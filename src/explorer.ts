import * as vscode from 'vscode';
import * as fs from 'fs';
import { ExplorerNode, Profile } from './node';
import { ProfileNode } from './node.profile';
import { env } from 'process';
import path = require('path');

const OSC_CONFIG_PATH = [ process.env.HOME + "/.osc/config.json"];

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
			const oscConfigPath = getConfigFile();
			if (typeof oscConfigPath === 'undefined') {
				vscode.window.showErrorMessage('No config file found');
				return Promise.resolve([]);
			}

			const toExplorerNode = (profileName: string, definition: any): ProfileNode => {
				return new ProfileNode(new Profile(profileName, definition.access_key, definition.secret_key, definition.region_name));
			};

			// Found a config file
			const configJson = JSON.parse(fs.readFileSync(oscConfigPath, 'utf-8'));

			const explorerNodes = Object.keys(configJson).map(dep => toExplorerNode(dep, configJson[dep]));

			return Promise.resolve(explorerNodes);
		}

	}

	async openConfigFile(): Promise<void> {
		const oscConfigPath = getConfigFile();

		if (typeof oscConfigPath === 'undefined') {
			fs.mkdirSync(path.dirname(OSC_CONFIG_PATH[0]), { recursive: true });
			fs.writeFileSync(OSC_CONFIG_PATH[0], "");
		}

		vscode.workspace.openTextDocument(vscode.Uri.file(OSC_CONFIG_PATH[0]).with({ scheme: 'file' })).then(doc => {
			vscode.window.showTextDocument(doc);
		  });

	}

}

export function getConfigFile(): string | undefined {
	for (const oscConfigPath of OSC_CONFIG_PATH) {

		if (!pathExists(oscConfigPath)) {
			continue;
		}

		return oscConfigPath;
	}

	return undefined;
}

export function pathExists(p: string): boolean {
	try {
		fs.accessSync(p);
	} catch (err) {
		return false;
	}

	return true;
}