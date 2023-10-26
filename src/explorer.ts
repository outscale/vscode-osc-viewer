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

    getTreeItem(element: ExplorerNode): Thenable<vscode.TreeItem> {
        return element.getTreeItem();
    }

    async getChildren(element?: ExplorerNode): Promise<ExplorerNode[]> {
        if (element) {
            return element.getChildren();
        } else {
            const toExplorerNode = async (profileName: string, definition: any): Promise<ProfileNode> => {
                const profile = jsonToProfile(profileName, definition);
                if (isOscCostEnabled()) {
                    profile.oscCost = await this.retrieveAccountCost(profile);
                    OutputChannel.getInstance().appendLine(`Retrieve the cost for ${profile.name}: ${profile.oscCost?.accountCost}`);
                }
                return Promise.resolve(new ProfileNode(profile));
            };

            const oscConfigObject = readConfigFile();
            if (typeof oscConfigObject === 'undefined') {
                vscode.window.showErrorMessage(vscode.l10n.t('No config file found'));
                return Promise.resolve([]);
            }
            const explorerNodes = await Promise.all(Object.keys(oscConfigObject).map(async (dep) => await toExplorerNode(dep, oscConfigObject[dep])));

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