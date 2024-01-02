'use strict';
import * as shelljs from 'shelljs';

import util = require('util');
import _exec = require('child_process');
const innerExec = util.promisify(_exec.exec);


export enum Platform {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Windows,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    MacOS,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Linux,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Unsupported,  // shouldn't happen!
}

const WINDOWS = 'win32';

export interface Shell {
    isWindows(): boolean;
    isUnix(): boolean;
    platform(): Platform;
    exec(cmd: string): Promise<string>;
    which(bin: string): string | null;
}

export const shell: Shell = {
    isWindows: isWindows,
    isUnix: isUnix,
    platform: platform,
    exec: exec,
    which: which,
};


function isWindows(): boolean {
    return (process.platform === WINDOWS);
}

function isUnix(): boolean {
    return !isWindows();
}

function platform(): Platform {
    switch (process.platform) {
        case 'win32': return Platform.Windows;
        case 'darwin': return Platform.MacOS;
        case 'linux': return Platform.Linux;
        default: return Platform.Unsupported;
    }
}

export function platformArch(): string | undefined {
    switch (process.arch) {
        case 'arm64':
            return 'aarch64';
        case 'x64':
            return "x86_64";
        default:
            return undefined;
    }
}


async function exec(cmd: string): Promise<string> {
    const { stdout } = await innerExec(cmd);
    return stdout;
}


function which(bin: string): string | null {
    return shelljs.which(bin);
}