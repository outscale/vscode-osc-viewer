import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteDhcpOption, getDhcpOptions } from '../../../cloud/dhcpoptions';
import { FiltersDhcpOptions, FiltersDhcpOptionsFromJSON } from 'outscale-api';

export const DHCPOPTIONS_FOLDER_NAME="Dhcp Options";
export class DhcpOptionsFolderNode extends FiltersFolderNode<FiltersDhcpOptions> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, DHCPOPTIONS_FOLDER_NAME);
    }

	getChildren(): Thenable<ExplorerNode[]> {
		this.updateFilters();
		return getDhcpOptions(this.profile, this.filters).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(`Error while reading ${this.folderName}: ${results}`);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.dhcpOptionsSetId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "", item.dhcpOptionsSetId , "DhcpOption", deleteDhcpOption));
                
			}
			return Promise.resolve(resources);
		});
		
    }

	filtersFromJson(json: string): FiltersDhcpOptions {
		return FiltersDhcpOptionsFromJSON(json);
	}
}