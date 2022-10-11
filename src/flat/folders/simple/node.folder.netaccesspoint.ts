import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteNetAccessPoint, getNetAccessPoints } from '../../../cloud/netaccesspoints';

export class NetAccessPointsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Net AccessPoints");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getNetAccessPoints(this.profile).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.netAccessPointId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "", item.netAccessPointId, "NetAccessPoint", deleteNetAccessPoint));
                
			}
			return Promise.resolve(resources);
		});
		
    }
}