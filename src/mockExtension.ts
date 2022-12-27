import * as vscode from 'vscode';
import * as extension from './extension';
import * as mockAccount from './cloud/mock/account';
import * as mockVms from './cloud/mock/vms';
import * as mockAccessKeys from './cloud/mock/accesskeys';
import * as mockApiAccessRules from './cloud/mock/apiaccessrules';
import * as mockRouteTables from './cloud/mock/routetable';
import * as mockSecurityGroups from './cloud/mock/securitygroups';


mockAccount.initMock();
mockVms.initMock();
mockAccessKeys.initMock();
mockApiAccessRules.initMock();
mockRouteTables.initMock();
mockSecurityGroups.initMock();


export function activate(context: vscode.ExtensionContext) {
    return extension.activate(context);
}
// this method is called when your extension is deactivated
export function deactivate() {
    return extension.deactivate();
}
