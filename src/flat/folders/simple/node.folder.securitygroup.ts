import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteSecurityGroup, getSecurityGroups } from '../../../cloud/securitygroups';
import { FiltersSecurityGroup, FiltersSecurityGroupFromJSON } from 'outscale-api';

export const SECURITYGROUPS_FOLDER_NAME = "Security Groups";
export class SecurityGroupsFolderNode extends FiltersFolderNode<FiltersSecurityGroup> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, SECURITYGROUPS_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getSecurityGroups(this.profile, this.filters).then(sgsResults => {
            if (typeof sgsResults === "string") {
                vscode.window.showErrorMessage(`Error while reading ${this.folderName}: ${sgsResults}`);
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

    filtersFromJson(json: string): FiltersSecurityGroup {
        return FiltersSecurityGroupFromJSON(json);
    }
}