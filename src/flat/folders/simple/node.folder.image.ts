import * as vscode from 'vscode';
import * as osc from "outscale-api";
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteOMI, getOMI, getOMIs } from '../../../cloud/images';
import { getAccounts } from '../../../cloud/account';

export const IMAGES_FOLDER_NAME = "Images";
export class OMIsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, IMAGES_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        return getAccounts(this.profile).then((account: Array<osc.Account> | string) => {
            if (typeof account === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, account));
                return Promise.resolve([]);
            }

            if (account.length === 0 || typeof account[0].accountId === 'undefined') {
                return Promise.resolve([]);
            }
            return getOMIs(this.profile, { accountIds: [account[0].accountId] }).then(result => {
                if (typeof result === "string") {
                    vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, result));
                    return Promise.resolve([]);
                }
                const resources = [];
                for (const image of result) {
                    if (typeof image.imageId === 'undefined' || typeof image.imageName === 'undefined') {
                        continue;
                    }
                    resources.push(new ResourceNode(this.profile, image.imageName, image.imageId, "omis", deleteOMI, getOMI, image.tags));
                }
                return Promise.resolve(resources.sort(resourceNodeCompare));
            });
        });

    }
}