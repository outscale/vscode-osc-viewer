import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteApiAccessRule, getApiAccessRules } from '../../../cloud/apiaccessrules';

export class ApiAccessRulesFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Api Access Rules");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getApiAccessRules(this.profile).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.apiAccessRuleId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "", item.apiAccessRuleId , "ApiAccessRule", deleteApiAccessRule));
                
			}
			return Promise.resolve(resources);
		});
		
    }
}