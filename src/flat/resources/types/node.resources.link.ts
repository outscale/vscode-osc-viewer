import { ExplorerResourceNode } from "../../node";

export interface LinkResourceNode extends ExplorerResourceNode {
    unlinkResource(): Promise<string | undefined>
    unlinkAllResource(): Promise<string | undefined>
}