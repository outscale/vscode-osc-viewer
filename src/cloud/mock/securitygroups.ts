import * as osc from 'outscale-api';
import { ImportMock } from 'ts-mock-imports';

let securityGroups: osc.SecurityGroup[] = [
    {
        securityGroupId: "sg-12345",
        securityGroupName: "first-sg",
        inboundRules: [
            {
                fromPortRange: -1,
                ipProtocol: "-1",
                ipRanges: ["0.0.0.0/0"],
                toPortRange: -1,
            },
            {
                fromPortRange: 22,
                ipProtocol: "tcp",
                toPortRange: 23,
                securityGroupsMembers: [
                    {
                        accountId: "123456789",
                        securityGroupId: "sg-12345",
                        securityGroupName: "first-sg"
                    }
                ]
            }
        ],
        outboundRules: [
            {
                fromPortRange: -1,
                ipProtocol: "-1",
                ipRanges: ["0.0.0.0/0"],
                toPortRange: -1,
            },
        ]
    },
    {
        securityGroupId: "sg-678910",
        securityGroupName: "second-sg",
        inboundRules: [
        ],
        outboundRules: [
            {
                fromPortRange: -1,
                ipProtocol: "-1",
                ipRanges: ["0.0.0.0/0"],
                toPortRange: -1,
            },
        ]
    }
];

export function initMock() {
    const readMock = ImportMock.mockFunction(osc.SecurityGroupApi.prototype, 'readSecurityGroups');
    readMock.callsFake((arg: osc.ReadSecurityGroupsOperationRequest) => {
        let responseData = securityGroups;
        if (typeof arg.readSecurityGroupsRequest?.filters?.securityGroupIds !== 'undefined') {
            responseData = responseData.filter(sg => {
                if (typeof sg.securityGroupId === 'undefined') {
                    return false;
                }
                return arg.readSecurityGroupsRequest?.filters?.securityGroupIds?.includes(sg.securityGroupId);
            });
        }

        const resp: osc.ReadSecurityGroupsResponse = {
            securityGroups: responseData
        };
        return Promise.resolve(resp);
    });

    const unlinkMock = ImportMock.mockFunction(osc.SecurityGroupRuleApi.prototype, 'deleteSecurityGroupRule');
    unlinkMock.callsFake((arg: osc.DeleteSecurityGroupRuleOperationRequest) => {
        const sgId = arg.deleteSecurityGroupRuleRequest?.securityGroupId;
        const flow = arg.deleteSecurityGroupRuleRequest?.flow;
        const requestedRules = arg.deleteSecurityGroupRuleRequest?.rules;

        if (typeof sgId === 'undefined' || typeof flow === 'undefined' || typeof requestedRules === 'undefined') {
            return Promise.reject("403");
        }

        securityGroups = securityGroups.filter((sg) => {
            if (typeof sg.securityGroupId === 'undefined') {
                return false;
            }

            if (sg.securityGroupId !== sgId) {
                return true;
            }

            if (flow === 'Inbound') {
                if (typeof sg.inboundRules === 'undefined') {
                    return false;
                }
                sg.inboundRules = sg.inboundRules.filter((rule) => {
                    return !(requestedRules[0].fromPortRange === rule.fromPortRange &&
                        requestedRules[0].toPortRange === rule.toPortRange &&
                        requestedRules[0].ipProtocol === rule.ipProtocol);
                });
            } else if (flow === 'Outbound') {
                if (typeof sg.outboundRules === 'undefined') {
                    return false;
                }
                sg.outboundRules = sg.outboundRules.filter((rule) => {
                    return !(requestedRules[0].fromPortRange === rule.fromPortRange &&
                        requestedRules[0].toPortRange === rule.toPortRange &&
                        requestedRules[0].ipProtocol === rule.ipProtocol);
                });
            }

            return true;
        });

        return Promise.resolve(undefined);
    });
}