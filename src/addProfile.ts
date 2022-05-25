/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { QuickPickItem, window, Disposable, CancellationToken, QuickInputButton, QuickInput, ExtensionContext, QuickInputButtons, Uri,  } from 'vscode';
import { getConfigFile } from './explorer';
import * as vscode from 'vscode';
import * as fs from 'fs';
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
			validate: () => {return Promise.resolve(undefined);},
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputSecretKey(input, state);
	}

    async function inputSecretKey(input: MultiStepInput, state: Partial<State>) {
		state.secretKey = await input.showInputBox({
			title,
			step: 2,
			totalSteps: 4,
			value: '',
			prompt: 'Enter your Secret Key',
			validate: () => {return Promise.resolve(undefined);},
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputRegion(input, state);
	}

    async function inputRegion(input: MultiStepInput, state: Partial<State>) {
		state.region = await input.showInputBox({
			title,
			step: 4,
			totalSteps: 4,
			value: '',
			prompt: 'Enter your Region',
			validate: () => {return Promise.resolve(undefined);},
			shouldResume: shouldResume
		});
	}

	function shouldResume() {
		// Could show a notification with the option to resume.
		return new Promise<boolean>((resolve, reject) => {
			// noop
		});
	}

	async function validateNameIsUnique(name: string) {
        const oscConfigPath = getConfigFile();
        if (typeof oscConfigPath === 'undefined') {
            vscode.window.showErrorMessage('No config file found');
            return undefined;
        }

        // Found a config file
        const configJson = JSON.parse(fs.readFileSync(oscConfigPath, 'utf-8'));

        const found = Object.keys(configJson).find(key => key === name);
		return typeof found === 'string' ? 'Name not unique' : undefined;
	}

    function writeProfile(state: Partial<State>) {
        const oscConfigPath = getConfigFile();
        if (typeof oscConfigPath === 'undefined') {
            vscode.window.showErrorMessage('No config file found');
            return undefined;
        }

        // Found a config file
        let configJson = JSON.parse(fs.readFileSync(oscConfigPath, 'utf-8'));

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

        fs.writeFileSync(oscConfigPath, JSON.stringify(configJson, null, 4), 'utf-8');


    }

	const state = await collectInputs();
	window.showInformationMessage(`Creating Application Service '${state.name}'`);

    // Store value
    writeProfile(state);

}


// -------------------------------------------------------
// Helper code that wraps the API for the multi-step case.
// -------------------------------------------------------


class InputFlowAction {
	static back = new InputFlowAction();
	static cancel = new InputFlowAction();
	static resume = new InputFlowAction();
}

type InputStep = (input: MultiStepInput) => Thenable<InputStep | void>;

interface QuickPickParameters<T extends QuickPickItem> {
	title: string;
	step: number;
	totalSteps: number;
	items: T[];
	activeItem?: T;
	placeholder: string;
	buttons?: QuickInputButton[];
	shouldResume: () => Thenable<boolean>;
}

interface InputBoxParameters {
	title: string;
	step: number;
	totalSteps: number;
	value: string;
	prompt: string;
	validate: (value: string) => Promise<string | undefined>;
	buttons?: QuickInputButton[];
	shouldResume: () => Thenable<boolean>;
}

class MultiStepInput {

	static async run<T>(start: InputStep) {
		const input = new MultiStepInput();
		return input.stepThrough(start);
	}

	private current?: QuickInput;
	private steps: InputStep[] = [];

	private async stepThrough<T>(start: InputStep) {
		let step: InputStep | void = start;
		while (step) {
			this.steps.push(step);
			if (this.current) {
				this.current.enabled = false;
				this.current.busy = true;
			}
			try {
				step = await step(this);
			} catch (err) {
				if (err === InputFlowAction.back) {
					this.steps.pop();
					step = this.steps.pop();
				} else if (err === InputFlowAction.resume) {
					step = this.steps.pop();
				} else if (err === InputFlowAction.cancel) {
					step = undefined;
				} else {
					throw err;
				}
			}
		}
		if (this.current) {
			this.current.dispose();
		}
	}

	async showQuickPick<T extends QuickPickItem, P extends QuickPickParameters<T>>({ title, step, totalSteps, items, activeItem, placeholder, buttons, shouldResume }: P) {
		const disposables: Disposable[] = [];
		try {
			return await new Promise<T | (P extends { buttons: (infer I)[] } ? I : never)>((resolve, reject) => {
				const input = window.createQuickPick<T>();
				input.title = title;
				input.step = step;
				input.totalSteps = totalSteps;
				input.placeholder = placeholder;
				input.items = items;
				if (activeItem) {
					input.activeItems = [activeItem];
				}
				input.buttons = [
					...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
					...(buttons || [])
				];
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === QuickInputButtons.Back) {
							reject(InputFlowAction.back);
						} else {
							resolve(<any>item);
						}
					}),
					input.onDidChangeSelection(items => resolve(items[0])),
					input.onDidHide(() => {
						(async () => {
							reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
						})()
							.catch(reject);
					})
				);
				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				this.current.show();
			});
		} finally {
			disposables.forEach(d => d.dispose());
		}
	}

	async showInputBox<P extends InputBoxParameters>({ title, step, totalSteps, value, prompt, validate, buttons, shouldResume }: P) {
		const disposables: Disposable[] = [];
		try {
			return await new Promise<string | (P extends { buttons: (infer I)[] } ? I : never)>((resolve, reject) => {
				const input = window.createInputBox();
				input.title = title;
				input.step = step;
				input.totalSteps = totalSteps;
				input.value = value || '';
				input.prompt = prompt;
				input.buttons = [
					...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
					...(buttons || [])
				];
				let validating = validate('');
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === QuickInputButtons.Back) {
							reject(InputFlowAction.back);
						} else {
							resolve(<any>item);
						}
					}),
					input.onDidAccept(async () => {
						const value = input.value;
						input.enabled = false;
						input.busy = true;
						if (!(await validate(value))) {
							resolve(value);
						}
						input.enabled = true;
						input.busy = false;
					}),
					input.onDidChangeValue(async text => {
						const current = validate(text);
						validating = current;
						const validationMessage = await current;
						if (current === validating) {
							input.validationMessage = validationMessage;
						}
					}),
					input.onDidHide(() => {
						(async () => {
							reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
						})()
							.catch(reject);
					})
				);
				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				this.current.show();
			});
		} finally {
			disposables.forEach(d => d.dispose());
		}
	}
}
