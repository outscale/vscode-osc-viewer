import * as vscode from 'vscode';
import { deleteLoadBalancer, getLoadBalancers } from '../../../cloud/loadbalancers';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';

export const LOADBALANCER_FOLDER_NAME="LoadBalancers";
export class LoadBalancerFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, LOADBALANCER_FOLDER_NAME);
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getLoadBalancers(this.profile).then(result => {
			if (typeof result === "string") {
				vscode.window.showErrorMessage(result);
				return Promise.resolve([]);
			}
			const resources = [];
			for (const lb of result) {
                if (typeof lb.loadBalancerName === 'undefined') {
                    continue;
                }
                resources.push(new ResourceNode(this.profile, "", lb.loadBalancerName, "loadbalancers", deleteLoadBalancer));
			}
			return Promise.resolve(resources);
		});
		
    }
}