import * as vscode from 'vscode';
import { deleteLoadBalancer, getLoadBalancer } from "../../cloud/loadbalancers";
import { deleteNatService, getNatService } from "../../cloud/natservices";
import { deleteNetAccessPoint, getNetAccessPoint } from "../../cloud/netaccesspoints";
import { deleteNetPeering, getNetPeering } from '../../cloud/netpeerings';
import { deleteNet, getAllNetResources, getNet } from "../../cloud/nets";
import { deleteExternalIP, getExternalIP } from '../../cloud/publicips';
import { deleteSubnet, getSubnet } from "../../cloud/subnets";
import { deleteVpnConnection, getVpnConnection } from "../../cloud/vpnconnections";
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
        const net = await getAllNetResources(this.profile, this.resourceId);

        if (typeof net === 'string') {
            return net;
        }

        // VMs
        {
            const res = net.vms.map((vm) => {
                if (typeof vm.vmId === 'undefined') {
                    return undefined;
                }
                return new VmResourceNode(this.profile, "", vm.vmId, "", false);
            });
            resourceToDelete.push(...res);
        }

        // LBUs
        {
            const res = net.loadbalancers.map((lbu) => {
                if (typeof lbu.loadBalancerName === 'undefined') {
                    return undefined;
                }
                return new ResourceNode(this.profile, "", lbu.loadBalancerName, "loadbalancers", deleteLoadBalancer, getLoadBalancer);
            });
            resourceToDelete.push(...res);
        }

        // Net peering (check all source and target)
        // Sources
        {
            const res = net.sourceNetPeerings.map((netPeer) => {
                if (typeof netPeer.netPeeringId === 'undefined') {
                    return undefined;
                }
                return new ResourceNode(this.profile, "", netPeer.netPeeringId, "NetPeering", deleteNetPeering, getNetPeering);
            });
            resourceToDelete.push(...res);
        }

        {
            const res = net.accepterNetPeerings.map((netPeer) => {
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
        {
            const res = net.netAccessPoints.map((nap) => {
                if (typeof nap.netAccessPointId === 'undefined') {
                    return undefined;
                }

                return new ResourceNode(this.profile, "", nap.netAccessPointId, "NetAccessPoint", deleteNetAccessPoint, getNetAccessPoint);
            });
            resourceToDelete.push(...res);
        }

        // Routes (Deletion with route table)

        // Nat Services
        {
            const res = net.nats.map((nat) => {
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
        {
            const res = net.routeTables.map((rt) => {
                if (typeof rt.routeTableId === 'undefined') {
                    return undefined;
                }

                return new RouteTableResourceNode(this.profile, "", rt.routeTableId, "");
            });
            resourceToDelete.push(...res);
        }

        // Security groups Rules (delete with Security Groups)

        // Security group
        {
            const res = net.securityGroups.map((sg) => {
                if (typeof sg.securityGroupId === 'undefined') {
                    return undefined;
                }
                return new SecurityGroupResourceNode(this.profile, "", sg.securityGroupId);
            });
            resourceToDelete.push(...res);
        }

        // Virtual Gateways
        {
            const res = net.virtualGateways.map((vg) => {
                if (typeof vg.virtualGatewayId === 'undefined') {
                    return undefined;
                }
                return new VirtualGatewayResourceNode(this.profile, "", vg.virtualGatewayId);
            });
            resourceToDelete.push(...res);
        }

        // Nics
        {
            const res = net.nics.map((nic) => {
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
        {
            const res = net.subnets.map((subnet) => {
                if (typeof subnet.subnetId === 'undefined') {
                    return undefined;
                }

                return new ResourceNode(this.profile, "", subnet.subnetId, "Subnet", deleteSubnet, getSubnet);
            });
            resourceToDelete.push(...res);
        }

        // Internet Services
        {
            const res = net.internetServices.map((is) => {
                if (typeof is.internetServiceId === 'undefined') {
                    return undefined;
                }

                return new InternetServiceResourceNode(this.profile, "", is.internetServiceId, "");
            });
            resourceToDelete.push(...res);
        }

        // VPN Connections (Virtualgateway ou client gateway)
        {
            const res = net.vpnConnections.map((vpn) => {
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