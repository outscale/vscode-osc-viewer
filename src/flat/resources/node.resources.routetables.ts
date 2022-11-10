import * as osc from "outscale-api";
import * as vscode from 'vscode';
import { deleteRouteTable, getRouteTable, unlinkRouteTable } from '../../cloud/routetables';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { LinkResourceNode } from './types/node.resources.link';


export class RouteTableResourceNode extends ResourceNode implements LinkResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string) {
        super(profile, resourceName, resourceId, "routetables", deleteRouteTable);
    }

    getContextValue(): string {
        return "routetableresourcenode;linkresourcenode";
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

}