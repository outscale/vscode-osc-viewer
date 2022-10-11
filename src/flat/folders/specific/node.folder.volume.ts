import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { getVolumes } from '../../../cloud/volumes';
import { VolumeResourceNode } from '../../resources/node.resources.volumes';

export const VOLUME_FOLDER_NAME = "Volumes";
export class VolumeFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, VOLUME_FOLDER_NAME);
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getVolumes(this.profile).then(result => {
			if (typeof result === "string") {
				vscode.window.showErrorMessage(result);
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