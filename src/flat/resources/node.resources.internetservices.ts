import * as vscode from 'vscode';
import { deleteInternetService, getInternetService, unlinkInternetService } from '../../cloud/internetservices';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { LinkResourceNode } from './types/node.resources.link';


export class InternetServiceResourceNode extends ResourceNode implements LinkResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string) {
        super(profile, resourceName, resourceId, "InternetService", deleteInternetService, getInternetService);
    }

    getContextValue(): string {
        return "internetserviceresourcenode;linkresourcenode";
    }

    getIconPath(): vscode.ThemeIcon {
        switch (this.resourceState) {
            case "link":
                return new vscode.ThemeIcon("plug");
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
        const internetService = await getInternetService(this.profile, this.resourceId);
        if (typeof internetService === "string" || typeof internetService === 'undefined') {
            return internetService;
        }

        if (typeof internetService.netId === "undefined") {
            return undefined;
        }


        return unlinkInternetService(this.profile, this.resourceId, internetService.netId);
    }

    unlinkAllResource(): Promise<string | undefined> {
        return this.unlinkResource();
    }

}