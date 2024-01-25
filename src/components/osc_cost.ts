import * as vscode from 'vscode';
import { getConfigurationParameter, OSC_COST_PARAMETER, updateConfigurationParameter } from "../configuration/utils";
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
import { Platform, platformArch, shell } from "./shell";
import { satisfies } from 'compare-versions';

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { finished } from 'stream/promises';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';

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

export async function fetchAccountCost(profile: Profile): Promise<AccountCost> {

    const oscCostPath = getOscCostPath();

    if (typeof oscCostPath === 'undefined') {
        return Promise.reject("Cannot find osc-cost binary. Please install it.");
    }

    const oscCostVersion = await getOscCostVersion(oscCostPath);

    if (typeof oscCostVersion === 'undefined') {
        return Promise.reject("Cannot find the version of osc-cost. Report to developers");
    }

    const defaultArg = getDefaultOptions(oscCostVersion);

    if (typeof defaultArg === 'undefined') {
        return Promise.reject("Cannot recognize the version of osc-cost. Report to developers");
    }

    const res = await shell.exec(`${oscCostPath} ${defaultArg} --profile ${profile.name}`);

    const accountCost = jsonToAccountCost(res.trim());
    if (typeof accountCost === 'undefined') {
        return Promise.reject("Cannot convert the Json to AccountCost");
    }

    return Promise.resolve(accountCost);
}


export function isOscCostEnabled(): boolean {
    const isEnabled = getConfigurationParameter<boolean>(OSC_COST_PARAMETER + ".enabled");
    if (typeof isEnabled === 'undefined') {
        return false;
    }
    return isEnabled;
}

export function isOscCostFound(): boolean {

    return typeof getOscCostPath() !== 'undefined';
}

export async function isOscCostWorking(): Promise<boolean> {
    const oscCostPath = getOscCostPath();

    if (typeof oscCostPath === 'undefined') {
        vscode.window.showErrorMessage(vscode.l10n.t("{0} is not found", "osc-cost"));
        showErrorMessageWithInstallPrompt();
        return false;
    }

    return getOscCostVersion(oscCostPath).then(
        () => {
            return true;
        },
        (reason) => {
            vscode.window.showErrorMessage(vscode.l10n.t("Error while retrieving the version of {0}: {1}", "osc-cost", reason));
            return false;
        }
    );


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

export async function showErrorMessageWithInstallPrompt() {
    const tool = "osc-cost";
    const message = vscode.l10n.t("{0} is not found. Do you want to install it ?", tool);
    const yes = vscode.l10n.t('Yes');
    const noManually = vscode.l10n.t('No, open the documentation');
    const no = vscode.l10n.t('No');
    const choice = await vscode.window.showErrorMessage(message, yes, noManually, no);
    switch (choice) {
        case no:
            return;
        case noManually:
            await vscode.env.openExternal(vscode.Uri.parse('https://github.com/outscale/osc-cost#installation'));
            return;
        case yes:
            // Install and update the path
            await vscode.window.withProgress(
                {
                    title: vscode.l10n.t("Installing {0}", tool),
                    location: vscode.ProgressLocation.Notification,
                    cancellable: false
                },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                async (p, _) => {
                    p.report({ message: vscode.l10n.t("Installing the latest stable version of {0}", tool) });
                    await installOscCost(p).catch((reason: string) => {
                        vscode.window.showErrorMessage(vscode.l10n.t("Error while installing {0}: {1}", tool, reason));
                        throw vscode.l10n.t("Error while installing {0}: {1}", tool, reason);
                    });
                    p.report({ message: vscode.l10n.t("Adding the path to the user config") });
                    await addInstalledPathToExtension();
                });
            break;
    }
}

async function getStableVersion(): Promise<string | undefined> {
    const requestHeaders: HeadersInit = new Headers();
    // eslint-disable-next-line @typescript-eslint/naming-convention
    requestHeaders.set('Accept', 'application/vnd.github+json');
    // eslint-disable-next-line @typescript-eslint/naming-convention
    requestHeaders.set('User-Agent', 'osc-viewer/0.0.0');

    const response = await fetch("https://api.github.com/repos/outscale/osc-cost/releases/latest", {
        method: 'GET',
        headers: requestHeaders,
    });

    const responseJson = await response.json();

    return responseJson.tag_name;
}

function platformUrlString(platform: Platform): string | undefined {
    switch (platform) {
        case Platform.Windows:
            return 'pc-windows-msvc';
        case Platform.MacOS:
            return 'apple-darwin';
        case Platform.Linux:
            return 'unknown-linux-musl';
        default:
            return undefined;
    }
}

function defaultInstalledPath(): string {
    return path.join(os.homedir(), `.vs-osc_viewer`);
}

function defaultBinName(): string {
    const tool = 'osc-cost';
    const extension = (shell.isUnix()) ? '' : '.exe';
    return `${tool}${extension}`;
}


async function installOscCost(p?: vscode.Progress<{ message?: string; increment?: number }>): Promise<null> {
    const tool = 'osc-cost';
    const extension = (shell.isUnix()) ? '' : '.exe';
    const platform = shell.platform();
    const targetOs = platformUrlString(platform);
    if (typeof targetOs === 'undefined') {
        return Promise.reject('OS is not supported');
    }
    const arch = platformArch();
    if (typeof arch === 'undefined') {
        return Promise.reject('arch is not supported');
    }

    p?.report({ message: vscode.l10n.t("Fetching the latest stable version") });
    const version = await getStableVersion();
    if (typeof version === 'undefined') {
        return Promise.reject('Cannot retrieve latest stable version');
    }

    p?.report({ message: vscode.l10n.t("Latest stable version found is {0}", version) });

    const targetDir = defaultInstalledPath();
    const binName = defaultBinName();

    if (!pathExists(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    const downloadUrl = `https://github.com/outscale/osc-cost/releases/download/${version}/${tool}-${version}-${arch}-${targetOs}${extension}`;
    const downloadFile = path.join(targetDir, binName);

    p?.report({ message: vscode.l10n.t("Downloading {0} for {1}, {2} in {3}", tool, targetOs, arch, downloadFile) });

    const stream = fs.createWriteStream(downloadFile);
    const res = await fetch(downloadUrl);

    if (!res.ok) {
        return Promise.reject(`Download fails (${downloadUrl}) with "${res.status} ${res.statusText}"`);
    }

    if (res.body === null) {
        return Promise.reject('Receive an empty response from server');
    }
    await finished(Readable.fromWeb(res.body as ReadableStream<any>).pipe(stream));

    if (shell.isUnix()) {
        fs.chmodSync(downloadFile, '0750');
    }

    return null;
}

async function addInstalledPathToExtension() {

    const targetDir = defaultInstalledPath();
    const binName = defaultBinName();

    await updateConfigurationParameter(OSC_COST_PARAMETER + ".oscCostPath", path.join(targetDir, binName));

}