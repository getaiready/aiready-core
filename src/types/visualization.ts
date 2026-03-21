/**
 * Shared types for graph-based visualizations
 */

/**
 * Base graph node compatible with d3-force simulation
 */
export interface BaseGraphNode {
  id: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

/**
 * Base graph link compatible with d3-force simulation
 */
export interface BaseGraphLink {
  source: string | BaseGraphNode;
  target: string | BaseGraphNode;
  index?: number;
}

/**
 * Full graph node with all metadata
 */
export interface GraphNode extends BaseGraphNode {
  label: string;
  path?: string;
  size?: number;
  value?: number;
  color?: string;
  group?: string;
  title?: string;
  duplicates?: number;
  tokenCost?: number;
  severity?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type?: string;
  weight?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters?: { id: string; name: string; nodeIds: string[] }[];
  issues?: {
    id: string;
    type: string;
    severity: string;
    nodeIds: string[];
    message: string;
  }[];
  metadata?: any;
  /** Whether the graph was truncated due to size limits */
  truncated?: {
    nodes: boolean;
    edges: boolean;
    nodeCount?: number;
    edgeCount?: number;
    nodeLimit?: number;
    edgeLimit?: number;
  };
}
