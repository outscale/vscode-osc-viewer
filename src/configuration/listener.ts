import * as vscode from 'vscode';
import { CONFIGURATION_NAME, OSC_COST_PARAMETER } from "../configuration/utils";
import { isOscCostEnabled, isOscCostFound, showMessageWithInstallPrompt } from '../components/osc_cost';


export function handleOscViewerUpdateConf() {
    vscode.workspace.onDidChangeConfiguration((e) => {
        // Osc-Cost enabled
        if (e.affectsConfiguration(`${CONFIGURATION_NAME}.${OSC_COST_PARAMETER}.enabled`)) {
            if (isOscCostEnabled() && !(isOscCostFound())) {
                const message = vscode.l10n.t("{0} is not found. Do you want to install it ?", "osc-cost");
                showMessageWithInstallPrompt(vscode.LogLevel.Error, message);
            }
        }
    });
}