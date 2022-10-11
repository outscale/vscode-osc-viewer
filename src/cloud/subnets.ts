
import * as osc from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource Subnet
export function getSubnets(profile: Profile): Promise<Array<osc.Subnet> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadSubnetsOperationRequest = {
        readSubnetsRequest: {}
    };

    const api = new osc.SubnetApi(config);
    return api.readSubnets(readParameters)
    .then((res: osc.ReadSubnetsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.subnets === undefined || res.subnets.length === 0) {
            return "Listing suceeded but it seems you have no Subnet";
        }
        return res.subnets;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

// Retrieve a specific item of the resource Subnet
export function getSubnet(profile: Profile, resourceId: string): Promise<osc.Subnet | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadSubnetsOperationRequest = {
        readSubnetsRequest: {
            filters: {
                subnetIds: [resourceId]
            }
        }
    };

    const api = new osc.SubnetApi(config);
    return api.readSubnets(readParameters)
    .then((res: osc.ReadSubnetsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.subnets === undefined || res.subnets.length === 0) {
            return "Listing suceeded but it seems you have no Subnet";
        }
        return res.subnets[0];
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

// Delete a specific item the resource Subnet
export function deleteSubnet(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteSubnetOperationRequest = {
        deleteSubnetRequest: {
            subnetId: resourceId
        }
    };

    const api = new osc.SubnetApi(config);
    return api.deleteSubnet(deleteParameters)
    .then((res: osc.DeleteSubnetResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}