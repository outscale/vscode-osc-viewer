import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { getSecurityGroups } from '../../../cloud/securitygroups';
import { FiltersSecurityGroup, FiltersSecurityGroupFromJSON } from 'outscale-api';
import { SecurityGroupResourceNode } from '../../resources/node.resources.securitygroups';

export const SECURITYGROUPS_FOLDER_NAME = "Security Groups";
export class SecurityGroupsFolderNode extends FiltersFolderNode<FiltersSecurityGroup> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, SECURITYGROUPS_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getSecurityGroups(this.profile, this.filters).then(sgsResults => {
            if (typeof sgsResults === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, sgsResults));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const sg of sgsResults) {
                if (typeof sg.securityGroupId === 'undefined' || typeof sg.securityGroupName === 'undefined') {
                    continue;
                }
                resources.push(new SecurityGroupResourceNode(this.profile, sg.securityGroupName, sg.securityGroupId, sg.tags));
            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersSecurityGroup {
        return FiltersSecurityGroupFromJSON(json);
    }
}