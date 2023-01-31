
import * as osc from "outscale-api";
import { FiltersSecurityGroup } from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource SecurityGroup
export function getSecurityGroups(profile: Profile, filters?: FiltersSecurityGroup): Promise<Array<osc.SecurityGroup> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadSecurityGroupsOperationRequest = {
        readSecurityGroupsRequest: {
            filters: filters
        }
    };

    const api = new osc.SecurityGroupApi(config);
    return api.readSecurityGroups(readParameters)
        .then((res: osc.ReadSecurityGroupsResponse) => {
            if (res.securityGroups === undefined || res.securityGroups.length === 0) {
                return [];
            }
            return res.securityGroups;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Retrieve a specific item of the resource SecurityGroup
export function getSecurityGroup(profile: Profile, resourceId: string): Promise<osc.SecurityGroup | undefined | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadSecurityGroupsOperationRequest = {
        readSecurityGroupsRequest: {
            filters: {
                securityGroupIds: [resourceId]
            }
        }
    };

    const api = new osc.SecurityGroupApi(config);
    return api.readSecurityGroups(readParameters)
        .then((res: osc.ReadSecurityGroupsResponse) => {
            if (res.securityGroups === undefined || res.securityGroups.length === 0) {
                return undefined;
            }
            return res.securityGroups[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Delete a specific item the resource SecurityGroup
export function deleteSecurityGroup(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteSecurityGroupOperationRequest = {
        deleteSecurityGroupRequest: {
            securityGroupId: resourceId
        }
    };

    const api = new osc.SecurityGroupApi(config);
    return api.deleteSecurityGroup(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

export function ruleToString(flow: string, resource: osc.SecurityGroupRule): string {
    let service = "";

    if (typeof resource.ipRanges !== 'undefined' && resource.ipRanges.length > 0) {
        service = `${resource.ipRanges}`;
    } else if (typeof resource.securityGroupsMembers !== 'undefined' && resource.securityGroupsMembers.length > 0) {
        service = `${resource.securityGroupsMembers.map((element) => element.securityGroupId)}`;
    }

    let stringBuilder = "";
    if (flow === "Inbound") {
        stringBuilder = `From ${service}:[${resource.fromPortRange} -> ${resource.toPortRange}] via ${resource.ipProtocol}`;
    } else if (flow === "Outbound") {
        stringBuilder = `To ${service}:[${resource.fromPortRange} -> ${resource.toPortRange}] via ${resource.ipProtocol}`;
    }

    return stringBuilder;
}

export function removeRule(profile: Profile, resourceId: string, flow: string, rule: osc.SecurityGroupRule): Promise<string | undefined> {
    const config = getConfig(profile);

    // Sanityze the request
    if (typeof rule.securityGroupsMembers !== "undefined" && rule.securityGroupsMembers.length > 0) {
        const targetSecurityGroupsMembers: osc.SecurityGroupsMember[] = rule.securityGroupsMembers.map((sgMember) => {
            if (typeof sgMember.securityGroupId !== 'undefined' && typeof sgMember.securityGroupName !== 'undefined') {
                return {
                    securityGroupId: sgMember.securityGroupId,
                };
            } else {
                return {
                    securityGroupId: sgMember.securityGroupId,
                    securityGroupName: sgMember.securityGroupName,
                };
            }
        });
        rule.securityGroupsMembers = targetSecurityGroupsMembers;
    }

    const parameter: osc.DeleteSecurityGroupRuleOperationRequest = {
        deleteSecurityGroupRuleRequest: {
            flow: flow,
            rules: [rule],
            securityGroupId: resourceId,
        }
    };

    const api = new osc.SecurityGroupRuleApi(config);
    return api.deleteSecurityGroupRule(parameter)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}