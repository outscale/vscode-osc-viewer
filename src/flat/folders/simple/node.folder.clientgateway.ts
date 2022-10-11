import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteClientGateway, getClientGateways } from '../../../cloud/clientgateways';

export const CLIENTGATEWAYS_FOLDER_NAME="Client Gateways";
export class ClientGatewaysFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, CLIENTGATEWAYS_FOLDER_NAME);
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getClientGateways(this.profile).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.clientGatewayId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "", item.clientGatewayId , "ClientGateway", deleteClientGateway));
                
			}
			return Promise.resolve(resources);
		});
		
    }
}