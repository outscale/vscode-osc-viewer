import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { getInternetServices } from '../../../cloud/internetservices';
import { FiltersInternetService, FiltersInternetServiceFromJSON } from 'outscale-api';
import { InternetServiceResourceNode } from '../../resources/node.resources.internetservices';

export const INTERNETSERVICES_FOLDER_NAME = "Internet Services";
export class InternetServicesFolderNode extends FiltersFolderNode<FiltersInternetService> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, INTERNETSERVICES_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getInternetServices(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(`Error while reading ${this.folderName}: ${results}`);
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.internetServiceId === 'undefined') {

                    continue;
                }

                resources.push(new InternetServiceResourceNode(this.profile, "", item.internetServiceId, item.netId === "undefined" ? "unlink" : "link"));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersInternetService {
        return FiltersInternetServiceFromJSON(json);
    }
}