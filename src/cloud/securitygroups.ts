
import * as osc from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


export function getSecurityGroups(profile: Profile): Promise<Array<osc.SecurityGroup> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadSecurityGroupsOperationRequest = {
        readSecurityGroupsRequest: {}
    };

    const api = new osc.SecurityGroupApi(config);
    return api.readSecurityGroups(readParameters)
    .then((res: osc.ReadSecurityGroupsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.securityGroups === undefined || res.securityGroups.length === 0) {
            return "Listing suceeded but it seems you have no Security Group";
        }
        return res.securityGroups;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

export function getSecurityGroup(profile: Profile, sgId: string): Promise<osc.SecurityGroup | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadSecurityGroupsOperationRequest = {
        readSecurityGroupsRequest: {
            filters: {
                securityGroupIds: [sgId]
            }
        }
    };

    const api = new osc.SecurityGroupApi(config);
    return api.readSecurityGroups(readParameters)
    .then((res: osc.ReadSecurityGroupsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.securityGroups === undefined || res.securityGroups.length === 0) {
            return "Listing suceeded but it seems you have no Security Group";
        }
        return res.securityGroups[0];
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

export function deleteSecurityGroup(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteSecurityGroupOperationRequest = {
        deleteSecurityGroupRequest: {
            securityGroupId: resourceId
        }
    };

    const api = new osc.SecurityGroupApi(config);
    return api.deleteSecurityGroup(deleteParameters)
    .then((res: osc.DeleteSecurityGroupResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return err_;
    });
}