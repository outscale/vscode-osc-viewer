import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteDirectLink, getDirectLinks } from '../../../cloud/directlinks';
import { FiltersDirectLink, FiltersDirectLinkFromJSON } from 'outscale-api';

export const DIRECTLINKS_FOLDER_NAME = "DirectLinks";
export class DirectLinksFolderNode extends FiltersFolderNode<FiltersDirectLink> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, DIRECTLINKS_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getDirectLinks(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.directLinkId === 'undefined') {

                    continue;
                }

                resources.push(new ResourceNode(this.profile, "", item.directLinkId, "DirectLink", deleteDirectLink));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersDirectLink {
        return FiltersDirectLinkFromJSON(json);
    }
}