import * as vscode from 'vscode';
import * as osc from "outscale-api";
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FolderNode } from '../node.folder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteOMI, getOMIs } from '../../../cloud/images';
import { getAccounts } from '../../../cloud/account';

export class OMIsFolderNode extends FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
		super(profile, "Images");
    }

	getChildren(): Thenable<ExplorerNode[]> {
		return getAccounts(this.profile).then((account: Array<osc.Account> | string) => {
			if (typeof account === "string") {
				vscode.window.showErrorMessage(account);
				return Promise.resolve([]);
			}

			if (account.length === 0 || typeof account[0].accountId === 'undefined') {
				return Promise.resolve([]);
			}
			return getOMIs(this.profile, {accountIds: [account[0].accountId]}).then(result => {
				if (typeof result === "string") {
					vscode.window.showErrorMessage(result);
					return Promise.resolve([]);
				}
				const resources = [];
				for (const image of result) {
					if (typeof image.imageId === 'undefined' || typeof image.imageName === 'undefined') {
						continue;
					}
					resources.push(new ResourceNode(this.profile, image.imageName, image.imageId, "omis", deleteOMI));
				}
				return Promise.resolve(resources);
			});
		});
		
    }
}