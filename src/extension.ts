// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { multiStepInput } from './config_file/action.addprofile';
import {OscExplorer} from "./explorer";
import { ExplorerResourceNode } from './flat/node';
import { OscVirtualFileSystemProvider } from './osc_virtual_filesystem/oscvirtualfs';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "osc-viewer" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('osc-viewer.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from osc-viewer! v2');
	});
	context.subscriptions.push(disposable);


	// Samples of `window.registerTreeDataProvider`
	const profileProvider = new OscExplorer();
	vscode.window.registerTreeDataProvider('profile', profileProvider);
	vscode.commands.registerCommand('profile.refreshEntry', () => profileProvider.refresh());
	vscode.commands.registerCommand('profile.configure', () => profileProvider.openConfigFile());
	vscode.commands.registerCommand('profile.addEntry', () => multiStepInput());


	// register a content provider for the cowsay-scheme
	const myScheme = 'osc';
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider(myScheme, new OscVirtualFileSystemProvider(), {}));

	// register a command that opens a cowsay-document
	context.subscriptions.push(vscode.commands.registerCommand('osc.showResource', async (resource: ExplorerResourceNode) => {
		const uri = vscode.Uri.parse('osc:/' + resource.profile.name + "/" +  resource.resourceType + "/" + resource.resourceId);
		const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
		await vscode.window.showTextDocument(doc);
		await vscode.languages.setTextDocumentLanguage(doc, "json");
	}));


	
}
// this method is called when your extension is deactivated
export function deactivate() {}
