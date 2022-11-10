import { ThemeIcon } from 'vscode';
import { deleteExternalIP, unlinkExternalIP } from '../../cloud/publicips';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { LinkResourceNode } from './types/node.resources.link';


export class PublicIpResourceNode extends ResourceNode implements LinkResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string) {
        super(profile, resourceName, resourceId, "eips", deleteExternalIP);
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

}