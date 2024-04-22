import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteCa, getCa, getCas } from '../../../cloud/cas';
import { FiltersCa, FiltersCaFromJSON } from 'outscale-api';

export const CA_FOLDER_NAME = "Cas";
export class CasFolderNode extends FiltersFolderNode<FiltersCa> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, CA_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getCas(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.caId === 'undefined') {

                    continue;
                }

                resources.push(new ResourceNode(this.profile, "", item.caId, "Ca", deleteCa, getCa, undefined));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersCa {
        return FiltersCaFromJSON(json);
    }
}