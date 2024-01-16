
import * as osc from "outscale-api";
import { FiltersDedicatedGroup } from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource DedicatedGroup
export function getDedicatedGroups(profile: Profile, filters?: FiltersDedicatedGroup): Promise<Array<osc.DedicatedGroup> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadDedicatedGroupsOperationRequest = {
        readDedicatedGroupsRequest: {
            filters: filters
        }
    };

    const api = new osc.DedicatedGroupApi(config);
    return api.readDedicatedGroups(readParameters)
        .then((res: osc.ReadDedicatedGroupsResponse) => {
            if (res.dedicatedGroups === undefined || res.dedicatedGroups.length === 0) {
                return [];
            }
            return res.dedicatedGroups;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Retrieve a specific item of the resource DedicatedGroup
export function getDedicatedGroup(profile: Profile, resourceId: string): Promise<osc.DedicatedGroup | undefined | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadDedicatedGroupsOperationRequest = {
        readDedicatedGroupsRequest: {
            filters: {
                dedicatedGroupIds: [resourceId]
            }
        }
    };

    const api = new osc.DedicatedGroupApi(config);
    return api.readDedicatedGroups(readParameters)
        .then((res: osc.ReadDedicatedGroupsResponse) => {
            if (res.dedicatedGroups === undefined || res.dedicatedGroups.length === 0) {
                return undefined;
            }
            return res.dedicatedGroups[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Delete a specific item the resource DedicatedGroup
export function deleteDedicatedGroup(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteDedicatedGroupOperationRequest = {
        deleteDedicatedGroupRequest: {
            dedicatedGroupId: resourceId
        }
    };

    const api = new osc.DedicatedGroupApi(config);
    return api.deleteDedicatedGroup(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}