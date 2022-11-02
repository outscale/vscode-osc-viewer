
import * as osc from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";


export function getAccounts(profile: Profile): Promise<Array<osc.Account> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadAccountsOperationRequest = {
        readAccountsRequest: {}
    };

    const api = new osc.AccountApi(config);
    return api.readAccounts(readParameters)
        .then((res: osc.ReadAccountsResponse) => {
            if (res.accounts === undefined || res.accounts.length === 0) {
                return [];
            }
            return res.accounts;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

export function getAccount(profile: Profile, _: string): Promise<osc.Account | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadAccountsOperationRequest = {
        readAccountsRequest: {}
    };

    const api = new osc.AccountApi(config);
    return api.readAccounts(readParameters)
        .then((res: osc.ReadAccountsResponse) => {
            if (res.accounts === undefined || res.accounts.length === 0) {
                return {};
            }
            return res.accounts[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}
