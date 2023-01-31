import * as osc from "outscale-api";
import { FiltersVm } from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource Vm
export function getVms(profile: Profile, filters?: FiltersVm): Promise<Array<osc.Vm> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadVmsOperationRequest = {
        readVmsRequest: {
            filters: filters
        }
    };

    const api = new osc.VmApi(config);
    return api.readVms(readParameters)
        .then((res: osc.ReadVmsResponse) => {
            if (res.vms === undefined || res.vms.length === 0) {
                return [];
            }
            return res.vms;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Retrieve a specific item of the resource Vm
export function getVm(profile: Profile, resourceId: string): Promise<osc.Vm | undefined | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadVmsOperationRequest = {
        readVmsRequest: {
            filters: {
                vmIds: [resourceId]
            }
        }
    };

    const api = new osc.VmApi(config);
    return api.readVms(readParameters)
        .then((res: osc.ReadVmsResponse) => {
            if (res.vms === undefined || res.vms.length === 0) {
                return undefined;
            }
            return res.vms[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

export function getVmName(vm: osc.Vm): string {
    if (typeof vm.tags === "undefined") {
        return "";
    }

    for (const tag of vm.tags) {
        if (tag.key === "name" || tag.key === "Name") {
            return tag.value;
        }
    }
    return "";
}

// Delete a specific item the resource Vm
export function deleteVm(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteVmsOperationRequest = {
        deleteVmsRequest: {
            vmIds: [resourceId]
        }
    };

    const api = new osc.VmApi(config);
    return api.deleteVms(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}
export function startVm(profile: Profile, vmId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const startParameters: osc.StartVmsOperationRequest = {
        startVmsRequest: {
            vmIds: [vmId]
        }
    };

    const api = new osc.VmApi(config);
    return api.startVms(startParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });

}

export function stopVm(profile: Profile, vmId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const stopParameters: osc.StopVmsOperationRequest = {
        stopVmsRequest: {
            vmIds: [vmId]
        }
    };

    const api = new osc.VmApi(config);
    return api.stopVms(stopParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });

}

export function getLogs(profile: Profile, vmId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const stopParameters: osc.ReadConsoleOutputOperationRequest = {
        readConsoleOutputRequest: {
            vmId: vmId
        }
    };

    const api = new osc.VmApi(config);
    return api.readConsoleOutput(stopParameters)
        .then((res: osc.ReadConsoleOutputResponse) => {
            if (typeof res.consoleOutput === "undefined") {
                return undefined;
            }
            return res.consoleOutput;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}