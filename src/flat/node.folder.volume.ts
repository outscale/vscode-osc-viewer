import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from './node';
import { FolderNode } from './node.folder';
import { ResourceNode } from './node.resources';
import { getVolumes } from '../cloud/volume';

export class VolumeFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Volumes");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getVolumes(this.profile).then(result => {
			if (typeof result === "string") {
				vscode.window.showInformationMessage(result);
				return Promise.resolve([]);
			}
			let resources = [];
			for (const volume of result) {
                if (typeof volume.volumeId === 'undefined') {
                    continue;
                }
                resources.push(new ResourceNode(this.profile, "", volume.volumeId, "volumes"));
			}
			return Promise.resolve(resources);
		});
		
    }
}