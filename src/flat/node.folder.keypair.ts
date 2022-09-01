import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from './node';
import { FolderNode } from './node.folder';
import { ResourceNode } from './node.resources';
import { deleteKeypair, getKeypairs } from '../cloud/keypair';

export class KeypairsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Keypairs");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getKeypairs(this.profile).then(result => {
			if (typeof result === "string") {
				vscode.window.showErrorMessage(result);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const keypair of result) {
                if (typeof keypair.keypairName === 'undefined') {
                    continue;
                }
                resources.push(new ResourceNode(this.profile, "", keypair.keypairName, "keypairs", deleteKeypair));
			}
			return Promise.resolve(resources);
		});
		
    }
}