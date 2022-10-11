
import * as osc from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource ApiAccessRule
export function getApiAccessRules(profile: Profile): Promise<Array<osc.ApiAccessRule> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadApiAccessRulesOperationRequest = {
        readApiAccessRulesRequest: {}
    };

    const api = new osc.ApiAccessRuleApi(config);
    return api.readApiAccessRules(readParameters)
    .then((res: osc.ReadApiAccessRulesResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.apiAccessRules === undefined || res.apiAccessRules.length === 0) {
            return "Listing suceeded but it seems you have no ApiAccessRule";
        }
        return res.apiAccessRules;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

// Retrieve a specific item of the resource ApiAccessRule
export function getApiAccessRule(profile: Profile, resourceId: string): Promise<osc.ApiAccessRule | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadApiAccessRulesOperationRequest = {
        readApiAccessRulesRequest: {
            filters: {
                apiAccessRuleIds: [resourceId]
            }
        }
    };

    const api = new osc.ApiAccessRuleApi(config);
    return api.readApiAccessRules(readParameters)
    .then((res: osc.ReadApiAccessRulesResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.apiAccessRules === undefined || res.apiAccessRules.length === 0) {
            return "Listing suceeded but it seems you have no ApiAccessRule";
        }
        return res.apiAccessRules[0];
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

// Delete a specific item the resource ApiAccessRule
export function deleteApiAccessRule(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteApiAccessRuleOperationRequest = {
        deleteApiAccessRuleRequest: {
            apiAccessRuleId: resourceId
        }
    };

    const api = new osc.ApiAccessRuleApi(config);
    return api.deleteApiAccessRule(deleteParameters)
    .then((res: osc.DeleteApiAccessRuleResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}