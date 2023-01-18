import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { getVolumes } from '../../../cloud/volumes';
import { VolumeResourceNode } from '../../resources/node.resources.volumes';
import { FiltersVolume, FiltersVolumeFromJSON } from 'outscale-api';
import { FiltersFolderNode } from '../node.filterfolder';

export const VOLUME_FOLDER_NAME = "Volumes";
export class VolumeFolderNode extends FiltersFolderNode<FiltersVolume> implements ExplorerFolderNode {

    constructor(readonly profile: Profile) {
        super(profile, VOLUME_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getVolumes(this.profile, this.filters).then(result => {
            if (typeof result === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, result));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const volume of result) {
                if (typeof volume.volumeId === 'undefined' || typeof volume.state === 'undefined') {
                    continue;
                }
                resources.push(new VolumeResourceNode(this.profile, "", volume.volumeId, volume.state));
            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersVolume {
        return FiltersVolumeFromJSON(json);
    }
}