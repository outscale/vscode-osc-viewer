import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteNetPeering, getNetPeerings } from '../../../cloud/netpeerings';
import { FiltersNetPeering, FiltersNetPeeringFromJSON } from 'outscale-api';

export const NETPEERINGS_FOLDER_NAME = "Net Peerings";
export class NetPeeringsFolderNode extends FiltersFolderNode<FiltersNetPeering> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, NETPEERINGS_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getNetPeerings(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(`Error while reading ${this.folderName}: ${results}`);
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.netPeeringId === 'undefined') {

                    continue;
                }

                resources.push(new ResourceNode(this.profile, "", item.netPeeringId, "NetPeering", deleteNetPeering));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersNetPeering {
        return FiltersNetPeeringFromJSON(json);
    }
}