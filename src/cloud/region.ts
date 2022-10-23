import * as osc from "outscale-api";
import { getCloudUnauthenticatedConfig } from "./cloud";

export function getRegions(): Promise<osc.Region[] | string> {
    const cloudConfig = getCloudUnauthenticatedConfig();
    const api = new osc.RegionApi(cloudConfig);
    const readParameters: osc.ReadRegionsOperationRequest = {
        readRegionsRequest: {}
    };
    return api.readRegions(readParameters).then((res: osc.ReadRegionsResponse) => {
        if (typeof res.regions === "undefined" || res.regions.length === 0) {
            return [];
        }
        return res.regions;
    }, (err_: any) => {
        return err_.toString();
    });

}