import * as vscode from 'vscode';
import { deleteOksClusterUnsupported, getOksCluster } from '../../cloud/oks';
import { ExplorerNode, Profile } from '../node';
import { ResourceNode } from './node.resources';
import { KubeKindFolderNode } from '../folders/simple/node.folder.kubekind';
import { KubeCategoryFolderNode, WORKLOAD_KINDS, NETWORK_KINDS, STORAGE_KINDS, CONFIGURATION_KINDS } from '../folders/simple/node.folder.kubecategory';
import { CustomResourcesFolderNode } from '../folders/simple/node.folder.customresources';
import { HelmReleasesFolderNode } from '../folders/simple/node.folder.helmreleases';

export class OksClusterResourceNode extends ResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string | undefined) {
        super(profile, resourceName, resourceId, "OksCluster", deleteOksClusterUnsupported, getOksCluster, undefined);
    }

    // Not "...resourcenode": keeps this read-only (no Delete/Copy Resource Id in the context menu)
    // since cluster deletion isn't wired up yet.
    getContextValue(): string {
        return "okscluster";
    }

    getIconPath(): vscode.ThemeIcon {
        return new vscode.ThemeIcon("server-environment");
    }

    getHoverExtraData(): vscode.MarkdownString | undefined {
        if (typeof this.resourceState === 'undefined') {
            return undefined;
        }
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`**Status**: ${this.resourceState}`);
        return markdown;
    }

    getTreeItem(): vscode.TreeItem {
        const treeItem = super.getTreeItem();
        // Base class uses resourceId (the cluster UUID) as the label; show the cluster's real
        // name instead, with the id as the smaller description.
        treeItem.label = this.resourceName.length > 0 ? this.resourceName : this.resourceId;
        treeItem.description = this.resourceId;
        treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        return treeItem;
    }

    getChildren(): Thenable<ExplorerNode[]> {
        const clusterId = this.resourceId;
        return Promise.resolve([
            new KubeKindFolderNode(this.profile, clusterId, "namespaces", false, "Namespaces"),
            new KubeKindFolderNode(this.profile, clusterId, "nodes", false, "Nodes"),
            new KubeKindFolderNode(this.profile, clusterId, "nodepool", false, "Node Pools"),
            new KubeCategoryFolderNode(this.profile, clusterId, "Workloads", WORKLOAD_KINDS),
            new KubeCategoryFolderNode(this.profile, clusterId, "Network", NETWORK_KINDS),
            new KubeCategoryFolderNode(this.profile, clusterId, "Storage", STORAGE_KINDS),
            new KubeCategoryFolderNode(this.profile, clusterId, "Configuration", CONFIGURATION_KINDS),
            new CustomResourcesFolderNode(this.profile, clusterId),
            new HelmReleasesFolderNode(this.profile, clusterId),
        ]);
    }
}
