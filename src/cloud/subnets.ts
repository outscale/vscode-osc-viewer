
import * as osc from "outscale-api";
import { FiltersSubnet } from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource Subnet
export function getSubnets(profile: Profile, filters?: FiltersSubnet): Promise<Array<osc.Subnet> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadSubnetsOperationRequest = {
        readSubnetsRequest: {
            filters: filters
        }
    };

    const api = new osc.SubnetApi(config);
    return api.readSubnets(readParameters)
        .then((res: osc.ReadSubnetsResponse) => {
            if (res.subnets === undefined || res.subnets.length === 0) {
                return [];
            }
            return res.subnets;
        }, (err_: any) => {
            return err_.toString();
        });
}

// Retrieve a specific item of the resource Subnet
export function getSubnet(profile: Profile, resourceId: string): Promise<osc.Subnet | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadSubnetsOperationRequest = {
        readSubnetsRequest: {
            filters: {
                subnetIds: [resourceId]
            }
        }
    };

    const api = new osc.SubnetApi(config);
    return api.readSubnets(readParameters)
        .then((res: osc.ReadSubnetsResponse) => {
            if (res.subnets === undefined || res.subnets.length === 0) {
                return {};
            }
            return res.subnets[0];
        }, (err_: any) => {
            return err_.toString();
        });
}

// Delete a specific item the resource Subnet
export function deleteSubnet(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteSubnetOperationRequest = {
        deleteSubnetRequest: {
            subnetId: resourceId
        }
    };

    const api = new osc.SubnetApi(config);
    return api.deleteSubnet(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return err_.toString();
        });
}