import { ThemeIcon } from 'vscode';
import { deleteInternetService, getInternetService, unlinkInternetService } from '../../cloud/internetservices';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { LinkResourceNode } from './types/node.resources.link';


export class InternetServiceResourceNode extends ResourceNode implements LinkResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string) {
        super(profile, resourceName, resourceId, "InternetService", deleteInternetService);
    }

    getContextValue(): string {
        return "internetserviceresourcenode;linkresourcenode";
    }

    getIconPath(): ThemeIcon {
        switch (this.resourceState) {
            case "link":
                return new ThemeIcon("plug");
            default:
                return new ThemeIcon("dash");
        }

    }

    async unlinkResource(): Promise<string | undefined> {
        const internetService = await getInternetService(this.profile, this.resourceId);
        if (typeof internetService === "string") {
            return internetService;
        }

        if (typeof internetService.netId === "undefined") {
            return Promise.resolve("The Internet Service is not attached");
        }


        return unlinkInternetService(this.profile, this.resourceId, internetService.netId);
    }

}