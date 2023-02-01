import * as vscode from 'vscode';


export class OutputChannel {
    private static instance: vscode.OutputChannel;


    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() { }


    public static getInstance(): vscode.OutputChannel {
        if (!OutputChannel.instance) {
            OutputChannel.instance = vscode.window.createOutputChannel("osc-viewer");
            OutputChannel.instance.show();
        }

        return OutputChannel.instance;
    }

}