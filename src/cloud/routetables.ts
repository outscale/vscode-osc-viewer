
import * as osc from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource RouteTable
export function getRouteTables(profile: Profile): Promise<Array<osc.RouteTable> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadRouteTablesOperationRequest = {
        readRouteTablesRequest: {}
    };

    const api = new osc.RouteTableApi(config);
    return api.readRouteTables(readParameters)
    .then((res: osc.ReadRouteTablesResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.routeTables === undefined || res.routeTables.length === 0) {
            return "Listing suceeded but it seems you have no RouteTable";
        }
        return res.routeTables;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

// Retrieve a specific item of the resource RouteTable
export function getRouteTable(profile: Profile, resourceId: string): Promise<osc.RouteTable | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadRouteTablesOperationRequest = {
        readRouteTablesRequest: {
            filters: {
                routeTableIds: [resourceId]
            }
        }
    };

    const api = new osc.RouteTableApi(config);
    return api.readRouteTables(readParameters)
    .then((res: osc.ReadRouteTablesResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.routeTables === undefined || res.routeTables.length === 0) {
            return "Listing suceeded but it seems you have no RouteTable";
        }
        return res.routeTables[0];
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

// Delete a specific item the resource RouteTable
export function deleteRouteTable(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteRouteTableOperationRequest = {
        deleteRouteTableRequest: {
            routeTableId: resourceId
        }
    };

    const api = new osc.RouteTableApi(config);
    return api.deleteRouteTable(deleteParameters)
    .then((res: osc.DeleteRouteTableResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}