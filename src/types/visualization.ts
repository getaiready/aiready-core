/**
 * Shared types for graph-based visualizations
 */
import { IssueOverlay } from './contract';

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
  issues?: IssueOverlay[];
  metadata?: GraphMetadata;
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

/**
 * Metadata about the graph
 */
export interface GraphMetadata {
  projectName?: string;
  timestamp?: string;
  totalFiles?: number;
  totalDependencies?: number;
  analysisTypes?: string[];

  // Aggregate metrics
  totalLinesOfCode?: number;
  totalTokenCost?: number;
  averageComplexity?: number;

  // Issue counts
  criticalIssues?: number;
  majorIssues?: number;
  minorIssues?: number;
  infoIssues?: number;

  // Business metrics (v0.10+)
  estimatedMonthlyCost?: number;
  estimatedDeveloperHours?: number;
  aiAcceptanceRate?: number;
  aiReadinessScore?: number;
  /** AI token budget unit economics (v0.13+) */
  tokenBudget?: any; // Avoid circular dependency with ast.ts if possible, or use a more generic type
}
