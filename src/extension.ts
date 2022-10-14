// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { write } from './components/clipboard';
import { multiStepInput } from './config_file/action.addprofile';
import { OscExplorer } from "./explorer";
import { ExplorerResourceNode } from './flat/node';
import { ResourceNode } from './flat/resources/node.resources';
import { VmResourceNode } from './flat/resources/node.resources.vms';
import { OscVirtualContentProvider } from './virtual_filesystem/oscvirtualfs';
import { LogsProvider } from './virtual_filesystem/logs';
import { ProfileNode } from './flat/node.profile';
import { FolderNode } from './flat/folders/node.folder';
import { FiltersFolderNode } from './flat/folders/node.filterfolder';
import { DISABLE_FOLDER_PARAMETER, getConfigurationParameter, updateConfigurationParameter } from './configuration/utils';
import { editFilters } from './config_file/action.editFilters';

function getMultipleSelection<T>(mainSelectedItem: T, allSelectedItems?: any[]): T[] {
	if (typeof allSelectedItems === 'undefined') {
		return [mainSelectedItem];
	}
	return allSelectedItems;
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
	vscode.commands.registerCommand('profile.refreshEntry', () => profileProvider.refresh());
	vscode.commands.registerCommand('profile.configure', () => profileProvider.openConfigFile());
	vscode.commands.registerCommand('profile.addEntry', () => multiStepInput());


	// register a content provider for the cowsay-scheme
	const myScheme = 'osc';
	const oscProvider = new OscVirtualContentProvider();
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, oscProvider));

	vscode.commands.registerCommand('osc.refreshResourceData', async (arg: any) => {
		oscProvider.onDidChangeEmitter.fire(arg);
		vscode.window.showInformationMessage(`Refreshed`);
	});

	// register a command that opens a cowsay-document
	context.subscriptions.push(vscode.commands.registerCommand('osc.showResource', async (resource: ExplorerResourceNode) => {
		const uri = vscode.Uri.parse('osc:/' + resource.profile.name + "/" + resource.resourceType + "/" + resource.resourceId);
		const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
		await vscode.window.showTextDocument(doc);
		await vscode.languages.setTextDocumentLanguage(doc, "json");
	}));
	

	vscode.commands.registerCommand('osc.deleteResource', async (arg: ResourceNode) => {
		showYesOrNoWindow("Do you want to delete the resource '" + arg.resourceId + " (" + arg.resourceName + ")" + "' ?", async () => {
			const res = await arg.deleteResource();
			if (typeof res === "undefined") {
				vscode.window.showInformationMessage(`${arg.resourceName} deleted`);
			} else {
				vscode.window.showErrorMessage(`Error while deleting ${arg.resourceName}: ${res}`);
			}
		});
	});

	vscode.commands.registerCommand('osc.copyResourceId', async (arg: ResourceNode) => {
		const res = await arg.getResourceId();
		if (typeof res === 'string') {
			await write(res);
		}
	});

	vscode.commands.registerCommand('osc.stopVm', async (arg: VmResourceNode) => {
		showYesOrNoWindow("Do you want to stop the VM '" + arg.resourceId + " (" + arg.resourceName + ")" + "' ?", async () => {
			const res = await arg.stopResource();
			if (typeof res === "undefined") {
				vscode.window.showInformationMessage(`${arg.resourceName} stopped`);
			} else {
				vscode.window.showErrorMessage(`Error while stopping ${arg.resourceName}: ${res}`);
			}
		});
	});

	vscode.commands.registerCommand('osc.startVm', async (arg: VmResourceNode) => {
		showYesOrNoWindow("Do you want to start the VM '" + arg.resourceId + " (" + arg.resourceName + ")" + "' ?", async () => {
			const res = await arg.startResource();
			if (typeof res === "undefined") {
				vscode.window.showInformationMessage(`${arg.resourceName} started`);
			} else {
				vscode.window.showErrorMessage(`Error while starting ${arg.resourceName}: ${res}`);
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
		vscode.window.showInformationMessage(`Refreshed`);
	});

	vscode.commands.registerCommand('osc.showAccountInfo', async (arg: ProfileNode) => {
		const uri = vscode.Uri.parse('osc:/' + arg.profile.name + "/profile/" + arg.profile.name);
		const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
		await vscode.window.showTextDocument(doc);
		await vscode.languages.setTextDocumentLanguage(doc, "json");
	});

	vscode.commands.registerCommand('osc.copyAccountId', async (arg: ProfileNode) => {
		const res = await arg.getAccountId();
		if (typeof res === 'string') {
			await write(res);
		}
	});

	vscode.commands.registerCommand('osc.disableResourceFolder', async (arg: FolderNode, allSelected: FolderNode[]) => {
		// Add the folderName into the conf
		let disableFolder = getConfigurationParameter<Array<string>>(DISABLE_FOLDER_PARAMETER);
		if (typeof disableFolder === 'undefined') {
			disableFolder = [];
		}
		// We support multiple selection
		const  targetFolders: FolderNode[]= getMultipleSelection<FolderNode>(arg, allSelected);
		for (const folder of targetFolders) {
			if (! (folder instanceof FolderNode)) {
				continue;
			}
			const res = folder.folderName;
			if (! disableFolder.includes(res)) {
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

}
// this method is called when your extension is deactivated
export function deactivate() { 
	return;
}

function showYesOrNoWindow(question: string, cb: () => void) {
	vscode.window.showWarningMessage(question, "Yes", "No")
		.then(async (answer) => {
			if (answer === "Yes") {
				cb();
			}
		});
}