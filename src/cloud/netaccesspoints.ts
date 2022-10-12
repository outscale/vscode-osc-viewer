
import * as osc from "outscale-api";
import { FiltersNetAccessPoint } from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource NetAccessPoint
export function getNetAccessPoints(profile: Profile, filters?: FiltersNetAccessPoint): Promise<Array<osc.NetAccessPoint> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadNetAccessPointsOperationRequest = {
        readNetAccessPointsRequest: {
            filters: filters
        }
    };

    const api = new osc.NetAccessPointApi(config);
    return api.readNetAccessPoints(readParameters)
    .then((res: osc.ReadNetAccessPointsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.netAccessPoints === undefined || res.netAccessPoints.length === 0) {
            return "Listing suceeded but it seems you have no NetAccessPoint";
        }
        return res.netAccessPoints;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

// Retrieve a specific item of the resource NetAccessPoint
export function getNetAccessPoint(profile: Profile, resourceId: string): Promise<osc.NetAccessPoint | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadNetAccessPointsOperationRequest = {
        readNetAccessPointsRequest: {
            filters: {
                netAccessPointIds: [resourceId]
            }
        }
    };

    const api = new osc.NetAccessPointApi(config);
    return api.readNetAccessPoints(readParameters)
    .then((res: osc.ReadNetAccessPointsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.netAccessPoints === undefined || res.netAccessPoints.length === 0) {
            return "Listing suceeded but it seems you have no NetAccessPoint";
        }
        return res.netAccessPoints[0];
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

// Delete a specific item the resource NetAccessPoint
export function deleteNetAccessPoint(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteNetAccessPointOperationRequest = {
        deleteNetAccessPointRequest: {
            netAccessPointId: resourceId
        }
    };

    const api = new osc.NetAccessPointApi(config);
    return api.deleteNetAccessPoint(deleteParameters)
    .then((res: osc.DeleteNetAccessPointResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}