
import * as osc from "outscale-api";
import { FiltersNet } from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource Net
export function getNets(profile: Profile, filters?: FiltersNet): Promise<Array<osc.Net> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadNetsOperationRequest = {
        readNetsRequest: {
            filters: filters
        }
    };

    const api = new osc.NetApi(config);
    return api.readNets(readParameters)
        .then((res: osc.ReadNetsResponse) => {
            if (res.nets === undefined || res.nets.length === 0) {
                return [];
            }
            return res.nets;
        }, (err_: any) => {
            return err_.toString();
        });
}

// Retrieve a specific item of the resource Net
export function getNet(profile: Profile, resourceId: string): Promise<osc.Net | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadNetsOperationRequest = {
        readNetsRequest: {
            filters: {
                netIds: [resourceId]
            }
        }
    };

    const api = new osc.NetApi(config);
    return api.readNets(readParameters)
        .then((res: osc.ReadNetsResponse) => {
            if (res.nets === undefined || res.nets.length === 0) {
                return {};
            }
            return res.nets[0];
        }, (err_: any) => {
            return err_.toString();
        });
}

// Delete a specific item the resource Net
export function deleteNet(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteNetOperationRequest = {
        deleteNetRequest: {
            netId: resourceId
        }
    };

    const api = new osc.NetApi(config);
    return api.deleteNet(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return err_.toString();
        });
}