import * as vscode from 'vscode';
import { ExplorerNode, ExplorerProfileNode, Profile } from './node';
import { VmsFolderNode } from './node.folder.vms';
import { VpcFolderNode } from './node.folder.vpc';
import { SecurityGroupsFolderNode } from './node.folder.securitygroups';
import { KeypairsFolderNode } from './node.folder.keypair';
import { VolumeFolderNode } from './node.folder.volume';
import { LoadBalancerFolderNode } from './node.folder.loadbalancer';
import { ExternalIPsFolderNode } from './node.folder.eips';
import { OMIsFolderNode } from './node.folder.omis';
import { SnapshotsFolderNode } from './node.folder.snapshots';
import { RouteTablesFolderNode } from './node.folder.routetables';
import { getAccount } from '../cloud/account';


export class ProfileNode implements ExplorerProfileNode {
    constructor(readonly profile: Profile) {
    }


	getTreeItem(): vscode.TreeItem {
		const treeItem = new vscode.TreeItem(this.profile.name, vscode.TreeItemCollapsibleState.Collapsed);
		treeItem.iconPath = new vscode.ThemeIcon("account");
		treeItem.contextValue = this.getContextValue();
        return treeItem;
	}

	getChildren(): Thenable<ExplorerNode[]> {
		return Promise.resolve([
			new VmsFolderNode(this.profile),
			new VpcFolderNode(this.profile),
			new SecurityGroupsFolderNode(this.profile),
			new KeypairsFolderNode(this.profile),
			new VolumeFolderNode(this.profile),
			new LoadBalancerFolderNode(this.profile),
			new ExternalIPsFolderNode(this.profile),
			new OMIsFolderNode(this.profile),
			new SnapshotsFolderNode(this.profile),
			new RouteTablesFolderNode(this.profile)
		]);
		
    }

	getContextValue(): string {
		return "profilenode";
	}

	async getAccountId(): Promise<string> {
		if (this.profile.accountId.length !== 0) {
			return this.profile.accountId;
		}
		const res = await getAccount(this.profile, "");
		if (typeof res === "string") {
			vscode.window.showInformationMessage(res);
			return Promise.resolve("");
		}

		if (typeof res.accountId === 'undefined') {
			return Promise.resolve("");
		}

		this.profile.accountId = res.accountId;

		return Promise.resolve(this.profile.accountId);
	}


}