
import * as osc from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


export function getKeypairs(profile: Profile): Promise<Array<osc.Keypair> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadKeypairsOperationRequest = {
        readKeypairsRequest: {}
    };

    const api = new osc.KeypairApi(config);
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
    const config = getConfig(profile);
    const readParameters : osc.ReadKeypairsOperationRequest = {
        readKeypairsRequest: {
            filters: {
                keypairNames: [keypairId]
            }
        }
    };

    const api = new osc.KeypairApi(config);
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

export function deleteKeypair(profile: Profile, keypairId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteKeypairOperationRequest = {
        deleteKeypairRequest: {
            keypairName: keypairId
        }
    };

    const api = new osc.KeypairApi(config);
    return api.deleteKeypair(deleteParameters)
    .then((res: osc.DeleteKeypairResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}