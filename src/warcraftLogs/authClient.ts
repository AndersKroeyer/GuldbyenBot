import axios from 'axios';
import qs from 'qs';

export async function getAccessToken(): Promise<string | null> {
  try {
    const clientSecret = process.env.WARCRAFT_LOGS_CLIENT_SECRET as string;
    const clientId = process.env.WARCRAFT_LOGS_CLIENT_ID as string;
    const response = await axios.post(
      'https://www.warcraftlogs.com/oauth/token',
      qs.stringify({
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: clientId,
          password: clientSecret,
        },
      },
    );

    if (response.data && response.data.access_token) {
      return response.data.access_token;
    } else {
      console.error('No access token found in the response');
      return null;
    }
  } catch (error) {
    console.error('Error occurred while fetching access token:', error);
    return null;
  }
}
