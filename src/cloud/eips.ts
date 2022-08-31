
import * as osc from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


export function getExternalIPs(profile: Profile): Promise<Array<osc.PublicIp> | string> {
    let config = getConfig(profile);
    let readParameters : osc.ReadPublicIpsOperationRequest = {
        readPublicIpsRequest: {}
    };

    let api = new osc.PublicIpApi(config);
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
    let config = getConfig(profile);
    let readParameters : osc.ReadPublicIpsOperationRequest = {
        readPublicIpsRequest: {
            filters: {
                publicIpIds: [publicIpId]
            }
        }
    };

    let api = new osc.PublicIpApi(config);
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
    let config = getConfig(profile);
    let deleteParameters : osc.DeletePublicIpOperationRequest = {
        deletePublicIpRequest: {
            publicIpId: resourceId
        }
    };

    let api = new osc.PublicIpApi(config);
    return api.deletePublicIp(deleteParameters)
    .then((res: osc.DeleteImageResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}