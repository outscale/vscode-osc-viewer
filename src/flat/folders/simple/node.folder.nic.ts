import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteNic, getNics } from '../../../cloud/nics';
import { FiltersNic, FiltersNicFromJSON } from 'outscale-api';

export const NICS_FOLDER_NAME="Nics";
export class NicsFolderNode extends FiltersFolderNode<FiltersNic> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, NICS_FOLDER_NAME);
    }

	getChildren(): Thenable<ExplorerNode[]> {
		this.updateFilters();
		return getNics(this.profile, this.filters).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.nicId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "", item.nicId, "Nic", deleteNic));
                
			}
			return Promise.resolve(resources);
		});
		
    }

	filtersFromJson(json: string): FiltersNic {
		return FiltersNicFromJSON(json);
	}
}