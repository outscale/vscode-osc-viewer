import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteFlexibleGpu, getFlexibleGpus } from '../../../cloud/flexiblegpus';
import { FiltersFlexibleGpu, FiltersFlexibleGpuFromJSON } from 'outscale-api';

export const FLEXIBLEGPUS_FOLDER_NAME="Flexible Gpus";
export class FlexibleGpusFolderNode extends FiltersFolderNode<FiltersFlexibleGpu> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, FLEXIBLEGPUS_FOLDER_NAME);
    }

	getChildren(): Thenable<ExplorerNode[]> {
		this.updateFilters();
		return getFlexibleGpus(this.profile, this.filters).then(results => {
			if (typeof results === "string") {
				vscode.window.showErrorMessage(results);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const item of results) {
                
                if (typeof item.flexibleGpuId === 'undefined') {
                
                    continue;
                }
                
                resources.push(new ResourceNode(this.profile, "", item.flexibleGpuId, "FlexibleGpu", deleteFlexibleGpu));
                
			}
			return Promise.resolve(resources);
		});
		
    }

	filtersFromJson(json: string): FiltersFlexibleGpu {
		return FiltersFlexibleGpuFromJSON(json);
	}
}