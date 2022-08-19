import * as fs from 'fs';
import path = require('path');
import { Profile } from '../flat/node';

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

export function getProfile(profileName: string): Profile {
    const oscConfigFile = readConfigFile();
    if (typeof oscConfigFile === 'undefined') {
        throw new Error("malformed uri");
    }
    const profileData = oscConfigFile[profileName];
    if (typeof profileData === "undefined") {
        throw new Error("malformed uri");
    }
    var profile = jsonToProfile(profileName, profileData);

    return profile;
}

export function jsonToProfile(profileName: string, profileJson: any): Profile {
    var profile;
    var host = "outscale.com";
    var https = true;
    if ('host' in profileJson) {
        host = profileJson["host"];
    }

    if ('https' in profileJson) {
        https = profileJson["https"];
    }

    if ('region_name' in profileJson) {
        profile = new Profile(profileName, profileJson.access_key, profileJson.secret_key, profileJson.region_name, host, https);
    } else {
        profile = new Profile(profileName, profileJson.access_key, profileJson.secret_key, profileJson.region, host, https);
    }
    return profile;
} 