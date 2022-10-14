
import * as osc from "outscale-api";
import { FiltersInternetService } from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource InternetService
export function getInternetServices(profile: Profile, filters?: FiltersInternetService): Promise<Array<osc.InternetService> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadInternetServicesOperationRequest = {
        readInternetServicesRequest: {
            filters: filters
        }
    };

    const api = new osc.InternetServiceApi(config);
    return api.readInternetServices(readParameters)
    .then((res: osc.ReadInternetServicesResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.internetServices === undefined || res.internetServices.length === 0) {
            return "Listing suceeded but it seems you have no InternetService";
        }
        return res.internetServices;
    }, (err_: any) => {
        return err_;
    });
}

// Retrieve a specific item of the resource InternetService
export function getInternetService(profile: Profile, resourceId: string): Promise<osc.InternetService | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadInternetServicesOperationRequest = {
        readInternetServicesRequest: {
            filters: {
                internetServiceIds: [resourceId]
            }
        }
    };

    const api = new osc.InternetServiceApi(config);
    return api.readInternetServices(readParameters)
    .then((res: osc.ReadInternetServicesResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.internetServices === undefined || res.internetServices.length === 0) {
            return "Listing suceeded but it seems you have no InternetService";
        }
        return res.internetServices[0];
    }, (err_: any) => {
        return err_;
    });
}

// Delete a specific item the resource InternetService
export function deleteInternetService(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteInternetServiceOperationRequest = {
        deleteInternetServiceRequest: {
            internetServiceId: resourceId
        }
    };

    const api = new osc.InternetServiceApi(config);
    return api.deleteInternetService(deleteParameters)
    .then((res: osc.DeleteInternetServiceResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return err_;
    });
}