import { ResourceNodeType } from "../flat/node";

export class CytoscapeNode {
    public group: CytoscapeNodeTypes;
    public data: CytoscapeNodeData | CytoscapeEdgeData;

    constructor(type: CytoscapeNodeTypes) {
        this.group = type;
        this.data = ({} as CytoscapeNodeData);
    }
}

type CytoscapeNodeTypes = 'nodes' | 'edges';

export interface CytoscapeNodeData {
    id: string
    img?: string
    color?: string
    label: string
    parent?: string
    type?: ResourceNodeType,
    showDetails: boolean,
    resourceId?: string,
    collapse?: boolean
}

export interface CytoscapeEdgeData {
    id: string
    source: string
    target: string
    label: string
    edgeType: string
}
