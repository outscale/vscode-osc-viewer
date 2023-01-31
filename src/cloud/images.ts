
import * as osc from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource Image
export function getOMIs(profile: Profile, filters?: osc.FiltersImage): Promise<Array<osc.Image> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadImagesOperationRequest = {
        readImagesRequest: {
            filters: filters
        }
    };

    const api = new osc.ImageApi(config);
    return api.readImages(readParameters)
        .then((res: osc.ReadImagesResponse) => {
            if (res.images === undefined || res.images.length === 0) {
                return [];
            }
            return res.images;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Retrieve a specific item of the resource Image
export function getOMI(profile: Profile, resourceId: string): Promise<osc.Image | undefined | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadImagesOperationRequest = {
        readImagesRequest: {
            filters: {
                imageIds: [resourceId]
            }
        }
    };

    const api = new osc.ImageApi(config);
    return api.readImages(readParameters)
        .then((res: osc.ReadImagesResponse) => {
            if (res.images === undefined || res.images.length === 0) {
                return undefined;
            }
            return res.images[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Delete a specific item the resource Image
export function deleteOMI(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteImageOperationRequest = {
        deleteImageRequest: {
            imageId: resourceId
        }
    };

    const api = new osc.ImageApi(config);
    return api.deleteImage(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}