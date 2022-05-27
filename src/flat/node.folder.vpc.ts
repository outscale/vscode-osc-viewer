import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from './node';
import { FolderNode } from './node.folder';
import * as osc from "outscale-api";
import { ResourceNode } from './node.resources';
import {getConfig} from '../cloud/cloud';

export class VpcFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Nets");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		let region = "eu-west-2";
		return this.getNets().then(netsResults => {
			if (typeof netsResults === "string") {
				vscode.window.showInformationMessage(netsResults);
				return Promise.resolve([]);
			}
			let resources = [];
			for (const net of netsResults) {
                if (typeof net.netId === 'undefined') {
                    continue;
                }
                resources.push(new ResourceNode(this.profile,"", net.netId?.toString()));
			}
			return Promise.resolve(resources);
		});
		
    }


    private async getNets(): Promise<Array<osc.Net> | string> {
        const config = getConfig(this.profile);
        let readParameters : osc.ReadNetsOperationRequest = {
            readNetsRequest: {}
        };
    
        let api = new osc.NetApi(config);
        return api.readNets(readParameters)
        .then((res: osc.ReadNetsResponse | string) => {
            if (typeof res === "string") {
                return res;
            }
            if (res.nets === undefined || res.nets.length === 0) {
                return "Listing suceeded but it seems you have no VPC";
            }
            return res.nets;
        }, (err_: any) => {
            return "Error, bad credential or region?" + err_;
        });
    }




}