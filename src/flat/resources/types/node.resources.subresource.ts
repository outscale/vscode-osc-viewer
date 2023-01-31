import { ExplorerResourceNode } from "../../node";

export interface SubResourceNode extends ExplorerResourceNode {
    removeSubresource(): Promise<string | undefined>
    removeAllSubresources(): Promise<string | undefined>
}