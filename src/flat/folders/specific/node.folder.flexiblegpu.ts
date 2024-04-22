import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { getFlexibleGpus } from '../../../cloud/flexiblegpus';
import { FiltersFlexibleGpu, FiltersFlexibleGpuFromJSON } from 'outscale-api';
import { FlexibleGpuResourceNode } from '../../resources/node.resources.flexiblegpus';

export const FLEXIBLEGPUS_FOLDER_NAME = "Flexible Gpus";
export class FlexibleGpusFolderNode extends FiltersFolderNode<FiltersFlexibleGpu> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, FLEXIBLEGPUS_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getFlexibleGpus(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.flexibleGpuId === 'undefined') {

                    continue;
                }

                if (typeof item.state === 'undefined') {
                    continue;
                }

                resources.push(new FlexibleGpuResourceNode(this.profile, "", item.flexibleGpuId, item.state, undefined));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersFlexibleGpu {
        return FiltersFlexibleGpuFromJSON(json);
    }
}