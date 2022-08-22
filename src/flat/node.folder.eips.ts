import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from './node';
import { FolderNode } from './node.folder';
import { ResourceNode } from './node.resources';
import { getExternalIPs } from '../cloud/eips';

export class ExternalIPsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "External IPs");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getExternalIPs(this.profile).then(result => {
			if (typeof result === "string") {
				vscode.window.showInformationMessage(result);
				return Promise.resolve([]);
			}
			let resources = [];
			for (const publicIp of result) {
				if (typeof publicIp.publicIp === 'undefined' || typeof publicIp.publicIpId === 'undefined') {
					continue;
				}
                resources.push(new ResourceNode(this.profile, publicIp.publicIp, publicIp.publicIpId, "eips"));
			}
			return Promise.resolve(resources);
		});
		
    }
}