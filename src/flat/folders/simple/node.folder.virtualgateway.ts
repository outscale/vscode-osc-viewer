import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteVirtualGateway, getVirtualGateways } from '../../../cloud/virtualgateways';

export class VirtualGatewaysFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Virtual Gateways");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getVirtualGateways(this.profile).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.virtualGatewayId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "", item.virtualGatewayId, "VirtualGateway", deleteVirtualGateway));
                
			}
			return Promise.resolve(resources);
		});
		
    }
}