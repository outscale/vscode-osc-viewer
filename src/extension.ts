// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {OscExplorer} from "./explorer"
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
	const profileProvider = new OscExplorer()
	vscode.window.registerTreeDataProvider('profile', profileProvider);
	vscode.commands.registerCommand('profile.refreshEntry', () => profileProvider.refresh());
	vscode.commands.registerCommand('profile.configure', () => profileProvider.openConfigFile());


	
}
// this method is called when your extension is deactivated
export function deactivate() {}
