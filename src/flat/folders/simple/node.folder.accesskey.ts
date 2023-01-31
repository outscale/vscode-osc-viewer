import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteAccessKey, getAccessKeys, getAccessKey } from '../../../cloud/accesskeys';
import { FiltersAccessKeys, FiltersAccessKeysFromJSON } from 'outscale-api';

export const ACCESSKEY_FOLDER_NAME = "Access Keys";
export class AccessKeysFolderNode extends FiltersFolderNode<FiltersAccessKeys> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, ACCESSKEY_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getAccessKeys(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.accessKeyId === 'undefined') {

                    continue;
                }

                resources.push(new ResourceNode(this.profile, "", item.accessKeyId, "AccessKey", deleteAccessKey, getAccessKey));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersAccessKeys {
        return FiltersAccessKeysFromJSON(json);
    }
}