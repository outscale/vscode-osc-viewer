import * as vscode from 'vscode';

import { AccountToJSON, ImageToJSON, KeypairToJSON, LoadBalancerToJSON, NetToJSON, PublicIpToJSON, RouteTableToJSON, SecurityGroupToJSON, SnapshotToJSON, VmToJSON, VolumeToJSON } from "outscale-api";
import { getExternalIP } from "../cloud/eips";
import { getKeypair } from "../cloud/keypair";
import { getLoadBalancer } from "../cloud/loadbalancer";
import { getOMI } from "../cloud/omis";
import { getRouteTable } from "../cloud/routetables";
import { getSecurityGroup } from "../cloud/securitygroups";
import { getSnapshot } from "../cloud/snapshots";
import { getVm } from "../cloud/vm";
import { getVolume } from "../cloud/volume";
import { getNet } from "../cloud/vpc";
import { getProfile } from "../config_file/utils";
import { Profile } from "../flat/node";
import { getAccount } from '../cloud/account';


class ResourceEncoding {
    constructor(
        public get: (profile: Profile, resourceId: string) => any,
        public toString: (resourceData: any) => string, 
    ){}
}

const resourceMap = new Map([
    ["profile", new ResourceEncoding(getAccount, AccountToJSON)],
    ["vms", new ResourceEncoding(getVm, VmToJSON)],
    ["vpc", new ResourceEncoding(getNet, NetToJSON)],
    ["securitygroups", new ResourceEncoding(getSecurityGroup, SecurityGroupToJSON)],
    ["keypairs", new ResourceEncoding(getKeypair, KeypairToJSON)],
    ["volumes", new ResourceEncoding(getVolume, VolumeToJSON)],
    ["loadbalancers", new ResourceEncoding(getLoadBalancer, LoadBalancerToJSON)],
    ["eips", new ResourceEncoding(getExternalIP, PublicIpToJSON)],
    ["omis", new ResourceEncoding(getOMI, ImageToJSON)],
    ["snapshots", new ResourceEncoding(getSnapshot, SnapshotToJSON)],
    ["routetables", new ResourceEncoding(getRouteTable, RouteTableToJSON)],
]);

export class OscVirtualContentProvider implements vscode.TextDocumentContentProvider {
    public onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        const pathSplit = uri.path.split("/");
        if (pathSplit.length !== 4) {
            throw new Error("malformed uri");
        }

        // Retrieve Profile
        const uriProfile = pathSplit[1];
        const profile = getProfile(uriProfile);

        // Retrieve the resource Type
        const resourceType = pathSplit[2];
        const resourceId = pathSplit[3];
        return this.readFileAsync(profile, resourceType, resourceId);

    }

    async readFileAsync(profile: Profile, resourceType: string, resourceId: string): Promise<string> {
        const resourceEncoding = resourceMap.get(resourceType);
        if (typeof resourceEncoding === 'undefined') {
            vscode.window.showErrorMessage("Unable to display resource '"+ resourceId +"'");
            throw new Error("failed");
        }
        const res = await resourceEncoding.get(profile, resourceId);
        return JSON.stringify(resourceEncoding.toString(res), null, 4);
    }
}