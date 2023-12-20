import * as vscode from 'vscode';
import { ExplorerNode, ExplorerResourceNode, Profile, ResourceNodeType } from '../node';



export class ResourceNode implements ExplorerResourceNode {


    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceType: ResourceNodeType, readonly deleteFunc: (profile: Profile, resourceid: string) => Promise<string | undefined>, readonly getFunc: (profile: Profile, resourceid: string) => Promise<any | string | undefined>) {
    }

    getResourceId(): Promise<string | undefined> {
        return Promise.resolve(this.resourceId);
    }

    getIconPath(): vscode.ThemeIcon {
        return new vscode.ThemeIcon("dash");
    }

    getContextValue(): string {
        return "resourcenode";
    }


    async deleteResource(): Promise<string | undefined> {
        const resource = await this.getFunc(this.profile, this.resourceId);
        if (typeof resource === 'undefined' || typeof resource === 'string') {
            return resource;
        }

        return this.deleteFunc(this.profile, this.resourceId);
    }

    getResourceName(): string {
        if (this.resourceName.length > 0) {
            return this.resourceName;
        }
        return this.resourceId;
    }


    getTreeItem(): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(this.resourceId, vscode.TreeItemCollapsibleState.None);
        treeItem.description = this.resourceName;
        if (typeof this.profile.oscCost !== 'undefined') {
            const oscCost = this.profile.oscCost.getResourceIdCost(this.resourceType, this.resourceId);
            if (typeof oscCost !== 'undefined') {
                treeItem.description += " " + this.profile.oscCost.getResourceIdCost(this.resourceType, this.resourceId);
            }
        }
        treeItem.iconPath = this.getIconPath();
        treeItem.command = {
            "title": vscode.l10n.t("Get"),
            "command": "osc.showResource",
            "arguments": [this]
        };
        treeItem.contextValue = this.getContextValue();
        return treeItem;
    }

    getChildren(): Thenable<ExplorerNode[]> {
        return Promise.resolve([]);
    }


}