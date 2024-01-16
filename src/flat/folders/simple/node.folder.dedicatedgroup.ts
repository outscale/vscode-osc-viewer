import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { FiltersDedicatedGroup, FiltersDedicatedGroupFromJSON } from 'outscale-api';
import { deleteDedicatedGroup, getDedicatedGroup, getDedicatedGroups } from '../../../cloud/dedicatedgroup';

export const DEDICATEDGROUP_FOLDER_NAME = "Dedicated Groups";
export class DedicatedGroupsFolderNode extends FiltersFolderNode<FiltersDedicatedGroup> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, DEDICATEDGROUP_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getDedicatedGroups(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.dedicatedGroupId === 'undefined') {

                    continue;
                }

                if (typeof item.name === 'undefined') {

                    continue;
                }

                resources.push(new ResourceNode(this.profile, item.name, item.dedicatedGroupId, "DedicatedGroup", deleteDedicatedGroup, getDedicatedGroup));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersDedicatedGroup {
        return FiltersDedicatedGroupFromJSON(json);
    }
}