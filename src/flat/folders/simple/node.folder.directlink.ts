import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteDirectLink, getDirectLinks } from '../../../cloud/directlinks';

export class DirectLinksFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "DirectLinks");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getDirectLinks(this.profile).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.directLinkId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "", item.directLinkId, "DirectLink", deleteDirectLink));
                
			}
			return Promise.resolve(resources);
		});
		
    }
}