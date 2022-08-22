import { ImageToJSON, KeypairToJSON, LoadBalancerToJSON, NetToJSON, PublicIpToJSON, SecurityGroupToJSON, SnapshotToJSON, VmToJSON, VolumeToJSON } from "outscale-api";
import { Disposable, Event, EventEmitter, FileChangeEvent, FilePermission, FileStat, FileSystemProvider, FileType, Uri } from "vscode";
import { getExternalIP } from "../cloud/eips";
import { getKeypair } from "../cloud/keypair";
import { getLoadBalancer } from "../cloud/loadbalancer";
import { getOMI } from "../cloud/omis";
import { getSecurityGroup } from "../cloud/securitygroups";
import { getSnapshot } from "../cloud/snapshots";
import { getVm } from "../cloud/vm";
import { getVolume } from "../cloud/volume";
import { getNet } from "../cloud/vpc";
import { getProfile } from "../config_file/utils";
import { Profile } from "../flat/node";


export class OscVirtualFileSystemProvider implements FileSystemProvider {

    private readonly onDidChangeFileEmitter: EventEmitter<FileChangeEvent[]> = new EventEmitter<FileChangeEvent[]>();

    onDidChangeFile: Event<FileChangeEvent[]> = this.onDidChangeFileEmitter.event;

    watch(_uri: Uri, _options: { recursive: boolean; excludes: string[] }): Disposable {
        // It would be quite neat to implement this to watch for changes
        // in the cluster and update the doc accordingly.  But that is very
        // definitely a future enhancement thing!
        return new Disposable(() => { });
    }

    stat(_uri: Uri): FileStat {
        return {
            type: FileType.File,
            ctime: Date.now(),
            mtime: Date.now(),
            permissions: FilePermission.Readonly,
            size: 65536  // These files don't seem to matter for us
        };
    }

    readDirectory(_uri: Uri): [string, FileType][] | Thenable<[string, FileType][]> {
        return [];
    }

    createDirectory(_uri: Uri): void | Thenable<void> {
        // no-op
    }

    readFile(uri: Uri): Uint8Array | Thenable<Uint8Array> {
        const pathSplit = uri.path.split("/");
        if (pathSplit.length !== 4) {
            throw new Error("malformed uri");
        }

        // Retrieve Profile
        const uriProfile = pathSplit[1];
        let profile = getProfile(uriProfile);

        // Retrieve the resource Type
        const resourceType = pathSplit[2];
        const resourceId = pathSplit[3];
        return this.readFileAsync(profile, resourceType, resourceId);
    }



    async readFileAsync(profile: Profile, resourceType: string, resourceId: string): Promise<Uint8Array> {
        const enc = new TextEncoder();
        switch (resourceType) {
            case "vms":
                const vm = await getVm(profile, resourceId);
                if (typeof vm === "string") {
                    throw new Error(vm);
                }
                return enc.encode(JSON.stringify(VmToJSON(vm), null, 4));
            case "vpc":
                const net = await getNet(profile, resourceId);
                if (typeof net === "string") {
                    throw new Error(net);
                }
                return enc.encode(JSON.stringify(NetToJSON(net), null, 4));
            case "securitygroups":
                const securitygroup = await getSecurityGroup(profile, resourceId);
                if (typeof securitygroup === "string") {
                    throw new Error(securitygroup);
                }
                return enc.encode(JSON.stringify(SecurityGroupToJSON(securitygroup), null, 4));
            case "keypairs":
                const keypair = await getKeypair(profile, resourceId);
                if (typeof keypair === "string") {
                    throw new Error(keypair);
                }
                return enc.encode(JSON.stringify(KeypairToJSON(keypair), null, 4));
            case "volumes":
                const volume = await getVolume(profile, resourceId);
                if (typeof volume === "string") {
                    throw new Error(volume);
                }
                return enc.encode(JSON.stringify(VolumeToJSON(volume), null, 4));
            case "loadbalancers":
                const lb = await getLoadBalancer(profile, resourceId);
                if (typeof lb === "string") {
                    throw new Error(lb);
                }
                return enc.encode(JSON.stringify(LoadBalancerToJSON(lb), null, 4));
            case "eips":
                const eip = await getExternalIP(profile, resourceId);
                if (typeof eip === "string") {
                    throw new Error(eip);
                }
                return enc.encode(JSON.stringify(PublicIpToJSON(eip), null, 4));
            case "omis":
                const omi = await getOMI(profile, resourceId);
                if (typeof omi === "string") {
                    throw new Error(omi);
                }
                return enc.encode(JSON.stringify(ImageToJSON(omi), null, 4));
            case "snapshots":
                const sp = await getSnapshot(profile, resourceId);
                if (typeof sp === "string") {
                    throw new Error(sp);
                }
                return enc.encode(JSON.stringify(SnapshotToJSON(sp), null, 4));
            default:
                break;
        }
        throw new Error("failed");
    }

    async loadResource(uri: Uri): Promise<string> {
        console.log(uri);
        return "toto";
    }

    writeFile(uri: Uri, content: Uint8Array, _options: { create: boolean; overwrite: boolean }): void | Thenable<void> {
        // no-op
    }


    delete(_uri: Uri, _options: { recursive: boolean }): void | Thenable<void> {
        // no-op
    }

    rename(_oldUri: Uri, _newUri: Uri, _options: { overwrite: boolean }): void | Thenable<void> {
        // no-op
    }
}
