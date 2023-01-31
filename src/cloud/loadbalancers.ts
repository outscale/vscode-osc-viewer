
import * as osc from "outscale-api";
import { FiltersLoadBalancer } from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource LoadBalancer
export function getLoadBalancers(profile: Profile, filters?: FiltersLoadBalancer): Promise<Array<osc.LoadBalancer> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadLoadBalancersOperationRequest = {
        readLoadBalancersRequest: {
            filters: filters
        }
    };

    const api = new osc.LoadBalancerApi(config);
    return api.readLoadBalancers(readParameters)
        .then((res: osc.ReadLoadBalancersResponse) => {
            if (res.loadBalancers === undefined || res.loadBalancers.length === 0) {
                return [];
            }
            return res.loadBalancers;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Retrieve a specific item of the resource LoadBalancer
export function getLoadBalancer(profile: Profile, resourceId: string): Promise<osc.LoadBalancer | undefined | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadLoadBalancersOperationRequest = {
        readLoadBalancersRequest: {
            filters: {
                loadBalancerNames: [resourceId]
            }
        }
    };

    const api = new osc.LoadBalancerApi(config);
    return api.readLoadBalancers(readParameters)
        .then((res: osc.ReadLoadBalancersResponse) => {
            if (res.loadBalancers === undefined || res.loadBalancers.length === 0) {
                return undefined;
            }
            return res.loadBalancers[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Delete a specific item the resource LoadBalancer
export function deleteLoadBalancer(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteLoadBalancerOperationRequest = {
        deleteLoadBalancerRequest: {
            loadBalancerName: resourceId
        }
    };

    const api = new osc.LoadBalancerApi(config);
    return api.deleteLoadBalancer(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}