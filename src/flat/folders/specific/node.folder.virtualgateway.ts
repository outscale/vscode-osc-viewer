import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { getVirtualGateways } from '../../../cloud/virtualgateways';
import { FiltersVirtualGateway, FiltersVirtualGatewayFromJSON } from 'outscale-api';
import { VirtualGatewayResourceNode } from '../../resources/node.resources.virtualgateways';

export const VIRTUALGATEWAYS_FOLDER_NAME = "Virtual Gateways";
export class VirtualGatewaysFolderNode extends FiltersFolderNode<FiltersVirtualGateway> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, VIRTUALGATEWAYS_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getVirtualGateways(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.virtualGatewayId === 'undefined') {

                    continue;
                }

                resources.push(new VirtualGatewayResourceNode(this.profile, "", item.virtualGatewayId, item.tags));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersVirtualGateway {
        return FiltersVirtualGatewayFromJSON(json);
    }
}