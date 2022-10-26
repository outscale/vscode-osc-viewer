import * as osc from 'outscale-api';
import { ImportMock } from 'ts-mock-imports';

let vms: osc.Vm[] = [
    {
        vmId: "vmId1",
        state: "running",
        tags: [
            {
                key: "name",
                value: "vm1"
            }
        ]
    },
    {
        vmId: "vmId2",
        state: "pending",
        tags: [
            {
                key: "name",
                value: "vm2"
            },
            {
                key: "Filtered",
                value: "true"
            }
        ]
    }
];

export function initMock() {
    const readVmMock = ImportMock.mockFunction(osc.VmApi.prototype, 'readVms');
    readVmMock.callsFake((arg: osc.ReadVmsOperationRequest) => {
        let responseVms = vms;
        if (typeof arg.readVmsRequest?.filters?.vmIds !== 'undefined') {
            responseVms = responseVms.filter(vm => {
                if (typeof vm.vmId === 'undefined') {
                    return false;
                }
                return arg.readVmsRequest?.filters?.vmIds?.includes(vm.vmId);
            });
        }

        const filteredTags = arg.readVmsRequest?.filters?.tagKeys;
        if (typeof filteredTags !== 'undefined') {
            responseVms = responseVms.filter(vm => {
                if (typeof vm.tags === 'undefined') {
                    return false;
                }

                const vmKeyTags = vm.tags.map(tag => tag.key);

                for (const filteredTag of filteredTags) {
                    if (!vmKeyTags.includes(filteredTag)) {
                        return false;
                    }
                }
                return true;
            });
        }
        const resp: osc.ReadVmsResponse = {
            vms: responseVms
        };
        return Promise.resolve(resp);
    });

    const deleteVmMock = ImportMock.mockFunction(osc.VmApi.prototype, 'deleteVms');
    deleteVmMock.callsFake((arg: osc.DeleteVmsOperationRequest) => {
        const vmIds = arg.deleteVmsRequest?.vmIds;
        if (typeof vmIds === 'undefined') {
            return Promise.reject("403");
        }
        vms = vms.filter((vm) => {
            if (typeof vm.vmId === 'undefined') {
                return false;
            }
            return !vmIds.includes(vm.vmId);
        });
        return Promise.resolve(undefined);
    });

    const startVmMock = ImportMock.mockFunction(osc.VmApi.prototype, 'startVms');
    startVmMock.callsFake((arg: osc.StartVmsOperationRequest) => {
        const vmIds = arg.startVmsRequest?.vmIds;
        if (typeof vmIds === 'undefined') {
            return Promise.reject("403");
        }
        vms = vms.filter((vm) => {
            if (typeof vm.vmId === 'undefined') {
                return false;
            }
            if (vmIds.includes(vm.vmId)) {
                vm.state = "running";
            }
            return true;
        });
        return Promise.resolve(undefined);
    });

    const stopVmMock = ImportMock.mockFunction(osc.VmApi.prototype, 'stopVms');
    stopVmMock.callsFake((arg: osc.StopVmsOperationRequest) => {
        const vmIds = arg.stopVmsRequest?.vmIds;
        if (typeof vmIds === 'undefined') {
            return Promise.reject("403");
        }
        vms = vms.filter((vm) => {
            if (typeof vm.vmId === 'undefined') {
                return false;
            }
            if (vmIds.includes(vm.vmId)) {
                vm.state = "stopped";
            }
            return true;
        });
        return Promise.resolve(undefined);
    });
}