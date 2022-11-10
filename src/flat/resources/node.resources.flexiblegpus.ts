import { ThemeIcon } from 'vscode';
import { deleteFlexibleGpu, unlinkFlexibleGpu } from '../../cloud/flexiblegpus';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { LinkResourceNode } from './types/node.resources.link';


export class FlexibleGpuResourceNode extends ResourceNode implements LinkResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string) {
        super(profile, resourceName, resourceId, "FlexibleGpu", deleteFlexibleGpu);
    }

    getContextValue(): string {
        return "flexibleresourcenode;linkresourcenode";
    }

    getIconPath(): ThemeIcon {
        switch (this.resourceState) {
            case "allocated":
                return new ThemeIcon("check");
            case "attached":
                return new ThemeIcon("plug");
            case "attaching":
            case "detaching":
                return new ThemeIcon("sync");
            default:
                return new ThemeIcon("dash");
        }

    }

    unlinkResource(): Promise<string | undefined> {
        return unlinkFlexibleGpu(this.profile, this.resourceId);
    }

}