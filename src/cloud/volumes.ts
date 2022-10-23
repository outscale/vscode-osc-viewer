
import * as osc from "outscale-api";
import { FiltersVolume } from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource Volume
export function getVolumes(profile: Profile, filters?: FiltersVolume): Promise<Array<osc.Volume> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadVolumesOperationRequest = {
        readVolumesRequest: {
            filters: filters
        }
    };

    const api = new osc.VolumeApi(config);
    return api.readVolumes(readParameters)
        .then((res: osc.ReadVolumesResponse) => {
            if (res.volumes === undefined || res.volumes.length === 0) {
                return [];
            }
            return res.volumes;
        }, (err_: any) => {
            return err_.toString();
        });
}

// Retrieve a specific item of the resource Volume
export function getVolume(profile: Profile, resourceId: string): Promise<osc.Volume | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadVolumesOperationRequest = {
        readVolumesRequest: {
            filters: {
                volumeIds: [resourceId]
            }
        }
    };

    const api = new osc.VolumeApi(config);
    return api.readVolumes(readParameters)
        .then((res: osc.ReadVolumesResponse) => {
            if (res.volumes === undefined || res.volumes.length === 0) {
                return {};
            }
            return res.volumes[0];
        }, (err_: any) => {
            return err_.toString();
        });
}

// Delete a specific item the resource Volume
export function deleteVolume(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteVolumeOperationRequest = {
        deleteVolumeRequest: {
            volumeId: resourceId
        }
    };

    const api = new osc.VolumeApi(config);
    return api.deleteVolume(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return err_.toString();
        });
}