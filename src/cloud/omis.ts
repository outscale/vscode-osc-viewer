
import * as osc from "outscale-api";
import { getConfig } from './cloud';
import { Profile } from "../flat/node";


export function getOMIs(profile: Profile, filters?: osc.FiltersImage): Promise<Array<osc.Image> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadImagesOperationRequest = {
        readImagesRequest: {
            filters: filters
        }
    };

    const api = new osc.ImageApi(config);
    return api.readImages(readParameters)
    .then((res: osc.ReadImagesResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.images === undefined || res.images.length === 0) {
            return "Listing suceeded but it seems you have no OMIs";
        }
        return res.images;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

export function getOMI(profile: Profile, omiId: string): Promise<osc.Image | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadImagesOperationRequest = {
        readImagesRequest: {
            filters: {
                imageIds: [omiId]
            }
        }
    };

    const api = new osc.ImageApi(config);
    return api.readImages(readParameters)
    .then((res: osc.ReadImagesResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.images === undefined || res.images.length === 0) {
            return "Listing suceeded but it seems you have no OMIs";
        }
        return res.images[0];
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

export function deleteOMI(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteImageOperationRequest = {
        deleteImageRequest: {
            imageId: resourceId
        }
    };

    const api = new osc.ImageApi(config);
    return api.deleteImage(deleteParameters)
    .then((res: osc.DeleteImageResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}