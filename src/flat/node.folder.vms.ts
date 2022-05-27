import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from './node';
import { FolderNode } from './node.folder';
import { ResourceNode } from './node.resources';
import { getVmName, getVms } from '../cloud/vm';


export class VmsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, "Vms");
    }

    getChildren(): Thenable<ExplorerNode[]> {
        return getVms(this.profile).then(vmsResult => {
            if (typeof vmsResult === "string") {
                vscode.window.showInformationMessage(vmsResult);
                return Promise.resolve([]);
            }
            let resources = [];
            for (const vm of vmsResult) {
                if (typeof vm.vmId === 'undefined') {
                    continue;
                }

                resources.push(new ResourceNode(this.profile, getVmName(vm), vm.vmId?.toString()));
            }
            return Promise.resolve(resources);
        });

    }

}