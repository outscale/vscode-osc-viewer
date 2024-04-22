import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteSubnet, getSubnet, getSubnets } from '../../../cloud/subnets';
import { FiltersSubnet, FiltersSubnetFromJSON } from 'outscale-api';

export const SUBNETS_FOLDER_NAME = "Subnets";
export class SubnetsFolderNode extends FiltersFolderNode<FiltersSubnet> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, SUBNETS_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getSubnets(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.subnetId === 'undefined') {

                    continue;
                }

                resources.push(new ResourceNode(this.profile, "", item.subnetId, "Subnet", deleteSubnet, getSubnet, item.tags));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersSubnet {
        return FiltersSubnetFromJSON(json);
    }
}