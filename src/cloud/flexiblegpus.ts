
import * as osc from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource FlexibleGpu
export function getFlexibleGpus(profile: Profile): Promise<Array<osc.FlexibleGpu> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadFlexibleGpusOperationRequest = {
        readFlexibleGpusRequest: {}
    };

    const api = new osc.FlexibleGpuApi(config);
    return api.readFlexibleGpus(readParameters)
    .then((res: osc.ReadFlexibleGpusResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.flexibleGpus === undefined || res.flexibleGpus.length === 0) {
            return "Listing suceeded but it seems you have no FlexibleGpu";
        }
        return res.flexibleGpus;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

// Retrieve a specific item of the resource FlexibleGpu
export function getFlexibleGpu(profile: Profile, resourceId: string): Promise<osc.FlexibleGpu | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadFlexibleGpusOperationRequest = {
        readFlexibleGpusRequest: {
            filters: {
                flexibleGpuIds: [resourceId]
            }
        }
    };

    const api = new osc.FlexibleGpuApi(config);
    return api.readFlexibleGpus(readParameters)
    .then((res: osc.ReadFlexibleGpusResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.flexibleGpus === undefined || res.flexibleGpus.length === 0) {
            return "Listing suceeded but it seems you have no FlexibleGpu";
        }
        return res.flexibleGpus[0];
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

// Delete a specific item the resource FlexibleGpu
export function deleteFlexibleGpu(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteFlexibleGpuOperationRequest = {
        deleteFlexibleGpuRequest: {
            flexibleGpuId: resourceId
        }
    };

    const api = new osc.FlexibleGpuApi(config);
    return api.deleteFlexibleGpu(deleteParameters)
    .then((res: osc.DeleteFlexibleGpuResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}