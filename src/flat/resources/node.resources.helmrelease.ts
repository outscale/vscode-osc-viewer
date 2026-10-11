import * as vscode from 'vscode';
import { deleteHelmReleaseUnsupported, getHelmRelease, helmReleaseCompositeId } from '../../cloud/kube';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';

export class HelmReleaseResourceNode extends ResourceNode {

    constructor(readonly profile: Profile, readonly clusterId: string, readonly namespace: string, readonly releaseName: string, readonly chart: string | undefined, readonly status: string | undefined) {
        super(profile, releaseName, helmReleaseCompositeId(clusterId, namespace, releaseName), "HelmRelease", deleteHelmReleaseUnsupported, getHelmRelease, undefined);
    }

    getContextValue(): string {
        return "helmrelease";
    }

    getIconPath(): vscode.ThemeIcon {
        return new vscode.ThemeIcon("package");
    }

    getTreeItem(): vscode.TreeItem {
        const treeItem = super.getTreeItem();
        treeItem.label = this.releaseName;
        treeItem.description = [this.namespace, this.chart, this.status]
            .filter(part => typeof part === 'string' && part.length > 0)
            .join(' · ');
        return treeItem;
    }
}
