import * as vscode from 'vscode';
import { OksCluster, getOksClusters, getOksProjects } from '../../../cloud/oks';
import { OksClusterResourceNode } from '../../resources/node.resources.oksclusters';
import { ExplorerFolderNode, ExplorerNode, Profile, resourceNodeCompare } from '../../node';
import { FolderNode } from '../node.folder';

export const OKSCLUSTERS_FOLDER_NAME = "Kubernetes Clusters (OKS)";
export class OksClustersFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, OKSCLUSTERS_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        return Promise.all([getOksClusters(this.profile), getOksProjects(this.profile)]).then(([results, projects]) => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }

            // Best-effort: if the projects lookup fails, still show clusters grouped by id
            // rather than losing the whole tree over a secondary, non-essential call.
            const projectNames = new Map<string, string>();
            if (typeof projects !== "string") {
                for (const project of projects) {
                    projectNames.set(project.id, project.name);
                }
            }

            const byProject = new Map<string, OksCluster[]>();
            for (const cluster of results) {
                const projectId = cluster.project_id ?? "unknown";
                const clusters = byProject.get(projectId) ?? [];
                clusters.push(cluster);
                byProject.set(projectId, clusters);
            }

            const projectFolders = Array.from(byProject.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([projectId, clusters]) =>
                    new OksProjectFolderNode(this.profile, projectNames.get(projectId) ?? projectId, clusters));

            return Promise.resolve(projectFolders);
        });
    }
}

// Groups clusters by their OKS project, one subfolder per project (labeled by name; falls back
// to the project id if the name couldn't be resolved).
class OksProjectFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile, readonly projectLabel: string, readonly clusters: OksCluster[]) {
        super(profile, `Project ${projectLabel}`);
    }

    // Not "...foldernode": this subfolder isn't part of the top-level disableFolders list,
    // so the generic "Hide" action wouldn't do anything useful here anyway.
    getContextValue(): string {
        return "oksprojectfoldernode";
    }

    getChildren(): Thenable<ExplorerNode[]> {
        const resources = this.clusters.map(cluster =>
            new OksClusterResourceNode(this.profile, cluster.name, cluster.id, cluster.statuses?.status)
        );
        return Promise.resolve(resources.sort(resourceNodeCompare));
    }
}
