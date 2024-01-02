import * as vscode from 'vscode';
import { CONFIGURATION_NAME, OSC_COST_PARAMETER } from "../configuration/utils";
import { isOscCostEnabled, isOscCostFound, showErrorMessageWithInstallPrompt } from '../components/osc_cost';


export function handleOscViewerUpdateConf() {
    vscode.workspace.onDidChangeConfiguration((e) => {
        // Osc-Cost enabled
        if (e.affectsConfiguration(`${CONFIGURATION_NAME}.${OSC_COST_PARAMETER}.enabled`)) {
            if (isOscCostEnabled() && !(isOscCostFound())) {
                showErrorMessageWithInstallPrompt();
            }
        }
    });
}