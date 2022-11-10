import * as osc from 'outscale-api';
import { ImportMock } from 'ts-mock-imports';

let routeTables: osc.RouteTable[] = [
    {
        linkRouteTables: [
            {
                linkRouteTableId: "rtbassoc1"
            },
            {
                linkRouteTableId: "rtbassoc2"
            }
        ],
        routeTableId: "rtb1"
    },
    {
        linkRouteTables: [
            {
                linkRouteTableId: "rtbassoc3"
            }
        ],
        routeTableId: "rtb2"
    }
];

export function initMock() {
    const readMock = ImportMock.mockFunction(osc.RouteTableApi.prototype, 'readRouteTables');
    readMock.callsFake((arg: osc.ReadRouteTablesOperationRequest) => {
        let responseData = routeTables;
        if (typeof arg.readRouteTablesRequest?.filters?.routeTableIds !== 'undefined') {
            responseData = responseData.filter(rt => {
                if (typeof rt.routeTableId === 'undefined') {
                    return false;
                }
                return arg.readRouteTablesRequest?.filters?.routeTableIds?.includes(rt.routeTableId);
            });
        }

        const resp: osc.ReadRouteTablesResponse = {
            routeTables: responseData
        };
        return Promise.resolve(resp);
    });

    const unlinkMock = ImportMock.mockFunction(osc.RouteTableApi.prototype, 'unlinkRouteTable');
    unlinkMock.callsFake((arg: osc.UnlinkRouteTableOperationRequest) => {
        const linkRouteTableId = arg.unlinkRouteTableRequest?.linkRouteTableId;

        if (typeof linkRouteTableId === 'undefined') {
            return Promise.reject("403");
        }

        routeTables = routeTables.filter((rt) => {
            if (typeof rt.linkRouteTables === 'undefined') {
                return false;
            }


            rt.linkRouteTables = rt.linkRouteTables.filter((link) => {
                if (typeof link.linkRouteTableId === 'undefined') {
                    return false;
                }
                return link.linkRouteTableId !== linkRouteTableId;
            });

            return true;
        });

        return Promise.resolve(undefined);
    });
}