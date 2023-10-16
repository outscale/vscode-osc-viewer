import * as vscode from 'vscode';
import { ResourceNodeType } from '../flat/node';

const resourceToRegexp: Map<ResourceNodeType, [string, string]> = new Map([
    //["AccessKey", "[A-Z0-9]{20}"],
    ["ApiAccessRule", ["aar-", "aar-[a-f0-9]{32}"]],
    ["Ca", ["ca-", "ca-[a-f0-9]{32}"]],
    ["ClientGateway", ["cgw-", "cgw-[a-f0-9]{8}"]],
    ["DhcpOption", ["dopt-", "dopt-[a-f0-9]{8}"]],
    ["DirectLink", ["dxcon-", "dxcon-[a-f0-9]{8}"]],
    ["DirectLinkInterface", ["dxvif-", "dxvif-[a-f0-9]{8}"]],
    ["FlexibleGpu", ["fgpu-", "fgpu-[a-f0-9]{8}"]],
    ["InternetService", ["igw-", "igw-[a-f0-9]{8}"]],
    ["NatService", ["nat-", "nat-[a-f0-9]{8}"]],
    ["NetAccessPoint", ["vpce-", "vpce-[a-f0-9]{8}"]],
    ["NetPeering", ["pcx-", "pcx-[a-f0-9]{8}"]],
    ["Nic", ["eni-", "eni-[a-f0-9]{8}"]],
    ["Subnet", ["subnet-", "subnet-[a-f0-9]{8}"]],
    ["VirtualGateway", ["vgw-", "vgw-[a-f0-9]{8}"]],
    ["VpnConnection", ["vpn-", "vpn-[a-f0-9]{8}"]],
    ["vms", ["i-", "i-[a-f0-9]{8}"]],
    ["vpc", ["vpc-", "vpc-[a-f0-9]{8}"]],
    ["securitygroups", ["sg-", "sg-[a-f0-9]{8}"]],
    //["keypairs", ""],
    ["volumes", ["vol-", "vol-[a-f0-9]{8}"]],
    //["loadbalancers", ""], // Currently, the Id of Loadbalancer is names which is ... everything up to 32 chars, too many false negatives therefore we skip this
    ["eips", ["eipalloc-", "eipalloc-[a-f0-9]{8}"]],
    ["omis", ["ami-", "ami-[a-f0-9]{8}"]],
    ["snapshots", ["snap-", "snap-[a-f0-9]{8}"]],
    ["routetables", ["rtb-", "rtb-[a-f0-9]{8}"]],
    ["VmTemplate", ["vmtemplate-", "vmtemplate-[a-f0-9]{32}"]],
    ["VmGroup", ["vmgroup-", "vmgroup-[a-f0-9]{32}"]],
]);

const globalResourcePrefix: string = Array.from(resourceToRegexp.values()).map(e => e[0]).join("|");

export class OscLinkProvider implements vscode.DocumentLinkProvider {


    createDocumentLink(line: number, startIndex: number, resource: ResourceNodeType, value: string, uriPrefix: vscode.Uri): vscode.DocumentLink {
        const startPosition = new vscode.Position(line, startIndex); // Start of the value index
        const endPosition = new vscode.Position(line, startIndex + value.length); // End of value index
        const range: vscode.Range = new vscode.Range(startPosition, endPosition);
        const targetUri = vscode.Uri.joinPath(uriPrefix, resource + "/" + value + ".json"); // The trick is to change the resourcename and the resourceId
        const link = new vscode.DocumentLink(range, targetUri);
        return link;

    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    provideDocumentLinks(document: vscode.TextDocument, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        const links: Array<vscode.DocumentLink> = [];
        const globalResourceRegexp = new RegExp(`"(${globalResourcePrefix}).+"`);

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            // This test try to see if there is a potential match to reduce multiple tests
            if (!globalResourceRegexp.test(line.text)) {
                continue;
            }

            for (const resource of resourceToRegexp.entries()) {
                const regex = new RegExp(`"(${resource[1][1]})"`);
                const matches = regex.exec(line.text);
                if (matches !== null) {
                    const matchStartIndex = 1 + matches.index;
                    const value = matches[1];
                    const link = this.createDocumentLink(i, matchStartIndex, resource[0], value, vscode.Uri.joinPath(document.uri, "../../"));
                    links.push(link);
                }
            }

        }
        return Promise.resolve(links);
    }
}