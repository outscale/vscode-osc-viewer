import * as vscode from 'vscode';
import { ExplorerNode, ExplorerResourceNode, Profile } from './node';



export class ResourceNode implements ExplorerResourceNode {


    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string) {
    }


	getTreeItem(): vscode.TreeItem {
		const treeItem = new vscode.TreeItem(this.resourceId, vscode.TreeItemCollapsibleState.None);
		treeItem.description = this.resourceName
		treeItem.iconPath= new vscode.ThemeIcon("dash")
        return treeItem;
	}

	getChildren(): Thenable<ExplorerNode[]> {
		return Promise.resolve([])
	}


}