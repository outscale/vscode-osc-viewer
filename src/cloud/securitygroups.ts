
import * as osc from "outscale-api";
import { FiltersSecurityGroup } from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource SecurityGroup
export function getSecurityGroups(profile: Profile, filters?: FiltersSecurityGroup): Promise<Array<osc.SecurityGroup> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadSecurityGroupsOperationRequest = {
        readSecurityGroupsRequest: {
            filters: filters
        }
    };

    const api = new osc.SecurityGroupApi(config);
    return api.readSecurityGroups(readParameters)
        .then((res: osc.ReadSecurityGroupsResponse) => {
            if (res.securityGroups === undefined || res.securityGroups.length === 0) {
                return [];
            }
            return res.securityGroups;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Retrieve a specific item of the resource SecurityGroup
export function getSecurityGroup(profile: Profile, resourceId: string): Promise<osc.SecurityGroup | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadSecurityGroupsOperationRequest = {
        readSecurityGroupsRequest: {
            filters: {
                securityGroupIds: [resourceId]
            }
        }
    };

    const api = new osc.SecurityGroupApi(config);
    return api.readSecurityGroups(readParameters)
        .then((res: osc.ReadSecurityGroupsResponse) => {
            if (res.securityGroups === undefined || res.securityGroups.length === 0) {
                return {};
            }
            return res.securityGroups[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Delete a specific item the resource SecurityGroup
export function deleteSecurityGroup(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteSecurityGroupOperationRequest = {
        deleteSecurityGroupRequest: {
            securityGroupId: resourceId
        }
    };

    const api = new osc.SecurityGroupApi(config);
    return api.deleteSecurityGroup(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}