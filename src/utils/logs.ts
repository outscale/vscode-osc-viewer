import * as vscode from 'vscode';
import { Observable } from 'rxjs';
import { getLogs } from '../cloud/vm';
import { getProfile } from '../config_file/utils';
import { Profile } from '../flat/node';


class LogsDocuments {
    constructor(
        public readonly resourceId: string,
        public readonly profile: Profile,
        public readonly lastData : string,
    ) { }
}
export class LogsProvider implements vscode.TextDocumentContentProvider {
    public onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    private _documents = new Map<string, LogsDocuments>();
    private _subscriptions: vscode.Disposable;
    private clock$: Observable<void> | undefined;

    constructor() {
        this._subscriptions = vscode.workspace.onDidCloseTextDocument(doc => this._documents.delete(doc.uri.toString()));
        const conf = vscode.workspace.getConfiguration('osc-viewer');
        const hasParameter = conf.has("refreshConsoleLogs.enabled");
        if (!hasParameter || (hasParameter && conf.get("refreshConsoleLogs.enabled")))  {
            this.clock$ = new Observable((subject) => {
                setInterval(() => {
                    subject.next();
                }, conf.get("refreshConsoleLogs.interval"));
            });
            this.clock$.subscribe(() => {
                for (const uri of this._documents.keys()) {
                    this.onDidChangeEmitter.fire(vscode.Uri.parse(uri));
                }
            });
        }

    }

    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        var document = this._documents.get(uri.toString());
        var resourceId: string;
        var profile: Profile;
        var lastData: string = "";
        if (document) {
            resourceId = document.resourceId;
            profile = document.profile;
            lastData = document.lastData;
        } else {

            const pathSplit = uri.path.split("/");
            if (pathSplit.length !== 3) {
                throw new Error("malformed uri");
            }

            // Retrieve Profile
            const uriProfile = pathSplit[1];
            profile = getProfile(uriProfile);

            // Retrieve the resource Type
            resourceId = pathSplit[2];
            document = new LogsDocuments(resourceId, profile, "");
            this._documents.set(uri.toString(), document);    
        }
        
        return getLogs(profile, resourceId).then((res: string | undefined) => {
            if (typeof res === 'undefined') {
                return Buffer.from(lastData, 'base64').toString('ascii');
            }
            return Buffer.from(res, 'base64').toString('ascii');
        });

    }
}
