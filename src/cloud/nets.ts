
import * as osc from "outscale-api";
import { FiltersNet } from "outscale-api";
import { getConfig, handleRejection } from '../cloud/cloud';
import { Profile } from "../flat/node";
import { getInternetServices } from "./internetservices";
import { getLoadBalancersInNet } from "./loadbalancers";
import { getNatServices } from "./natservices";
import { getNetAccessPoints } from "./netaccesspoints";
import { getNetPeerings } from "./netpeerings";
import { getNics } from "./nics";
import { getRouteTables } from "./routetables";
import { getSecurityGroups } from "./securitygroups";
import { getSubnets } from "./subnets";
import { getVirtualGateways } from "./virtualgateways";
import { getVmsInNet } from "./vms";
import { getVpnConnections } from "./vpnconnections";

export class Net {
    readonly id!: string;
    vms!: Array<osc.Vm>;
    loadbalancers!: Array<osc.LoadBalancer>;
    subnets!: Array<osc.Subnet>;
    routeTables!: Array<osc.RouteTable>;
    nats!: Array<osc.NatService>;
    internetServices!: Array<osc.InternetService>;
    netAccessPoints!: Array<osc.NetAccessPoint>;
    accepterNetPeerings!: Array<osc.NetPeering>;
    sourceNetPeerings!: Array<osc.NetPeering>;
    securityGroups!: Array<osc.SecurityGroup>;
    virtualGateways!: Array<osc.VirtualGateway>;
    nics!: Array<osc.Nic>;
    vpnConnections!: Array<osc.VpnConnection>;
}

// Retrieve all items of the resource Net
export function getNets(profile: Profile, filters?: FiltersNet): Promise<Array<osc.Net> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadNetsOperationRequest = {
        readNetsRequest: {
            filters: filters
        }
    };

    const api = new osc.NetApi(config);
    return api.readNets(readParameters)
        .then((res: osc.ReadNetsResponse) => {
            if (res.nets === undefined || res.nets.length === 0) {
                return [];
            }
            return res.nets;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Retrieve a specific item of the resource Net
export function getNet(profile: Profile, resourceId: string): Promise<osc.Net | undefined | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadNetsOperationRequest = {
        readNetsRequest: {
            filters: {
                netIds: [resourceId]
            }
        }
    };

    const api = new osc.NetApi(config);
    return api.readNets(readParameters)
        .then((res: osc.ReadNetsResponse) => {
            if (res.nets === undefined || res.nets.length === 0) {
                return undefined;
            }
            return res.nets[0];
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

// Delete a specific item the resource Net
export function deleteNet(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteNetOperationRequest = {
        deleteNetRequest: {
            netId: resourceId
        }
    };

    const api = new osc.NetApi(config);
    return api.deleteNet(deleteParameters)
        .then(() => {
            return undefined;
        }, (err_: any) => {
            return handleRejection(err_);
        });
}

export async function getAllNetResources(profile: Profile, resourceId: string): Promise<Net | string> {
    // VMs
    const vms = await getVmsInNet(profile, resourceId);
    if (typeof vms === 'string') {
        return vms;
    }

    // LBUs
    const lbus = await getLoadBalancersInNet(profile, resourceId);
    if (typeof lbus === 'string') {
        return lbus;
    }

    // Net peering (check all source and target)
    // Sources
    const sourceNetPeers = await getNetPeerings(profile, { sourceNetNetIds: [resourceId] });
    if (typeof sourceNetPeers === 'string') {
        return sourceNetPeers;
    }

    const accepterNetPeers = await getNetPeerings(profile, { accepterNetNetIds: [resourceId] });
    if (typeof accepterNetPeers === 'string') {
        return accepterNetPeers;
    }

    // Net Access Point
    const naps = await getNetAccessPoints(profile, { netIds: [resourceId] });
    if (typeof naps === 'string') {
        return naps;
    }

    // Nat Services
    const nats = await getNatServices(profile, { netIds: [resourceId] });
    if (typeof nats === 'string') {
        return nats;
    }

    // Routes Tables
    const rts = await getRouteTables(profile, { netIds: [resourceId] });
    if (typeof rts === 'string') {
        return rts;
    }

    // Security group
    const sgs = await getSecurityGroups(profile, { netIds: [resourceId] });
    if (typeof sgs === 'string') {
        return sgs;
    }

    // Virtual Gateways
    const vgs = await getVirtualGateways(profile, { linkNetIds: [resourceId] });
    if (typeof vgs === 'string') {
        return vgs;
    }

    // Nics
    const nics = await getNics(profile, { netIds: [resourceId] });
    if (typeof nics === 'string') {
        return nics;
    }

    // Subnets
    const subnets = await getSubnets(profile, { netIds: [resourceId] });
    if (typeof subnets === 'string') {
        return subnets;
    }

    // Internet Services
    const iss = await getInternetServices(profile, { linkNetIds: [resourceId] });
    if (typeof iss === 'string') {
        return iss;
    }

    // VPN Connections (Virtualgateway ou client gateway)
    const vgsIds: string[] = [];
    vgs.forEach((vg) => {
        if (typeof vg.virtualGatewayId === 'undefined') {
            return undefined;
        }
        vgsIds.push(vg.virtualGatewayId);
    });
    const vpns = await getVpnConnections(profile, { virtualGatewayIds: vgsIds });
    if (typeof vpns === 'string') {
        return vpns;
    }

    const net: Net = {
        id: resourceId,
        internetServices: iss,
        loadbalancers: lbus,
        nats: nats,
        netAccessPoints: naps,
        sourceNetPeerings: sourceNetPeers,
        accepterNetPeerings: accepterNetPeers,
        nics: nics,
        routeTables: rts,
        securityGroups: sgs,
        subnets: subnets,
        virtualGateways: vgs,
        vms: vms,
        vpnConnections: vpns,
    };

    return net;
}