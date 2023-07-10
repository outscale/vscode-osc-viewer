
import * as osc from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";


export function getVmGroups(profile: Profile, filters?: osc.FiltersVmGroup): Promise<Array<osc.VmGroup> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadVmGroupsOperationRequest = {
        readVmGroupsRequest: {
            filters: filters
        }
    };

    const api = new osc.VmGroupApi(config);
    return api.readVmGroups(readParameters)
        .then((res: osc.ReadVmGroupsResponse) => {
            if (res.vmGroups === undefined || res.vmGroups.length === 0) {
                return [];
            }
            return res.vmGroups;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

export function getVmGroup(profile: Profile, vmGroupId: string): Promise<osc.VmGroup | undefined | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadVmGroupsOperationRequest = {
        readVmGroupsRequest: {
            filters: {
                vmGroupIds: [vmGroupId]
            }
        }
    };

    const api = new osc.VmGroupApi(config);
    return api.readVmGroups(readParameters)
        .then((res: osc.ReadVmGroupsResponse) => {
            if (res.vmGroups === undefined || res.vmGroups.length === 0) {
                return undefined;
            }
            return res.vmGroups[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

export function deleteVmGroup(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteVmGroupOperationRequest = {
        deleteVmGroupRequest: {
            vmGroupId: resourceId
        }
    };

    const api = new osc.VmGroupApi(config);
    return api.deleteVmGroup(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}


export function scaleUp(profile: Profile, resourceId: string, addition: number): Promise<string | undefined> {
    const config = getConfig(profile);
    const parameters: osc.ScaleUpVmGroupOperationRequest = {
        scaleUpVmGroupRequest: {
            vmGroupId: resourceId,
            vmAddition: addition
        }
    };

    const api = new osc.VmGroupApi(config);
    return api.scaleUpVmGroup(parameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

export function scaleDown(profile: Profile, resourceId: string, substraction: number): Promise<string | undefined> {
    const config = getConfig(profile);
    const parameters: osc.ScaleDownVmGroupOperationRequest = {
        scaleDownVmGroupRequest: {
            vmGroupId: resourceId,
            vmSubtraction: substraction
        }
    };

    const api = new osc.VmGroupApi(config);
    return api.scaleDownVmGroup(parameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}