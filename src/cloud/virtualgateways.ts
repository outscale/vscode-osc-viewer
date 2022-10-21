
import * as osc from "outscale-api";
import { FiltersVirtualGateway } from "outscale-api";
import { getConfig } from '../cloud/cloud';
import { Profile } from "../flat/node";


// Retrieve all items of the resource VirtualGateway
export function getVirtualGateways(profile: Profile, filters?: FiltersVirtualGateway): Promise<Array<osc.VirtualGateway> | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadVirtualGatewaysOperationRequest = {
        readVirtualGatewaysRequest: {
            filters: filters
        }
    };

    const api = new osc.VirtualGatewayApi(config);
    return api.readVirtualGateways(readParameters)
        .then((res: osc.ReadVirtualGatewaysResponse | string) => {
            if (typeof res === "string") {
                return res;
            }
            if (res.virtualGateways === undefined || res.virtualGateways.length === 0) {
                return "Listing suceeded but it seems you have no VirtualGateway";
            }
            return res.virtualGateways;
        }, (err_: any) => {
            return err_;
        });
}

// Retrieve a specific item of the resource VirtualGateway
export function getVirtualGateway(profile: Profile, resourceId: string): Promise<osc.VirtualGateway | string> {
    const config = getConfig(profile);
    const readParameters: osc.ReadVirtualGatewaysOperationRequest = {
        readVirtualGatewaysRequest: {
            filters: {
                virtualGatewayIds: [resourceId]
            }
        }
    };

    const api = new osc.VirtualGatewayApi(config);
    return api.readVirtualGateways(readParameters)
        .then((res: osc.ReadVirtualGatewaysResponse | string) => {
            if (typeof res === "string") {
                return res;
            }
            if (res.virtualGateways === undefined || res.virtualGateways.length === 0) {
                return "Listing suceeded but it seems you have no VirtualGateway";
            }
            return res.virtualGateways[0];
        }, (err_: any) => {
            return err_;
        });
}

// Delete a specific item the resource VirtualGateway
export function deleteVirtualGateway(profile: Profile, resourceId: string): Promise<string | undefined> {
    const config = getConfig(profile);
    const deleteParameters: osc.DeleteVirtualGatewayOperationRequest = {
        deleteVirtualGatewayRequest: {
            virtualGatewayId: resourceId
        }
    };

    const api = new osc.VirtualGatewayApi(config);
    return api.deleteVirtualGateway(deleteParameters)
        .then((res: osc.DeleteVirtualGatewayResponse | string) => {
            if (typeof res === "string") {
                return res;
            }
            return undefined;
        }, (err_: any) => {
            return err_;
        });
}