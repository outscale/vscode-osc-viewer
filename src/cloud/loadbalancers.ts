
import * as osc from "outscale-api";
import { getConfig } from './cloud';
import { Profile } from "../flat/node";
import { FiltersLoadBalancer } from "outscale-api";


export function getLoadBalancers(profile: Profile, filters?: FiltersLoadBalancer): Promise<Array<osc.LoadBalancer> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadLoadBalancersOperationRequest = {
        readLoadBalancersRequest: {
            filters: filters
        }
    };

    const api = new osc.LoadBalancerApi(config);
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
    const config = getConfig(profile);
    const readParameters : osc.ReadLoadBalancersOperationRequest = {
        readLoadBalancersRequest: {
            filters: {
                loadBalancerNames: [loadBalancerName]
            }
        }
    };

    const api = new osc.LoadBalancerApi(config);
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

export function deleteLoadBalancer(profile: Profile, loadBalancerName: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteLoadBalancerOperationRequest = {
        deleteLoadBalancerRequest: {
            loadBalancerName: loadBalancerName
        }
    };

    const api = new osc.LoadBalancerApi(config);
    return api.deleteLoadBalancer(deleteParameters)
    .then((res: osc.DeleteLoadBalancerResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}