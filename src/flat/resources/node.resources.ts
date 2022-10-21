import * as vscode from 'vscode';
import { ExplorerNode, ExplorerResourceNode, Profile, ResourceNodeType } from '../node';



export class ResourceNode implements ExplorerResourceNode {


    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceType: ResourceNodeType, readonly deleteFunc: (profile: Profile, resourceid: string) => Promise<string| undefined> ) {
    }

	getResourceId(): Promise<string | undefined> {
		return Promise.resolve(this.resourceId);
	}

	getIconPath(): vscode.ThemeIcon {
		return new vscode.ThemeIcon("dash");
	}

	getContextValue(): string {
		return "resourcenode";
	}
	
	deleteResource(): Promise<string | undefined> {
		return this.deleteFunc(this.profile, this.resourceId);
	}

	getResourceName(): string {
		if (this.resourceName.length > 0) {
			return this.resourceName;
		}
		return this.resourceId;
	}


	getTreeItem(): vscode.TreeItem {
		const treeItem = new vscode.TreeItem(this.resourceId, vscode.TreeItemCollapsibleState.None);
		treeItem.description = this.resourceName;
		treeItem.iconPath= this.getIconPath();
		treeItem.command= {
			"title": "Get",
			"command": "osc.showResource",
			"arguments": [this]
		};
		treeItem.contextValue = this.getContextValue();
        return treeItem;
	}

	getChildren(): Thenable<ExplorerNode[]> {
		return Promise.resolve([]);
	}


}