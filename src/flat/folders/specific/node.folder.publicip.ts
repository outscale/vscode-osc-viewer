import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { getExternalIPs } from '../../../cloud/publicips';
import { PublicIpResourceNode } from '../../resources/node.resources.eip';

export const PUBLICIP_FOLDER_NAME = "External IPs";
export class ExternalIPsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, PUBLICIP_FOLDER_NAME);
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getExternalIPs(this.profile).then(result => {
			if (typeof result === "string") {
				vscode.window.showErrorMessage(result);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const publicIp of result) {
				if (typeof publicIp.publicIp === 'undefined' || typeof publicIp.publicIpId === 'undefined') {
					continue;
				}
                resources.push(new PublicIpResourceNode(this.profile, publicIp.publicIp, publicIp.publicIpId, (typeof publicIp.linkPublicIpId === "undefined" || publicIp.linkPublicIpId.length === 0) ? "unlink": "link"));
			}
			return Promise.resolve(resources);
		});
		
    }
}