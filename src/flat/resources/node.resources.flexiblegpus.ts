import { ThemeIcon } from 'vscode';
import { deleteFlexibleGpu, getFlexibleGpu, unlinkFlexibleGpu } from '../../cloud/flexiblegpus';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { LinkResourceNode } from './types/node.resources.link';


export class FlexibleGpuResourceNode extends ResourceNode implements LinkResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string) {
        super(profile, resourceName, resourceId, "FlexibleGpu", deleteFlexibleGpu, getFlexibleGpu);
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

    async unlinkResource(): Promise<string | undefined> {
        const fgpu = await getFlexibleGpu(this.profile, this.resourceId);
        if (typeof fgpu === 'string' || typeof fgpu === "undefined") {
            return fgpu;
        }

        if (typeof fgpu.vmId === 'undefined') {
            return undefined;
        }

        return unlinkFlexibleGpu(this.profile, this.resourceId);
    }

    unlinkAllResource(): Promise<string | undefined> {
        return this.unlinkResource();
    }

}