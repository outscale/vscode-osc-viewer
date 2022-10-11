import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteAccessKey, getAccessKeys } from '../../../cloud/accesskeys';

export class AccessKeysFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Access Keys");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getAccessKeys(this.profile).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.accessKeyId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "", item.accessKeyId , "AccessKey", deleteAccessKey));
                
			}
			return Promise.resolve(resources);
		});
		
    }
}