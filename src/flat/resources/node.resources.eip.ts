import { ThemeIcon } from 'vscode';
import { deleteExternalIP, unlinkExternalIP, getExternalIP } from '../../cloud/publicips';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { LinkResourceNode } from './types/node.resources.link';
import { ResourceTag } from 'outscale-api';


export class PublicIpResourceNode extends ResourceNode implements LinkResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string, readonly tags: Array<ResourceTag> | undefined) {
        super(profile, resourceName, resourceId, "eips", deleteExternalIP, getExternalIP, tags);
    }

    getContextValue(): string {
        return super.getContextValue() + ";eipresourcenode;linkresourcenode";
    }

    getIconPath(): ThemeIcon {
        switch (this.resourceState) {
            case "link":
                return new ThemeIcon("plug");
            default:
                return new ThemeIcon("dash");
        }

    }

    async deleteResource(): Promise<string | undefined> {
        const res = await this.unlinkAllResource();
        if (typeof res === 'string') {
            return res;
        }

        return super.deleteResource();
    }

    async unlinkResource(): Promise<string | undefined> {
        const ip = await getExternalIP(this.profile, this.resourceId);
        if (typeof ip === "string" || typeof ip === "undefined") {
            return ip;
        }

        if (typeof ip.linkPublicIpId === "undefined") {
            return undefined;
        }

        return unlinkExternalIP(this.profile, this.resourceName);
    }

    unlinkAllResource(): Promise<string | undefined> {
        // One link possible
        return this.unlinkResource();
    }

}