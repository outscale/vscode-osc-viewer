import * as vscode from 'vscode';
import * as fs from 'fs';
import { ExplorerNode, Profile } from './node';
import { ProfileNode } from './node.profile';
import { env } from 'process';
import path = require('path');

const OSC_CONFIG_PATH = [ process.env.HOME + "/.osc/config.json"]

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
			return element.getChildren()
		} else {
			const osc_config_path = getConfigFile()
			if (typeof osc_config_path == 'undefined') {
				vscode.window.showErrorMessage('No config file found');
				return Promise.resolve([])
			}

			const toExplorerNode = (profileName: string, definition: any): ProfileNode => {
				return new ProfileNode(new Profile(profileName, definition.access_key, definition.secret_key, definition.region_name));
			};

			// Found a config file
			const configJson = JSON.parse(fs.readFileSync(osc_config_path, 'utf-8'))

			const ExplorerNodes = Object.keys(configJson).map(dep => toExplorerNode(dep, configJson[dep]))

			return Promise.resolve(ExplorerNodes)
		}

	}

}

export function getConfigFile(): string | undefined {
	for (const osc_config_path of OSC_CONFIG_PATH) {

		if (!pathExists(osc_config_path)) {
			continue
		}

		return osc_config_path
	}

	return undefined
}

export function pathExists(p: string): boolean {
	try {
		fs.accessSync(p);
	} catch (err) {
		return false;
	}

	return true;
}