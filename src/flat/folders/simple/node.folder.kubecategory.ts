import { ExplorerFolderNode, ExplorerNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { KubeKindFolderNode } from './node.folder.kubekind';

interface KindSpec {
    kind: string;
    namespaced: boolean;
    folderName: string;
}

export const WORKLOAD_KINDS: KindSpec[] = [
    { kind: "pods", namespaced: true, folderName: "Pods" },
    { kind: "deployments", namespaced: true, folderName: "Deployments" },
    { kind: "statefulsets", namespaced: true, folderName: "StatefulSets" },
    { kind: "daemonsets", namespaced: true, folderName: "DaemonSets" },
    { kind: "replicasets", namespaced: true, folderName: "ReplicaSets" },
    { kind: "jobs", namespaced: true, folderName: "Jobs" },
    { kind: "cronjobs", namespaced: true, folderName: "CronJobs" },
];

export const NETWORK_KINDS: KindSpec[] = [
    { kind: "services", namespaced: true, folderName: "Services" },
    { kind: "ingresses", namespaced: true, folderName: "Ingresses" },
    { kind: "networkpolicies", namespaced: true, folderName: "Network Policies" },
];

export const STORAGE_KINDS: KindSpec[] = [
    { kind: "persistentvolumes", namespaced: false, folderName: "Persistent Volumes" },
    { kind: "persistentvolumeclaims", namespaced: true, folderName: "Persistent Volume Claims" },
    { kind: "storageclasses", namespaced: false, folderName: "Storage Classes" },
];

export const CONFIGURATION_KINDS: KindSpec[] = [
    { kind: "configmaps", namespaced: true, folderName: "Config Maps" },
    { kind: "secrets", namespaced: true, folderName: "Secrets" },
];

// A static grouping folder (Workloads, Network, Storage, Configuration) whose children are a
// fixed list of per-kind folders — doesn't call kubectl itself.
export class KubeCategoryFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile, readonly clusterId: string, categoryName: string, readonly kinds: KindSpec[]) {
        super(profile, categoryName);
    }

    getContextValue(): string {
        return "kubecategoryfoldernode";
    }

    getChildren(): Thenable<ExplorerNode[]> {
        return Promise.resolve(this.kinds.map(k => new KubeKindFolderNode(this.profile, this.clusterId, k.kind, k.namespaced, k.folderName)));
    }
}
