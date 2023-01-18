import { MultiStepInput } from './multistep';
import { QuickPickItem } from 'vscode';
import { FiltersFolderNode } from '../flat/folders/node.filterfolder';
import { FILTERS_PARAMETER, getConfigurationParameter, updateConfigurationParameter } from '../configuration/utils';
import * as vscode from 'vscode';

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 * 
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function editFilters(resource: FiltersFolderNode<any>) {


    interface State {
        title: string;
        step: number;
        totalSteps: number;
        filterName: string;
        filterValue: string;
    }

    async function collectInputs() {
        const state = {} as Partial<State>;
        await MultiStepInput.run(input => inputFilterName(input, state));
    }

    const title = vscode.l10n.t(`Edit Filters of {0}`, resource.folderName);
    const resourceName = resource.folderName;
    const steps = 2;

    function capitalizeFirstLetter(value: string) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    async function inputFilterName(input: MultiStepInput, state: Partial<State>) {
        const quickPickItems: Array<QuickPickItem> = [];
        for (const el of Object.keys(resource.filtersFromJson("{}"))) {
            quickPickItems.push({
                label: capitalizeFirstLetter(el)
            });
        }
        const item = await input.showQuickPick({
            title,
            step: 1,
            totalSteps: steps,
            items: quickPickItems,
            activeItem: quickPickItems[0],
            placeholder: vscode.l10n.t("Which filter to select ?"),
            shouldResume: shouldResume
        });
        state.filterName = item.label;
        return (input: MultiStepInput) => inputValue(input, state);
    }

    async function inputValue(input: MultiStepInput, state: Partial<State>) {
        const filters = getConfigurationParameter<any>(FILTERS_PARAMETER);
        let value = '';
        if (!(resourceName in filters)) {
            filters[resourceName] = {};
        }
        if (typeof state.filterName !== 'undefined') {
            if (state.filterName in filters[resourceName]) {
                value = JSON.stringify(filters[resourceName][state.filterName]);
            }
        }

        state.filterValue = await input.showInputBox({
            title,
            step: 2,
            totalSteps: steps,
            value: value,
            prompt: 'Enter Filter Value',
            validate: valideJSON,
            shouldResume: shouldResume
        });



        if (typeof state.filterName !== 'undefined') {
            filters[resourceName][state.filterName] = JSON.parse(state.filterValue);
        }

        await updateConfigurationParameter(FILTERS_PARAMETER, filters);
    }

    function shouldResume() {
        // Could show a notification with the option to resume.
        return new Promise<boolean>(() => {
            // noop
        });
    }

    async function valideJSON(params: string) {
        try {
            JSON.parse(params);
            return undefined;
        } catch (e) {
            return vscode.l10n.t('The value is incorrect. It should be a valid JSON');
        }
    }

    await collectInputs();

}