import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteVpnConnection, getVpnConnections } from '../../../cloud/vpnconnections';

export class VpnConnectionsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Vpn Connections");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getVpnConnections(this.profile).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.vpnConnectionId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "" , item.vpnConnectionId, "VpnConnection", deleteVpnConnection));
                
			}
			return Promise.resolve(resources);
		});
		
    }
}