import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { getVmName, getVms } from '../../../cloud/vms';
import { VmResourceNode } from '../../resources/node.resources.vms';


const filteredState = ["pending","running", "stopping", "stopped", "shutting-down"];
export const VM_FOLDER_NAME = "Vms";
export class VmsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, VM_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        return getVms(this.profile).then(vmsResult => {
            if (typeof vmsResult === "string") {
                vscode.window.showErrorMessage(vmsResult);
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

                if (! filteredState.includes(vm.state)) {
                    continue;
                }

                resources.push(new VmResourceNode(this.profile, getVmName(vm), vm.vmId?.toString(), vm.state));
            }
            return Promise.resolve(resources);
        });

    }

}