import { MultiStepInput} from './multistep';
import { readConfigFile, writeConfigFile } from './utils';
import { QuickPickItem, window } from 'vscode';
import * as fs from 'fs';
import { getRegions } from '../cloud/region';

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 * 
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
 export async function multiStepInput() {


	interface State {
		title: string;
		step: number;
		totalSteps: number;
		name: string;
		accessKey: string;
		secretKey: string;
		region: string;
	}

	async function collectInputs() {
		const state = {} as Partial<State>;
		await MultiStepInput.run(input => inputProfileName(input, state));
		return state as State;
	}

	const title = 'Add a profile';

	async function inputProfileName(input: MultiStepInput, state: Partial<State>) {
		state.name = await input.showInputBox({
			title,
			step: 1,
			totalSteps: 4,
			value: '',
			prompt: 'Choose a unique name for the profile',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputAccessKey(input, state);
	}

	async function inputAccessKey(input: MultiStepInput, state: Partial<State>) {
		state.accessKey = await input.showInputBox({
			title,
			step: 2,
			totalSteps: 4,
			value: '',
			prompt: 'Enter your Access Key',
			validate: valideIsNotNull,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputSecretKey(input, state);
	}

    async function inputSecretKey(input: MultiStepInput, state: Partial<State>) {
		state.secretKey = await input.showInputBox({
			title,
			step: 3,
			totalSteps: 4,
			value: '',
			prompt: 'Enter your Secret Key',
			validate: valideIsNotNull,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputRegion(input, state);
	}

    async function inputRegion(input: MultiStepInput, state: Partial<State>) {
		let regionGroups : QuickPickItem[]= [];
		
		await getRegions().then( result => {
			if (typeof result === "string") {
				return undefined;
			}
			for (const region of result) {
				if (typeof region.regionName === "undefined") {
					continue;
				}
				regionGroups.push({label: region.regionName});
			}
		});

		const pick = await input.showQuickPick({
			title,
			step: 4,
			totalSteps: 4,
			placeholder: 'Pick a region',
			items: regionGroups,
			shouldResume: shouldResume
		});
		state.region = pick.label;
	}

	function shouldResume() {
		// Could show a notification with the option to resume.
		return new Promise<boolean>((resolve, reject) => {
			// noop
		});
	}

	async function validateNameIsUnique(name: string) {
        const oscConfObject = readConfigFile();
        if (typeof oscConfObject === 'undefined') {
            window.showErrorMessage('No config file found');
            return undefined;
        }

        const found = Object.keys(oscConfObject).find(key => key === name);
		return typeof found === 'string' ? 'The name is not unique' : undefined;
	}

	async function valideIsNotNull(params: string) {
		return params.length === 0 ? 'Cannot be empty': undefined;
	}

    function writeProfile(state: Partial<State>) {
        // Found a config file
        let configJson = readConfigFile();
        if (typeof configJson === 'undefined') {
            window.showErrorMessage('No config file found');
            return undefined;
        }

        if (typeof state.name === 'undefined') {
            return undefined;
        }
        configJson[state.name]= {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "access_key": state.accessKey,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "secret_key": state.secretKey,
            "host": "outscale.com",
            "https": true,
            "method": "POST",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "region_name": state.region
        };

        writeConfigFile(configJson);


    }

	const state = await collectInputs();
	window.showInformationMessage(`Creating Application Service '${state.name}'`);

    // Store value
    writeProfile(state);

}