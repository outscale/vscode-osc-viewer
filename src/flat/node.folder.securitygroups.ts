import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from './node';
import { FolderNode } from './node.folder';
import { ResourceNode } from './node.resources';
import { deleteSecurityGroup, getSecurityGroups } from '../cloud/securitygroups';

export class SecurityGroupsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Security Groups");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getSecurityGroups(this.profile).then(sgsResults => {
			if (typeof sgsResults === "string") {
				vscode.window.showInformationMessage(sgsResults);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const sg of sgsResults) {
                if (typeof sg.securityGroupId === 'undefined' || typeof sg.securityGroupName === 'undefined') {
                    continue;
                }
                resources.push(new ResourceNode(this.profile, sg.securityGroupName, sg.securityGroupId, "securitygroups", deleteSecurityGroup));
			}
			return Promise.resolve(resources);
		});
		
    }
}