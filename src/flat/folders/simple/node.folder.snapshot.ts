import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteSnapshot, getSnapshot, getSnapshots } from '../../../cloud/snapshots';
import { FiltersSnapshot, FiltersSnapshotFromJSON } from 'outscale-api';

export const SNAPSHOTS_FOLDER_NAME = "Snapshots";
export class SnapshotsFolderNode extends FiltersFolderNode<FiltersSnapshot> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, SNAPSHOTS_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getSnapshots(this.profile, this.filters).then(result => {
            if (typeof result === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, result));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const snapshot of result) {
                if (typeof snapshot.snapshotId === 'undefined' || typeof snapshot.description === 'undefined') {
                    continue;
                }
                resources.push(new ResourceNode(this.profile, snapshot.description, snapshot.snapshotId, "snapshots", deleteSnapshot, getSnapshot, snapshot.tags));
            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersSnapshot {
        return FiltersSnapshotFromJSON(json);
    }

}