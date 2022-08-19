import * as vscode from 'vscode';
import { getLogs } from '../cloud/vm';
import { getProfile } from '../config_file/utils';

export class LogsProvider implements vscode.TextDocumentContentProvider {
    public onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;
    
    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        const pathSplit = uri.path.split("/");
        if (pathSplit.length !== 3) {
            throw new Error("malformed uri");
        }

        // Retrieve Profile
        const uriProfile = pathSplit[1];
        let profile = getProfile(uriProfile);

        // Retrieve the resource Type
        const resourceId = pathSplit[2];
        return  getLogs(profile, resourceId).then((res: string) => {
            return Buffer.from(res, 'base64').toString('ascii');
        });

    }
}