'use strict';

import * as vscode from 'vscode';
import * as shelljs from 'shelljs';
import { ChildProcess } from 'child_process';

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

export interface Shell {
    isWindows(): boolean;
    isUnix(): boolean;
    platform(): Platform;
    execOpts(): any;
    exec(cmd: string, stdin?: string): Promise<ShellResult | undefined>;
    which(bin: string): string | null;
}

export const shell: Shell = {
    isWindows: isWindows,
    isUnix: isUnix,
    platform: platform,
    execOpts: execOpts,
    exec: exec,
    which: which,
};

const WINDOWS = 'win32';

export interface ShellResult {
    readonly code: number;
    readonly stdout: string;
    readonly stderr: string;
}

export type ShellHandler = (code: number, stdout: string, stderr: string) => void;

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

function concatIfSafe(homeDrive: string | undefined, homePath: string | undefined): string | undefined {
    if (homeDrive && homePath) {
        const safe = !homePath.toLowerCase().startsWith('\\windows\\system32');
        if (safe) {
            return homeDrive.concat(homePath);
        }
    }

    return undefined;
}

function home(): string {
    return process.env['HOME'] ||
        concatIfSafe(process.env['HOMEDRIVE'], process.env['HOMEPATH']) ||
        process.env['USERPROFILE'] ||
        '';
}

function execOpts(): any {
    let env = process.env;
    if (isWindows()) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        env = Object.assign({}, env, { HOME: home() });
    }
    env = shellEnvironment(env);

    const opts = {
        cwd: typeof vscode.workspace.workspaceFolders === 'undefined' ? undefined : vscode.workspace.workspaceFolders[0],
        env: env,
        async: true
    };
    return opts;
}

async function exec(cmd: string, stdin?: string): Promise<ShellResult | undefined> {
    try {
        return await execCore(cmd, execOpts(), null, stdin);
    } catch (ex) {
        vscode.window.showErrorMessage(`${ex}`);
        return undefined;
    }
}

function execCore(cmd: string, opts: any, callback?: ((proc: ChildProcess) => void) | null, stdin?: string): Promise<ShellResult> {
    return new Promise<ShellResult>((resolve) => {
        const proc = shelljs.exec(cmd, opts, (code, stdout, stderr) => resolve({ code: code, stdout: stdout, stderr: stderr }));
        if (stdin && proc.stdin !== null) {
            proc.stdin.end(stdin);
        }
        if (callback) {
            callback(proc);
        }
    });
}

function which(bin: string): string | null {
    return shelljs.which(bin);
}

export function shellEnvironment(baseEnvironment: any): any {
    const env = Object.assign({}, baseEnvironment);
    return env;
}

const SAFE_CHARS_REGEX = /^[-,._+:@%/\w]*$/;

export function isSafe(s: string): boolean {
    return SAFE_CHARS_REGEX.test(s);
}
