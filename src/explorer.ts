import * as vscode from 'vscode';
import { ExplorerNode } from './flat/node';
import { ProfileNode } from './flat/node.profile';
import { createConfigFile, getConfigFile, getDefaultConfigFilePath, jsonToProfile, readConfigFile } from './config_file/utils';


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
				return new ProfileNode(jsonToProfile(profileName, definition));
			};

			const oscConfigObject= readConfigFile();
			if (typeof oscConfigObject === 'undefined') {
				vscode.window.showErrorMessage('No config file found');
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

}