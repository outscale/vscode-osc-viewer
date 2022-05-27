import * as fs from 'fs';
import path = require('path');

const OSC_CONFIG_PATH = [process.env.HOME + "/.osc/config.json"];

export function getConfigFile(): string | undefined {
    for (const oscConfigPath of OSC_CONFIG_PATH) {

        if (!pathExists(oscConfigPath)) {
            continue;
        }

        return oscConfigPath;
    }

    return undefined;
}

export function pathExists(p: string): boolean {
    try {
        fs.accessSync(p);
    } catch (err) {
        return false;
    }

    return true;
}

export function readConfigFile(): any {
    const oscConfigPath = getConfigFile();
    if (typeof oscConfigPath === 'undefined') {
        return undefined;
    }
    // Found a config file
    return JSON.parse(fs.readFileSync(oscConfigPath, 'utf-8'));

}

export function writeConfigFile(data: any): void {
    let oscConfigPath = getConfigFile();
    if (typeof oscConfigPath === 'undefined') {
        createConfigFile();
        oscConfigPath = getDefaultConfigFilePath();
    }

    fs.writeFileSync(oscConfigPath, JSON.stringify(data, null, 4), 'utf-8');
}

export function getDefaultConfigFilePath(): string {
    return OSC_CONFIG_PATH[0];
}

export function createConfigFile() {
    const defaultConfifgPath = getDefaultConfigFilePath();
    fs.mkdirSync(path.dirname(defaultConfifgPath), { recursive: true });
    fs.writeFileSync(defaultConfifgPath, "");
}