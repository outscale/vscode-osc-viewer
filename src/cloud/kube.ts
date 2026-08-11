import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { Profile } from "../flat/node";
import { shell } from "../components/shell";
import { getOksKubeconfigYaml } from "./oks";

// Generic Kubernetes resource browsing (namespaces, nodes, workloads, network, storage,
// configuration, custom resources, Helm releases) for an OKS cluster. Everything here goes
// through kubectl/helm against the cluster's own API server, using the same kubeconfig-fetch +
// shell-out approach established in oks.ts for node pools (see the note there on why: VS Code's
// extension host patches https in a way that breaks in-process custom-CA TLS).

interface CachedKubeconfig {
    path: string;
    expiresAt: number;
}

// Fetching+writing a kubeconfig on every single tree click would be slow and hammer the OKS
// control-plane API; cache the temp file per cluster for a while (well under the multi-day token
// expiry the OKS API issues) and reuse it across a browsing session.
const KUBECONFIG_CACHE_MS = 10 * 60 * 1000;
const kubeconfigCache = new Map<string, CachedKubeconfig>();

async function getCachedKubeconfigPath(profile: Profile, clusterId: string): Promise<{ path: string } | string> {
    const cacheKey = `${profile.name}:${clusterId}`;
    const cached = kubeconfigCache.get(cacheKey);
    if (typeof cached !== "undefined" && cached.expiresAt > Date.now() && fs.existsSync(cached.path)) {
        return { path: cached.path };
    }

    const kubeconfigResult = await getOksKubeconfigYaml(profile, clusterId);
    if (typeof kubeconfigResult === "string") {
        return kubeconfigResult;
    }

    // Contains a private key: 0600, and cleaned up on extension deactivation (see
    // cleanupCachedKubeconfigs, called from extension.ts).
    const kubeconfigPath = path.join(os.tmpdir(), `osc-viewer-kubeconfig-${crypto.randomUUID()}.yaml`);
    fs.writeFileSync(kubeconfigPath, kubeconfigResult.yaml, { mode: 0o600 });
    kubeconfigCache.set(cacheKey, { path: kubeconfigPath, expiresAt: Date.now() + KUBECONFIG_CACHE_MS });
    return { path: kubeconfigPath };
}

export function cleanupCachedKubeconfigs() {
    for (const cached of kubeconfigCache.values()) {
        if (fs.existsSync(cached.path)) {
            fs.unlinkSync(cached.path);
        }
    }
    kubeconfigCache.clear();
}

// A full --all-namespaces JSON dump (Pods, ConfigMaps, ...) on a busy cluster can comfortably
// exceed Node's 1MB default child_process.exec buffer.
const KUBECTL_MAX_BUFFER = 64 * 1024 * 1024;

// kubectlArgs is a real argv array, passed straight through to execFile (no shell involved) —
// namespace/kind/name values coming from a URI-derived composite id can never be interpreted as
// shell syntax this way, unlike building a command string and running it via a shell.
async function kubectlGetJson(profile: Profile, clusterId: string, kubectlArgs: string[]): Promise<any | string> {
    if (shell.which("kubectl") === null) {
        return "kubectl was not found on your PATH";
    }
    const kubeconfig = await getCachedKubeconfigPath(profile, clusterId);
    if (typeof kubeconfig === "string") {
        return kubeconfig;
    }
    try {
        const output = await shell.execFile("kubectl", ["--kubeconfig", kubeconfig.path, ...kubectlArgs, "-o", "json"], KUBECTL_MAX_BUFFER);
        return JSON.parse(output);
    } catch (err: any) {
        return err.toString();
    }
}

// Kube object shape is whatever the cluster returns for that kind (core types, or any CRD);
// deliberately untyped.
export interface KubeObject {
    [key: string]: any;
}

function redactSecretMapValues(map: any): any {
    if (typeof map !== "object" || map === null) {
        return map;
    }
    const redacted: any = {};
    for (const key of Object.keys(map)) {
        const value = String(map[key] ?? "");
        redacted[key] = `***REDACTED (${value.length} chars)***`;
    }
    return redacted;
}

// Secrets are shown with their values redacted by default: this is a new point-and-click way to
// view cluster resources, and accidentally screen-sharing/screenshotting a decoded-looking secret
// blob is a much easier mistake to make here than typing `kubectl get secret -o yaml` deliberately
// in a terminal, even though both ultimately rely on the same cluster access.
function redactIfSecret(kind: string, obj: KubeObject): KubeObject {
    if (kind !== "secret" && kind !== "secrets") {
        return obj;
    }
    return {
        ...obj,
        data: redactSecretMapValues(obj.data),
        stringData: redactSecretMapValues(obj.stringData),
    };
}

// List every object of a kind. namespaced kinds are listed across all namespaces (the namespace
// is shown per-object in the tree, rather than nesting a namespace picker).
export async function getKubeObjects(profile: Profile, clusterId: string, kind: string, namespaced: boolean): Promise<Array<KubeObject> | string> {
    const args = namespaced ? ["get", kind, "--all-namespaces"] : ["get", kind];
    const body = await kubectlGetJson(profile, clusterId, args);
    if (typeof body === "string") {
        return body;
    }
    const items: Array<KubeObject> = body.items ?? [];
    return items.map(item => redactIfSecret(kind, item));
}

async function getKubeObject(profile: Profile, clusterId: string, kind: string, namespace: string, name: string): Promise<KubeObject | string> {
    const args = namespace.length > 0 ? ["get", kind, name, "-n", namespace] : ["get", kind, name];
    const body = await kubectlGetJson(profile, clusterId, args);
    if (typeof body === "string") {
        return body;
    }
    return redactIfSecret(kind, body);
}

// The osc: virtual filesystem URI scheme only carries one resourceId, but a single kube object
// lookup needs clusterId/kind/namespace/name too. "::" is unambiguous since none of those four
// ever contain it (cluster ids are UUIDs, kinds/namespaces/names follow Kubernetes' DNS-1123
// naming rules — letters, digits, hyphens, dots only).
export function kubeObjectCompositeId(clusterId: string, kind: string, namespace: string, name: string): string {
    return [clusterId, kind, namespace, name].join("::");
}

export async function getKubeObjectByCompositeId(profile: Profile, compositeResourceId: string): Promise<KubeObject | string> {
    const parts = compositeResourceId.split("::");
    if (parts.length !== 4) {
        return "Malformed Kubernetes object resource id";
    }
    const [clusterId, kind, namespace, name] = parts;
    return getKubeObject(profile, clusterId, kind, namespace, name);
}

export async function deleteKubeObjectUnsupported(): Promise<string | undefined> {
    return "Deleting Kubernetes objects is not supported yet";
}

// Plain-text `kubectl logs` output (unlike the OSC VM console-log API, no base64 decoding
// needed). Reuses the same clusterId::kind::namespace::name composite id as
// getKubeObjectByCompositeId (the kind segment is ignored here, since it's always "pods").
export async function getPodLogs(profile: Profile, compositeResourceId: string): Promise<string> {
    const parts = compositeResourceId.split("::");
    if (parts.length !== 4) {
        return "Malformed pod resource id";
    }
    const [clusterId, , namespace, name] = parts;

    if (shell.which("kubectl") === null) {
        return "kubectl was not found on your PATH";
    }
    const kubeconfig = await getCachedKubeconfigPath(profile, clusterId);
    if (typeof kubeconfig === "string") {
        return kubeconfig;
    }
    try {
        return await shell.execFile("kubectl", ["--kubeconfig", kubeconfig.path, "logs", name, "-n", namespace, "--tail=1000"], KUBECTL_MAX_BUFFER);
    } catch (err: any) {
        return err.toString();
    }
}

// Best-effort one-line status for the tree's description column; kinds not covered here just
// show their namespace with no extra status text.
export function describeKubeObject(kind: string, obj: KubeObject): string | undefined {
    switch (kind) {
        case "pods":
            return obj.status?.phase;
        case "nodes": {
            const readyCondition = (obj.status?.conditions ?? []).find((c: any) => c.type === "Ready");
            return readyCondition?.status === "True" ? "Ready" : "NotReady";
        }
        case "deployments":
        case "statefulsets":
        case "daemonsets":
        case "replicasets": {
            const ready = obj.status?.readyReplicas ?? obj.status?.numberReady ?? 0;
            const total = obj.spec?.replicas ?? obj.status?.desiredNumberScheduled ?? obj.status?.replicas;
            return typeof total === "number" ? `${ready}/${total} ready` : undefined;
        }
        case "jobs":
            if (typeof obj.status?.succeeded === "number" && obj.status.succeeded > 0) {
                return "Completed";
            }
            return typeof obj.status?.active === "number" && obj.status.active > 0 ? "Running" : undefined;
        default:
            return undefined;
    }
}

// Custom resource definitions themselves, so a folder can be built per CRD.
export async function getCustomResourceDefinitions(profile: Profile, clusterId: string): Promise<Array<KubeObject> | string> {
    return getKubeObjects(profile, clusterId, "customresourcedefinitions", false);
}

// Helm releases: a different tool (helm, not kubectl) and a different JSON shape (a bare array,
// not {items: [...]}), so kept separate from the generic kube object helpers above.
export interface HelmRelease {
    [key: string]: any;
}

export async function getHelmReleases(profile: Profile, clusterId: string): Promise<Array<HelmRelease> | string> {
    if (shell.which("helm") === null) {
        return "helm was not found on your PATH";
    }
    const kubeconfig = await getCachedKubeconfigPath(profile, clusterId);
    if (typeof kubeconfig === "string") {
        return kubeconfig;
    }
    try {
        const output = await shell.execFile("helm", ["--kubeconfig", kubeconfig.path, "list", "--all-namespaces", "-o", "json"], KUBECTL_MAX_BUFFER);
        return JSON.parse(output);
    } catch (err: any) {
        return err.toString();
    }
}

export function helmReleaseCompositeId(clusterId: string, namespace: string, name: string): string {
    return [clusterId, namespace, name].join("::");
}

// `helm get all`'s `manifest` field is a string of concatenated `---`-separated rendered YAML
// documents (unlike native kube objects, which come back as structured JSON redactable key-by-key
// via redactIfSecret) — any Secret the chart deploys would otherwise show its decoded-looking
// values in the clear here. Scrub the data:/stringData: block of any `kind: Secret` document.
function redactSecretManifestBlocks(manifestText: string): string {
    return manifestText.split(/\n---\n/).map(doc => {
        if (!/^kind:\s*Secret\s*$/m.test(doc)) {
            return doc;
        }
        return doc.replace(/^(data|stringData):\n(?:[ \t]+.*\n?)*/gm, "$1: \"***REDACTED***\"\n");
    }).join("\n---\n");
}

export async function getHelmRelease(profile: Profile, compositeResourceId: string): Promise<HelmRelease | string> {
    const parts = compositeResourceId.split("::");
    if (parts.length !== 3) {
        return "Malformed Helm release resource id";
    }
    const [clusterId, namespace, name] = parts;

    if (shell.which("helm") === null) {
        return "helm was not found on your PATH";
    }
    const kubeconfig = await getCachedKubeconfigPath(profile, clusterId);
    if (typeof kubeconfig === "string") {
        return kubeconfig;
    }

    // `helm get all` has no -o/--output flag at all (confirmed live against a real cluster: it's
    // a fixed human-readable text report, not structured data) — build the equivalent from the
    // subcommands that actually support JSON, or that are plain text anyway (manifest/hooks
    // never had one to begin with).
    const baseArgs = ["--kubeconfig", kubeconfig.path];
    try {
        const [metadataOutput, manifest, hooks] = await Promise.all([
            shell.execFile("helm", [...baseArgs, "get", "metadata", name, "-n", namespace, "-o", "json"], KUBECTL_MAX_BUFFER),
            shell.execFile("helm", [...baseArgs, "get", "manifest", name, "-n", namespace], KUBECTL_MAX_BUFFER),
            // Hooks are also `---`-separated rendered manifests (e.g. a pre-install Job/Secret),
            // so they get the same Secret-block redaction as the main manifest below.
            shell.execFile("helm", [...baseArgs, "get", "hooks", name, "-n", namespace], KUBECTL_MAX_BUFFER),
        ]);
        return {
            ...JSON.parse(metadataOutput),
            manifest: redactSecretManifestBlocks(manifest),
            hooks: redactSecretManifestBlocks(hooks),
            // No structural marker distinguishes secret-bearing content from the rest of `values`
            // or `notes` (unlike manifest/hooks, where `kind: Secret` is reliable) — charts
            // commonly interpolate a generated password/token directly into NOTES.txt, so both
            // are omitted wholesale rather than risking exposing one, and not even fetched here.
            values: "*** values omitted (may contain secrets) — run `helm get values <name> -n <namespace>` to view ***",
            notes: "*** notes omitted (may contain secrets) — run `helm get notes <name> -n <namespace>` to view ***",
        };
    } catch (err: any) {
        return err.toString();
    }
}

export async function deleteHelmReleaseUnsupported(): Promise<string | undefined> {
    return "Deleting Helm releases is not supported yet";
}
