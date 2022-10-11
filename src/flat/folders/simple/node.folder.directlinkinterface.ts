import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteDirectLinkInterface, getDirectLinkInterfaces } from '../../../cloud/directlinkinterfaces';

export class DirectLinkInterfacesFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "DirectLink Interfaces");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getDirectLinkInterfaces(this.profile).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.directLinkInterfaceId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "", item.directLinkInterfaceId , "DirectLinkInterface", deleteDirectLinkInterface));
                
			}
			return Promise.resolve(resources);
		});
		
    }
}