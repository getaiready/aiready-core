/**
 * Priority levels for actionable recommendations.
 * Used to sort and display fixes for the user.
 */
export enum RecommendationPriority {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

/**
 * Output structure for a single tool's scoring analysis.
 */
export interface ToolScoringOutput {
  /** Unique tool identifier (e.g., "pattern-detect") */
  toolName: string;

  /** Normalized 0-100 score for this tool */
  score: number;

  /** AI token budget unit economics (v0.13+) */
  tokenBudget?: any; // Avoiding deep circular imports

  /** Raw metrics used to calculate the score */
  rawMetrics: Record<string, any>;

  /** Factors that influenced the score */
  factors: Array<{
    /** Human-readable name of the factor */
    name: string;
    /** Points contribution (positive or negative) */
    impact: number;
    /** Explanation of the factor's impact */
    description: string;
  }>;

  /** Actionable recommendations with estimated impact */
  recommendations: Array<{
    /** The recommended action to take */
    action: string;
    /** Potential points increase if implemented */
    estimatedImpact: number;
    /** Implementation priority */
    priority: RecommendationPriority | 'high' | 'medium' | 'low';
  }>;
}

/**
 * Consolidated scoring result across all tools.
 */
export interface ScoringResult {
  /** Overall AI Readiness Score (0-100) */
  overall: number;

  /** Rating category representing the overall readiness */
  rating: string;

  /** Timestamp of score calculation */
  timestamp: string;

  /** Tools that contributed to this score */
  toolsUsed: string[];

  /** Breakdown by individual tool */
  breakdown: ToolScoringOutput[];

  /** Internal calculation details for transparency */
  calculation: {
    /** Textual representation of the calculation formula */
    formula: string;
    /** Weights applied to each tool */
    weights: Record<string, number>;
    /** Simplified normalized formula output */
    normalized: string;
  };
}

/**
 * Configuration options for the scoring system.
 */
export interface ScoringConfig {
  /** Minimum passing score (CLI will exit with non-zero if below) */
  threshold?: number;

  /** Whether to show the detailed tool-by-tool breakdown */
  showBreakdown?: boolean;

  /** Path to a baseline report JSON for trend comparison */
  compareBaseline?: string;

  /** Target file path to persist the calculated score */
  saveTo?: string;

  /** Scoring profile to use for weighting */
  profile?: string;

  /** Tool-specific configurations (e.g., weights) */
  tools?: Record<string, { scoreWeight?: number }>;
}
