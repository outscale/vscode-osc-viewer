
import * as osc from "outscale-api";
import { FiltersDhcpOptions } from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource DhcpOption
export function getDhcpOptions(profile: Profile, filters?: FiltersDhcpOptions): Promise<Array<osc.DhcpOptionsSet> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadDhcpOptionsOperationRequest = {
        readDhcpOptionsRequest: {
            filters: filters
        }
    };

    const api = new osc.DhcpOptionApi(config);
    return api.readDhcpOptions(readParameters)
    .then((res: osc.ReadDhcpOptionsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.dhcpOptionsSets === undefined || res.dhcpOptionsSets.length === 0) {
            return "Listing suceeded but it seems you have no DhcpOption";
        }
        return res.dhcpOptionsSets;
    }, (err_: any) => {
        return err_;
    });
}

// Retrieve a specific item of the resource DhcpOption
export function getDhcpOption(profile: Profile, resourceId: string): Promise<osc.DhcpOptionsSet | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadDhcpOptionsOperationRequest = {
        readDhcpOptionsRequest: {
            filters: {
                dhcpOptionsSetIds: [resourceId]
            }
        }
    };

    const api = new osc.DhcpOptionApi(config);
    return api.readDhcpOptions(readParameters)
    .then((res: osc.ReadDhcpOptionsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.dhcpOptionsSets === undefined || res.dhcpOptionsSets.length === 0) {
            return "Listing suceeded but it seems you have no DhcpOption";
        }
        return res.dhcpOptionsSets[0];
    }, (err_: any) => {
        return err_;
    });
}

// Delete a specific item the resource DhcpOption
export function deleteDhcpOption(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteDhcpOptionsOperationRequest = {
        deleteDhcpOptionsRequest: {
            dhcpOptionsSetId: resourceId
        }
    };

    const api = new osc.DhcpOptionApi(config);
    return api.deleteDhcpOptions(deleteParameters)
    .then((res: osc.DeleteDhcpOptionsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return err_;
    });
}