
import * as osc from "outscale-api";
import { getConfig } from './cloud';
import { Profile } from "../flat/node";
import { FiltersPublicIp } from "outscale-api";


export function getExternalIPs(profile: Profile, filters?: FiltersPublicIp): Promise<Array<osc.PublicIp> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadPublicIpsOperationRequest = {
        readPublicIpsRequest: {
            filters: filters
        }
    };

    const api = new osc.PublicIpApi(config);
    return api.readPublicIps(readParameters)
    .then((res: osc.ReadPublicIpsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.publicIps === undefined || res.publicIps.length === 0) {
            return "Listing suceeded but it seems you have no Public Ips";
        }
        return res.publicIps;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

export function getExternalIP(profile: Profile, publicIpId: string): Promise<osc.PublicIp | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadPublicIpsOperationRequest = {
        readPublicIpsRequest: {
            filters: {
                publicIpIds: [publicIpId]
            }
        }
    };

    const api = new osc.PublicIpApi(config);
    return api.readPublicIps(readParameters)
    .then((res: osc.ReadPublicIpsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.publicIps === undefined || res.publicIps.length === 0) {
            return "Listing suceeded but it seems you have no Public Ips";
        }
        return res.publicIps[0];
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

export function deleteExternalIP(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeletePublicIpOperationRequest = {
        deletePublicIpRequest: {
            publicIpId: resourceId
        }
    };

    const api = new osc.PublicIpApi(config);
    return api.deletePublicIp(deleteParameters)
    .then((res: osc.DeletePublicIpResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}