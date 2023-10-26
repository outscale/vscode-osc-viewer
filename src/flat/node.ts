import * as vscode from 'vscode';
import { AccountCost } from '../components/osc_cost';

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
    readonly deleteFunc: (profile: Profile, resourceid: string) => Promise<string | undefined>;
    deleteResource(): Promise<string | undefined>
    getResourceId(): Promise<string | undefined>
    getIconPath(): vscode.ThemeIcon;
    getResourceName(): string;
}

export interface ExplorerFolderNode extends ExplorerProfileNode {
    readonly folderName: string;
}

export type ExplorerNode =
    ExplorerProfileNode |
    ExplorerFolderNode |
    ExplorerResourceNode;

export type ResourceNodeType =
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
    "NetAccessPoint" |
    "NetPeering" |
    "Nic" |
    "Subnet" |
    "VirtualGateway" |
    "VpnConnection" |
    "vms" |
    "vpc" |
    "securitygroups" |
    "keypairs" |
    "volumes" |
    "loadbalancers" |
    "eips" |
    "omis" |
    "snapshots" |
    "routetables" |
    "VmTemplate" |
    "VmGroup";
export class NodeImpl {
}

export class Profile {
    accountId: string;
    oscCost: AccountCost | undefined;
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

export function resourceNodeCompare(r1: ExplorerResourceNode, r2: ExplorerResourceNode): number {
    const n1 = r1.resourceId;
    const n2 = r2.resourceId;
    if (n1 > n2) {
        return 1;
    }

    if (n1 < n2) {
        return -1;
    }

    return 0;
}