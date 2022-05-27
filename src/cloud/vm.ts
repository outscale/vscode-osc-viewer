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
        if (tag.key === "name") {
            return tag.value;
        }
    }
    return "";
}