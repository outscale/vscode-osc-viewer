import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteApiAccessRule, getApiAccessRules } from '../../../cloud/apiaccessrules';
import { FiltersApiAccessRule, FiltersApiAccessRuleFromJSON } from 'outscale-api';

export const APIACCESSRULES_FOLDER_NAME = "Api Access Rules";
export class ApiAccessRulesFolderNode extends FiltersFolderNode<FiltersApiAccessRule> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, APIACCESSRULES_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getApiAccessRules(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(`Error while reading ${this.folderName}: ${results}`);
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.apiAccessRuleId === 'undefined') {

                    continue;
                }

                resources.push(new ResourceNode(this.profile, "", item.apiAccessRuleId, "ApiAccessRule", deleteApiAccessRule));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersApiAccessRule {
        return FiltersApiAccessRuleFromJSON(json);
    }
}