
import * as osc from "outscale-api";
import { FiltersRouteTable } from "outscale-api";
import { getConfig } from '../cloud/cloud';
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
            return err_.toString();
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
            return err_.toString();
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
            return err_.toString();
        });
}