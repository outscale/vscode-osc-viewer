import * as vscode from 'vscode';
import { FiltersVpnConnection, FiltersNetAccessPoint, FiltersNet, FiltersCa, FiltersSnapshot, FiltersFlexibleGpu, FiltersNic, FiltersDirectLink, FiltersApiAccessRule, FiltersLoadBalancer, FiltersKeypair, FiltersNetPeering, FiltersVolume, FiltersSubnet, FiltersDirectLinkInterface, FiltersClientGateway, FiltersNatService, FiltersSecurityGroup, FiltersRouteTable, FiltersImage, FiltersInternetService, FiltersVm, FiltersVirtualGateway, FiltersPublicIp } from 'outscale-api';
import { ThemeIcon } from 'vscode';
import { FILTERS_PARAMETER, getConfigurationParameter, updateConfigurationParameter } from '../../configuration/utils';
import { Profile } from '../node';
import { FolderNode } from './node.folder';

export type FiltersType = FiltersVpnConnection | FiltersNetAccessPoint | FiltersNet | FiltersCa | FiltersSnapshot | FiltersFlexibleGpu | FiltersNic | FiltersDirectLink | FiltersApiAccessRule | FiltersLoadBalancer | FiltersKeypair | FiltersNetPeering | FiltersVolume | FiltersSubnet | FiltersDirectLinkInterface | FiltersClientGateway | FiltersNatService | FiltersSecurityGroup | FiltersRouteTable | FiltersImage | FiltersInternetService | FiltersVm | FiltersVirtualGateway | FiltersPublicIp;
export abstract class FiltersFolderNode<T> extends FolderNode {

    filters: T | undefined;
    constructor(readonly profile: Profile, readonly folderName: string) {
        super(profile, folderName);
        this.filters = undefined;
        this.updateFilters();
    }

    getContextValue(): string {
        if (typeof this.filters === 'undefined') {
            return "emptyfilterfoldernode";
        }
        return "filterfoldernode";
    }

    getTreeItem(): vscode.TreeItem {
        const treeItem = super.getTreeItem();
        if (typeof this.filters !== 'undefined') {
            treeItem.iconPath = new ThemeIcon("filter-filled");
        }

        return treeItem;
    }

    async resetFilters(): Promise<void> {
        const filters = getConfigurationParameter<any>(FILTERS_PARAMETER);
        if (this.folderName in filters) {
            filters[this.folderName] = undefined;
        }
        await updateConfigurationParameter(FILTERS_PARAMETER, filters);
        this.filters = undefined;
    }

    updateFilters(): void {
        const filters = getConfigurationParameter<any>(FILTERS_PARAMETER);
        if (this.folderName in filters) {
            this.filters = this.filtersFromJson(filters[this.folderName]);
        }
    }

    abstract filtersFromJson(json: string): T;

}