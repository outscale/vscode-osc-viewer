import * as vscode from 'vscode';
import { ExplorerNode, Profile } from './flat/node';
import { ProfileNode } from './flat/node.profile';
import { createConfigFile, getConfigFile, getDefaultConfigFilePath, jsonToProfile, readConfigFile } from './config_file/utils';
import { AccountCost, fetchAccountCost, isOscCostEnabled } from './components/osc_cost';
import { OutputChannel } from './logs/output_channel';


export class OscExplorer implements vscode.TreeDataProvider<ExplorerNode> {

    private _onDidChangeTreeData: vscode.EventEmitter<ExplorerNode | undefined | void> = new vscode.EventEmitter<ExplorerNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ExplorerNode | undefined | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ExplorerNode): vscode.TreeItem {
        return element.getTreeItem();
    }

    getChildren(element?: ExplorerNode): Thenable<ExplorerNode[]> {
        if (element) {
            return element.getChildren();
        } else {
            const toExplorerNode = (profileName: string, definition: any): ProfileNode => {
                const profile = jsonToProfile(profileName, definition);
                const profileObj = new ProfileNode(profile);

                if (isOscCostEnabled()) {
                    // Do not wait for completion but only fire a refresh on the node only if the data is available
                    this.retrieveAccountCost(profile).then(
                        (res: AccountCost | undefined) => {
                            if (typeof res === 'undefined') {
                                vscode.window.showErrorMessage(vscode.l10n.t(`Retrieve the cost for ${profile.name} fails: undefined`));
                                return;
                            }
                            profileObj.profile.oscCost = res;
                            this._onDidChangeTreeData.fire(profileObj);
                        },
                        (reason: any) => {
                            vscode.window.showErrorMessage(vscode.l10n.t(`Retrieval the cost for ${profile.name} fails: ${reason}`));
                        });
                }
                return profileObj;
            };

            const oscConfigObject = readConfigFile();
            if (typeof oscConfigObject === 'undefined') {
                vscode.window.showErrorMessage(vscode.l10n.t('No config file found'));
                return Promise.resolve([]);
            }
            const explorerNodes = Object.keys(oscConfigObject).map(dep => toExplorerNode(dep, oscConfigObject[dep]));
            return Promise.resolve(explorerNodes);
        }

    }

    async openConfigFile(): Promise<void> {
        let oscConfigPath = getConfigFile();

        if (typeof oscConfigPath === 'undefined') {
            createConfigFile();
            oscConfigPath = getDefaultConfigFilePath();
        }

        vscode.workspace.openTextDocument(vscode.Uri.file(oscConfigPath).with({ scheme: 'file' })).then(doc => {
            vscode.window.showTextDocument(doc);
        });

    }

    async retrieveAccountCost(profile: Profile): Promise<AccountCost | undefined> {
        // TODO: Add user options
        return fetchAccountCost(profile);
    }

}