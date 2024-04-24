import * as vscode from 'vscode';
import * as path from 'path';
import { Profile } from '../flat/node';
import { CytoscapeNode, CytoscapeNodeData } from './types';
import { getAllNetResources } from '../cloud/nets';
import { showResourceDetails } from '../extension';



// Main globals
let panel: vscode.WebviewPanel | undefined;
let extensionPath: string;
let resource: string | undefined;
let client: Profile | undefined;


export async function init(profile: Profile, resourceId: string, context: vscode.ExtensionContext) {
    resource = resourceId;
    client = profile;
    extensionPath = context.extensionPath;
    // Create the panel (held globally)
    panel = vscode.window.createWebviewPanel(
        `osc-viewer-network-view-${resourceId}`,
        `Network View of Net '${resourceId}'`,
        {
            preserveFocus: false,
            viewColumn: vscode.ViewColumn.Active
        },
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'assets'))],
            retainContextWhenHidden: true
        },
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(
        message => {
            // Initial load of content, done at startup
            if (message.command === 'initialized') {
                sendData();
            }

            // Message from webview - user clicked 'Filters' button
            if (message.command === 'exportPNG') {
                savePNG(message.payload);
            }

            // Message from webview - user clicked 'Filters' button
            if (message.command === 'showDetails') {
                showResourceDetails(profile.name, message.payload.resourceType, message.payload.resourceId);
            }

        },
        undefined,
        context.subscriptions,
    );
}

async function retrieveData(): Promise<CytoscapeNode[] | string | undefined> {
    if (typeof resource === 'undefined') {
        return "The Net is not defined";
    }
    if (typeof client === 'undefined') {
        return "The client is not defined";
    }

    // Read The net
    const data: CytoscapeNode[] = [];

    const net = await getAllNetResources(client, resource);
    if (typeof net === 'string') {
        return net;
    }

    // AZ
    const azs = new Map<string, CytoscapeNode>();

    // Subnets
    net.subnets.forEach((subnet) => {
        if (typeof subnet.subnetId === 'undefined') {
            return undefined;
        }

        if (typeof subnet.subregionName === 'undefined') {
            return undefined;
        }

        if (!azs.has(subnet.subregionName)) {
            azs.set(subnet.subregionName, {
                data: {
                    id: subnet.subregionName,
                    label: subnet.subregionName,
                    color: '#c3c5c7',
                    showDetails: false
                },
                group: 'nodes'
            });
        }
        data.push({
            data: {
                id: subnet.subnetId,
                label: subnet.subnetId,
                parent: subnet.subregionName,
                color: '#e6f2f8',
                showDetails: true,
                resourceId: subnet.subnetId,
                type: 'Subnet'

            },
            group: 'nodes'
        });
    });

    data.push(...azs.values());


    // VMs
    const vmGroups = new Map<string, { node: CytoscapeNodeData, refNumber: number }>();
    net.vms.forEach((vm) => {
        if (typeof vm.vmId === 'undefined') {
            return undefined;
        }
        if (typeof vm.subnetId === 'undefined') {
            return undefined;
        }
        const node = vmGroups.get(vm.subnetId);
        if (typeof node === 'undefined') {
            vmGroups.set(vm.subnetId, {
                node: {
                    id: 'vmgroup-' + vm.subnetId,
                    label: "",
                    parent: vm.subnetId,
                    showDetails: false,
                },
                refNumber: 1
            });
        } else {
            node.refNumber += 1;
        }
        data.push({
            data: {
                id: vm.vmId,
                label: vm.vmId,
                parent: 'vmgroup-' + vm.subnetId,
                img: 'design/VM@2x.png',
                showDetails: true,
                resourceId: vm.vmId,
                type: 'vms'
            },
            group: 'nodes'
        });

    });
    for (const entry of vmGroups.values()) {

        if (entry.refNumber > 5) {
            entry.node.collapse = true;
        }

        data.push({
            group: 'nodes',
            data: entry.node
        });
    }

    // Route Tables
    net.routeTables.forEach((rt) => {
        if (typeof rt.routeTableId === 'undefined') {
            return undefined;
        }

        const rtEl: string[] = [];
        if (typeof rt.linkRouteTables === 'undefined') {
            rtEl.push(rt.routeTableId);
            data.push({
                data: {
                    id: rt.routeTableId,
                    label: rt.routeTableId,
                    parent: rt.netId,
                    img: 'design/Routetable@2x.png',
                    showDetails: true,
                    resourceId: rt.routeTableId,
                    type: 'routetables'
                },
                group: 'nodes'
            });
        } else {
            let count = 0;
            for (const link of rt.linkRouteTables) {
                rtEl.push(rt.routeTableId + count);
                data.push({
                    data: {
                        id: rt.routeTableId + count,
                        label: rt.routeTableId,
                        parent: typeof link.subnetId === 'undefined' ? rt.netId : link.subnetId,
                        img: 'design/Routetable@2x.png',
                        showDetails: true,
                        resourceId: rt.routeTableId,
                        type: 'routetables'
                    },
                    group: 'nodes'
                });
                count += 1;
            }

        }

        if (typeof rt.routes !== 'undefined') {
            rt.routes.forEach((route) => {
                // Looking for IS
                if (typeof route.gatewayId !== 'undefined') {
                    const gatewayId = route.gatewayId;
                    rtEl.forEach((rtId) => {
                        // Skip the local gateway
                        if (gatewayId === "local") {
                            return;
                        }
                        data.push({
                            data: {
                                id: 'routes' + rtId + route.gatewayId,
                                source: rtId,
                                target: gatewayId,
                                label: '' + route.destinationIpRange,
                                edgeType: 'bezier'
                            },
                            group: 'edges'
                        });
                    });
                }

                // Looking for Nat
                if (typeof route.natServiceId !== 'undefined') {
                    const natServiceId = route.natServiceId;
                    rtEl.forEach((rtId) => {
                        data.push({
                            data: {
                                id: 'routes' + rtId + route.natServiceId,
                                source: rtId,
                                target: natServiceId,
                                label: '' + route.destinationIpRange,
                                edgeType: 'bezier'
                            },
                            group: 'edges'
                        });
                    });
                }
            });
        }


    });

    // NAT Services
    net.nats.forEach((nat) => {
        if (typeof nat.natServiceId === 'undefined') {
            return undefined;
        }

        data.push({
            data: {
                id: nat.natServiceId,
                label: nat.natServiceId,
                parent: nat.subnetId,
                img: 'design/NatGateway@2x.png',
                showDetails: true,
                resourceId: nat.natServiceId,
                type: 'NatService'
            },
            group: 'nodes'
        });
    });

    // LBUs
    net.loadbalancers.forEach((lbu) => {
        if (typeof lbu.loadBalancerName === 'undefined') {
            return undefined;
        }
        data.push({
            data: {
                id: lbu.loadBalancerName,
                label: lbu.loadBalancerName,
                parent: typeof lbu.subnets === 'undefined' ? lbu.netId : lbu.subnets[0],
                img: 'design/Loadbalance@2x.png',
                showDetails: true,
                resourceId: lbu.loadBalancerName,
                type: 'loadbalancers'
            },
            group: 'nodes'
        });

        if (typeof lbu.backendVmIds !== 'undefined') {
            for (const backend of lbu.backendVmIds) {
                data.push({
                    data: {
                        id: lbu.loadBalancerName + backend,
                        source: lbu.loadBalancerName,
                        target: backend,
                        label: '',
                        edgeType: 'bezier'
                    },
                    group: 'edges',
                });
            }
        }

    });

    // Internet Services
    net.internetServices.forEach((is) => {
        if (typeof is.internetServiceId === 'undefined') {
            return undefined;
        }

        data.push({
            data: {
                id: is.internetServiceId,
                label: is.internetServiceId,
                parent: is.netId,
                img: 'design/InternetService@2x.png',
                showDetails: true,
                resourceId: is.internetServiceId,
                type: 'InternetService'
            },
            group: 'nodes'
        });
    });

    // Net access point
    net.netAccessPoints.forEach((nap) => {
        if (typeof nap.netAccessPointId === 'undefined') {
            return undefined;
        }

        data.push({
            data: {
                id: nap.netAccessPointId,
                label: nap.netAccessPointId,
                parent: nap.netId,
                img: 'design/VPCEndpoint@2x.png',
                showDetails: true,
                resourceId: nap.netAccessPointId,
                type: 'NetAccessPoint'
            },
            group: 'nodes'
        });
    });

    // VGW
    net.virtualGateways.forEach((vgw) => {
        if (typeof vgw.virtualGatewayId === 'undefined') {
            return undefined;
        }

        data.push({
            data: {
                id: vgw.virtualGatewayId,
                label: vgw.virtualGatewayId,
                img: 'design/VirtualPrivateGateway@2x.png',
                showDetails: true,
                resourceId: vgw.virtualGatewayId,
                type: 'VirtualGateway'
            },
            group: 'nodes'
        });
    });


    return data;

}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function savePNG(data: any) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const saveAs = await vscode.window.showSaveDialog({ saveLabel: 'Save PNG', filters: { Images: ['png'] } });
    if (saveAs) {
        const buf = Buffer.from(data, 'base64');
        vscode.workspace.fs.writeFile(saveAs, buf);
    }
}

async function sendData() {
    const data = await retrieveData();

    if (typeof panel === 'undefined') {
        return;
    }
    panel.webview.postMessage({ command: 'newData', payload: data });
}


function getWebviewContent(): string {
    // Just in case, shouldn't happen
    if (!panel) {
        return '';
    }

    const assetsPath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, 'assets')));
    const iconThemeBase = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(extensionPath, 'assets', 'img')),
    ).toString();

    return `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
      <script src="${assetsPath}/js/vendor/jquery-3.4.1.slim.min.js"></script>
      <script src="${assetsPath}/js/vendor/cytoscape-3.23.0.min.js"></script>
      <script src="${assetsPath}/js/vendor/layout-base.js"></script>
      <script src="${assetsPath}/js/vendor/dagre-0.7.4.min.js"></script>
      <script src="${assetsPath}/js/vendor/cytoscape-dagre-2.5.0.js"></script>
      <script src="${assetsPath}/js/vendor/collapse-4.1.0.js"></script>
      <script src="${assetsPath}/js/vendor/navigator-2.0.2.js"></script>
    
      <script src="${assetsPath}/js/main.js"></script>
      <link href="${assetsPath}/css/main.css" rel="stylesheet" type="text/css">
      <link href="${assetsPath}/css/navigator.css" rel="stylesheet" type="text/css">
    
      <title>Osc Viewer</title>
    </head>
    
    <body>
      <div id="buttons">
        <button onclick="resize()" title="Zoom to fit"><img src="${assetsPath}/img/toolbar/fit.svg"><span class="lab">&nbsp;
            Zoom to fit</span></button>
        <button onclick="reLayout()" title="Relayout"><img src="${assetsPath}/img/toolbar/fit.svg"><span class="lab">&nbsp;
            Relayout</span></button>
        <button onclick="exportPNG()" title="Export view as PNG"><img src="${assetsPath}/img/toolbar/export.svg"><span
            class="lab">&nbsp; Export</span></button>
        <button onclick="showDetails()" title="Export view as PNG" id="details" disabled="true"><img src="${assetsPath}/img/toolbar/zoom-in.svg"><span
            class="lab">&nbsp; Show</span></button>
            <button onclick="toggleEdges()" title="Toggle Edges"><img src="${assetsPath}/img/toolbar/subtract-minus-remove.svg"><span class="lab">&nbsp; Edges</span></button>
      </div>
    
      <div class="loader"></div>
      <div id="mainview"></div>
    
      <script>
        init("${iconThemeBase}");
      </script>
    
    </body>
    
    </html>`;
}
