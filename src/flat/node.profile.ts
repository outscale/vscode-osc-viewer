import * as vscode from 'vscode';
import { ExplorerNode, ExplorerProfileNode, Profile } from './node';
import { VmsFolderNode, VM_FOLDER_NAME } from './folders/specific/node.folder.vm';
import { NET_FOLDER_NAME, VpcFolderNode } from './folders/specific/node.folder.net';
import { SecurityGroupsFolderNode, SECURITYGROUPS_FOLDER_NAME } from './folders/specific/node.folder.securitygroup';
import { KeypairsFolderNode, KEYPAIRS_FOLDER_NAME } from './folders/simple/node.folder.keypair';
import { VolumeFolderNode, VOLUME_FOLDER_NAME } from './folders/specific/node.folder.volume';
import { LoadBalancerFolderNode, LOADBALANCER_FOLDER_NAME } from './folders/simple/node.folder.loadbalancer';
import { ExternalIPsFolderNode, PUBLICIP_FOLDER_NAME } from './folders/specific/node.folder.publicip';
import { IMAGES_FOLDER_NAME, OMIsFolderNode } from './folders/simple/node.folder.image';
import { SnapshotsFolderNode, SNAPSHOTS_FOLDER_NAME } from './folders/simple/node.folder.snapshot';
import { RouteTablesFolderNode, ROUTETABLES_FOLDER_NAME } from './folders/specific/node.folder.routetable';
import { getAccount } from '../cloud/account';
import { AccessKeysFolderNode, ACCESSKEY_FOLDER_NAME } from './folders/simple/node.folder.accesskey';
import { ApiAccessRulesFolderNode, APIACCESSRULES_FOLDER_NAME } from './folders/simple/node.folder.apiaccessrule';
import { CasFolderNode, CA_FOLDER_NAME } from './folders/simple/node.folder.ca';
import { ClientGatewaysFolderNode, CLIENTGATEWAYS_FOLDER_NAME } from './folders/simple/node.folder.clientgateway';
import { DhcpOptionsFolderNode, DHCPOPTIONS_FOLDER_NAME } from './folders/simple/node.folder.dhcpoption';
import { DirectLinkInterfacesFolderNode, DIRECTLINKINTERFACES_FOLDER_NAME } from './folders/simple/node.folder.directlinkinterface';
import { DirectLinksFolderNode, DIRECTLINKS_FOLDER_NAME } from './folders/simple/node.folder.directlink';
import { FlexibleGpusFolderNode, FLEXIBLEGPUS_FOLDER_NAME } from './folders/specific/node.folder.flexiblegpu';
import { InternetServicesFolderNode, INTERNETSERVICES_FOLDER_NAME } from './folders/specific/node.folder.internetservice';
import { NatServicesFolderNode, NATSERVICES_FOLDER_NAME } from './folders/simple/node.folder.natservice';
import { NetAccessPointsFolderNode, NETACCESSPOINTS_FOLDER_NAME } from './folders/simple/node.folder.netaccesspoint';
import { NetPeeringsFolderNode, NETPEERINGS_FOLDER_NAME } from './folders/simple/node.folder.netpeering';
import { NicsFolderNode, NICS_FOLDER_NAME } from './folders/specific/node.folder.nic';
import { SubnetsFolderNode, SUBNETS_FOLDER_NAME } from './folders/simple/node.folder.subnet';
import { VirtualGatewaysFolderNode, VIRTUALGATEWAYS_FOLDER_NAME } from './folders/specific/node.folder.virtualgateway';
import { VpnConnectionsFolderNode, VPNCONNECTIONS_FOLDER_NAME } from './folders/simple/node.folder.vpnconnection';
import { DISABLE_FOLDER_PARAMETER, getConfigurationParameter } from '../configuration/utils';
import { VMGROUPS_FOLDER_NAME, VmGroupsFolderNode } from './folders/simple/node.folder.vmgroup';
import { VMTEMPLATES_FOLDER_NAME, VmTemplatesFolderNode } from './folders/simple/node.folder.vmtemplate';
import { DEDICATEDGROUP_FOLDER_NAME, DedicatedGroupsFolderNode } from './folders/simple/node.folder.dedicatedgroup';


export class ProfileNode implements ExplorerProfileNode {
    constructor(readonly profile: Profile) {
    }


    getTreeItem(): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(this.profile.name, vscode.TreeItemCollapsibleState.Collapsed);
        if (typeof this.profile.oscCost !== 'undefined') {
            treeItem.description = this.profile.oscCost.getAccountCost();
        }
        treeItem.iconPath = new vscode.ThemeIcon("account");
        treeItem.contextValue = this.getContextValue();
        return treeItem;
    }

    async getChildren(): Promise<ExplorerNode[]> {
        const resources = [
            [ACCESSKEY_FOLDER_NAME, new AccessKeysFolderNode(this.profile)],
            [APIACCESSRULES_FOLDER_NAME, new ApiAccessRulesFolderNode(this.profile)],
            [CA_FOLDER_NAME, new CasFolderNode(this.profile)],
            [CLIENTGATEWAYS_FOLDER_NAME, new ClientGatewaysFolderNode(this.profile)],
            [DEDICATEDGROUP_FOLDER_NAME, new DedicatedGroupsFolderNode(this.profile)],
            [DHCPOPTIONS_FOLDER_NAME, new DhcpOptionsFolderNode(this.profile)],
            [DIRECTLINKS_FOLDER_NAME, new DirectLinksFolderNode(this.profile)],
            [DIRECTLINKINTERFACES_FOLDER_NAME, new DirectLinkInterfacesFolderNode(this.profile)],
            [FLEXIBLEGPUS_FOLDER_NAME, new FlexibleGpusFolderNode(this.profile)],
            [IMAGES_FOLDER_NAME, new OMIsFolderNode(this.profile)],
            [INTERNETSERVICES_FOLDER_NAME, new InternetServicesFolderNode(this.profile)],
            [KEYPAIRS_FOLDER_NAME, new KeypairsFolderNode(this.profile)],
            [LOADBALANCER_FOLDER_NAME, new LoadBalancerFolderNode(this.profile)],
            [NATSERVICES_FOLDER_NAME, new NatServicesFolderNode(this.profile)],
            [NET_FOLDER_NAME, new VpcFolderNode(this.profile)],
            [NETACCESSPOINTS_FOLDER_NAME, new NetAccessPointsFolderNode(this.profile)],
            [NETPEERINGS_FOLDER_NAME, new NetPeeringsFolderNode(this.profile)],
            [NICS_FOLDER_NAME, new NicsFolderNode(this.profile)],
            [PUBLICIP_FOLDER_NAME, new ExternalIPsFolderNode(this.profile)],
            [ROUTETABLES_FOLDER_NAME, new RouteTablesFolderNode(this.profile)],
            [SECURITYGROUPS_FOLDER_NAME, new SecurityGroupsFolderNode(this.profile)],
            [SNAPSHOTS_FOLDER_NAME, new SnapshotsFolderNode(this.profile)],
            [SUBNETS_FOLDER_NAME, new SubnetsFolderNode(this.profile)],
            [VIRTUALGATEWAYS_FOLDER_NAME, new VirtualGatewaysFolderNode(this.profile)],
            [VM_FOLDER_NAME, new VmsFolderNode(this.profile)],
            [VPNCONNECTIONS_FOLDER_NAME, new VpnConnectionsFolderNode(this.profile)],
            [VOLUME_FOLDER_NAME, new VolumeFolderNode(this.profile)],
            [VMGROUPS_FOLDER_NAME, new VmGroupsFolderNode(this.profile)],
            [VMTEMPLATES_FOLDER_NAME, new VmTemplatesFolderNode(this.profile)],
        ];

        let disableFolder = getConfigurationParameter<Array<string>>(DISABLE_FOLDER_PARAMETER);
        if (typeof disableFolder === 'undefined') {
            disableFolder = [];
        }
        const targetResources = [];
        for (const [folder, folderNode] of resources) {
            if (typeof folder !== "string") {
                continue;
            }
            if (typeof folderNode === "string") {
                continue;
            }
            if (!disableFolder.includes(folder)) {
                targetResources.push(folderNode);
            }
        }
        return Promise.resolve(targetResources);

    }

    getContextValue(): string {
        return "profilenode";
    }

    async getAccountId(): Promise<string | undefined> {
        if (this.profile.accountId.length !== 0) {
            return this.profile.accountId;
        }
        const res = await getAccount(this.profile, "");
        if (typeof res === "string" || typeof res === 'undefined') {
            return Promise.resolve(undefined);
        }

        if (typeof res.accountId === 'undefined') {
            return Promise.resolve("");
        }

        this.profile.accountId = res.accountId;

        return Promise.resolve(this.profile.accountId);
    }


}