import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteFlexibleGpu, getFlexibleGpus } from '../../../cloud/flexiblegpus';

export class FlexibleGpusFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Flexible Gpus");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getFlexibleGpus(this.profile).then(results => {
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
}