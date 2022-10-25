import * as osc from 'outscale-api';
import { ImportMock } from 'ts-mock-imports';

let accessKeys: osc.AccessKey[] = [
    {
        accessKeyId: "AK",
        state: "ACTIVE"
    },
    {
        accessKeyId: "AK2",
        state: "INACTIVE"
    }
];

export function initMock() {
    const readAKMock = ImportMock.mockFunction(osc.AccessKeyApi.prototype, 'readAccessKeys');
    readAKMock.callsFake((arg: osc.ReadAccessKeysOperationRequest) => {
        let responseAccessKeys = accessKeys;
        if (typeof arg.readAccessKeysRequest?.filters?.states !== 'undefined') {
            responseAccessKeys = responseAccessKeys.filter(ak => ak.state === arg.readAccessKeysRequest?.filters?.states);
        }

        if (typeof arg.readAccessKeysRequest?.filters?.accessKeyIds !== 'undefined') {
            responseAccessKeys = responseAccessKeys.filter(ak => {
                if (typeof ak.accessKeyId === 'undefined') {
                    return false;
                }
                return arg.readAccessKeysRequest?.filters?.accessKeyIds?.includes(ak.accessKeyId);
            });
        }
        const resp: osc.ReadAccessKeysResponse = {
            accessKeys: responseAccessKeys
        };
        return Promise.resolve(resp);
    });

    const deleteAKMock = ImportMock.mockFunction(osc.AccessKeyApi.prototype, 'deleteAccessKey');

    deleteAKMock.callsFake((arg: osc.DeleteAccessKeyOperationRequest) => {
        const accessKeyId = arg.deleteAccessKeyRequest?.accessKeyId;
        if (typeof accessKeyId === 'undefined') {
            return Promise.reject("403");
        }
        accessKeys = accessKeys.filter((accessKey) => accessKey.accessKeyId !== accessKeyId);
        return Promise.resolve(undefined);
    });
}