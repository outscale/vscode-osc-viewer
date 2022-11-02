
import * as osc from "outscale-api";
import { FiltersKeypair } from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource Keypair
export function getKeypairs(profile: Profile, filters?: FiltersKeypair): Promise<Array<osc.Keypair> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadKeypairsOperationRequest = {
        readKeypairsRequest: {
            filters: filters
        }
    };

    const api = new osc.KeypairApi(config);
    return api.readKeypairs(readParameters)
        .then((res: osc.ReadKeypairsResponse) => {
            if (res.keypairs === undefined || res.keypairs.length === 0) {
                return [];
            }
            return res.keypairs;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Retrieve a specific item of the resource Keypair
export function getKeypair(profile: Profile, resourceId: string): Promise<osc.Keypair | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadKeypairsOperationRequest = {
        readKeypairsRequest: {
            filters: {
                keypairNames: [resourceId]
            }
        }
    };

    const api = new osc.KeypairApi(config);
    return api.readKeypairs(readParameters)
        .then((res: osc.ReadKeypairsResponse) => {
            if (res.keypairs === undefined || res.keypairs.length === 0) {
                return {};
            }
            return res.keypairs[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Delete a specific item the resource Keypair
export function deleteKeypair(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteKeypairOperationRequest = {
        deleteKeypairRequest: {
            keypairName: resourceId
        }
    };

    const api = new osc.KeypairApi(config);
    return api.deleteKeypair(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}