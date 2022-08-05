
import * as osc from "outscale-api";
import { getConfig } from './cloud';
import { Profile } from "../flat/node";


export function getLoadBalancers(profile: Profile): Promise<Array<osc.LoadBalancer> | string> {
    let config = getConfig(profile);
    let readParameters : osc.ReadLoadBalancersOperationRequest = {
        readLoadBalancersRequest: {}
    };

    let api = new osc.LoadBalancerApi(config);
    return api.readLoadBalancers(readParameters)
    .then((res: osc.ReadLoadBalancersResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.loadBalancers === undefined || res.loadBalancers.length === 0) {
            return "Listing suceeded but it seems you have no LoadBalancers";
        }
        return res.loadBalancers;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

export function getLoadBalancer(profile: Profile, loadBalancerName: string): Promise<osc.LoadBalancer | string> {
    let config = getConfig(profile);
    let readParameters : osc.ReadLoadBalancersOperationRequest = {
        readLoadBalancersRequest: {
            filters: {
                loadBalancerNames: [loadBalancerName]
            }
        }
    };

    let api = new osc.LoadBalancerApi(config);
    return api.readLoadBalancers(readParameters)
    .then((res: osc.ReadLoadBalancersResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.loadBalancers === undefined || res.loadBalancers.length === 0) {
            return "Listing suceeded but it seems you have no LoadBalancers";
        }
        return res.loadBalancers[0];
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}