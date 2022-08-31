
import * as osc from "outscale-api";
import { getConfig } from './cloud';
import { Profile } from "../flat/node";


export function getVolumes(profile: Profile): Promise<Array<osc.Volume> | string> {
    let config = getConfig(profile);
    let readParameters : osc.ReadVolumesOperationRequest = {
        readVolumesRequest: {}
    };

    let api = new osc.VolumeApi(config);
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
    let config = getConfig(profile);
    let readParameters : osc.ReadVolumesOperationRequest = {
        readVolumesRequest: {
            filters: {
                volumeIds: [volumeId]
            }
        }
    };

    let api = new osc.VolumeApi(config);
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
    let config = getConfig(profile);
    let deleteParameters : osc.DeleteVolumeOperationRequest = {
        deleteVolumeRequest: {
            volumeId: resourceId
        }
    };

    let api = new osc.VolumeApi(config);
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