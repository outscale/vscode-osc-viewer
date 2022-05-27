
import * as osc from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


export function getSecurityGroups(profile: Profile): Promise<Array<osc.SecurityGroup> | string> {
    let config = getConfig(profile);
    let readParameters : osc.ReadSecurityGroupsOperationRequest = {
        readSecurityGroupsRequest: {}
    };

    let api = new osc.SecurityGroupApi(config);
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