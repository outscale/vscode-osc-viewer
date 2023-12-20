'use strict';

import * as shelljs from 'shelljs';

import util = require('util');
import _exec = require('child_process');
const innerExec = util.promisify(_exec.exec);


export interface Shell {
    exec(cmd: string): Promise<string>;
    which(bin: string): string | null;
}

export const shell: Shell = {
    exec: exec,
    which: which,
};

async function exec(cmd: string): Promise<string> {
    const { stdout } = await innerExec(cmd);
    return stdout;
}


function which(bin: string): string | null {
    return shelljs.which(bin);
}