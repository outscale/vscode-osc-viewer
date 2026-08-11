import * as vscode from 'vscode';
import { describeKubeObject, getKubeObjects } from '../../../cloud/kube';
import { KubeObjectResourceNode } from '../../resources/node.resources.kubeobject';
import { ExplorerFolderNode, ExplorerNode, Profile, resourceNodeCompare } from '../../node';
import { FolderNode } from '../node.folder';

// Lists every object of one Kubernetes kind (e.g. all Pods, all Services) across every
// namespace for namespaced kinds — the namespace is shown per-object rather than nesting a
// namespace picker in between.
export class KubeKindFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile, readonly clusterId: string, readonly kind: string, readonly namespaced: boolean, folderName: string) {
        super(profile, folderName);
    }

    // Not "...foldernode": nested folders like this aren't part of the top-level disableFolders
    // list, so the generic "Hide" action wouldn't do anything useful here.
    getContextValue(): string {
        return "kubekindfoldernode";
    }

    getChildren(): Thenable<ExplorerNode[]> {
        return getKubeObjects(this.profile, this.clusterId, this.kind, this.namespaced).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = results.map(obj => {
                const namespace = obj.metadata?.namespace ?? "";
                const name = obj.metadata?.name ?? "";
                return new KubeObjectResourceNode(this.profile, this.clusterId, this.kind, namespace, name, describeKubeObject(this.kind, obj));
            });
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });
    }
}
