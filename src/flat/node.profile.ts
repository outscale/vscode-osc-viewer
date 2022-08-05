import * as vscode from 'vscode';
import { ExplorerNode, ExplorerProfileNode, Profile } from './node';
import { VmsFolderNode } from './node.folder.vms';
import { VpcFolderNode } from './node.folder.vpc';
import { SecurityGroupsFolderNode } from './node.folder.securitygroups';
import { KeypairsFolderNode } from './node.folder.keypair';
import { VolumeFolderNode } from './node.folder.volume';
import { LoadBalancerFolderNode } from './node.folder.loadbalancer';


export class ProfileNode implements ExplorerProfileNode {
    constructor(readonly profile: Profile) {
    }


	getTreeItem(): vscode.TreeItem {
		const treeItem = new vscode.TreeItem(this.profile.name, vscode.TreeItemCollapsibleState.Collapsed);
		treeItem.iconPath = new vscode.ThemeIcon("account");
        return treeItem;
	}

	getChildren(): Thenable<ExplorerNode[]> {
		return Promise.resolve([
			new VmsFolderNode(this.profile),
			new VpcFolderNode(this.profile),
			new SecurityGroupsFolderNode(this.profile),
			new KeypairsFolderNode(this.profile),
			new VolumeFolderNode(this.profile),
			new LoadBalancerFolderNode(this.profile)
		]);
		
    }




}