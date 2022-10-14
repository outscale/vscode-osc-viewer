import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteVpnConnection, getVpnConnections } from '../../../cloud/vpnconnections';
import { FiltersVpnConnection, FiltersVpnConnectionFromJSON } from 'outscale-api';

export const VPNCONNECTIONS_FOLDER_NAME="Vpn Connections";
export class VpnConnectionsFolderNode extends FiltersFolderNode<FiltersVpnConnection> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, VPNCONNECTIONS_FOLDER_NAME);
    }

	getChildren(): Thenable<ExplorerNode[]> {
		this.updateFilters();
		return getVpnConnections(this.profile, this.filters).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(`Error while reading ${this.folderName}: ${results}`);
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

	filtersFromJson(json: string): FiltersVpnConnection {
		return FiltersVpnConnectionFromJSON(json);
	}
}