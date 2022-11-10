import * as osc from "outscale-api";
import * as vscode from 'vscode';
import { deleteVirtualGateway, getVirtualGateway, unlinkVirtualGateway } from '../../cloud/virtualgateways';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { LinkResourceNode } from './types/node.resources.link';


export class VirtualGatewayResourceNode extends ResourceNode implements LinkResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string) {
        super(profile, resourceName, resourceId, "VirtualGateway", deleteVirtualGateway);
    }

    getContextValue(): string {
        return "virtualgatewayresourcenode;linkresourcenode";
    }


    async unlinkResource(): Promise<string | undefined> {
        const vgw = await getVirtualGateway(this.profile, this.resourceId);
        if (typeof vgw === "string") {
            return vgw;
        }

        if (typeof vgw.netToVirtualGatewayLinks === "undefined" || vgw.netToVirtualGatewayLinks.length === 0) {
            return Promise.resolve("The Virtual Gateway is not attached");
        }

        let link: osc.NetToVirtualGatewayLink;
        if (vgw.netToVirtualGatewayLinks.length > 1) {
            const pickItems = vgw.netToVirtualGatewayLinks.map((element) => {
                return {
                    label: `${element.netId}`,
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
            link = vgw.netToVirtualGatewayLinks[0];
        }

        if (typeof link.netId === "undefined") {
            return Promise.resolve("The Link has no NetId");
        }

        return unlinkVirtualGateway(this.profile, this.resourceId, link.netId);

    }

}