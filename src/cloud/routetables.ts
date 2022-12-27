
import * as osc from "outscale-api";
import { FiltersRouteTable } from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource RouteTable
export function getRouteTables(profile: Profile, filters?: FiltersRouteTable): Promise<Array<osc.RouteTable> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadRouteTablesOperationRequest = {
        readRouteTablesRequest: {
            filters: filters
        }
    };

    const api = new osc.RouteTableApi(config);
    return api.readRouteTables(readParameters)
        .then((res: osc.ReadRouteTablesResponse) => {
            if (res.routeTables === undefined || res.routeTables.length === 0) {
                return [];
            }
            return res.routeTables;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Retrieve a specific item of the resource RouteTable
export function getRouteTable(profile: Profile, resourceId: string): Promise<osc.RouteTable | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadRouteTablesOperationRequest = {
        readRouteTablesRequest: {
            filters: {
                routeTableIds: [resourceId]
            }
        }
    };

    const api = new osc.RouteTableApi(config);
    return api.readRouteTables(readParameters)
        .then((res: osc.ReadRouteTablesResponse) => {
            if (res.routeTables === undefined || res.routeTables.length === 0) {
                return {};
            }
            return res.routeTables[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Delete a specific item the resource RouteTable
export function deleteRouteTable(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteRouteTableOperationRequest = {
        deleteRouteTableRequest: {
            routeTableId: resourceId
        }
    };

    const api = new osc.RouteTableApi(config);
    return api.deleteRouteTable(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Unlink a specific item the resource RouteTable
export function unlinkRouteTable(profile: Profile, linkId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const parameters: osc.UnlinkRouteTableOperationRequest = {
        unlinkRouteTableRequest: {
            linkRouteTableId: linkId
        }
    };

    const api = new osc.RouteTableApi(config);
    return api.unlinkRouteTable(parameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

export function routeToString(route: osc.Route): string {
    let stringBuilder = `destinationIpRange: ${route.destinationIpRange}`;

    for (const field of Object.entries(route)) {
        if (!field[0].endsWith("Id")) {
            continue;
        }
        if (typeof field[1] === 'undefined') {
            continue;
        }

        stringBuilder = `${stringBuilder}, ${field[0]}: ${field[1]}`;
    }
    return stringBuilder;
}

export function removeRoute(profile: Profile, resourceId: string, subresourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const parameters: osc.DeleteRouteOperationRequest = {
        deleteRouteRequest: {
            destinationIpRange: subresourceId,
            routeTableId: resourceId
        }
    };

    const api = new osc.RouteApi(config);
    return api.deleteRoute(parameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}