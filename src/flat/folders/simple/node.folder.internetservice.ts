import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteInternetService, getInternetServices } from '../../../cloud/internetservices';
import { FiltersInternetService, FiltersInternetServiceFromJSON } from 'outscale-api';

export const INTERNETSERVICES_FOLDER_NAME="Internet Services";
export class InternetServicesFolderNode extends FiltersFolderNode<FiltersInternetService> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, INTERNETSERVICES_FOLDER_NAME);
    }

	getChildren(): Thenable<ExplorerNode[]> {
		this.updateFilters();
		return getInternetServices(this.profile, this.filters).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.internetServiceId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "", item.internetServiceId, "InternetService", deleteInternetService));
                
			}
			return Promise.resolve(resources);
		});
		
    }

	filtersFromJson(json: string): FiltersInternetService {
		return FiltersInternetServiceFromJSON(json);
	}
}