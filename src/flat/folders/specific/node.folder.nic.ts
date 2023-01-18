import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { getNics } from '../../../cloud/nics';
import { FiltersNic, FiltersNicFromJSON } from 'outscale-api';
import { NicResourceNode } from '../../resources/node.resources.nics';

export const NICS_FOLDER_NAME = "Nics";
export class NicsFolderNode extends FiltersFolderNode<FiltersNic> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, NICS_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getNics(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.nicId === 'undefined') {

                    continue;
                }

                if (typeof item.state === 'undefined') {
                    continue;
                }

                resources.push(new NicResourceNode(this.profile, "", item.nicId, item.state));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersNic {
        return FiltersNicFromJSON(json);
    }
}