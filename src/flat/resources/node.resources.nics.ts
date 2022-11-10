import { ThemeIcon } from 'vscode';
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

    getIconPath(): ThemeIcon {
        switch (this.resourceState) {
            case "available":
                return new ThemeIcon("check");
            case "attaching":
                return new ThemeIcon("sync");
            case "in-use":
                return new ThemeIcon("plug");
            case "detaching":
                return new ThemeIcon("sync");
            default:
                return new ThemeIcon("dash");
        }

    }

    async unlinkResource(): Promise<string | undefined> {
        const nic = await getNic(this.profile, this.resourceId);
        if (typeof nic === "string") {
            return nic;
        }

        if (typeof nic.linkNic === "undefined") {
            return Promise.resolve("The Nic is not attached");
        }

        const link = nic.linkNic;

        if (typeof link.linkNicId === "undefined") {
            return Promise.resolve("The Link has no LinkId");
        }

        return unlinkNic(this.profile, link.linkNicId);
    }

}