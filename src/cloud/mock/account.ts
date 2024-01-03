import * as osc from 'outscale-api';
import { ImportMock } from 'ts-mock-imports';

const account: osc.Account = {
    accountId: "accountid",
};

export function initMock() {
    const getAccountMock = ImportMock.mockFunction(osc.AccountApi.prototype, 'readAccounts');
    getAccountMock.returns(Promise.resolve(
        {
            accounts: [account],
        }
    ));
}
