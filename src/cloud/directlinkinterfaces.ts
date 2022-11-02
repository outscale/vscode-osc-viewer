
import * as osc from "outscale-api";
import { FiltersDirectLinkInterface } from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource DirectLinkInterface
export function getDirectLinkInterfaces(profile: Profile, filters?: FiltersDirectLinkInterface): Promise<Array<osc.DirectLinkInterfaces> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadDirectLinkInterfacesOperationRequest = {
        readDirectLinkInterfacesRequest: {
            filters: filters
        }
    };

    const api = new osc.DirectLinkInterfaceApi(config);
    return api.readDirectLinkInterfaces(readParameters)
        .then((res: osc.ReadDirectLinkInterfacesResponse) => {
            if (res.directLinkInterfaces === undefined || res.directLinkInterfaces.length === 0) {
                return [];
            }
            return res.directLinkInterfaces;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Retrieve a specific item of the resource DirectLinkInterface
export function getDirectLinkInterface(profile: Profile, resourceId: string): Promise<osc.DirectLinkInterfaces | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadDirectLinkInterfacesOperationRequest = {
        readDirectLinkInterfacesRequest: {
            filters: {
                directLinkInterfaceIds: [resourceId]
            }
        }
    };

    const api = new osc.DirectLinkInterfaceApi(config);
    return api.readDirectLinkInterfaces(readParameters)
        .then((res: osc.ReadDirectLinkInterfacesResponse) => {
            if (res.directLinkInterfaces === undefined || res.directLinkInterfaces.length === 0) {
                return {};
            }
            return res.directLinkInterfaces[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Delete a specific item the resource DirectLinkInterface
export function deleteDirectLinkInterface(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteDirectLinkInterfaceOperationRequest = {
        deleteDirectLinkInterfaceRequest: {
            directLinkInterfaceId: resourceId
        }
    };

    const api = new osc.DirectLinkInterfaceApi(config);
    return api.deleteDirectLinkInterface(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}