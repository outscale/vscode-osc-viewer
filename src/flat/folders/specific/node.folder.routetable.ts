import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { getRouteTables } from '../../../cloud/routetables';
import { FiltersRouteTable, FiltersRouteTableFromJSON } from 'outscale-api';
import { RouteTableResourceNode } from '../../resources/node.resources.routetables';

export const ROUTETABLES_FOLDER_NAME = "Route tables";
export class RouteTablesFolderNode extends FiltersFolderNode<FiltersRouteTable> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, ROUTETABLES_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getRouteTables(this.profile, this.filters).then(result => {
            if (typeof result === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, result));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const routeTable of result) {
                if (typeof routeTable.routeTableId === 'undefined') {
                    continue;
                }
                resources.push(new RouteTableResourceNode(this.profile, "", routeTable.routeTableId, (typeof routeTable.linkRouteTables === 'undefined') || routeTable.linkRouteTables.length === 0 ? 'unlink' : 'link', routeTable.tags));
            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersRouteTable {
        return FiltersRouteTableFromJSON(json);
    }
}