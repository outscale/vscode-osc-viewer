import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from './node';
import { FolderNode } from './node.folder';
import { getVolumes } from '../cloud/volume';
import { VolumeResourceNode } from './node.resources.volumes';

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
			const resources = [];
			for (const volume of result) {
                if (typeof volume.volumeId === 'undefined' || typeof volume.state === 'undefined') {
                    continue;
                }
                resources.push(new VolumeResourceNode(this.profile, "", volume.volumeId, volume.state));
			}
			return Promise.resolve(resources);
		});
		
    }
}