import * as osc from 'outscale-api';
import { ImportMock } from 'ts-mock-imports';

const apiAccessRules: osc.ApiAccessRule[] = [
    {
        apiAccessRuleId: "api1"
    },
    {
        apiAccessRuleId: "api2"
    }
];

export function initMock() {
    const readApiAccessMock = ImportMock.mockFunction(osc.ApiAccessRuleApi.prototype, 'readApiAccessRules');
    readApiAccessMock.onFirstCall().returns(Promise.reject("403 Error"));
    readApiAccessMock.onSecondCall().returns(Promise.resolve({
        apiAccessRules: [],
    }));
    readApiAccessMock.onThirdCall().returns(Promise.resolve(
        {
            apiAccessRules: apiAccessRules,
        }
    ));
    readApiAccessMock.returns(Promise.reject("403 Error"));


    const deleteAKMock = ImportMock.mockFunction(osc.ApiAccessRuleApi.prototype, 'deleteApiAccessRule');

    deleteAKMock.returns(Promise.reject("403 Error"));
}