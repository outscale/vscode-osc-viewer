import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { getNets } from '../../../cloud/nets';
import { FiltersNet, FiltersNetFromJSON } from 'outscale-api';
import { NetResourceNode } from '../../resources/node.resources.nets';

export const NET_FOLDER_NAME = "Nets";
export class VpcFolderNode extends FiltersFolderNode<FiltersNet> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, NET_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getNets(this.profile, this.filters).then(netsResults => {
            if (typeof netsResults === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, netsResults));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const net of netsResults) {
                if (typeof net.netId === 'undefined') {
                    continue;
                }
                resources.push(new NetResourceNode(this.profile, "", net.netId?.toString()));
            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersNet {
        return FiltersNetFromJSON(json);
    }

}