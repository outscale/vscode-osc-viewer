
import * as osc from "outscale-api";
import { FiltersNatService } from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource NatService
export function getNatServices(profile: Profile, filters?: FiltersNatService): Promise<Array<osc.NatService> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadNatServicesOperationRequest = {
        readNatServicesRequest: {
            filters: filters
        }
    };

    const api = new osc.NatServiceApi(config);
    return api.readNatServices(readParameters)
        .then((res: osc.ReadNatServicesResponse) => {
            if (res.natServices === undefined || res.natServices.length === 0) {
                return [];
            }
            return res.natServices;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Retrieve a specific item of the resource NatService
export function getNatService(profile: Profile, resourceId: string): Promise<osc.NatService | undefined | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadNatServicesOperationRequest = {
        readNatServicesRequest: {
            filters: {
                natServiceIds: [resourceId]
            }
        }
    };

    const api = new osc.NatServiceApi(config);
    return api.readNatServices(readParameters)
        .then((res: osc.ReadNatServicesResponse) => {
            if (res.natServices === undefined || res.natServices.length === 0) {
                return undefined;
            }
            return res.natServices[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Delete a specific item the resource NatService
export function deleteNatService(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteNatServiceOperationRequest = {
        deleteNatServiceRequest: {
            natServiceId: resourceId
        }
    };

    const api = new osc.NatServiceApi(config);
    return api.deleteNatService(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}