import * as vscode from 'vscode';
import { deleteNic, getNic, unlinkNic } from '../../cloud/nics';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { LinkResourceNode } from './types/node.resources.link';


export class NicResourceNode extends ResourceNode implements LinkResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string) {
        super(profile, resourceName, resourceId, "Nic", deleteNic);
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

    async unlinkResource(): Promise<string | undefined> {
        const nic = await getNic(this.profile, this.resourceId);
        if (typeof nic === "string") {
            return nic;
        }

        if (typeof nic.linkNic === "undefined") {
            return Promise.resolve(vscode.l10n.t("The resource is not linked"));
        }

        const link = nic.linkNic;

        if (typeof link.linkNicId === "undefined") {
            return Promise.resolve(vscode.l10n.t("The link is incomplete"));
        }

        return unlinkNic(this.profile, link.linkNicId);
    }

}