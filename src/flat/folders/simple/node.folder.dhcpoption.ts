import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteDhcpOption, getDhcpOption, getDhcpOptions } from '../../../cloud/dhcpoptions';
import { FiltersDhcpOptions, FiltersDhcpOptionsFromJSON } from 'outscale-api';

export const DHCPOPTIONS_FOLDER_NAME = "Dhcp Options";
export class DhcpOptionsFolderNode extends FiltersFolderNode<FiltersDhcpOptions> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, DHCPOPTIONS_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getDhcpOptions(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.dhcpOptionsSetId === 'undefined') {

                    continue;
                }

                resources.push(new ResourceNode(this.profile, "", item.dhcpOptionsSetId, "DhcpOption", deleteDhcpOption, getDhcpOption));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersDhcpOptions {
        return FiltersDhcpOptionsFromJSON(json);
    }
}