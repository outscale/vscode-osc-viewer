import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { getExternalIPs } from '../../../cloud/publicips';
import { PublicIpResourceNode } from '../../resources/node.resources.eip';
import { FiltersPublicIp, FiltersPublicIpFromJSON } from 'outscale-api';
import { FiltersFolderNode } from '../node.filterfolder';

export const PUBLICIP_FOLDER_NAME = "External IPs";
export class ExternalIPsFolderNode extends FiltersFolderNode<FiltersPublicIp> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, PUBLICIP_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getExternalIPs(this.profile, this.filters).then(result => {
            if (typeof result === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, result));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const publicIp of result) {
                if (typeof publicIp.publicIp === 'undefined' || typeof publicIp.publicIpId === 'undefined') {
                    continue;
                }
                resources.push(new PublicIpResourceNode(this.profile, publicIp.publicIp, publicIp.publicIpId, (typeof publicIp.linkPublicIpId === "undefined" || publicIp.linkPublicIpId.length === 0) ? "unlink" : "link", publicIp.tags));
            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersPublicIp {
        return FiltersPublicIpFromJSON(json);
    }
}