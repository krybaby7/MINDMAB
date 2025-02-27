export interface MindMapNode {
  id: string;
  label: string;
  parent?: string;
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export interface CytoscapeNodeData {
  id: string;
  label: string;
}

export interface CytoscapeEdgeData {
  id: string;
  source: string;
  target: string;
}

export interface CytoscapeStylesheet {
  selector: string;
  style: {
    [key: string]: string | number;
  };
}

export interface CytoscapeLayout {
  name: string;
  directed?: boolean;
  padding?: number;
  spacingFactor?: number;
  animate?: boolean;
}
