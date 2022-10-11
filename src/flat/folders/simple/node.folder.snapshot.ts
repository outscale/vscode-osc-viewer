import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteSnapshot, getSnapshots } from '../../../cloud/snapshots';

export const SNAPSHOTS_FOLDER_NAME="Snapshots";
export class SnapshotsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, SNAPSHOTS_FOLDER_NAME);
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getSnapshots(this.profile).then(result => {
			if (typeof result === "string") {
				vscode.window.showErrorMessage(result);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const snapshot of result) {
				if (typeof snapshot.snapshotId === 'undefined' || typeof snapshot.description === 'undefined') {
					continue;
				}
                resources.push(new ResourceNode(this.profile, snapshot.description, snapshot.snapshotId, "snapshots", deleteSnapshot));
			}
			return Promise.resolve(resources);
		});
		
    }
}