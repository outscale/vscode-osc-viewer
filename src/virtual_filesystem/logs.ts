import * as vscode from 'vscode';

import { Observable, Subscription } from 'rxjs';
import { getLogs } from '../cloud/vms';
import { getProfile } from '../config_file/utils';
import { Profile } from '../flat/node';


const MIN_REFRESH_INTERVAL = 3;
const DEFAULT_REFRESH_INTERVAL = 30;
class LogsDocuments {
    constructor(
        public readonly resourceId: string,
        public readonly profile: Profile,
        public readonly lastData: string,
        public readonly subscription: Subscription | undefined,
    ) { }
}
export class LogsProvider implements vscode.TextDocumentContentProvider {
    public onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    private _documents = new Map<string, LogsDocuments>();

    private refreshEnabled = false;
    private refreshInterval = DEFAULT_REFRESH_INTERVAL;

    constructor() {
        // Let vscode informs us when the document is really closed
        vscode.workspace.onDidCloseTextDocument(doc => {
            const logsDocument = this._documents.get(doc.uri.toString());
            if (typeof logsDocument === 'undefined') {
                return;
            }

            if (typeof logsDocument.subscription !== 'undefined') {
                logsDocument.subscription.unsubscribe();
            }
            this._documents.delete(doc.uri.toString());
        });
        const conf = vscode.workspace.getConfiguration('osc-viewer');
        const hasParameter = conf.has("refreshConsoleLogs.enabled");
        if (!hasParameter || (hasParameter && conf.get("refreshConsoleLogs.enabled"))) {
            // 
            const interval = conf.get("refreshConsoleLogs.interval");
            let intervalNumber = DEFAULT_REFRESH_INTERVAL;
            if (typeof interval === 'number' && interval >= MIN_REFRESH_INTERVAL) {
                intervalNumber = interval;
            }
            this.refreshEnabled = true;
            this.refreshInterval = intervalNumber;
        }

    }

    createSubscription(uri: vscode.Uri): Subscription | undefined {
        if (!this.refreshEnabled) {
            return undefined;
        }
        const refreshInterval = this.refreshInterval;
        const uriInterval = refreshInterval + (Math.random() * refreshInterval);
        const observable = new Observable<vscode.Uri>((subject) => {
            setTimeout(function updateLogs() {
                if (subject.closed) {
                    return;
                }
                subject.next(uri);
                setTimeout(updateLogs, 1000 * uriInterval);
            }, 1000 * uriInterval);
        });
        return observable.subscribe((uri: vscode.Uri) => {
            console.log(uri);
            this.onDidChangeEmitter.fire(uri);
        });
    }

    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        let document = this._documents.get(uri.toString());
        let resourceId: string;
        let profile: Profile;
        let lastData = "";
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
            const subscription = this.createSubscription(uri);
            document = new LogsDocuments(resourceId, profile, "", subscription);
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