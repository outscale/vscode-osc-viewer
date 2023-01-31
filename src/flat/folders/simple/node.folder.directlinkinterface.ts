import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteDirectLinkInterface, getDirectLinkInterface, getDirectLinkInterfaces } from '../../../cloud/directlinkinterfaces';
import { FiltersDirectLinkInterface, FiltersDirectLinkInterfaceFromJSON } from 'outscale-api';

export const DIRECTLINKINTERFACES_FOLDER_NAME = "DirectLink Interfaces";
export class DirectLinkInterfacesFolderNode extends FiltersFolderNode<FiltersDirectLinkInterface> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, DIRECTLINKINTERFACES_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getDirectLinkInterfaces(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.directLinkInterfaceId === 'undefined') {

                    continue;
                }

                resources.push(new ResourceNode(this.profile, "", item.directLinkInterfaceId, "DirectLinkInterface", deleteDirectLinkInterface, getDirectLinkInterface));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersDirectLinkInterface {
        return FiltersDirectLinkInterfaceFromJSON(json);
    }
}