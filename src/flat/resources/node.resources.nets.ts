import * as vscode from 'vscode';
import { getInternetServices } from "../../cloud/internetservices";
import { deleteLoadBalancer, getLoadBalancer, getLoadBalancersInNet } from "../../cloud/loadbalancers";
import { deleteNatService, getNatService, getNatServices } from "../../cloud/natservices";
import { deleteNetAccessPoint, getNetAccessPoint, getNetAccessPoints } from "../../cloud/netaccesspoints";
import { deleteNetPeering, getNetPeering, getNetPeerings } from '../../cloud/netpeerings';
import { deleteNet, getNet } from "../../cloud/nets";
import { getNics } from "../../cloud/nics";
import { deleteExternalIP, getExternalIP } from '../../cloud/publicips';
import { getRouteTables } from "../../cloud/routetables";
import { getSecurityGroups } from "../../cloud/securitygroups";
import { deleteSubnet, getSubnet, getSubnets } from "../../cloud/subnets";
import { getVirtualGateways } from "../../cloud/virtualgateways";
import { getVmsInNet } from "../../cloud/vms";
import { deleteVpnConnection, getVpnConnection, getVpnConnections } from "../../cloud/vpnconnections";
import { OutputChannel } from '../../logs/output_channel';
import { Profile } from '../node';
import { ResourceNode } from './node.resources';
import { InternetServiceResourceNode } from "./node.resources.internetservices";
import { NicResourceNode } from "./node.resources.nics";
import { RouteTableResourceNode } from "./node.resources.routetables";
import { SecurityGroupResourceNode } from "./node.resources.securitygroups";
import { VirtualGatewayResourceNode } from "./node.resources.virtualgateways";
import { VmResourceNode } from "./node.resources.vms";


export class NetResourceNode extends ResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string) {
        super(profile, resourceName, resourceId, "vpc", deleteNet, getNet);
    }

    getContextValue(): string {
        return "netresourcenode";
    }

    async teardown(): Promise<string | undefined> {
        let resourceToDelete: (ResourceNode | undefined)[] = [];
        const outputChannel = OutputChannel.getInstance();

        // VMs
        const vms = await getVmsInNet(this.profile, this.resourceId);
        if (typeof vms === "string") {
            outputChannel.appendLine(vms);
        } else {
            const res = vms.map((vm) => {
                if (typeof vm.vmId === 'undefined') {
                    return undefined;
                }
                return new VmResourceNode(this.profile, "", vm.vmId, "", false);
            });
            resourceToDelete.push(...res);
        }

        // LBUs
        const lbus = await getLoadBalancersInNet(this.profile, this.resourceId);
        if (typeof lbus === "string") {
            outputChannel.appendLine(lbus);
        } else {
            const res = lbus.map((lbu) => {
                if (typeof lbu.loadBalancerName === 'undefined') {
                    return undefined;
                }
                return new ResourceNode(this.profile, "", lbu.loadBalancerName, "loadbalancers", deleteLoadBalancer, getLoadBalancer);
            });
            resourceToDelete.push(...res);
        }

        // Net peering (check all source and target)
        // Sources
        let netPeers = await getNetPeerings(this.profile, { sourceNetNetIds: [this.resourceId] });
        if (typeof netPeers === 'string') {
            outputChannel.appendLine(netPeers);
        } else {
            const res = netPeers.map((netPeer) => {
                if (typeof netPeer.netPeeringId === 'undefined') {
                    return undefined;
                }
                return new ResourceNode(this.profile, "", netPeer.netPeeringId, "NetPeering", deleteNetPeering, getNetPeering);
            });
            resourceToDelete.push(...res);
        }

        netPeers = await getNetPeerings(this.profile, { accepterNetNetIds: [this.resourceId] });
        if (typeof netPeers === 'string') {
            outputChannel.appendLine(netPeers);
        } else {
            const res = netPeers.map((netPeer) => {
                if (typeof netPeer.netPeeringId === 'undefined') {
                    return undefined;
                }
                return new ResourceNode(this.profile, "", netPeer.netPeeringId, "NetPeering", deleteNetPeering, getNetPeering);
            });
            resourceToDelete.push(...res);
        }

        // Public IP
        // Retrieve all the links ?
        const publicIpIds: string[] = [];

        // Net Access Point
        const naps = await getNetAccessPoints(this.profile, { netIds: [this.resourceId] });
        if (typeof naps === "string") {
            outputChannel.appendLine(naps);
        } else {
            const res = naps.map((nap) => {
                if (typeof nap.netAccessPointId === 'undefined') {
                    return undefined;
                }

                return new ResourceNode(this.profile, "", nap.netAccessPointId, "NetAccessPoint", deleteNetAccessPoint, getNetAccessPoint);
            });
            resourceToDelete.push(...res);
        }

        // Routes (Deletion with route table)

        // Nat Services
        const nats = await getNatServices(this.profile, { netIds: [this.resourceId] });
        if (typeof nats === "string") {
            outputChannel.appendLine(nats);
        } else {
            const res = nats.map((nat) => {
                if (typeof nat.natServiceId === 'undefined') {
                    return undefined;
                }

                if (typeof nat.publicIps !== 'undefined') {
                    for (const publicIp of nat.publicIps) {
                        if (typeof publicIp.publicIpId === 'undefined') {
                            continue;
                        }
                        publicIpIds.push(publicIp.publicIpId);
                    }
                }

                return new ResourceNode(this.profile, "", nat.natServiceId, "NatService", deleteNatService, getNatService);
            });
            resourceToDelete.push(...res);
        }

        // Routes Tables
        const rts = await getRouteTables(this.profile, { netIds: [this.resourceId] });
        if (typeof rts === "string") {
            outputChannel.appendLine(rts);
        } else {
            const res = rts.map((rt) => {
                if (typeof rt.routeTableId === 'undefined') {
                    return undefined;
                }

                return new RouteTableResourceNode(this.profile, "", rt.routeTableId, "");
            });
            resourceToDelete.push(...res);
        }

        // Security groups Rules (delete with Security Groups)

        // Security group
        const sgs = await getSecurityGroups(this.profile, { netIds: [this.resourceId] });
        if (typeof sgs === "string") {
            outputChannel.appendLine(sgs);
        } else {
            const res = sgs.map((sg) => {
                if (typeof sg.securityGroupId === 'undefined') {
                    return undefined;
                }
                return new SecurityGroupResourceNode(this.profile, "", sg.securityGroupId);
            });
            resourceToDelete.push(...res);
        }

        // Virtual Gateways
        const vgs = await getVirtualGateways(this.profile, { linkNetIds: [this.resourceId] });
        const vgsIds: string[] = [];
        if (typeof vgs === "string") {
            outputChannel.appendLine(vgs);
        } else {
            const res = vgs.map((vg) => {
                if (typeof vg.virtualGatewayId === 'undefined') {
                    return undefined;
                }
                vgsIds.push(vg.virtualGatewayId);
                return new VirtualGatewayResourceNode(this.profile, "", vg.virtualGatewayId);
            });
            resourceToDelete.push(...res);
        }

        // Nics
        const nics = await getNics(this.profile, { netIds: [this.resourceId] });
        if (typeof nics === "string") {
            outputChannel.appendLine(nics);
        } else {
            const res = nics.map((nic) => {
                if (typeof nic.nicId === 'undefined') {
                    return undefined;
                }

                if (typeof nic.linkPublicIp !== 'undefined' && typeof nic.linkPublicIp.publicIpId !== 'undefined') {
                    publicIpIds.push(nic.linkPublicIp.publicIpId);
                }

                return new NicResourceNode(this.profile, "", nic.nicId, "");
            });
            resourceToDelete.push(...res);
        }

        // Subnets
        const subnets = await getSubnets(this.profile, { netIds: [this.resourceId] });
        if (typeof subnets === "string") {
            outputChannel.appendLine(subnets);
        } else {
            const res = subnets.map((subnet) => {
                if (typeof subnet.subnetId === 'undefined') {
                    return undefined;
                }

                return new ResourceNode(this.profile, "", subnet.subnetId, "Subnet", deleteSubnet, getSubnet);
            });
            resourceToDelete.push(...res);
        }

        // Internet Services
        const iss = await getInternetServices(this.profile, { linkNetIds: [this.resourceId] });
        if (typeof iss === "string") {
            outputChannel.appendLine(iss);
        } else {
            const res = iss.map((is) => {
                if (typeof is.internetServiceId === 'undefined') {
                    return undefined;
                }

                return new InternetServiceResourceNode(this.profile, "", is.internetServiceId, "");
            });
            resourceToDelete.push(...res);
        }

        // VPN Connections (Virtualgateway ou client gateway)
        const vpns = await getVpnConnections(this.profile, { virtualGatewayIds: vgsIds });
        if (typeof vpns === "string") {
            outputChannel.appendLine(vpns);
        } else {
            const res = vpns.map((vpn) => {
                if (typeof vpn.vpnConnectionId === 'undefined') {
                    return undefined;
                }

                return new ResourceNode(this.profile, "", vpn.vpnConnectionId, "VpnConnection", deleteVpnConnection, getVpnConnection);
            });
            resourceToDelete.push(...res);
        }

        //PublicIP
        const ips = publicIpIds.map((ip) => new ResourceNode(this.profile, "", ip, "eips", deleteExternalIP, getExternalIP));
        resourceToDelete.push(...ips);

        // Net
        resourceToDelete.push(this);

        const res = await vscode.window.withProgress({ title: vscode.l10n.t("Teardown Net '{0}'", this.resourceId), location: vscode.ProgressLocation.Notification, cancellable: true }, async (p, token) => {
            while (resourceToDelete.length !== 0) {
                p.report({ message: vscode.l10n.t("{0} resources to clean...", resourceToDelete.length) });
                const nextRoundToDelete = [];
                for (const resource of resourceToDelete) {
                    if (token.isCancellationRequested) {
                        return vscode.l10n.t("Cancelled by the user");
                    }

                    if (typeof resource === 'undefined') {
                        continue;
                    }
                    p.report({
                        message: vscode.l10n.t("Cleaning {0}...", resource.resourceId)
                    });
                    const res = await resource.deleteResource();
                    if (typeof res === 'string') {
                        // Check that the resource is still present
                        p.report({ message: vscode.l10n.t("Error while cleaning {0}: {1}", resource.resourceId, res) });
                        nextRoundToDelete.push(resource);
                    } else {
                        p.report({ message: vscode.l10n.t("Succeed to clean {0}", resource.resourceId) });
                    }
                }
                resourceToDelete = nextRoundToDelete;
                if (resourceToDelete.length > 0) {
                    p.report({ message: vscode.l10n.t("{0} resources to clean...", resourceToDelete.length) });
                    await new Promise(f => setTimeout(f, 5000));
                }
            }
            return undefined;
        });

        return Promise.resolve(res);
    }




}