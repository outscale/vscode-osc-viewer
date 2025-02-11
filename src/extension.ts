// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as clipboard from './components/clipboard';
import { multiStepInput } from './config_file/action.addprofile';
import { OscExplorer } from "./explorer";
import { ExplorerResourceNode, ResourceNodeType } from './flat/node';
import { ResourceNode } from './flat/resources/node.resources';
import { VmResourceNode } from './flat/resources/node.resources.vms';
import { OscVirtualContentProvider, computeUri } from './virtual_filesystem/oscvirtualfs';
import { LogsProvider } from './virtual_filesystem/logs';
import { ProfileNode } from './flat/node.profile';
import { FolderNode } from './flat/folders/node.folder';
import { FiltersFolderNode } from './flat/folders/node.filterfolder';
import { DISABLE_FOLDER_PARAMETER, getConfigurationParameter, updateConfigurationParameter } from './configuration/utils';
import { editFilters } from './config_file/action.editFilters';
import { LinkResourceNode } from './flat/resources/types/node.resources.link';
import { SubResourceNode } from './flat/resources/types/node.resources.subresource';
import { NetResourceNode } from './flat/resources/node.resources.nets';
import { init } from './network/networkview';
import { OscLinkProvider } from './virtual_filesystem/osclinkprovider';
import { updateToLatestVersionInstalled, isOscCostEnabled, isOscCostFound, showMessageWithInstallPrompt } from './components/osc_cost';
import { handleOscViewerUpdateConf } from './configuration/listener';

function getMultipleSelection<T>(mainSelectedItem: T, allSelectedItems?: any[]): T[] {
    if (typeof allSelectedItems === 'undefined') {
        return [mainSelectedItem];
    }
    return allSelectedItems;
}

export async function showResourceDetails(profileName: string, resourceType: ResourceNodeType, resourceId: string) {
    const uri = computeUri(profileName, `${resourceType}`, resourceId);
    const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
    await vscode.window.showTextDocument(doc);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "osc-viewer" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('osc-viewer.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from osc-viewer! v2');
    });
    context.subscriptions.push(disposable);


    // Samples of `window.registerTreeDataProvider`
    const profileProvider = new OscExplorer();
    vscode.window.registerTreeDataProvider('profile', profileProvider);
    vscode.window.createTreeView('profile', {
        treeDataProvider: profileProvider,
        canSelectMany: true,
    });


    vscode.commands.registerCommand('profile.refreshSpecificData', (arg) => {
        profileProvider.refresh(arg);
    });

    vscode.commands.registerCommand('profile.refreshEntry', () => {
        profileProvider.refresh(undefined);
    });

    vscode.commands.registerCommand('profile.configure', () => profileProvider.openConfigFile());
    vscode.commands.registerCommand('profile.addEntry', () => multiStepInput());


    // register a content provider for the cowsay-scheme
    const myScheme = 'osc';
    const oscProvider = new OscVirtualContentProvider();
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, oscProvider));

    const oscLinkProvider = new OscLinkProvider();
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider({ scheme: myScheme }, oscLinkProvider));

    vscode.commands.registerCommand('osc.refreshResourceData', async (arg: any) => {
        oscProvider.onDidChangeEmitter.fire(arg);
        vscode.window.showInformationMessage(vscode.l10n.t(`Refreshed`));
    });

    // register a command that opens a cowsay-document
    context.subscriptions.push(vscode.commands.registerCommand('osc.showResource', async (resource: ExplorerResourceNode) => {
        await showResourceDetails(resource.profile.name, resource.resourceType, resource.resourceId);
    }));


    vscode.commands.registerCommand('osc.deleteResource', async (arg: ResourceNode, allSelected: ResourceNode[]) => {
        const targetFolders: ResourceNode[] = getMultipleSelection<ResourceNode>(arg, allSelected);
        for (const folder of targetFolders) {
            if (!(folder instanceof ResourceNode)) {
                continue;
            }
            showYesOrNoWindow(vscode.l10n.t(`Do you want to delete the resource {0} ?`, folder.getResourceName()), async () => {
                const res = await folder.deleteResource();
                if (typeof res === "undefined") {
                    vscode.window.showInformationMessage(vscode.l10n.t(`The resource {0} has been deleted`, folder.getResourceName()));
                } else {
                    vscode.window.showErrorMessage(vscode.l10n.t(`Error while deleting the resource {0}: {1}`, folder.getResourceName(), res));
                }
            });
        }
    });

    vscode.commands.registerCommand('osc.copyResourceId', async (arg: ResourceNode) => {
        const res = await arg.getResourceId();
        if (typeof res === 'string') {
            await clipboard.write(res);
        }
    });

    vscode.commands.registerCommand('osc.stopVm', async (arg: VmResourceNode, allSelected: VmResourceNode[]) => {
        const targetFolders: VmResourceNode[] = getMultipleSelection<VmResourceNode>(arg, allSelected);
        for (const resource of targetFolders) {
            if (!(resource instanceof VmResourceNode)) {
                continue;
            }
            showYesOrNoWindow(vscode.l10n.t(`Do you want to stop the resource {0} ?`, resource.getResourceName()), async () => {
                const res = await resource.stopResource();
                if (typeof res === "undefined") {
                    vscode.window.showInformationMessage(vscode.l10n.t(`The resource {0} has been stopped`, resource.getResourceName()));
                } else {
                    vscode.window.showErrorMessage(vscode.l10n.t(`Error while stopping the resource {0}: {1}`, resource.resourceName, res));
                }
            });
        }
    });

    vscode.commands.registerCommand('osc.forceStopVm', async (arg: VmResourceNode, allSelected: VmResourceNode[]) => {
        const targetFolders: VmResourceNode[] = getMultipleSelection<VmResourceNode>(arg, allSelected);
        for (const resource of targetFolders) {
            if (!(resource instanceof VmResourceNode)) {
                continue;
            }
            showYesOrNoWindow(vscode.l10n.t(`Do you want to force stop the resource {0} ?`, resource.getResourceName()), async () => {
                const res = await resource.forceStopResource();
                if (typeof res === "undefined") {
                    vscode.window.showInformationMessage(vscode.l10n.t(`The resource {0} has been stopped`, resource.getResourceName()));
                } else {
                    vscode.window.showErrorMessage(vscode.l10n.t(`Error while force stopping the resource {0}: {1}`, resource.resourceName, res));
                }
            });
        }
    });


    vscode.commands.registerCommand('osc.startVm', async (arg: VmResourceNode, allSelected: VmResourceNode[]) => {
        const targetFolders: VmResourceNode[] = getMultipleSelection<VmResourceNode>(arg, allSelected);
        for (const resource of targetFolders) {
            if (!(resource instanceof VmResourceNode)) {
                continue;
            }
            showYesOrNoWindow(vscode.l10n.t(`Do you want to start the resource {0} ?`, resource.getResourceName()), async () => {
                const res = await resource.startResource();
                if (typeof res === "undefined") {
                    vscode.window.showInformationMessage(vscode.l10n.t(`The resource {0} has been started`, resource.getResourceName()));
                } else {
                    vscode.window.showErrorMessage(vscode.l10n.t(`Error while starting the resource {0}: {1}`, resource.resourceName, res));
                }
            });
        }
    });

    vscode.commands.registerCommand('osc.unlinkResource', async (arg: LinkResourceNode) => {
        showYesOrNoWindow(vscode.l10n.t(`Do you want to unlink the resource {0} ?`, arg.getResourceName()), async () => {
            const res = await arg.unlinkResource();
            if (typeof res === "undefined") {
                vscode.window.showInformationMessage(vscode.l10n.t(`The resource {0} has been unlinked`, arg.getResourceName()));
            } else {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while unlinking the resource {0}: {1}`, arg.getResourceName(), res));
            }
        });
    });

    vscode.commands.registerCommand('osc.showConsoleLogs', async (arg: VmResourceNode) => {
        const uri = vscode.Uri.parse('osc-logs:/' + arg.profile.name + "/" + arg.resourceId);
        const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
        await vscode.window.showTextDocument(doc, { preview: false });
    });

    const mySchemeLogs = 'osc-logs';

    const logsProvider = new LogsProvider();
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(mySchemeLogs, logsProvider));

    vscode.commands.registerCommand('osc.refreshConsoleLogs', async (arg: any) => {
        logsProvider.onDidChangeEmitter.fire(arg);
        vscode.window.showInformationMessage(vscode.l10n.t(`Refreshed`));
    });

    vscode.commands.registerCommand('osc.showAccountInfo', async (arg: ProfileNode) => {
        const uri = computeUri(arg.profile.name, "profile", arg.profile.name);
        try {
            const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
            await vscode.window.showTextDocument(doc);
            await vscode.languages.setTextDocumentLanguage(doc, "json");
        } catch (err: any) {
            vscode.window.showErrorMessage(err.toString());
        }
    });

    vscode.commands.registerCommand('osc.copyAccountId', async (arg: ProfileNode) => {
        const res = await arg.getAccountId();
        if (typeof res === 'string') {
            await clipboard.write(res);
        }
    });

    vscode.commands.registerCommand('osc.disableResourceFolder', async (arg: FolderNode, allSelected: FolderNode[]) => {
        // Add the folderName into the conf
        let disableFolder = getConfigurationParameter<Array<string>>(DISABLE_FOLDER_PARAMETER);
        if (typeof disableFolder === 'undefined') {
            disableFolder = [];
        }
        // We support multiple selection
        const targetFolders: FolderNode[] = getMultipleSelection<FolderNode>(arg, allSelected);
        for (const folder of targetFolders) {
            if (!(folder instanceof FolderNode)) {
                continue;
            }
            const res = folder.folderName;
            if (!disableFolder.includes(res)) {
                disableFolder.push(res);
            }
        }
        await updateConfigurationParameter(DISABLE_FOLDER_PARAMETER, disableFolder);

        // Refresh the profile
        await vscode.commands.executeCommand('profile.refreshEntry');
    });

    vscode.commands.registerCommand('osc.editFilters', async (arg: FiltersFolderNode<any>) => {
        await editFilters(arg);
        // Refresh the profile
        await vscode.commands.executeCommand('profile.refreshEntry');
    });

    vscode.commands.registerCommand('osc.resetFilters', async (arg: FiltersFolderNode<any>) => {
        await arg.resetFilters();
        // Refresh the profile
        await vscode.commands.executeCommand('profile.refreshEntry');
    });

    vscode.commands.registerCommand('osc.openParameter', async () => {
        vscode.commands.executeCommand('workbench.action.openSettings', '@ext:outscale.osc-viewer');
    });

    vscode.commands.registerCommand('osc.copyAccessKey', async (arg: ProfileNode) => {
        const res = arg.profile.accessKey;
        if (typeof res === 'string') {
            await clipboard.write(res);
        }
    });

    vscode.commands.registerCommand('osc.copySecretKey', async (arg: ProfileNode) => {
        const res = arg.profile.secretKey;
        if (typeof res === 'string') {
            await clipboard.write(res);
        }
    });

    vscode.commands.registerCommand('osc.deleteSubresource', async (arg: SubResourceNode) => {
        showYesOrNoWindow(vscode.l10n.t(`Do you want to remove the subresource of {0} ?`, arg.getResourceName()), async () => {
            const res = await arg.removeSubresource();
            if (typeof res === "undefined") {
                vscode.window.showInformationMessage(vscode.l10n.t(`The subresource of {0} has been deleted`, arg.getResourceName()));
            } else {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while deleting the subresource of {0}: {1}`, arg.getResourceName(), res));
            }
        });
    });

    vscode.commands.registerCommand('osc.teardownNet', async (arg: NetResourceNode) => {
        showYesOrNoWindow(vscode.l10n.t(`Do you want to tear down the net {0} ?`, arg.getResourceName()), async () => {
            const res = await arg.teardown();
            if (typeof res === "undefined") {
                vscode.window.showInformationMessage(vscode.l10n.t(`The net {0} has been torn down`, arg.getResourceName()));
            } else {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while tearing down the net {0}: {1}`, arg.getResourceName(), res));
            }
        });
    });

    vscode.commands.registerCommand('osc.retrieveAdminPassword', async (arg: VmResourceNode) => {
        const adminPassword = await arg.getAdminPassword();

        if (adminPassword.isOk) {
            clipboard.write(adminPassword.value);
        } else {
            vscode.window.showErrorMessage(vscode.l10n.t(`Error while retrieving the admin password for {0}: {1}`, arg.resourceId, adminPassword.error.reason));
        }
    });

    vscode.commands.registerCommand('osc.showNetworkView', async (arg: NetResourceNode) => {
        init(arg.profile, arg.resourceId, context);
    });


    // Watch Conf Update
    handleOscViewerUpdateConf();

    // Check latest version of osc-cost if enabled
    if (isOscCostEnabled()) {
        if (!isOscCostFound()) {
            const message = vscode.l10n.t("{0} is not found. Do you want to install it ?", "osc-cost");
            showMessageWithInstallPrompt(vscode.LogLevel.Error, message);
        } else {
            updateToLatestVersionInstalled();
        }
    }

}
// this method is called when your extension is deactivated
export function deactivate() {
    return;
}

function showYesOrNoWindow(question: string, cb: () => void) {
    vscode.window.showWarningMessage(question, vscode.l10n.t("Yes"), vscode.l10n.t("No"))
        .then(async (answer) => {
            if (answer === vscode.l10n.t("Yes")) {
                cb();
            }
        });
}