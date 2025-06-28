import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar, Cookie } from 'tough-cookie';
import { promises as fs } from 'fs';

interface RequestOptions extends AxiosRequestConfig {
  headers?: Record<string, string>;
}

interface CookieData {
  key: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
}

export class WowUtilsCookieApiClient {
  private jar: CookieJar;
  private client: ReturnType<typeof wrapper>;
  private cookieFile: string;
  private baseUrl: string;

  constructor(baseUrl: string = 'https://wowutils.com', cookieFile: string = './cookies.json') {
    this.jar = new CookieJar();
    this.client = wrapper(axios.create({ jar: this.jar }));
    this.cookieFile = cookieFile;
    this.baseUrl = baseUrl;
  }

  /**
   * Load cookies from file and set them in the cookie jar
   */
  async loadCookies(): Promise<void> {
    try {
      const cookieData = await fs.readFile(this.cookieFile, 'utf8');
      const cookies: CookieData[] = JSON.parse(cookieData);
      
      for (const cookieData of cookies) {
        try {
          const cookie = new Cookie({
            key: cookieData.key,
            value: cookieData.value,
            domain: cookieData.domain,
            path: cookieData.path,
            expires: cookieData.expires ? new Date(cookieData.expires) : undefined,
            httpOnly: cookieData.httpOnly,
            secure: cookieData.secure
          });
          
          await this.jar.setCookie(cookie, this.baseUrl);
        } catch (error) {
          console.warn(`Failed to set cookie ${cookieData.key}:`, error);
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log('No existing cookies found, will create new session');
      } else {
        console.error('Error loading cookies:', error);
      }
    }
  }

  /**
   * Save current cookies to file
   */
  async saveCookies(): Promise<void> {
    try {
      const cookies = await this.jar.getCookies(this.baseUrl);
      const cookieData: CookieData[] = cookies.map(cookie => ({
        key: cookie.key,
        value: cookie.value,
        domain: cookie.domain || undefined,
        path: cookie.path || undefined,
        expires: cookie.expires ? cookie.expires.toString() : undefined,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure
      }));
      
      await fs.writeFile(this.cookieFile, JSON.stringify(cookieData, null, 2));
    } catch (error) {
      console.error('Failed to save cookies:', error);
    }
  }

  /**
   * Make an authenticated HTTP request
   */
  async makeRequest<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client({
        url,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          ...options.headers
        },
        timeout: 30000,
        ...options
      });

      // Save cookies after each successful request
      await this.saveCookies();
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Request failed: ${error.response?.status} ${error.response?.statusText}`);
        
        // Handle authentication errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.error('Authentication failed - cookies may be expired or invalid');
        }
        
        throw new Error(`HTTP ${error.response?.status}: ${error.response?.statusText}`);
      }
      
      console.error('Request failed with non-HTTP error:', error);
      throw error;
    }
  }

  /**
   * Set cookies manually from browser cookie string
   */
  async setCookiesFromBrowser(cookieString: string, domain?: string): Promise<void> {
    const targetDomain = domain || this.baseUrl;
    const cookies = cookieString.split(';').map(c => c.trim());
    let setCookieCount = 0;
    
    for (const cookieStr of cookies) {
      const [name, ...valueParts] = cookieStr.split('=');
      const value = valueParts.join('='); // Handle values that contain '='
      
      if (name && value) {
        try {
          const cookie = new Cookie({
            key: name.trim(),
            value: value.trim(),
            domain: new URL(targetDomain).hostname,
            path: '/',
            httpOnly: name.includes('__Host-') || name.includes('__Secure-'),
            secure: name.includes('__Host-') || name.includes('__Secure-')
          });
          
          await this.jar.setCookie(cookie, targetDomain);
          setCookieCount++;
        } catch (error) {
          console.warn(`Failed to set cookie ${name}:`, error);
        }
      }
    }
    
    await this.saveCookies();
    console.log(`Set ${setCookieCount} cookies from browser`);
  }

  /**
   * Get all cookies as a string (for debugging)
   */
  async getCookieString(): Promise<string> {
    const cookies = await this.jar.getCookies(this.baseUrl);
    return cookies.map(cookie => `${cookie.key}=${cookie.value}`).join('; ');
  }

  /**
   * Check if we have authentication cookies
   */
  async hasAuthCookies(): Promise<boolean> {
    const cookies = await this.jar.getCookies(this.baseUrl);
    return cookies.some(cookie => 
      cookie.key.includes('auth') || 
      cookie.key.includes('session') || 
      cookie.key.includes('token')
    );
  }

  async get<T = any>(url: string, config?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(this.baseUrl + url, { ...config, method: 'GET' });
  }

  async post<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(this.baseUrl + url, { ...config, method: 'POST', data });
  }

  async put<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(this.baseUrl + url, { ...config, method: 'PUT', data });
  }

  async delete<T = any>(url: string, config?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(this.baseUrl + url, { ...config, method: 'DELETE' });
  }
}