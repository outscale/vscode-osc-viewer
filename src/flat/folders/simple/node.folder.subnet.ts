import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteSubnet, getSubnets } from '../../../cloud/subnets';

export class SubnetsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Subnets");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getSubnets(this.profile).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.subnetId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "" , item.subnetId, "Subnet", deleteSubnet));
                
			}
			return Promise.resolve(resources);
		});
		
    }
}