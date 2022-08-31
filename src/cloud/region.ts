import * as osc from "outscale-api";
import { getCloudUnauthenticatedConfig } from "./cloud";

export function getRegions(): Promise<osc.Region[] | string> {
    const cloudConfig = getCloudUnauthenticatedConfig();
    const api = new osc.RegionApi(cloudConfig);
    const readParameters: osc.ReadRegionsOperationRequest = {
        readRegionsRequest: {}
    };
    return api.readRegions(readParameters).then((res: osc.ReadRegionsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (typeof res.regions === "undefined" || res.regions.length === 0) {
            return "Listing suceeded but it seems there is no region";
        }
        return res.regions;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });

}