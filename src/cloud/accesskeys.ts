
import * as osc from "outscale-api";
import { FiltersAccessKeys } from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource AccessKey
export function getAccessKeys(profile: Profile, filters?: FiltersAccessKeys): Promise<Array<osc.AccessKey> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadAccessKeysOperationRequest = {
        readAccessKeysRequest: {
            filters: filters
        }
    };

    const api = new osc.AccessKeyApi(config);
    return api.readAccessKeys(readParameters)
        .then((res: osc.ReadAccessKeysResponse) => {
            if (res.accessKeys === undefined || res.accessKeys.length === 0) {
                return [];
            }
            return res.accessKeys;
        }, (err_: any) => {
            return err_.toString();
        });
}

// Retrieve a specific item of the resource AccessKey
export function getAccessKey(profile: Profile, resourceId: string): Promise<osc.AccessKey | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadAccessKeysOperationRequest = {
        readAccessKeysRequest: {
            filters: {
                accessKeyIds: [resourceId]
            }
        }
    };

    const api = new osc.AccessKeyApi(config);
    return api.readAccessKeys(readParameters)
        .then((res: osc.ReadAccessKeysResponse) => {
            if (res.accessKeys === undefined || res.accessKeys.length === 0) {
                return {};
            }
            return res.accessKeys[0];
        }, (err_: any) => {
            return err_.toString();
        });
}

// Delete a specific item the resource AccessKey
export function deleteAccessKey(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteAccessKeyOperationRequest = {
        deleteAccessKeyRequest: {
            accessKeyId: resourceId
        }
    };

    const api = new osc.AccessKeyApi(config);
    return api.deleteAccessKey(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return err_.toString();
        });
}