import * as vscode from 'vscode';
import { deleteKubeObjectUnsupported, getKubeObjectByCompositeId, kubeObjectCompositeId } from '../../cloud/kube';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';

// Generic node for any Kubernetes object reached via kubectl (core types or CRD instances):
// namespaces, nodes, pods, deployments, services, secrets, node pools, custom resources, etc.
export class KubeObjectResourceNode extends ResourceNode {

    constructor(readonly profile: Profile, readonly clusterId: string, readonly kind: string, readonly namespace: string, readonly objectName: string, readonly extraDescription: string | undefined) {
        super(profile, objectName, kubeObjectCompositeId(clusterId, kind, namespace, objectName), "KubeObject", deleteKubeObjectUnsupported, getKubeObjectByCompositeId, undefined);
    }

    // Not "...resourcenode": keeps this read-only, matching every other Kubernetes-native node
    // (OksCluster's own object, not something this extension can safely mutate yet). Pods get
    // their own contextValue so "Show Pod Logs" only appears on them, not on every kube object.
    getContextValue(): string {
        return this.kind === "pods" ? "kubeobject-pod" : "kubeobject";
    }

    getIconPath(): vscode.ThemeIcon {
        return new vscode.ThemeIcon("symbol-object");
    }

    getTreeItem(): vscode.TreeItem {
        const treeItem = super.getTreeItem();
        // Base class uses resourceId (the clusterId::kind::namespace::name composite) as the
        // label; show the clean object name instead.
        treeItem.label = this.objectName;
        treeItem.description = [this.namespace, this.extraDescription]
            .filter(part => typeof part === 'string' && part.length > 0)
            .join(' · ');
        return treeItem;
    }
}
