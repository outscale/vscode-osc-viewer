import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteKeypair, getKeypairs } from '../../../cloud/keypairs';
import { FiltersKeypair, FiltersKeypairFromJSON } from 'outscale-api';

export const KEYPAIRS_FOLDER_NAME = "Keypairs";
export class KeypairsFolderNode extends FiltersFolderNode<FiltersKeypair> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, KEYPAIRS_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getKeypairs(this.profile, this.filters).then(result => {
            if (typeof result === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, result));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const keypair of result) {
                if (typeof keypair.keypairName === 'undefined') {
                    continue;
                }
                resources.push(new ResourceNode(this.profile, "", keypair.keypairName, "keypairs", deleteKeypair));
            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersKeypair {
        return FiltersKeypairFromJSON(json);
    }
}