import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from './node';
import { FolderNode } from './node.folder';
import * as osc from "outscale-api";
import { ResourceNode } from './node.resources';
import { getConfig } from './cloud';

export class KeypairsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Keypair")
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return this.getKeypair().then(result => {
			if (typeof result == "string") {
				vscode.window.showInformationMessage(result);
				return Promise.resolve([]);
			}
			let resources = []
			for (const keypair of result) {
                if (typeof keypair.keypairName == 'undefined') {
                    continue
                }
                resources.push(new ResourceNode(this.profile, "", keypair.keypairName))
			}
			return Promise.resolve(resources)
		});
		
    }


    private async getKeypair(): Promise<Array<osc.Keypair> | string> {
        let config = getConfig(this.profile)
        let readParameters : osc.ReadKeypairsOperationRequest = {
            readKeypairsRequest: {}
        };
    
        let api = new osc.KeypairApi(config)
        return api.readKeypairs(readParameters)
        .then((res: osc.ReadKeypairsResponse | string) => {
            if (typeof res == "string") {
                return res;
            }
            if (res.keypairs === undefined || res.keypairs.length == 0) {
                return "Listing suceeded but it seems you have no vm";
            }
            return res.keypairs;
        }, (err_: any) => {
            return "Error, bad credential or region?" + err_;
        });
    }




}