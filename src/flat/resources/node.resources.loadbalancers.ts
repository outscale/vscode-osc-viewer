import * as vscode from 'vscode';
import { deleteLoadBalancer, getLoadBalancer, getLoadBalancerHealth } from "../../cloud/loadbalancers";
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { BackendVmHealth, ResourceTag } from 'outscale-api';

export type LoadBalancerHealth =
    "Healthy" |
    "Unhealthy" |
    "Unknown";


export class LoadBalancerResourceNode extends ResourceNode {

    resourceHealth: BackendVmHealth[] | undefined | string;

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly tags: Array<ResourceTag> | undefined) {
        super(profile, resourceName, resourceId, "loadbalancers", deleteLoadBalancer, getLoadBalancer, tags);
        this.resourceHealth = undefined;
        getLoadBalancerHealth(this.profile, this.resourceId).then(health => {
            this.resourceHealth = health;
            vscode.commands.executeCommand("profile.refreshEntry", this);
        });
    }

    getContextValue(): string {
        return "loadbalancerresourcenode";
    }

    getIconPath(): vscode.ThemeIcon {
        switch (this.isInGoodHealth(this.resourceHealth)) {
            case "Healthy":
                return new vscode.ThemeIcon("pass", new vscode.ThemeColor("charts.green"));
            case "Unhealthy":
                return new vscode.ThemeIcon("alert", new vscode.ThemeColor("charts.red"));
            default:
                return new vscode.ThemeIcon("dash");
        }
    }

    isInGoodHealth(resourceHealth: BackendVmHealth[] | string | undefined): LoadBalancerHealth {
        if (typeof resourceHealth === "string") {
            return "Unknown";
        }

        if (typeof resourceHealth === "undefined") {
            return "Unknown";
        }

        const badHealthVms = resourceHealth.filter((backendHealth) => {
            if (typeof backendHealth.state === "undefined") {
                return true;
            }

            return backendHealth.state === "DOWN";

        });

        return badHealthVms.length === 0 ? "Healthy" : "Unhealthy";

    }

}