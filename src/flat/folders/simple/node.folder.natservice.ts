import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteNatService, getNatServices } from '../../../cloud/natservices';

export class NatServicesFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Nat Services");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getNatServices(this.profile).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.natServiceId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "", item.natServiceId, "NatService", deleteNatService));
                
			}
			return Promise.resolve(resources);
		});
		
    }
}