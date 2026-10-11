import * as vscode from 'vscode';
import { getHelmReleases } from '../../../cloud/kube';
import { HelmReleaseResourceNode } from '../../resources/node.resources.helmrelease';
import { ExplorerFolderNode, ExplorerNode, Profile, resourceNodeCompare } from '../../node';
import { FolderNode } from '../node.folder';

export const HELMRELEASES_FOLDER_NAME = "Helm Releases";

export class HelmReleasesFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile, readonly clusterId: string) {
        super(profile, HELMRELEASES_FOLDER_NAME);
    }

    getContextValue(): string {
        return "kubecategoryfoldernode";
    }

    getChildren(): Thenable<ExplorerNode[]> {
        return getHelmReleases(this.profile, this.clusterId).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = results.map(release =>
                new HelmReleaseResourceNode(this.profile, this.clusterId, release.namespace, release.name, release.chart, release.status)
            );
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });
    }
}
