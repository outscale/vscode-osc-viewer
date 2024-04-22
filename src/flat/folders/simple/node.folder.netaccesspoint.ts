import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteNetAccessPoint, getNetAccessPoint, getNetAccessPoints } from '../../../cloud/netaccesspoints';
import { FiltersNetAccessPoint, FiltersNetAccessPointFromJSON } from 'outscale-api';

export const NETACCESSPOINTS_FOLDER_NAME = "Net AccessPoints";
export class NetAccessPointsFolderNode extends FiltersFolderNode<FiltersNetAccessPoint> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, NETACCESSPOINTS_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getNetAccessPoints(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.netAccessPointId === 'undefined') {

                    continue;
                }

                resources.push(new ResourceNode(this.profile, "", item.netAccessPointId, "NetAccessPoint", deleteNetAccessPoint, getNetAccessPoint, item.tags));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersNetAccessPoint {
        return FiltersNetAccessPointFromJSON(json);
    }
}