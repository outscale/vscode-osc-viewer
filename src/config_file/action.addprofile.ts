import { MultiStepInput} from './multistep';
import { readConfigFile, writeConfigFile } from './utils';
import { QuickPickItem, window } from 'vscode';
import * as fs from 'fs';
import { getRegions } from '../cloud/region';
import { getAccounts } from '../cloud/account';
import { Profile } from '../flat/node';

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
		host: string;
		https: boolean;
	}

	async function collectInputs() {
		const state = {} as Partial<State>;
		await MultiStepInput.run(input => inputProfileName(input, state));
		return state as State;
	}

	const title = 'Add a profile';
	const steps = 6;

	async function inputProfileName(input: MultiStepInput, state: Partial<State>) {
		state.name = await input.showInputBox({
			title,
			step: 1,
			totalSteps: steps,
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
			totalSteps: steps,
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
			totalSteps: steps,
			value: '',
			prompt: 'Enter your Secret Key',
			validate: valideIsNotNull,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputRegion(input, state);
	}

    async function inputRegion(input: MultiStepInput, state: Partial<State>) {
		const regionGroups : QuickPickItem[]= [];
		
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
			totalSteps: steps,
			placeholder: 'Pick a region',
			items: regionGroups,
			shouldResume: shouldResume
		});
		state.region = pick.label;

		return (input: MultiStepInput) => inputHost(input, state);
	}

	async function inputHost(input: MultiStepInput, state: Partial<State>) {
		state.host = await input.showInputBox({
			title,
			step: 5,
			totalSteps: steps,
			value: 'outscale.com',
			prompt: 'Enter the host',
			validate: valideIsNotNull,
			shouldResume: shouldResume
		});

		return (input: MultiStepInput) => inputHttps(input, state);
	}

	async function inputHttps(input: MultiStepInput, state: Partial<State>) {
		const pick = await input.showQuickPick({
			title,
			step: 6,
			totalSteps: steps,
			placeholder: 'Pick a region',
			items: [{label: 'yes'}, {label: 'no'}],
			shouldResume: shouldResume
		});
		state.https = (pick.label === 'yes') ? true: false;
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
        const configJson = readConfigFile();
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
            "host": state.host,
            "https": state.https,
            "method": "POST",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "region": state.region
        };

        writeConfigFile(configJson);


    }

	const state = await collectInputs();
	
	// Validate the account
	const profileIsValid = await getAccounts(new Profile(state.name, state.accessKey, state.secretKey, state.region, state.host, state.https)).then((result) => {
		if (typeof result === "string") {
			window.showErrorMessage(`The account '${state.name}' is invalid. Please retry !`);
			return false;
		}
		return true;
	});

	if (!profileIsValid) {
		return undefined;
	}

    // Store value
    writeProfile(state);

}