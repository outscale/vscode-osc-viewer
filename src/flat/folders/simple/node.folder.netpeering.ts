import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteNetPeering, getNetPeerings } from '../../../cloud/netpeerings';

export const NETPEERINGS_FOLDER_NAME="Net Peerings";
export class NetPeeringsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, NETPEERINGS_FOLDER_NAME);
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getNetPeerings(this.profile).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.netPeeringId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile,  "", item.netPeeringId, "NetPeering", deleteNetPeering));
                
			}
			return Promise.resolve(resources);
		});
		
    }
}