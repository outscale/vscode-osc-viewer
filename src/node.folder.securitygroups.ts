import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from './node';
import { FolderNode } from './node.folder';
import * as osc from "outscale-api";
import { ResourceNode } from './node.resources';
import { getConfig } from './cloud';

export class SecurityGroupsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Security Groups")
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return this.getSecurityGroups().then(sgsResults => {
			if (typeof sgsResults == "string") {
				vscode.window.showInformationMessage(sgsResults);
				return Promise.resolve([]);
			}
			let resources = []
			for (const sg of sgsResults) {
                if (typeof sg.securityGroupId == 'undefined' || typeof sg.securityGroupName == 'undefined') {
                    continue
                }
                resources.push(new ResourceNode(this.profile, sg.securityGroupName, sg.securityGroupId))
			}
			return Promise.resolve(resources)
		});
		
    }


    private async getSecurityGroups(): Promise<Array<osc.SecurityGroup> | string> {
        let config = getConfig(this.profile)
        let readParameters : osc.ReadSecurityGroupsOperationRequest = {
            readSecurityGroupsRequest: {}
        };
    
        let api = new osc.SecurityGroupApi(config)
        return api.readSecurityGroups(readParameters)
        .then((res: osc.ReadSecurityGroupsResponse | string) => {
            if (typeof res == "string") {
                return res;
            }
            if (res.securityGroups === undefined || res.securityGroups.length == 0) {
                return "Listing suceeded but it seems you have no vm";
            }
            return res.securityGroups;
        }, (err_: any) => {
            return "Error, bad credential or region?" + err_;
        });
    }




}