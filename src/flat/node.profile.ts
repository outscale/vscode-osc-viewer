import * as vscode from 'vscode';
import { ExplorerNode, ExplorerProfileNode, Profile } from './node';
import { VmsFolderNode } from './folders/specific/node.folder.vm';
import { VpcFolderNode } from './folders/simple/node.folder.net';
import { SecurityGroupsFolderNode } from './folders/simple/node.folder.securitygroup';
import { KeypairsFolderNode } from './folders/simple/node.folder.keypair';
import { VolumeFolderNode } from './folders/specific/node.folder.volume';
import { LoadBalancerFolderNode } from './folders/simple/node.folder.loadbalancer';
import { ExternalIPsFolderNode } from './folders/specific/node.folder.publicip';
import { OMIsFolderNode } from './folders/simple/node.folder.image';
import { SnapshotsFolderNode } from './folders/simple/node.folder.snapshot';
import { RouteTablesFolderNode } from './folders/simple/node.folder.routetable';
import { getAccount } from '../cloud/account';
import { AccessKeysFolderNode } from './folders/simple/node.folder.accesskey';
import { ApiAccessRulesFolderNode } from './folders/simple/node.folder.apiaccessrule';
import { CasFolderNode } from './folders/simple/node.folder.ca';
import { ClientGatewaysFolderNode } from './folders/simple/node.folder.clientgateway';
import { DhcpOptionsFolderNode } from './folders/simple/node.folder.dhcpoption';


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
			new AccessKeysFolderNode(this.profile),
			new ApiAccessRulesFolderNode(this.profile),
			new CasFolderNode(this.profile),
			new ClientGatewaysFolderNode(this.profile),
			new DhcpOptionsFolderNode(this.profile),
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