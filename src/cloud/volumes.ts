
import * as osc from "outscale-api";
import { getConfig } from './cloud';
import { Profile } from "../flat/node";
import { FiltersVolume } from "outscale-api";


export function getVolumes(profile: Profile, filters?: FiltersVolume): Promise<Array<osc.Volume> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadVolumesOperationRequest = {
        readVolumesRequest: {
            filters: filters
        }
    };

    const api = new osc.VolumeApi(config);
    return api.readVolumes(readParameters)
    .then((res: osc.ReadVolumesResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.volumes === undefined || res.volumes.length === 0) {
            return "Listing suceeded but it seems you have no Volume";
        }
        return res.volumes;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

export function getVolume(profile: Profile, volumeId: string): Promise<osc.Volume | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadVolumesOperationRequest = {
        readVolumesRequest: {
            filters: {
                volumeIds: [volumeId]
            }
        }
    };

    const api = new osc.VolumeApi(config);
    return api.readVolumes(readParameters)
    .then((res: osc.ReadVolumesResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.volumes === undefined || res.volumes.length === 0) {
            return "Listing suceeded but it seems you have no Volume";
        }
        return res.volumes[0];
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

export function deleteVolume(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteVolumeOperationRequest = {
        deleteVolumeRequest: {
            volumeId: resourceId
        }
    };

    const api = new osc.VolumeApi(config);
    return api.deleteVolume(deleteParameters)
    .then((res: osc.DeleteVolumeResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}