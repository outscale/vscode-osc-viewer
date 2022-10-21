
import * as osc from "outscale-api";
import { FiltersNetPeering } from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource NetPeering
export function getNetPeerings(profile: Profile, filters?: FiltersNetPeering): Promise<Array<osc.NetPeering> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadNetPeeringsOperationRequest = {
        readNetPeeringsRequest: {
            filters: filters
        }
    };

    const api = new osc.NetPeeringApi(config);
    return api.readNetPeerings(readParameters)
        .then((res: osc.ReadNetPeeringsResponse | string) => {
            if (typeof res === "string") {
                return res;
            }
            if (res.netPeerings === undefined || res.netPeerings.length === 0) {
                return "Listing suceeded but it seems you have no NetPeering";
            }
            return res.netPeerings;
        }, (err_: any) => {
            return err_;
        });
}

// Retrieve a specific item of the resource NetPeering
export function getNetPeering(profile: Profile, resourceId: string): Promise<osc.NetPeering | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadNetPeeringsOperationRequest = {
        readNetPeeringsRequest: {
            filters: {
                netPeeringIds: [resourceId]
            }
        }
    };

    const api = new osc.NetPeeringApi(config);
    return api.readNetPeerings(readParameters)
        .then((res: osc.ReadNetPeeringsResponse | string) => {
            if (typeof res === "string") {
                return res;
            }
            if (res.netPeerings === undefined || res.netPeerings.length === 0) {
                return "Listing suceeded but it seems you have no NetPeering";
            }
            return res.netPeerings[0];
        }, (err_: any) => {
            return err_;
        });
}

// Delete a specific item the resource NetPeering
export function deleteNetPeering(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteNetPeeringOperationRequest = {
        deleteNetPeeringRequest: {
            netPeeringId: resourceId
        }
    };

    const api = new osc.NetPeeringApi(config);
    return api.deleteNetPeering(deleteParameters)
        .then((res: osc.DeleteNetPeeringResponse | string) => {
            if (typeof res === "string") {
                return res;
            }
            return undefined;
        }, (err_: any) => {
            return err_;
        });
}