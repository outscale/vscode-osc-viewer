
import * as osc from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


export function getSnapshots(profile: Profile): Promise<Array<osc.Snapshot> | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadSnapshotsOperationRequest = {
        readSnapshotsRequest: {}
    };

    const api = new osc.SnapshotApi(config);
    return api.readSnapshots(readParameters)
    .then((res: osc.ReadSnapshotsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.snapshots === undefined || res.snapshots.length === 0) {
            return "Listing suceeded but it seems you have no Snapshot";
        }
        return res.snapshots;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

export function getSnapshot(profile: Profile, snapshotId: string): Promise<osc.Snapshot | string> {
    const config = getConfig(profile);
    const readParameters : osc.ReadSnapshotsOperationRequest = {
        readSnapshotsRequest: {
            filters: {
                snapshotIds: [snapshotId]
            }
        }
    };

    const api = new osc.SnapshotApi(config);
    return api.readSnapshots(readParameters)
    .then((res: osc.ReadSnapshotsResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        if (res.snapshots === undefined || res.snapshots.length === 0) {
            return "Listing suceeded but it seems you have no Snapshots";
        }
        return res.snapshots[0];
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}

export function deleteSnapshot(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters : osc.DeleteSnapshotOperationRequest = {
        deleteSnapshotRequest: {
            snapshotId: resourceId
        }
    };

    const api = new osc.SnapshotApi(config);
    return api.deleteSnapshot(deleteParameters)
    .then((res: osc.DeleteSnapshotResponse | string) => {
        if (typeof res === "string") {
            return res;
        }
        return undefined;
    }, (err_: any) => {
        return "Error, bad credential or region?" + err_;
    });
}