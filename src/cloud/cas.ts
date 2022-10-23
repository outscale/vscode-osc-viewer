
import * as osc from "outscale-api";
import { FiltersCa } from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource Ca
export function getCas(profile: Profile, filters?: FiltersCa): Promise<Array<osc.Ca> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadCasOperationRequest = {
        readCasRequest: {
            filters: filters
        }
    };

    const api = new osc.CaApi(config);
    return api.readCas(readParameters)
        .then((res: osc.ReadCasResponse) => {
            if (res.cas === undefined || res.cas.length === 0) {
                return [];
            }
            return res.cas;
        }, (err_: any) => {
            return err_.toString();
        });
}

// Retrieve a specific item of the resource Ca
export function getCa(profile: Profile, resourceId: string): Promise<osc.Ca | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadCasOperationRequest = {
        readCasRequest: {
            filters: {
                caIds: [resourceId]
            }
        }
    };

    const api = new osc.CaApi(config);
    return api.readCas(readParameters)
        .then((res: osc.ReadCasResponse) => {
            if (res.cas === undefined || res.cas.length === 0) {
                return {};
            }
            return res.cas[0];
        }, (err_: any) => {
            return err_.toString();
        });
}

// Delete a specific item the resource Ca
export function deleteCa(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteCaOperationRequest = {
        deleteCaRequest: {
            caId: resourceId
        }
    };

    const api = new osc.CaApi(config);
    return api.deleteCa(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return err_.toString();
        });
}