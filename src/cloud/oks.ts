import * as fetch from "cross-fetch";
import { Profile } from "../flat/node";

// The OKS control plane is a separate API (not part of outscale-api): its own host
// (api.<region>.oks.<host>/api/v2) and its own auth headers (AccessKey/SecretKey, no SigV4).

export interface OksClusterStatuses {
    status?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    created_at?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    updated_at?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    deleted_at?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    available_upgrade?: string;
}

// Mirrors the raw OKS API field names (snake_case) rather than remapping them, so the "Get"
// detail view matches what the OKS API itself documents field-for-field.
export interface OksCluster {
    id: string;
    name: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    project_id?: string;
    description?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    cp_multi_az?: boolean;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    cp_subregions?: Array<string>;
    version?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    expected_version?: string;
    cni?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    admin_lbu?: boolean;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    admission_flags?: any;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    cidr_pods?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    cidr_service?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    cluster_dns?: string;
    tags?: any;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    auto_maintenances?: any;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    maintenance_window?: any;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    control_planes?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    expected_control_planes?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    admin_whitelist?: Array<string>;
    statuses?: OksClusterStatuses;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    disable_api_termination?: boolean;
    auth?: any;
}

export function getOksEndpoint(profile: Profile): string {
    const protocol = profile.https ? "https" : "http";
    return `${protocol}://api.${profile.region}.oks.${profile.host}/api/v2`;
}

export function getOksHeaders(profile: Profile): Record<string, string> {
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        AccessKey: profile.accessKey,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        SecretKey: profile.secretKey,
    };
}

// Retrieve all items of the resource OksCluster
export async function getOksClusters(profile: Profile): Promise<Array<OksCluster> | string> {
    try {
        const res = await fetch.default(`${getOksEndpoint(profile)}/clusters/all`, {
            headers: getOksHeaders(profile)
        });
        if (!res.ok) {
            return `${res.status} ${res.statusText}`;
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const body: { Clusters?: Array<OksCluster> } = await res.json();
        return body.Clusters ?? [];
    } catch (err: any) {
        return err.toString();
    }
}

// Retrieve a specific item of the resource OksCluster
export async function getOksCluster(profile: Profile, resourceId: string): Promise<OksCluster | undefined | string> {
    const clusters = await getOksClusters(profile);
    if (typeof clusters === "string") {
        return clusters;
    }
    return clusters.find(cluster => cluster.id === resourceId);
}

export interface OksProject {
    id: string;
    name: string;
}

// Retrieve all projects, so a project_id can be resolved to its human-readable name (the OKS
// API's Cluster object only carries the id, not the name).
export async function getOksProjects(profile: Profile): Promise<Array<OksProject> | string> {
    try {
        const res = await fetch.default(`${getOksEndpoint(profile)}/projects`, {
            headers: getOksHeaders(profile)
        });
        if (!res.ok) {
            return `${res.status} ${res.statusText}`;
        }
        const body: any = await res.json();
        return Array.isArray(body) ? body : (body.Projects ?? body.projects ?? []);
    } catch (err: any) {
        return err.toString();
    }
}

// Cluster deletion is not wired up yet (OKS view is read-only for now); kept as a placeholder
// so OksClusterResourceNode can satisfy the ResourceNode interface's required deleteFunc.
export async function deleteOksClusterUnsupported(): Promise<string | undefined> {
    return "Deleting OKS clusters is not supported yet";
}

// Node pools, generic Kubernetes resource browsing, and Helm releases all live in kube.ts —
// they go through kubectl/helm against the cluster's own API server rather than this OKS
// control-plane REST API. See kube.ts for why (VS Code's extension host breaks in-process
// custom-CA TLS) and getOksKubeconfigYaml below, which kube.ts builds on.

// Retrieve the raw kubeconfig YAML for a cluster (GET /clusters/{id}/kubeconfig, confirmed in
// the OKS OpenAPI spec). Wrapped in an object (rather than returning a bare string) so a
// successful result can't be confused with the string-typed error case used throughout this file.
export async function getOksKubeconfigYaml(profile: Profile, clusterId: string): Promise<{ yaml: string } | string> {
    try {
        const res = await fetch.default(`${getOksEndpoint(profile)}/clusters/${clusterId}/kubeconfig`, {
            headers: getOksHeaders(profile)
        });
        if (!res.ok) {
            return `${res.status} ${res.statusText}`;
        }
        const body: any = await res.json();
        const yaml = body?.Cluster?.data?.kubeconfig ?? body?.Cluster?.kubeconfig ?? body?.kubeconfig;
        if (typeof yaml !== "string") {
            return "Could not find kubeconfig content in the API response";
        }
        return { yaml };
    } catch (err: any) {
        return err.toString();
    }
}
