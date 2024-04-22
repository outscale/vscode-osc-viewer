import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { getVmName, getVms } from '../../../cloud/vms';
import { VmResourceNode } from '../../resources/node.resources.vms';
import { FiltersVm, FiltersVmFromJSON } from 'outscale-api';
import { FiltersFolderNode } from '../node.filterfolder';


const filteredState = ["pending", "running", "stopping", "stopped", "shutting-down"];
const windowsProductCodes = ["0002", "0005", "0008", "0009"];
export const VM_FOLDER_NAME = "Vms";
export class VmsFolderNode extends FiltersFolderNode<FiltersVm> implements ExplorerFolderNode {

    constructor(readonly profile: Profile) {
        super(profile, VM_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getVms(this.profile, this.filters).then(vmsResult => {
            if (typeof vmsResult === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, vmsResult));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const vm of vmsResult) {
                if (typeof vm.vmId === 'undefined') {
                    continue;
                }

                if (typeof vm.state !== "string") {
                    continue;
                }

                if (!filteredState.includes(vm.state)) {
                    continue;
                }

                let isWindows = false;
                if (typeof vm.productCodes !== "undefined") {
                    for (const pc of vm.productCodes) {
                        if (windowsProductCodes.includes(pc)) {
                            isWindows = true;
                        }
                    }
                }

                resources.push(new VmResourceNode(this.profile, getVmName(vm), vm.vmId?.toString(), vm.state, isWindows, vm.tags));
            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersVm {
        return FiltersVmFromJSON(json);
    }

}