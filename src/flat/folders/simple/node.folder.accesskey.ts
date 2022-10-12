import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteAccessKey, getAccessKeys } from '../../../cloud/accesskeys';
import { FiltersAccessKeys, FiltersAccessKeysFromJSON } from 'outscale-api';

export const ACCESSKEY_FOLDER_NAME = "Access Keys";
export class AccessKeysFolderNode extends FiltersFolderNode<FiltersAccessKeys> implements ExplorerFolderNode {
	constructor(readonly profile: Profile) {
		super(profile, ACCESSKEY_FOLDER_NAME);
    }

	getChildren(): Thenable<ExplorerNode[]> {
		this.updateFilters();
		return getAccessKeys(this.profile, this.filters).then(results => {
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

	filtersFromJson(json: string): FiltersAccessKeys {
		return FiltersAccessKeysFromJSON(json);
	}
}