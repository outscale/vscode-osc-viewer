import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { FiltersVmGroup, FiltersVmGroupFromJSON } from 'outscale-api';
import { deleteVmGroup, getVmGroup, getVmGroups } from '../../../cloud/vmgroup';

export const VMGROUPS_FOLDER_NAME = "Vm Groups";
export class VmGroupsFolderNode extends FiltersFolderNode<FiltersVmGroup> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, VMGROUPS_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getVmGroups(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.vmGroupId === 'undefined') {

                    continue;
                }

                if (typeof item.vmGroupName === 'undefined') {

                    continue;
                }

                resources.push(new ResourceNode(this.profile, item.vmGroupName, item.vmGroupId, "VmGroup", deleteVmGroup, getVmGroup));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersVmGroup {
        return FiltersVmGroupFromJSON(json);
    }
}