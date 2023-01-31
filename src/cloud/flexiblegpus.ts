
import * as osc from "outscale-api";
import { FiltersFlexibleGpu } from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource FlexibleGpu
export function getFlexibleGpus(profile: Profile, filters?: FiltersFlexibleGpu): Promise<Array<osc.FlexibleGpu> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadFlexibleGpusOperationRequest = {
        readFlexibleGpusRequest: {
            filters: filters
        }
    };

    const api = new osc.FlexibleGpuApi(config);
    return api.readFlexibleGpus(readParameters)
        .then((res: osc.ReadFlexibleGpusResponse) => {
            if (res.flexibleGpus === undefined || res.flexibleGpus.length === 0) {
                return [];
            }
            return res.flexibleGpus;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Retrieve a specific item of the resource FlexibleGpu
export function getFlexibleGpu(profile: Profile, resourceId: string): Promise<osc.FlexibleGpu | undefined | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadFlexibleGpusOperationRequest = {
        readFlexibleGpusRequest: {
            filters: {
                flexibleGpuIds: [resourceId]
            }
        }
    };

    const api = new osc.FlexibleGpuApi(config);
    return api.readFlexibleGpus(readParameters)
        .then((res: osc.ReadFlexibleGpusResponse) => {
            if (res.flexibleGpus === undefined || res.flexibleGpus.length === 0) {
                return undefined;
            }
            return res.flexibleGpus[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Delete a specific item the resource FlexibleGpu
export function deleteFlexibleGpu(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteFlexibleGpuOperationRequest = {
        deleteFlexibleGpuRequest: {
            flexibleGpuId: resourceId
        }
    };

    const api = new osc.FlexibleGpuApi(config);
    return api.deleteFlexibleGpu(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

export function unlinkFlexibleGpu(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const parameters: osc.UnlinkFlexibleGpuOperationRequest = {
        unlinkFlexibleGpuRequest: {
            flexibleGpuId: resourceId
        }
    };

    const api = new osc.FlexibleGpuApi(config);
    return api.unlinkFlexibleGpu(parameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}