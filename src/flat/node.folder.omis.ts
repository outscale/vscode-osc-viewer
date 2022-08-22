import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from './node';
import { FolderNode } from './node.folder';
import { ResourceNode } from './node.resources';
import { getOMIs } from '../cloud/omis';

export class OMIsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "OMIs");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getOMIs(this.profile).then(result => {
			if (typeof result === "string") {
				vscode.window.showInformationMessage(result);
				return Promise.resolve([]);
			}
			let resources = [];
			for (const image of result) {
				if (typeof image.imageId === 'undefined' || typeof image.imageName === 'undefined') {
					continue;
				}
                resources.push(new ResourceNode(this.profile, image.imageName, image.imageId, "omis"));
			}
			return Promise.resolve(resources);
		});
		
    }
}