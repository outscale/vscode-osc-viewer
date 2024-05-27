import * as vscode from 'vscode';
import { getLoadBalancers } from '../../../cloud/loadbalancers';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { FiltersLoadBalancer, FiltersLoadBalancerFromJSON } from 'outscale-api';
import { LoadBalancerResourceNode } from '../../resources/node.resources.loadbalancers';

export const LOADBALANCER_FOLDER_NAME = "LoadBalancers";
export class LoadBalancerFolderNode extends FiltersFolderNode<FiltersLoadBalancer> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, LOADBALANCER_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getLoadBalancers(this.profile, this.filters).then(result => {
            if (typeof result === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, result));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const lb of result) {
                if (typeof lb.loadBalancerName === 'undefined') {
                    continue;
                }

                resources.push(new LoadBalancerResourceNode(this.profile, "", lb.loadBalancerName, lb.tags));
            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersLoadBalancer {
        return FiltersLoadBalancerFromJSON(json);
    }
}