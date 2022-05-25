import * as vscode from 'vscode';
import * as fs from 'fs';
import { ExplorerNode, ExplorerProfileNode, Profile } from './node';
import { FolderNode } from './node.folder';
import { VmsFolderNode } from './node.folder.vms';
import { VpcFolderNode } from './node.folder.vpc';
import { SecurityGroupsFolderNode } from './node.folder.securitygroups';
import { KeypairsFolderNode } from './node.folder.keypair';


export class ProfileNode implements ExplorerProfileNode {
    constructor(readonly profile: Profile) {
    }


	getTreeItem(): vscode.TreeItem {
		const treeItem = new vscode.TreeItem(this.profile.name, vscode.TreeItemCollapsibleState.Collapsed);
        return treeItem;
	}

	getChildren(): Thenable<ExplorerNode[]> {
		return Promise.resolve([
			new VmsFolderNode(this.profile),
			new VpcFolderNode(this.profile),
			new SecurityGroupsFolderNode(this.profile),
			new KeypairsFolderNode(this.profile)
		])
		
    }




}