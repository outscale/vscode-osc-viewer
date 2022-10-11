import * as vscode from 'vscode';

export interface ExplorerNodeBase {
    getChildren(): Thenable<ExplorerNode[]>;
    getTreeItem(): vscode.TreeItem;
}

export interface ExplorerProfileNode extends ExplorerNodeBase {
    readonly profile: Profile;
}

export interface ExplorerResourceNode extends ExplorerProfileNode {
    readonly resourceName: string;
    readonly resourceId: string;
    readonly resourceType: ResourceNodeType;
    readonly deleteFunc: (profile: Profile, resourceid: string) => Promise<string| undefined> ;
    deleteResource(): Promise<string | undefined>
    getResourceId(): Promise<string | undefined>
    getIconPath(): vscode.ThemeIcon;
}

export interface ExplorerFolderNode extends ExplorerProfileNode {
    readonly folderName: string;
}

export type ExplorerNode =
    ExplorerProfileNode |
    ExplorerFolderNode |
    ExplorerResourceNode;

export type ResourceNodeType=
    "AccessKey" |
    "ApiAccessRule" |
    "Ca" |
    "ClientGateway" |
    "DhcpOption" |
    "DirectLink" |
    "DirectLinkInterface" |
    "FlexibleGpu" |
    "InternetService" |
    "NatService" |
    "vms" |
    "vpc" |
    "securitygroups" |
    "keypairs" |
    "volumes" |
    "loadbalancers" |
    "eips" |
    "omis" |
    "snapshots"|
    "routetables";
export class NodeImpl {
}

export class Profile {
    accountId: string;
    constructor(
		public readonly name: string,
		public readonly accessKey: string,
		public readonly secretKey: string,
        public readonly region: string,
        public readonly host: string,
        public readonly https: boolean
	) {	
        this.name = name;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.region = region;
        this.host = host;
        this.https = https;
        this.accountId = "";
    }
}