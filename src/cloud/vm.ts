import * as osc from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";

export function getVms(profile: Profile): Promise<Array<osc.Vm> | string> {
    let config = getConfig(profile);
    let readParameters : osc.ReadVmsOperationRequest = {
        readVmsRequest: {}
    };

    let api = new osc.VmApi(config);
    return api.readVms(readParameters)
    .then((res: osc.ReadVmsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.vms === undefined || res.vms.length === 0) {
            return "Listing suceeded but it seems you have no vm";
        }
        return res.vms;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

export function getVm(profile: Profile, vmId: string): Promise<osc.Vm | string> {
    let config = getConfig(profile);
    let readParameters : osc.ReadVmsOperationRequest = {
        readVmsRequest: {
            filters: {
                vmIds: [vmId]
            }
        }
    };

    let api = new osc.VmApi(config);
    return api.readVms(readParameters)
    .then((res: osc.ReadVmsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.vms === undefined || res.vms.length === 0) {
            return "Listing suceeded but it seems you have no vm";
        }
        return res.vms[0];
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
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

export function deleteVm(profile: Profile, vmId: string): Promise<string | undefined> {
    let config = getConfig(profile);
    let deleteParameters : osc.DeleteVmsOperationRequest = {
        deleteVmsRequest: {
            vmIds: [vmId]
        }
    };

    let api = new osc.VmApi(config);
    return api.deleteVms(deleteParameters)
    .then((res: osc.DeleteVmsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
    
}

export function startVm(profile: Profile, vmId: string): Promise<string | undefined> {
    let config = getConfig(profile);
    let startParameters : osc.StartVmsOperationRequest = {
        startVmsRequest: {
            vmIds: [vmId]
        }
    };

    let api = new osc.VmApi(config);
    return api.startVms(startParameters)
    .then((res: osc.StartVmsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        console.log(res);
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
    
}

export function stopVm(profile: Profile, vmId: string): Promise<string | undefined> {
    let config = getConfig(profile);
    let stopParameters : osc.StopVmsOperationRequest = {
        stopVmsRequest: {
            vmIds: [vmId]
        }
    };

    let api = new osc.VmApi(config);
    return api.stopVms(stopParameters)
    .then((res: osc.StopVmsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        console.log(res);
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
    
}

export async function getLogs(profile: Profile, vmId: string): Promise<string | undefined> {
    let config = getConfig(profile);
    let stopParameters : osc.ReadConsoleOutputOperationRequest = {
        readConsoleOutputRequest: {
            vmId: vmId
        }
    };

    let api = new osc.VmApi(config);
    return api.readConsoleOutput(stopParameters)
            .then((res: osc.ReadConsoleOutputResponse | string) => {
                if (typeof res === "string") {
                    console.log(res);
                    return undefined;
                }
                
                if (typeof res.consoleOutput === "undefined") {
                    return undefined;
                }
                return res.consoleOutput;
            });
}