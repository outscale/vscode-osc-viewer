
import * as osc from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


export function getNets(profile: Profile): Promise<Array<osc.Net> | string> {
    const config = getConfig(profile);
    let readParameters: osc.ReadNetsOperationRequest = {
        readNetsRequest: {}
    };

    let api = new osc.NetApi(config);
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
            return "Error, bad credential or region?" + err_;
        });
}

export function getNet(profile: Profile, netId: string): Promise<osc.Net | string> {
    const config = getConfig(profile);
    let readParameters: osc.ReadNetsOperationRequest = {
        readNetsRequest: {
            filters: {
                netIds: [netId]
            }
        }
    };

    let api = new osc.NetApi(config);
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
            return "Error, bad credential or region?" + err_;
        });
}