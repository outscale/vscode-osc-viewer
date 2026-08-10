import * as vscode from 'vscode';
import { getCustomResourceDefinitions } from '../../../cloud/kube';
import { ExplorerFolderNode, ExplorerNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { KubeKindFolderNode } from './node.folder.kubekind';

export const CUSTOMRESOURCES_FOLDER_NAME = "Custom Resources";

// One subfolder per CRD registered on the cluster, listing instances of that CRD — discovered
// dynamically since custom resource types aren't known ahead of time.
export class CustomResourcesFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile, readonly clusterId: string) {
        super(profile, CUSTOMRESOURCES_FOLDER_NAME);
    }

    getContextValue(): string {
        return "kubecategoryfoldernode";
    }

    getChildren(): Thenable<ExplorerNode[]> {
        return getCustomResourceDefinitions(this.profile, this.clusterId).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = results
                .map(crd => {
                    const plural = crd.spec?.names?.plural;
                    const group = crd.spec?.group;
                    const kind = typeof plural === 'string' && typeof group === 'string' ? `${plural}.${group}` : crd.metadata?.name;
                    if (typeof kind !== 'string') {
                        return undefined;
                    }
                    const namespaced = crd.spec?.scope === 'Namespaced';
                    const folderName = crd.metadata?.name ?? kind;
                    return new KubeKindFolderNode(this.profile, this.clusterId, kind, namespaced, folderName);
                })
                .filter((node): node is KubeKindFolderNode => typeof node !== 'undefined')
                .sort((a, b) => a.folderName.localeCompare(b.folderName));
            return Promise.resolve(resources);
        });
    }
}
