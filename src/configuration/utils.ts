import * as vscode from 'vscode';

export const CONFIGURATION_NAME = "osc-viewer";

export const FILTERS_PARAMETER = "filters";
export const DISABLE_FOLDER_PARAMETER = "disableFolders";
export const OSC_COST_PARAMETER = "costEstimation";

export function getConfigurationParameter<T>(parameter: string): T | undefined {
    const conf = vscode.workspace.getConfiguration(CONFIGURATION_NAME);
    return conf.get<T>(parameter);
}

export async function updateConfigurationParameter(parameter: string, value: any) {
    const conf = vscode.workspace.getConfiguration(CONFIGURATION_NAME);
    await conf.update(parameter, value, true);
}