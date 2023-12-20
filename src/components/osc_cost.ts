import * as vscode from 'vscode';
import { getConfigurationParameter, OSC_COST_PARAMETER } from "../configuration/utils";
import { pathExists } from "../config_file/utils";
import { LOADBALANCER_FOLDER_NAME } from "../flat/folders/simple/node.folder.loadbalancer";
import { NATSERVICES_FOLDER_NAME } from "../flat/folders/simple/node.folder.natservice";
import { SNAPSHOTS_FOLDER_NAME } from "../flat/folders/simple/node.folder.snapshot";
import { VPNCONNECTIONS_FOLDER_NAME } from "../flat/folders/simple/node.folder.vpnconnection";
import { FLEXIBLEGPUS_FOLDER_NAME } from "../flat/folders/specific/node.folder.flexiblegpu";
import { PUBLICIP_FOLDER_NAME } from "../flat/folders/specific/node.folder.publicip";
import { VM_FOLDER_NAME } from "../flat/folders/specific/node.folder.vm";
import { VOLUME_FOLDER_NAME } from "../flat/folders/specific/node.folder.volume";
import { Profile, ResourceNodeType } from "../flat/node";
import { OutputChannel } from "../logs/output_channel";
import { shell } from "./shell";
import { satisfies } from 'compare-versions';

export type ResourceCost = number;
export type ResourcesTypeCost = { globalPrice: number, values: Map<string, ResourceCost> };

const DEFAULT_OPTIONS_OSC_COST: [string, string][] = [
    ['<v0.2.0', '--format json'],
    ['>=v0.2.0', '--format json --skip-resource Oos'], // Skipe OOS to reduce the latency
];

export class AccountCost {
    accountCost: number;
    region: string;
    resourcesCost: Map<string, ResourcesTypeCost>;

    constructor() {
        this.resourcesCost = new Map();
        this.accountCost = 0;
        this.region = "";
    }

    getResourceType(resourceType: string): ResourcesTypeCost | undefined {
        return this.resourcesCost.get(resourceType);
    }

    setResourceType(resourceType: string, value: ResourcesTypeCost) {
        this.resourcesCost.set(resourceType, value);
    }

    getResourceTypeCost(folderName: string): string | undefined {
        const resourceType = folderNameToOscCostResourceType(folderName);
        if (typeof resourceType === 'undefined') {
            return undefined;
        }
        const resourceTypeCost = this.getResourceType(resourceType);
        if (typeof resourceTypeCost === 'undefined') {
            return undefined;
        }
        return formatPrice(resourceTypeCost.globalPrice, getCurrency(this.region));
    }

    getResourceIdCost(resourceNodeType: ResourceNodeType, resourceId: string): string | undefined {
        const resourceType = resourceNodeTypeToOscCostResourceType(resourceNodeType);
        if (typeof resourceType === 'undefined') {
            return undefined;
        }

        const resourceTypeCost = this.getResourceType(resourceType);
        if (typeof resourceTypeCost === 'undefined') {
            return undefined;
        }

        const resourceCost = resourceTypeCost.values.get(resourceId);
        if (typeof resourceCost === 'undefined') {
            return undefined;
        }

        return formatPrice(resourceCost, getCurrency(this.region));
    }

    getAccountCost(): string {
        return formatPrice(this.accountCost, getCurrency(this.region));
    }


}

function formatPrice(price: number, currency: string): string {
    return "~" + price.toFixed(2) + currency;
}

function getCurrency(region: string): string {
    switch (region) {
        case "eu-west-2":
        case "cloudgouv-eu-west-1":
            return "€";
        case "ap-northeast-1":
            return "¥";
        case "us-east-2":
        case "us-west-1":
            return "$";
        default:
            return "€";
    }
}

function folderNameToOscCostResourceType(folderName: string): string | undefined {
    switch (folderName) {
        case VM_FOLDER_NAME:
            return "Vm";
        case VOLUME_FOLDER_NAME:
            return "Volume";
        case PUBLICIP_FOLDER_NAME:
            return "PublicIp";
        case SNAPSHOTS_FOLDER_NAME:
            return "Snapshot";
        case LOADBALANCER_FOLDER_NAME:
            return "LoadBalancer";
        case FLEXIBLEGPUS_FOLDER_NAME:
            return "FlexibleGpu";
        case VPNCONNECTIONS_FOLDER_NAME:
            return "Vpn";
        case NATSERVICES_FOLDER_NAME:
            return "NatServices";
        default:
            return undefined;
    }
}

function resourceNodeTypeToOscCostResourceType(resourceNodeType: ResourceNodeType): string | undefined {
    switch (resourceNodeType) {
        case 'vms':
            return "Vm";
        case 'volumes':
            return "Volume";
        case 'eips':
            return "PublicIp";
        case 'snapshots':
            return "Snapshot";
        case 'loadbalancers':
            return "LoadBalancer";
        case 'FlexibleGpu':
            return "FlexibleGpu";
        case 'VpnConnection':
            return "Vpn";
        case 'NatService':
            return "NatServices";
        default:
            return undefined;
    }
}


function jsonToAccountCost(oscCostOutput: string): AccountCost | undefined {
    const accountCost = new AccountCost();
    for (const jsonString of oscCostOutput.split('\n')) {
        let json;
        try {
            json = JSON.parse(jsonString);
        } catch {
            OutputChannel.getInstance().appendLine(`Could not parse the json string ${jsonString}`);
            return undefined;
        }

        if (typeof json === "undefined") {
            OutputChannel.getInstance().appendLine(`Could not parse the json string ${jsonString}`);
            return undefined;
        }

        //OutputChannel.getInstance().appendLine(`The json is  ${json}`);


        const resourceType = json.resource_type;
        const resourceId = json.resource_id;
        const pricePerMonth = json.price_per_month;
        const region = json.region;

        if (typeof resourceType !== 'string') {
            OutputChannel.getInstance().appendLine(`Could not parse the resource type ${resourceType}`);
            return undefined;
        }

        if (typeof resourceId !== 'string') {
            OutputChannel.getInstance().appendLine(`Could not parse the resource id ${resourceId}`);
            return undefined;
        }

        if (typeof region !== 'string') {
            OutputChannel.getInstance().appendLine(`Could not parse the region ${region}`);
            return undefined;
        }

        if (typeof pricePerMonth !== 'number') {
            OutputChannel.getInstance().appendLine(`Could not parse the price per month ${pricePerMonth}`);
            return undefined;
        }


        let resourceElement = accountCost.getResourceType(resourceType);
        if (typeof resourceElement === 'undefined') {
            resourceElement = {
                globalPrice: 0,
                values: new Map()
            };
        }

        resourceElement.values.set(resourceId, pricePerMonth);
        resourceElement.globalPrice += pricePerMonth;
        accountCost.accountCost += pricePerMonth;
        accountCost.region = region;
        accountCost.setResourceType(resourceType, resourceElement);
    }


    return accountCost;
}

export async function fetchAccountCost(profile: Profile): Promise<AccountCost | undefined> {

    const oscCostPath = getOscCostPath();

    if (typeof oscCostPath === 'undefined') {
        vscode.window.showErrorMessage("Cannot find osc-cost binary. Please install it.");
        return Promise.resolve(undefined);
    }

    const oscCostVersion = await getOscCostVersion(oscCostPath);

    if (typeof oscCostVersion === 'undefined') {
        vscode.window.showErrorMessage("Cannot find the version of osc-cost. Report to developers");
        return Promise.resolve(undefined);
    }

    const defaultArg = getDefaultOptions(oscCostVersion);

    if (typeof defaultArg === 'undefined') {
        vscode.window.showErrorMessage("Cannot recognize the version of osc-cost. Report to developers");
        return Promise.resolve(undefined);
    }

    const res = await shell.exec(`${oscCostPath} ${defaultArg} --profile ${profile.name}`);
    if (typeof res === "undefined") {
        return res;
    }

    return Promise.resolve(jsonToAccountCost(res.trim()));
}


export function isOscCostEnabled(): boolean {
    const isEnabled = getConfigurationParameter<boolean>(OSC_COST_PARAMETER + ".enabled");
    if (typeof isEnabled === 'undefined') {
        return false;
    }
    return isEnabled;
}

export function getOscCostPath(): string | undefined {
    const userOscCostPath = getConfigurationParameter<string>(OSC_COST_PARAMETER + ".oscCostPath");
    if (typeof userOscCostPath === 'undefined' || userOscCostPath === "") {
        const systemOscCostPath = shell.which("osc-cost");
        if (systemOscCostPath === null) {
            return undefined;
        }
        return systemOscCostPath;
    }
    // Check exist
    if (!pathExists(userOscCostPath)) {
        return undefined;
    }
    return userOscCostPath;
}

async function getOscCostVersion(oscCostPath: string): Promise<string | undefined> {
    const res = await shell.exec(`${oscCostPath} --version`);
    if (typeof res === "undefined") {
        return res;
    }
    // version is like "osc-cost X.Y.Z"
    return res.split(" ")[1].trim();

}

function getDefaultOptions(version: string): string | undefined {
    const options = DEFAULT_OPTIONS_OSC_COST.filter((val) => {
        return satisfies(version, val[0]);
    });

    if (options.length > 1) {
        OutputChannel.getInstance().appendLine("Got multiple default options possible, rejecting all of them");
        return undefined;
    }

    if (options.length === 0) {
        OutputChannel.getInstance().appendLine("Got none default option");
        return undefined;
    }

    return options[0][1];
}
