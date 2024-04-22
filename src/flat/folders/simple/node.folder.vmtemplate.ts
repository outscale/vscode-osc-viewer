import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile, resourceNodeCompare } from '../../node';
import { FiltersFolderNode } from '../node.filterfolder';
import { ResourceNode } from '../../resources/node.resources';
import { FiltersVmTemplate, FiltersVmTemplateFromJSON } from 'outscale-api';
import { deleteVmTemplate, getVmTemplate, getVmTemplates } from '../../../cloud/vmtemplate';

export const VMTEMPLATES_FOLDER_NAME = "Vm Templates";
export class VmTemplatesFolderNode extends FiltersFolderNode<FiltersVmTemplate> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, VMTEMPLATES_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> {
        this.updateFilters();
        return getVmTemplates(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.vmTemplateId === 'undefined') {

                    continue;
                }

                if (typeof item.vmTemplateName === 'undefined') {

                    continue;
                }

                resources.push(new ResourceNode(this.profile, item.vmTemplateName, item.vmTemplateId, "VmTemplate", deleteVmTemplate, getVmTemplate, item.tags));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersVmTemplate {
        return FiltersVmTemplateFromJSON(json);
    }
}