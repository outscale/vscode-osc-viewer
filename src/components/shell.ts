'use strict';
import * as shelljs from 'shelljs';

import util = require('util');
import _exec = require('child_process');
const innerExec = util.promisify(_exec.exec);
const innerExecFile = util.promisify(_exec.execFile);


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
    exec(cmd: string, maxBuffer?: number): Promise<string>;
    execFile(command: string, args: string[], maxBuffer?: number): Promise<string>;
    which(bin: string): string | null;
}

export const shell: Shell = {
    isWindows: isWindows,
    isUnix: isUnix,
    platform: platform,
    exec: exec,
    execFile: execFile,
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


async function exec(cmd: string, maxBuffer?: number): Promise<string> {
    // encoding: 'utf8' pins util.promisify(exec)'s overload to the string-returning one; without
    // it, passing an options object at all resolves to the string | Buffer overload instead.
    const { stdout } = await innerExec(cmd, { encoding: 'utf8', ...(typeof maxBuffer === 'number' ? { maxBuffer } : {}) });
    return stdout;
}

// Runs a command with its arguments passed as a real argv array (execFile, not exec): no shell
// is involved, so argument values can never be interpreted as shell syntax regardless of their
// content. Use this instead of exec() whenever any argument isn't a fixed, hardcoded string.
async function execFile(command: string, args: string[], maxBuffer?: number): Promise<string> {
    const { stdout } = await innerExecFile(command, args, { encoding: 'utf8', ...(typeof maxBuffer === 'number' ? { maxBuffer } : {}) });
    return stdout;
}


function which(bin: string): string | null {
    return shelljs.which(bin);
}