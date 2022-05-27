
import * as osc from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


export function getKeypairs(profile: Profile): Promise<Array<osc.Keypair> | string> {
    let config = getConfig(profile);
    let readParameters : osc.ReadKeypairsOperationRequest = {
        readKeypairsRequest: {}
    };

    let api = new osc.KeypairApi(config);
    return api.readKeypairs(readParameters)
    .then((res: osc.ReadKeypairsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.keypairs === undefined || res.keypairs.length === 0) {
            return "Listing suceeded but it seems you have no Keypairs";
        }
        return res.keypairs;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

export function getKeypair(profile: Profile, keypairId: string): Promise<osc.Keypair | string> {
    let config = getConfig(profile);
    let readParameters : osc.ReadKeypairsOperationRequest = {
        readKeypairsRequest: {
            filters: {
                keypairNames: [keypairId]
            }
        }
    };

    let api = new osc.KeypairApi(config);
    return api.readKeypairs(readParameters)
    .then((res: osc.ReadKeypairsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.keypairs === undefined || res.keypairs.length === 0) {
            return "Listing suceeded but it seems you have no Keypairs";
        }
        return res.keypairs[0];
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}