import * as vscode from 'vscode';

import { Observable, Subscription } from 'rxjs';
import { getPodLogs } from '../cloud/kube';
import { getProfile } from '../config_file/utils';
import { Profile } from '../flat/node';

// Mirrors LogsProvider (logs.ts, VM console logs) but for `kubectl logs` output. Kept separate
// rather than reused: getPodLogs returns plain text directly (no base64 decoding, unlike the OSC
// VM console-log API), and pod logs need a different resourceId shape (the
// clusterId::pods::namespace::name composite, vs a bare VM id).

const MIN_REFRESH_INTERVAL = 3;
const DEFAULT_REFRESH_INTERVAL = 30;

class KubeLogsDocument {
    constructor(
        public readonly resourceId: string,
        public readonly profile: Profile,
        public readonly subscription: Subscription | undefined,
    ) { }
}

export class KubeLogsProvider implements vscode.TextDocumentContentProvider {
    public onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    private _documents = new Map<string, KubeLogsDocument>();

    private refreshEnabled = false;
    private refreshInterval = DEFAULT_REFRESH_INTERVAL;

    constructor() {
        // Reuses the existing refreshConsoleLogs settings rather than adding a dedicated pair,
        // to keep this MVP's surface area small.
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
            this.onDidChangeEmitter.fire(uri);
        });
    }

    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        let document = this._documents.get(uri.toString());
        let resourceId: string;
        let profile: Profile;

        if (document) {
            resourceId = document.resourceId;
            profile = document.profile;
        } else {
            const pathSplit = uri.path.split("/");
            if (pathSplit.length !== 3) {
                throw new Error("malformed uri");
            }

            const uriProfile = pathSplit[1];
            profile = getProfile(uriProfile);
            resourceId = pathSplit[2];

            const subscription = this.createSubscription(uri);
            document = new KubeLogsDocument(resourceId, profile, subscription);
            this._documents.set(uri.toString(), document);
        }

        return getPodLogs(profile, resourceId);
    }
}
