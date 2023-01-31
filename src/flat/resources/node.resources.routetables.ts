import * as osc from "outscale-api";
import * as vscode from 'vscode';
import { deleteRouteTable, getRouteTable, removeRoute, routeToString, unlinkRouteTable } from '../../cloud/routetables';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { LinkResourceNode } from './types/node.resources.link';
import { SubResourceNode } from "./types/node.resources.subresource";


export class RouteTableResourceNode extends ResourceNode implements LinkResourceNode, SubResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string) {
        super(profile, resourceName, resourceId, "routetables", deleteRouteTable, getRouteTable);
    }

    getContextValue(): string {
        return "routetableresourcenode;linkresourcenode;subresourcenode";
    }

    getIconPath(): vscode.ThemeIcon {
        switch (this.resourceState) {
            case "link":
                return new vscode.ThemeIcon("plug");
            default:
                return new vscode.ThemeIcon("dash");
        }

    }

    async deleteResource(): Promise<string | undefined> {
        let res = await this.unlinkAllResource();
        if (res === 'string') {
            return res;
        }

        res = await this.removeAllSubresources();
        if (res === 'string') {
            return res;
        }

        return super.deleteResource();
    }

    async unlinkResource(): Promise<string | undefined> {
        const rt = await getRouteTable(this.profile, this.resourceId);
        if (typeof rt === "string" || typeof rt === 'undefined') {
            return rt;
        }

        if (typeof rt.linkRouteTables === "undefined" || rt.linkRouteTables.length === 0) {
            return Promise.resolve(vscode.l10n.t("The resource is not linked"));
        }

        let link: osc.LinkRouteTable;
        if (rt.linkRouteTables.length > 1) {
            const pickItems = rt.linkRouteTables.map((element) => {
                return {
                    label: `${element.linkRouteTableId}`,
                    description: '',
                    item: element
                };
            });

            const value = await vscode.window.showQuickPick(pickItems);

            if (!value) {
                return Promise.resolve(vscode.l10n.t("Unlink cancelled"));
            }
            link = value.item;
        } else {
            link = rt.linkRouteTables[0];
        }

        if (typeof link.linkRouteTableId === "undefined") {
            return Promise.resolve(vscode.l10n.t("The link is incomplete"));
        }

        return unlinkRouteTable(this.profile, link.linkRouteTableId);
    }

    async removeSubresource(): Promise<string | undefined> {
        const rt = await getRouteTable(this.profile, this.resourceId);
        if (typeof rt === "string" || typeof rt === 'undefined') {
            return rt;
        }

        if (typeof rt.routes === "undefined" || rt.routes.length === 0) {
            return undefined;
        }

        let route: osc.Route;
        if (rt.routes.length > 1) {
            const pickItems = rt.routes.map((element) => {
                return {
                    label: `${routeToString(element)}`,
                    description: '',
                    item: element
                };
            });

            const value = await vscode.window.showQuickPick(pickItems);

            if (!value) {
                return Promise.resolve(vscode.l10n.t("Deletion of subresource cancelled"));
            }
            route = value.item;
        } else {
            route = rt.routes[0];
        }

        if (typeof route.destinationIpRange === "undefined") {
            return Promise.resolve(vscode.l10n.t("The subresource is incomplete"));
        }

        return removeRoute(this.profile, this.resourceId, route.destinationIpRange);
    }

    async removeAllSubresources(): Promise<string | undefined> {
        const rt = await getRouteTable(this.profile, this.resourceId);
        if (typeof rt === "string" || typeof rt === 'undefined') {
            return rt;
        }

        if (typeof rt.routes === "undefined" || rt.routes.length === 0) {
            return Promise.resolve(vscode.l10n.t("The resource has no subresources"));
        }

        for (const route of rt.routes) {
            if (typeof route.destinationIpRange === "undefined") {
                return Promise.resolve(vscode.l10n.t("The subresource is incomplete"));
            }
            const res = await removeRoute(this.profile, this.resourceId, route.destinationIpRange);
            if (typeof res === 'string') {
                return res;
            }
        }

        return Promise.resolve(undefined);
    }

    async unlinkAllResource(): Promise<string | undefined> {
        const rt = await getRouteTable(this.profile, this.resourceId);
        if (typeof rt === "string" || typeof rt === 'undefined') {
            return rt;
        }

        if (typeof rt.linkRouteTables === "undefined" || rt.linkRouteTables.length === 0) {
            return undefined;
        }

        for (const link of rt.linkRouteTables) {
            if (typeof link.linkRouteTableId === "undefined") {
                return Promise.resolve(vscode.l10n.t("The link is incomplete"));
            }

            return unlinkRouteTable(this.profile, link.linkRouteTableId);
        }
    }

}