import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteDhcpOption, getDhcpOptions } from '../../../cloud/dhcpoptions';

export class DhcpOptionsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Dhcp Options");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getDhcpOptions(this.profile).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.dhcpOptionsSetId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "", item.dhcpOptionsSetId , "DhcpOption", deleteDhcpOption));
                
			}
			return Promise.resolve(resources);
		});
		
    }
}