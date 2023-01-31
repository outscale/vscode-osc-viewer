import { ThemeIcon } from 'vscode';
import { deleteVolume, getVolume, unlinkVolume } from '../../cloud/volumes';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { LinkResourceNode } from './types/node.resources.link';


export class VolumeResourceNode extends ResourceNode implements LinkResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string) {
        super(profile, resourceName, resourceId, "volumes", deleteVolume, getVolume);
    }

    getContextValue(): string {
        return "volumeresourcenode;linkresourcenode";
    }

    getIconPath(): ThemeIcon {
        switch (this.resourceState) {
            case "creating":
                return new ThemeIcon("repo-create");
            case "available":
                return new ThemeIcon("check");
            case "in-use":
                return new ThemeIcon("plug");
            case "updating":
                return new ThemeIcon("sync");
            case "deleting":
                return new ThemeIcon("trash");
            case "error":
                return new ThemeIcon("alert");
            default:
                return new ThemeIcon("dash");
        }

    }

    unlinkResource(): Promise<string | undefined> {
        return unlinkVolume(this.profile, this.resourceId);
    }

}