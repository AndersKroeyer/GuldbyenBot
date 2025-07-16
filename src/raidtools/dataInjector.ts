import { FarmSetupResult } from "src/wowutils/farmHelper";
import * as fs from "fs/promises";

/**
 * Serializes a JS object to a Lua table string.
 * Only supports simple objects, arrays, strings, numbers, booleans.
 */
function toLuaTable(obj: any, indent = 0): string {
    const pad = "  ".repeat(indent);
    if (Array.isArray(obj)) {
        return "{ " + obj.map(v => toLuaTable(v, indent + 1)).join(", ") + " }";
    }
    if (typeof obj === "object" && obj !== null) {
        let out = "{\n";
        for (const [key, value] of Object.entries(obj)) {
            out += `${pad}  ["${key}"] = ${toLuaTable(value, indent + 1)},\n`;
        }
        out += pad + "}";
        return out;
    }
    if (typeof obj === "string") {
        return `"${obj.replace(/"/g, '\\"')}"`;
    }
    if (typeof obj === "boolean" || typeof obj === "number") {
        return obj.toString();
    }
    return "nil";
}

/**
 * Finds the matching closing brace for a given opening brace position
 */
function findMatchingBrace(content: string, startPos: number): number {
    let braceCount = 1;
    let pos = startPos + 1;
    
    while (pos < content.length && braceCount > 0) {
        if (content[pos] === '{') {
            braceCount++;
        } else if (content[pos] === '}') {
            braceCount--;
        }
        pos++;
    }
    
    return braceCount === 0 ? pos - 1 : -1;
}

export const injectDataIntoAddon = async (farmSetup: FarmSetupResult): Promise<void> => {
    const filepath = process.env.GBRT_SAVED_VARS_PATH;
    let luaContent = await fs.readFile(filepath, "utf8");

    // Serialize new FarmSetup
    const newFarmSetup = `["FarmSetup"] = ${toLuaTable(farmSetup)}`;

    // Find the FarmSetup block start
    const farmSetupStart = luaContent.search(/\["FarmSetup"\]\s*=\s*\{/);
    
    if (farmSetupStart !== -1) {
        // Find the opening brace position
        const openBracePos = luaContent.indexOf('{', farmSetupStart);
        
        // Find the matching closing brace
        const closeBracePos = findMatchingBrace(luaContent, openBracePos);
        
        if (closeBracePos !== -1) {
            // Check if there's a comma after the closing brace
            const afterBrace = luaContent.slice(closeBracePos + 1).match(/^(\s*,?)/);
            const trailingComma = afterBrace ? afterBrace[1] : '';
            
            // Replace the entire FarmSetup block
            luaContent = 
                luaContent.slice(0, farmSetupStart) + 
                newFarmSetup + 
                trailingComma + 
                luaContent.slice(closeBracePos + 1 + trailingComma.length);
        } else {
            throw new Error("Could not find matching closing brace for FarmSetup");
        }
    } else {
        // Try to insert before the last closing brace of GBRT table
        const insertIndex = luaContent.lastIndexOf('}');
        if (insertIndex !== -1) {
            // Insert with a comma if needed
            const before = luaContent.slice(0, insertIndex).trimEnd();
            const needsComma = !before.endsWith(',');
            luaContent =
                before +
                (needsComma ? ',\n' : '\n') +
                newFarmSetup +
                '\n' +
                luaContent.slice(insertIndex);
        } else {
            // If file is malformed, just append
            luaContent += `\n${newFarmSetup}\n`;
        }
    }

    await fs.writeFile(filepath, luaContent, "utf8");
};