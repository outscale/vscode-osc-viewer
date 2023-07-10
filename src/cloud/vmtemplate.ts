
import * as osc from "outscale-api";
import { getConfig, handleRejection } from './cloud';
import { Profile } from "../flat/node";


export function getVmTemplates(profile: Profile, filters?: osc.FiltersVmTemplate): Promise<Array<osc.VmTemplate> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadVmTemplatesOperationRequest = {
        readVmTemplatesRequest: {
            filters: filters
        }
    };

    const api = new osc.VmTemplateApi(config);
    return api.readVmTemplates(readParameters)
        .then((res: osc.ReadVmTemplatesResponse) => {
            if (res.vmTemplates === undefined || res.vmTemplates.length === 0) {
                return [];
            }
            return res.vmTemplates;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

export function getVmTemplate(profile: Profile, resourceId: string): Promise<osc.VmTemplate | undefined | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadVmTemplatesOperationRequest = {
        readVmTemplatesRequest: {
            filters: {
                vmTemplateIds: [resourceId]
            }
        }
    };

    const api = new osc.VmTemplateApi(config);
    return api.readVmTemplates(readParameters)
        .then((res: osc.ReadVmTemplatesResponse) => {
            if (res.vmTemplates === undefined || res.vmTemplates.length === 0) {
                return undefined;
            }
            return res.vmTemplates[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

export function deleteVmTemplate(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteVmTemplateOperationRequest = {
        deleteVmTemplateRequest: {
            vmTemplateId: resourceId
        }
    };

    const api = new osc.VmTemplateApi(config);
    return api.deleteVmTemplate(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}