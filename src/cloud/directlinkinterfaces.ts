
import * as osc from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource DirectLinkInterface
export function getDirectLinkInterfaces(profile: Profile): Promise<Array<osc.DirectLinkInterfaces> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadDirectLinkInterfacesOperationRequest = {
        readDirectLinkInterfacesRequest: {}
    };

    const api = new osc.DirectLinkInterfaceApi(config);
    return api.readDirectLinkInterfaces(readParameters)
    .then((res: osc.ReadDirectLinkInterfacesResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.directLinkInterfaces === undefined || res.directLinkInterfaces.length === 0) {
            return "Listing suceeded but it seems you have no DirectLinkInterface";
        }
        return res.directLinkInterfaces;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

// Retrieve a specific item of the resource DirectLinkInterface
export function getDirectLinkInterface(profile: Profile, resourceId: string): Promise<osc.DirectLinkInterfaces | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadDirectLinkInterfacesOperationRequest = {
        readDirectLinkInterfacesRequest: {
            filters: {
                directLinkInterfaceIds: [resourceId]
            }
        }
    };

    const api = new osc.DirectLinkInterfaceApi(config);
    return api.readDirectLinkInterfaces(readParameters)
    .then((res: osc.ReadDirectLinkInterfacesResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.directLinkInterfaces === undefined || res.directLinkInterfaces.length === 0) {
            return "Listing suceeded but it seems you have no DirectLinkInterface";
        }
        return res.directLinkInterfaces[0];
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

// Delete a specific item the resource DirectLinkInterface
export function deleteDirectLinkInterface(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteDirectLinkInterfaceOperationRequest = {
        deleteDirectLinkInterfaceRequest: {
            directLinkInterfaceId: resourceId
        }
    };

    const api = new osc.DirectLinkInterfaceApi(config);
    return api.deleteDirectLinkInterface(deleteParameters)
    .then((res: osc.DeleteDirectLinkInterfaceResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}