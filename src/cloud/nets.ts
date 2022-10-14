
import * as osc from "outscale-api";
import { getConfig } from './cloud';
import { Profile } from "../flat/node";
import { FiltersNet } from "outscale-api";


export function getNets(profile: Profile, filters?: FiltersNet): Promise<Array<osc.Net> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadNetsOperationRequest = {
        readNetsRequest: {
            filters: filters
        }
    };

    const api = new osc.NetApi(config);
    return api.readNets(readParameters)
        .then((res: osc.ReadNetsResponse | string) => {
            if (typeof res === "string") {
                return res;
            }
            if (res.nets === undefined || res.nets.length === 0) {
                return "Listing suceeded but it seems you have no VPC";
            }
            return res.nets;
        }, (err_: any) => {
            return err_;
        });
}

export function getNet(profile: Profile, netId: string): Promise<osc.Net | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadNetsOperationRequest = {
        readNetsRequest: {
            filters: {
                netIds: [netId]
            }
        }
    };

    const api = new osc.NetApi(config);
    return api.readNets(readParameters)
        .then((res: osc.ReadNetsResponse | string) => {
            if (typeof res === "string") {
                return res;
            }
            if (res.nets === undefined || res.nets.length === 0) {
                return "Listing suceeded but it seems you have no VPC";
            }
            return res.nets[0];
        }, (err_: any) => {
            return err_;
        });
}

export function deleteNet(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteNetOperationRequest = {
        deleteNetRequest: {
            netId: resourceId
        }
    };

    const api = new osc.NetApi(config);
    return api.deleteNet(deleteParameters)
    .then((res: osc.DeleteNetResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return err_;
    });
}