import * as vscode from 'vscode';


const CONFIGURATION_NAME = "osc-viewer";

export const FILTERS_PARAMETER = "filters";
export const DISABLE_FOLDER_PARAMETER = "disableFolders";

export function getConfigurationParameter<T>(parameter: string):  T | undefined {
    const conf = vscode.workspace.getConfiguration(CONFIGURATION_NAME);
    return conf.get<T>(parameter);
}

export async function updateConfigurationParameter(parameter: string, value: any) {
    const conf = vscode.workspace.getConfiguration(CONFIGURATION_NAME);
    conf.update(parameter, value, true).then();
}