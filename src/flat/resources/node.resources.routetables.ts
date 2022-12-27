import * as osc from "outscale-api";
import * as vscode from 'vscode';
import { deleteRouteTable, getRouteTable, removeRoute, routeToString, unlinkRouteTable } from '../../cloud/routetables';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { LinkResourceNode } from './types/node.resources.link';
import { SubResourceNode } from "./types/node.resources.subresource";


export class RouteTableResourceNode extends ResourceNode implements LinkResourceNode, SubResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string) {
        super(profile, resourceName, resourceId, "routetables", deleteRouteTable);
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

    async unlinkResource(): Promise<string | undefined> {
        const rt = await getRouteTable(this.profile, this.resourceId);
        if (typeof rt === "string") {
            return rt;
        }

        if (typeof rt.linkRouteTables === "undefined" || rt.linkRouteTables.length === 0) {
            return Promise.resolve("The RouteTable is not attached");
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
                return Promise.resolve("Unlink cancelled");
            }
            link = value.item;
        } else {
            link = rt.linkRouteTables[0];
        }

        if (typeof link.linkRouteTableId === "undefined") {
            return Promise.resolve("The Link has no LinkId");
        }

        return unlinkRouteTable(this.profile, link.linkRouteTableId);
    }

    async removeSubresource(): Promise<string | undefined> {
        const rt = await getRouteTable(this.profile, this.resourceId);
        if (typeof rt === "string") {
            return rt;
        }

        if (typeof rt.routes === "undefined" || rt.routes.length === 0) {
            return Promise.resolve("The RouteTable does not have routes");
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
                return Promise.resolve("Deletion of route cancelled");
            }
            route = value.item;
        } else {
            route = rt.routes[0];
        }

        if (typeof route.destinationIpRange === "undefined") {
            return Promise.resolve("The Route does not have a destinationIpRange");
        }

        return removeRoute(this.profile, this.resourceId, route.destinationIpRange);
    }
}