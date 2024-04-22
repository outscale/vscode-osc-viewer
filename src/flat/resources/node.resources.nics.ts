import * as vscode from 'vscode';
import { deleteNic, getNic, unlinkNic } from '../../cloud/nics';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { LinkResourceNode } from './types/node.resources.link';
import { ResourceTag } from 'outscale-api';


export class NicResourceNode extends ResourceNode implements LinkResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string, readonly tags: Array<ResourceTag> | undefined) {
        super(profile, resourceName, resourceId, "Nic", deleteNic, getNic, tags);
    }

    getContextValue(): string {
        return super.getContextValue() + ";nicresourcenode;linkresourcenode";
    }

    getIconPath(): vscode.ThemeIcon {
        switch (this.resourceState) {
            case "available":
                return new vscode.ThemeIcon("check");
            case "attaching":
                return new vscode.ThemeIcon("sync");
            case "in-use":
                return new vscode.ThemeIcon("plug");
            case "detaching":
                return new vscode.ThemeIcon("sync");
            default:
                return new vscode.ThemeIcon("dash");
        }

    }

    async deleteResource(): Promise<string | undefined> {
        const res = await this.unlinkAllResource();
        if (res === 'string') {
            return res;
        }

        return super.deleteResource();
    }

    async unlinkResource(): Promise<string | undefined> {
        const nic = await getNic(this.profile, this.resourceId);
        if (typeof nic === "string" || typeof nic === "undefined") {
            return nic;
        }

        if (typeof nic.linkNic === "undefined") {
            return undefined;
        }

        const link = nic.linkNic;

        if (typeof link.linkNicId === "undefined") {
            return Promise.resolve(vscode.l10n.t("The link is incomplete"));
        }

        return unlinkNic(this.profile, link.linkNicId);
    }

    unlinkAllResource(): Promise<string | undefined> {
        // Only one link possible
        return this.unlinkResource();
    }

}