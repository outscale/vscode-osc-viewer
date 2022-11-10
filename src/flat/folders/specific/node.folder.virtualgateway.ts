import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
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
                vscode.window.showErrorMessage(`Error while reading ${this.folderName}: ${results}`);
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.virtualGatewayId === 'undefined') {

                    continue;
                }

                resources.push(new VirtualGatewayResourceNode(this.profile, "", item.virtualGatewayId));

            }
            return Promise.resolve(resources);
        });

    }

    filtersFromJson(json: string): FiltersVirtualGateway {
        return FiltersVirtualGatewayFromJSON(json);
    }
}