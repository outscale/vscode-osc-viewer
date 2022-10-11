import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteRouteTable, getRouteTables } from '../../../cloud/routetables';

export class RouteTablesFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Route tables");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getRouteTables(this.profile).then(result => {
			if (typeof result === "string") {
				vscode.window.showErrorMessage(result);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const routeTable of result) {
				if (typeof routeTable.routeTableId === 'undefined') {
					continue;
				}
                resources.push(new ResourceNode(this.profile, "", routeTable.routeTableId, "routetables", deleteRouteTable));
			}
			return Promise.resolve(resources);
		});
		
    }
}