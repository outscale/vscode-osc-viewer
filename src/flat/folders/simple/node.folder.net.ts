import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { deleteNet, getNets } from '../../../cloud/nets';
import { FiltersNet, FiltersNetFromJSON } from 'outscale-api';

export const NET_FOLDER_NAME = "Nets";
export class VpcFolderNode extends FiltersFolderNode<FiltersNet> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, NET_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getNets(this.profile, this.filters).then(netsResults => {
            if (typeof netsResults === "string") {
                vscode.window.showErrorMessage(`Error while reading ${this.folderName}: ${netsResults}`);
                return Promise.resolve([]);
            }
            const resources = [];
            for (const net of netsResults) {
                if (typeof net.netId === 'undefined') {
                    continue;
                }
                resources.push(new ResourceNode(this.profile, "", net.netId?.toString(), "vpc", deleteNet));
            }
            return Promise.resolve(resources);
        });

    }

    filtersFromJson(json: string): FiltersNet {
        return FiltersNetFromJSON(json);
    }

}