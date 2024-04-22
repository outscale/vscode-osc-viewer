import * as vscode from 'vscode';
import * as fs from 'fs';
import { deleteVm, getAdminPassword, getVm, startVm, stopVm } from '../../cloud/vms';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import crypto = require("crypto");
import { Result } from 'true-myth';
import { ResourceTag } from 'outscale-api';





export class VmResourceNode extends ResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string, readonly windows: boolean, readonly tags: Array<ResourceTag> | undefined) {
        super(profile, resourceName, resourceId, "vms", deleteVm, getVm, tags);
    }

    startResource(): Promise<string | undefined> {
        return startVm(this.profile, this.resourceId);
    }

    stopResource(): Promise<string | undefined> {
        return stopVm(this.profile, this.resourceId, false);
    }

    forceStopResource(): Promise<string | undefined> {
        return stopVm(this.profile, this.resourceId, true);
    }

    getContextValue(): string {
        if (this.windows) {
            return "windows;vmresourcenode";
        } else {
            return "vmresourcenode";
        }
    }

    getIconPath(): vscode.ThemeIcon {
        switch (this.resourceState) {
            case "running":
                return new vscode.ThemeIcon("debug-start");
            case "stopping":
            case "stopped":
                return new vscode.ThemeIcon("debug-pause");
            case "shutting-down":
                return new vscode.ThemeIcon("debug-disconnect");
            case "pending":
                return new vscode.ThemeIcon("repo-create");
            default:
                return new vscode.ThemeIcon("dash");
        }

    }

    async getAdminPassword(): Promise<Result<string, { reason: string }>> {

        // Ask for the private key
        const value = await vscode.window.showOpenDialog({
            canSelectFolders: false,
            canSelectFiles: true,
            canSelectMany: false,
            title: vscode.l10n.t("Select the private key used for decrypting the admin password")
        });

        if (typeof value === 'undefined' || value.length > 1) {
            return Result.err({ reason: vscode.l10n.t("Cancelled by the user") });
        }

        // Read the encrypted password
        const adminPasswordB64 = await getAdminPassword(this.profile, this.resourceId);

        if (typeof adminPasswordB64 === 'undefined' || adminPasswordB64.length === 0) {
            return Result.err({ reason: vscode.l10n.t("Cannot retrieve the admin password") });
        }

        // Read the private Key 
        const res = fs.readFileSync(value[0].path, 'utf8');

        // Decrypt the password (Only RSA is supported right now)
        try {
            return Result.ok(crypto.privateDecrypt(
                {
                    key: res,
                    padding: crypto.constants.RSA_PKCS1_PADDING // default padding
                },
                Buffer.from(adminPasswordB64, 'base64')
            ).toString('utf-8'));
        } catch (e) {
            return Result.err({ reason: vscode.l10n.t("Decryption fails ({0})", `${e}`) });
        }

    }

}