import * as vscode from 'vscode';
import { ExplorerNode, Profile } from './flat/node';
import { ProfileNode } from './flat/node.profile';
import { createConfigFile, getConfigFile, getDefaultConfigFilePath, jsonToProfile, readConfigFile } from './config_file/utils';
import { AccountCost, fetchAccountCost, isOscCostEnabled, isOscCostWorking } from './components/osc_cost';


export class OscExplorer implements vscode.TreeDataProvider<ExplorerNode> {

    private _onDidChangeTreeData: vscode.EventEmitter<ExplorerNode | undefined | void> = new vscode.EventEmitter<ExplorerNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ExplorerNode | undefined | void> = this._onDidChangeTreeData.event;
    private waitFor = 0; // Counter to not spam the API/tools when they are already executed (here osc-cost)

    refresh(element: ExplorerNode | undefined): void {
        if (this.waitFor !== 0) {
            vscode.window.showInformationMessage(vscode.l10n.t("Refreshed not finished, waiting"));
            return;
        }
        this._onDidChangeTreeData.fire(element);
    }

    getTreeItem(element: ExplorerNode): vscode.TreeItem {
        return element.getTreeItem();
    }

    async getChildren(element?: ExplorerNode): Promise<ExplorerNode[]> {
        if (element) {
            return element.getChildren();
        } else {
            const toExplorerNode = (profileName: string, definition: any, performOscCost: boolean): ProfileNode => {
                const profile = jsonToProfile(profileName, definition);
                const profileObj = new ProfileNode(profile);

                if (performOscCost) {
                    this.waitFor += 1;
                    this.retrieveAccountCost(profile).then(
                        (res: AccountCost) => {
                            profileObj.profile.oscCost = res;
                            this._onDidChangeTreeData.fire(profileObj);
                        },
                        (reason: any) => {
                            vscode.window.showErrorMessage(vscode.l10n.t(`Retrieval the cost for ${profile.name} fails: ${reason}`));
                        }).finally(() => {
                            this.waitFor -= 1;
                        });
                }
                return profileObj;
            };

            const oscConfigObject = readConfigFile();
            if (typeof oscConfigObject === 'undefined') {
                vscode.window.showErrorMessage(vscode.l10n.t('No config file found'));
                return Promise.resolve([]);
            }
            const performOscCost = isOscCostEnabled() && await isOscCostWorking();
            const explorerNodes = Object.keys(oscConfigObject).map(dep => toExplorerNode(dep, oscConfigObject[dep], performOscCost));
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

    async retrieveAccountCost(profile: Profile): Promise<AccountCost> {
        // TODO: Add user options
        return fetchAccountCost(profile);
    }

}