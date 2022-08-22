
import * as osc from "outscale-api";
import { getConfig } from './cloud';
import { Profile } from "../flat/node";


export function getOMIs(profile: Profile, filters?: osc.FiltersImage): Promise<Array<osc.Image> | string> {
    let config = getConfig(profile);
    let readParameters : osc.ReadImagesOperationRequest = {
        readImagesRequest: {
            filters: filters
        }
    };

    let api = new osc.ImageApi(config);
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
    let config = getConfig(profile);
    let readParameters : osc.ReadImagesOperationRequest = {
        readImagesRequest: {
            filters: {
                imageIds: [omiId]
            }
        }
    };

    let api = new osc.ImageApi(config);
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