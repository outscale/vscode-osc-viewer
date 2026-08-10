import * as vscode from 'vscode';
import * as path from 'path';
import { Profile } from '../flat/node';
import { CytoscapeNode, CytoscapeNodeData } from './types';
import { getKubeObjects, kubeObjectCompositeId } from '../cloud/kube';
import { showResourceDetails } from '../extension';
import { getConfigurationParameter } from '../configuration/utils';
import { getGraphWebviewContent } from './webviewshell';

// Mirrors networkview.ts's structure closely (webview lifecycle, live refresh, dashboard
// messaging) but visualizes an OKS cluster's Nodes (grouped by zone) and Pods (placed under the
// Node they're scheduled on) instead of a Net's VPC resources.

let panel: vscode.WebviewPanel | undefined;
let extensionPath: string;
let cluster: string | undefined;
let client: Profile | undefined;

const MIN_LIVE_REFRESH_INTERVAL = 5;
const DEFAULT_LIVE_REFRESH_INTERVAL = 15;
let liveEnabled = false;
let liveInterval = DEFAULT_LIVE_REFRESH_INTERVAL;
let liveTimer: ReturnType<typeof setTimeout> | undefined;

export async function init(profile: Profile, clusterId: string, clusterName: string, context: vscode.ExtensionContext) {
    cluster = clusterId;
    client = profile;
    extensionPath = context.extensionPath;

    liveEnabled = getConfigurationParameter<boolean>('oksView.liveRefresh.enabled') ?? false;
    const configuredInterval = getConfigurationParameter<number>('oksView.liveRefresh.interval');
    liveInterval = (typeof configuredInterval === 'number' && configuredInterval >= MIN_LIVE_REFRESH_INTERVAL)
        ? configuredInterval : DEFAULT_LIVE_REFRESH_INTERVAL;

    panel = vscode.window.createWebviewPanel(
        `osc-viewer-oks-view-${clusterId}`,
        `OKS View of Cluster '${clusterName.length > 0 ? clusterName : clusterId}'`,
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

    panel.webview.html = getGraphWebviewContent(panel, extensionPath);

    panel.webview.onDidReceiveMessage(
        message => {
            if (message.command === 'initialized') {
                sendData();
                if (liveEnabled) {
                    startLiveRefresh();
                }
            }

            if (message.command === 'exportPNG') {
                savePNG(message.payload);
            }

            if (message.command === 'showDetails') {
                showResourceDetails(profile.name, message.payload.resourceType, message.payload.resourceId);
            }

            if (message.command === 'toggleLive') {
                liveEnabled = !!message.payload.enabled;
                if (liveEnabled) {
                    startLiveRefresh();
                } else {
                    stopLiveRefresh();
                }
            }
        },
        undefined,
        context.subscriptions,
    );

    panel.onDidDispose(() => {
        stopLiveRefresh();
        panel = undefined;
    }, undefined, context.subscriptions);
}

function startLiveRefresh() {
    stopLiveRefresh();
    liveTimer = setTimeout(async function tick() {
        await sendData();
        liveTimer = setTimeout(tick, 1000 * liveInterval);
    }, 1000 * liveInterval);
}

function stopLiveRefresh() {
    if (typeof liveTimer !== 'undefined') {
        clearTimeout(liveTimer);
        liveTimer = undefined;
    }
}

function nodeReadyState(node: any): string | undefined {
    const readyCondition = (node.status?.conditions ?? []).find((c: any) => c.type === 'Ready');
    if (typeof readyCondition === 'undefined') {
        return undefined;
    }
    return readyCondition.status === 'True' ? 'running' : 'stopped';
}

function podPhaseState(pod: any): string | undefined {
    const phase = pod.status?.phase;
    switch (phase) {
        case 'Running':
        case 'Succeeded':
            return 'running';
        case 'Pending':
            return 'pending';
        case 'Failed':
        case 'Unknown':
            return 'stopped';
        default:
            return undefined;
    }
}

async function retrieveData(): Promise<CytoscapeNode[] | string | undefined> {
    if (typeof cluster === 'undefined') {
        return "The cluster is not defined";
    }
    if (typeof client === 'undefined') {
        return "The client is not defined";
    }

    const data: CytoscapeNode[] = [];

    const nodes = await getKubeObjects(client, cluster, 'nodes', false);
    if (typeof nodes === 'string') {
        return nodes;
    }
    const pods = await getKubeObjects(client, cluster, 'pods', true);
    if (typeof pods === 'string') {
        return pods;
    }

    // Zone groups (like the Net view's AZ groups)
    const zones = new Map<string, CytoscapeNode>();

    nodes.forEach((node) => {
        const name = node.metadata?.name;
        if (typeof name === 'undefined') {
            return;
        }
        const zone = node.metadata?.labels?.['topology.kubernetes.io/zone'] ?? 'unknown';
        if (!zones.has(zone)) {
            zones.set(zone, {
                data: {
                    id: `zone-${zone}`,
                    label: zone,
                    color: '#c3c5c7',
                    showDetails: false
                },
                group: 'nodes'
            });
        }
        data.push({
            data: {
                id: name,
                label: name,
                parent: `zone-${zone}`,
                color: '#e8edfb',
                shape: 'round-rectangle',
                showDetails: true,
                resourceId: kubeObjectCompositeId(cluster as string, 'nodes', '', name),
                type: 'KubeObject',
                state: nodeReadyState(node)
            },
            group: 'nodes'
        });
    });
    data.push(...zones.values());

    // Pods, grouped (and collapsed if many) under the Node they're scheduled on. Unscheduled
    // pods (no nodeName yet) go under a synthetic "Unscheduled" parent instead of being dropped.
    const podGroups = new Map<string, { node: CytoscapeNodeData, refNumber: number }>();
    let hasUnscheduled = false;

    pods.forEach((pod) => {
        const name = pod.metadata?.name;
        const namespace = pod.metadata?.namespace;
        if (typeof name === 'undefined' || typeof namespace === 'undefined') {
            return;
        }
        const nodeName = pod.spec?.nodeName;
        const parentId = typeof nodeName === 'string' ? nodeName : 'unscheduled';
        if (typeof nodeName !== 'string') {
            hasUnscheduled = true;
        }

        const groupId = 'podgroup-' + parentId;
        const group = podGroups.get(parentId);
        if (typeof group === 'undefined') {
            podGroups.set(parentId, {
                node: {
                    id: groupId,
                    label: "",
                    parent: parentId,
                    showDetails: false,
                },
                refNumber: 1
            });
        } else {
            group.refNumber += 1;
        }

        data.push({
            data: {
                id: `${namespace}/${name}`,
                label: name,
                parent: groupId,
                // Kubernetes-blue hexagon, smaller than the default 128px: pods are numerous
                // and this reads as a cluster of small hexagons rather than oversized boxes.
                color: '#c9d6f7',
                shape: 'hexagon',
                size: '56px',
                showDetails: true,
                resourceId: kubeObjectCompositeId(cluster as string, 'pods', namespace, name),
                type: 'KubeObject',
                state: podPhaseState(pod)
            },
            group: 'nodes'
        });
    });

    if (hasUnscheduled) {
        data.push({
            data: {
                id: 'unscheduled',
                label: 'Unscheduled',
                color: '#f2d891',
                showDetails: false
            },
            group: 'nodes'
        });
    }

    for (const entry of podGroups.values()) {
        if (entry.refNumber > 5) {
            entry.node.collapse = true;
        }
        data.push({
            group: 'nodes',
            data: entry.node
        });
    }

    // Network flow: Service -> Pod (via Endpoints, the actual backing-pod list — not
    // reimplementing label-selector matching), Ingress -> Service (via its backend refs), and a
    // synthetic Internet node feeding Ingresses and any LoadBalancer-type Service. This is the
    // real, K8s-native path traffic takes to reach a pod; raw NetworkPolicy-based pod-to-pod
    // edges were deliberately left out — without a policy every pod can already reach every pod,
    // and drawing that would just be a dense, meaningless complete graph.
    const services = await getKubeObjects(client, cluster, 'services', true);
    if (typeof services === 'string') {
        return services;
    }
    const endpoints = await getKubeObjects(client, cluster, 'endpoints', true);
    if (typeof endpoints === 'string') {
        return endpoints;
    }
    const ingresses = await getKubeObjects(client, cluster, 'ingresses', true);
    if (typeof ingresses === 'string') {
        return ingresses;
    }

    let needsInternetNode = false;

    const serviceToPods = new Map<string, Set<string>>();
    endpoints.forEach((ep) => {
        const namespace = ep.metadata?.namespace;
        const name = ep.metadata?.name;
        if (typeof namespace === 'undefined' || typeof name === 'undefined') {
            return;
        }
        const podIds = new Set<string>();
        (ep.subsets ?? []).forEach((subset: any) => {
            (subset.addresses ?? []).forEach((addr: any) => {
                if (addr.targetRef?.kind === 'Pod' && typeof addr.targetRef.name === 'string') {
                    podIds.add(`${namespace}/${addr.targetRef.name}`);
                }
            });
        });
        serviceToPods.set(`${namespace}/${name}`, podIds);
    });

    services.forEach((svc) => {
        const namespace = svc.metadata?.namespace;
        const name = svc.metadata?.name;
        if (typeof namespace === 'undefined' || typeof name === 'undefined') {
            return;
        }
        const serviceId = `svc:${namespace}/${name}`;
        data.push({
            data: {
                id: serviceId,
                label: name,
                color: '#d4f0ec',
                shape: 'ellipse',
                showDetails: true,
                resourceId: kubeObjectCompositeId(cluster as string, 'services', namespace, name),
                type: 'KubeObject',
            },
            group: 'nodes'
        });

        (serviceToPods.get(`${namespace}/${name}`) ?? new Set()).forEach((podId) => {
            data.push({
                data: {
                    id: `edge-${serviceId}-${podId}`,
                    source: serviceId,
                    target: podId,
                    label: '',
                    edgeType: 'bezier'
                },
                group: 'edges'
            });
        });

        if (svc.spec?.type === 'LoadBalancer') {
            needsInternetNode = true;
            data.push({
                data: {
                    id: `edge-internet-${serviceId}`,
                    source: 'internet',
                    target: serviceId,
                    label: '',
                    edgeType: 'bezier'
                },
                group: 'edges'
            });
        }
    });

    ingresses.forEach((ing) => {
        const namespace = ing.metadata?.namespace;
        const name = ing.metadata?.name;
        if (typeof namespace === 'undefined' || typeof name === 'undefined') {
            return;
        }
        const ingressId = `ing:${namespace}/${name}`;
        needsInternetNode = true;

        data.push({
            data: {
                id: ingressId,
                label: name,
                color: '#e8dff5',
                shape: 'diamond',
                showDetails: true,
                resourceId: kubeObjectCompositeId(cluster as string, 'ingresses', namespace, name),
                type: 'KubeObject',
            },
            group: 'nodes'
        });
        data.push({
            data: {
                id: `edge-internet-${ingressId}`,
                source: 'internet',
                target: ingressId,
                label: '',
                edgeType: 'bezier'
            },
            group: 'edges'
        });

        const backendServiceNames = new Set<string>();
        (ing.spec?.rules ?? []).forEach((rule: any) => {
            (rule.http?.paths ?? []).forEach((p: any) => {
                const svcName = p.backend?.service?.name;
                if (typeof svcName === 'string') {
                    backendServiceNames.add(svcName);
                }
            });
        });
        const defaultBackendService = ing.spec?.defaultBackend?.service?.name;
        if (typeof defaultBackendService === 'string') {
            backendServiceNames.add(defaultBackendService);
        }

        backendServiceNames.forEach((svcName) => {
            data.push({
                data: {
                    id: `edge-${ingressId}-svc:${namespace}/${svcName}`,
                    source: ingressId,
                    target: `svc:${namespace}/${svcName}`,
                    label: '',
                    edgeType: 'bezier'
                },
                group: 'edges'
            });
        });
    });

    if (needsInternetNode) {
        data.push({
            data: {
                id: 'internet',
                label: 'Internet',
                color: '#f5c451',
                shape: 'ellipse',
                showDetails: false,
            },
            group: 'nodes'
        });
    }

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
    panel.webview.postMessage({ command: 'newData', payload: data, lastUpdated: Date.now(), live: liveEnabled });
}
