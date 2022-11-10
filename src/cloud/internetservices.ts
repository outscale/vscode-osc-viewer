
import * as osc from "outscale-api";
import { FiltersInternetService } from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource InternetService
export function getInternetServices(profile: Profile, filters?: FiltersInternetService): Promise<Array<osc.InternetService> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadInternetServicesOperationRequest = {
        readInternetServicesRequest: {
            filters: filters
        }
    };

    const api = new osc.InternetServiceApi(config);
    return api.readInternetServices(readParameters)
        .then((res: osc.ReadInternetServicesResponse) => {
            if (res.internetServices === undefined || res.internetServices.length === 0) {
                return [];
            }
            return res.internetServices;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Retrieve a specific item of the resource InternetService
export function getInternetService(profile: Profile, resourceId: string): Promise<osc.InternetService | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadInternetServicesOperationRequest = {
        readInternetServicesRequest: {
            filters: {
                internetServiceIds: [resourceId]
            }
        }
    };

    const api = new osc.InternetServiceApi(config);
    return api.readInternetServices(readParameters)
        .then((res: osc.ReadInternetServicesResponse) => {
            if (res.internetServices === undefined || res.internetServices.length === 0) {
                return {};
            }
            return res.internetServices[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Delete a specific item the resource InternetService
export function deleteInternetService(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteInternetServiceOperationRequest = {
        deleteInternetServiceRequest: {
            internetServiceId: resourceId
        }
    };

    const api = new osc.InternetServiceApi(config);
    return api.deleteInternetService(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Unlink a specific item the resource InternetService
export function unlinkInternetService(profile: Profile, resourceId: string, netId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const parameters: osc.UnlinkInternetServiceOperationRequest = {
        unlinkInternetServiceRequest: {
            internetServiceId: resourceId,
            netId: netId
        }
    };

    const api = new osc.InternetServiceApi(config);
    return api.unlinkInternetService(parameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}