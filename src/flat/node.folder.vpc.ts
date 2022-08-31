import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from './node';
import { FolderNode } from './node.folder';
import { ResourceNode } from './node.resources';
import { deleteNet, getNets } from '../cloud/vpc';

export class VpcFolderNode extends FolderNode implements ExplorerFolderNode {
	constructor(readonly profile: Profile) {
		super(profile, "Nets");
	}

	getChildren(): Thenable<ExplorerNode[]> {
		return getNets(this.profile).then(netsResults => {
			if (typeof netsResults === "string") {
				vscode.window.showInformationMessage(netsResults);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const net of netsResults) {
				if (typeof net.netId === 'undefined') {
					continue;
				}
				resources.push(new ResourceNode(this.profile, "", net.netId?.toString(), "vpc", deleteNet));
			}
			return Promise.resolve(resources);
		});

	}

}