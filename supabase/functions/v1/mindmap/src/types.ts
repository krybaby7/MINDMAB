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

export type LayoutType = 'hierarchical' | 'radial' | 'force' | 'concentric' | 'grid';

export interface GenerateMindMapRequest {
  topic: string;
  layout?: LayoutType;
}

export interface GenerateMindMapResponse {
  success: boolean;
  data?: MindMapData;
  error?: string;
}

export interface DeepseekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepseekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }[];
}