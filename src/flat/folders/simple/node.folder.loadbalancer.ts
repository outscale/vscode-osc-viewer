import * as vscode from 'vscode';
import { deleteLoadBalancer, getLoadBalancers } from '../../../cloud/loadbalancers';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { FiltersLoadBalancer, FiltersLoadBalancerFromJSON } from 'outscale-api';

export const LOADBALANCER_FOLDER_NAME = "LoadBalancers";
export class LoadBalancerFolderNode extends FiltersFolderNode<FiltersLoadBalancer> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, LOADBALANCER_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getLoadBalancers(this.profile, this.filters).then(result => {
            if (typeof result === "string") {
                vscode.window.showErrorMessage(`Error while reading ${this.folderName}: ${result}`);
                return Promise.resolve([]);
            }
            const resources = [];
            for (const lb of result) {
                if (typeof lb.loadBalancerName === 'undefined') {
                    continue;
                }
                resources.push(new ResourceNode(this.profile, "", lb.loadBalancerName, "loadbalancers", deleteLoadBalancer));
            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersLoadBalancer {
        return FiltersLoadBalancerFromJSON(json);
    }
}