import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from './node';
import { FolderNode } from './node.folder';
import * as osc from "outscale-api";
import { ResourceNode } from './node.resources';
import { getConfig } from '../cloud/cloud';


export class VmsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Vms");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return this.getVms().then(vmsResult => {
			if (typeof vmsResult === "string") {
				vscode.window.showInformationMessage(vmsResult);
				return Promise.resolve([]);
			}
			let resources = [];
			for (const vm of vmsResult) {
                if (typeof vm.vmId === 'undefined') {
                    continue;
                }
                resources.push(new ResourceNode(this.profile,"", vm.vmId?.toString()));
			}
			return Promise.resolve(resources);
		});
		
    }


    private async getVms(): Promise<Array<osc.Vm> | string> {
        let config = getConfig(this.profile);
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




}