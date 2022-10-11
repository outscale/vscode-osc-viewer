import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteNic, getNics } from '../../../cloud/nics';

export const NICS_FOLDER_NAME="Nics";
export class NicsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, NICS_FOLDER_NAME);
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getNics(this.profile).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.nicId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "", item.nicId, "Nic", deleteNic));
                
			}
			return Promise.resolve(resources);
		});
		
    }
}