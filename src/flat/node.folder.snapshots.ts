import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from './node';
import { FolderNode } from './node.folder';
import { ResourceNode } from './node.resources';
import { deleteSnapshot, getSnapshots } from '../cloud/snapshots';

export class SnapshotsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Snapshots");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getSnapshots(this.profile).then(result => {
			if (typeof result === "string") {
				vscode.window.showInformationMessage(result);
				return Promise.resolve([]);
			}
			let resources = [];
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