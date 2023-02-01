import { deleteNet, getNet } from "../../cloud/nets";
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
export class NetResourceNode extends ResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string) {
        super(profile, resourceName, resourceId, "vpc", deleteNet, getNet);
    }

    getContextValue(): string {
        return "netresourcenode";
    }


}