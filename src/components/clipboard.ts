import * as vscode from 'vscode';

export async function write(res: string) {
    const cb = (<any>vscode.env).clipboard;
    if (cb) {
        await cb.writeText(res);
        vscode.window.showInformationMessage(vscode.l10n.t(`Copied to clipboard`));
    }
}