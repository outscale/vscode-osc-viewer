import { ThemeIcon } from 'vscode';
import { deleteExternalIP, unlinkExternalIP, getExternalIP } from '../../cloud/publicips';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { LinkResourceNode } from './types/node.resources.link';


export class PublicIpResourceNode extends ResourceNode implements LinkResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string) {
        super(profile, resourceName, resourceId, "eips", deleteExternalIP, getExternalIP);
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

    unlinkResource(): Promise<string | undefined> {
        return unlinkExternalIP(this.profile, this.resourceName);
    }

    unlinkAllResource(): Promise<string | undefined> {
        // One link possible
        return this.unlinkResource();
    }

}