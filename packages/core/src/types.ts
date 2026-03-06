export * from './types/schema';
import {
  Severity,
  IssueType,
  Location,
  Issue,
  Metrics,
  AnalysisResult,
  ModelTier,
} from './types/schema';

// Re-export specific common types as needed (though schema.ts exports them too)

// ============================================
// Business Value Metrics
// ============================================

/**
 * Cost estimation configuration
 */
export interface CostConfig {
  /** Price per 1K tokens (default: $0.01 for GPT-4) */
  pricePer1KTokens: number;
  /** Average AI queries per developer per day */
  queriesPerDevPerDay: number;
  /** Number of developers on the team */
  developerCount: number;
  /** Days per month (default: 30) */
  daysPerMonth: number;
}

/**
 * Token budget metrics (v0.13+)
 * Technology-agnostic unit economics for AI impact.
 */
export interface TokenBudget {
  /** Total tokens required for full task context */
  totalContextTokens: number;
  /** Estimated tokens generated in response */
  estimatedResponseTokens: number;
  /** Tokens wasted on redundant/duplicated context */
  wastedTokens: {
    total: number;
    bySource: {
      duplication: number;
      fragmentation: number;
      chattiness: number;
    };
  };
  /** Context efficiency ratio (0-1). 1.0 = perfect efficiency. */
  efficiencyRatio: number;
  /** Estimated tokens saved if recommendations are followed */
  potentialRetrievableTokens: number;
}

/**
 * Productivity impact estimates
 */
export interface ProductivityImpact {
  /** Estimated hours to fix all issues */
  totalHours: number;
  /** Average hourly rate for developers */
  hourlyRate: number;
  /** Estimated total fix cost */
  totalCost: number;
  /** Breakdown by severity */
  bySeverity: {
    [K in Severity]: { hours: number; cost: number };
  };
}

/**
 * AI acceptance rate prediction
 * Based on research correlating code quality to AI suggestion acceptance
 */
export interface AcceptancePrediction {
  /** Predicted acceptance rate (0-1) */
  rate: number;
  /** Confidence level (0-1) */
  confidence: number;
  /** Factors affecting acceptance */
  factors: {
    name: string;
    impact: number; // +/- percentage points
  }[];
}

/**
 * Comprehension difficulty score (future-proof abstraction)
 * Normalized 0-100 scale: lower = easier for AI to understand
 */
export interface ComprehensionDifficulty {
  /** Overall difficulty score (0-100) */
  score: number;
  /** Factors contributing to difficulty */
  factors: {
    budgetRatio: number;
    depthRatio: number;
    fragmentation: number;
  };
  /** Interpretation */
  rating: 'trivial' | 'easy' | 'moderate' | 'difficult' | 'expert';
}

/**
 * Technical Value Chain
 * Traces a technical issue through its impact on AI and developer outcomes.
 */
export interface TechnicalValueChain {
  issueType: string;
  technicalMetric: string;
  technicalValue: number;
  aiImpact: {
    description: string;
    scoreImpact: number;
  };
  developerImpact: {
    description: string;
    productivityLoss: number; // percentage (0-1)
  };
  businessOutcome: {
    directCost: number;
    opportunityCost: number;
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  };
}

/**
 * v0.13+ simplified technical value chain
 */
export interface TechnicalValueChainSummary {
  score: number;
  density: number;
  complexity: number;
  surface: number;
}

/**
 * Extended report with business metrics
 */
export interface BusinessReport extends Report {
  businessMetrics: {
    /** Token-based unit economics (v0.13+) */
    tokenBudget: TokenBudget;
    /** @deprecated Use tokenBudget instead. Estimated monthly cost impact of AI context waste */
    estimatedMonthlyCost: {
      total: number;
      range: [number, number];
      confidence: number;
    };
    /** Opportunity cost of project delay due to technical debt */
    opportunityCost: number;
    /** Estimated developer hours to address issues */
    estimatedDeveloperHours: number;
    /** Predicted AI suggestion acceptance rate */
    aiAcceptanceRate: number;
    /** Comprehension difficulty assessment */
    comprehensionDifficulty: ComprehensionDifficulty;
    /** Traces for specific critical issues */
    valueChains?: TechnicalValueChain[];
    /** Timestamp for trend tracking */
    period?: string;
  };
}

export interface ScanOptions {
  rootDir: string;
  include?: string[];
  exclude?: string[];
  maxDepth?: number;
  onProgress?: (processed: number, total: number, message: string) => void;
  includeTests?: boolean;
}

export interface AIReadyConfig {
  // Global scan options
  scan?: {
    include?: string[];
    exclude?: string[];
    tools?: string[]; // Which tools to run: ["patterns", "context", "consistency"]
  };

  // Tool-specific configurations
  tools?: {
    'pattern-detect'?: {
      enabled?: boolean;
      scoreWeight?: number;
      minSimilarity?: number;
      minLines?: number;
      batchSize?: number;
      approx?: boolean;
      minSharedTokens?: number;
      maxCandidatesPerBlock?: number;
      streamResults?: boolean;
      maxResults?: number;
    };
    'context-analyzer'?: {
      enabled?: boolean;
      scoreWeight?: number;
      maxDepth?: number;
      maxContextBudget?: number;
      minCohesion?: number;
      maxFragmentation?: number;
      focus?: 'fragmentation' | 'cohesion' | 'depth' | 'all';
      includeNodeModules?: boolean;
      maxResults?: number;
      // Domain inference configuration
      domainKeywords?: string[]; // project-specific domain keywords (e.g., ['txn','transaction','cust'])
      domainPatterns?: string[]; // regex strings to match domains (e.g., ['^ord(er)?$', '^(inv|invoice)$'])
      pathDomainMap?: Record<string, string>; // map of path segment -> domain (e.g., {'orders': 'order'})
    };
    consistency?: {
      enabled?: boolean;
      scoreWeight?: number;
      // Custom abbreviations to accept (domain-specific terms)
      acceptedAbbreviations?: string[]; // e.g., ['ses', 'gst', 'cdk', 'btn', 'buf', 'agg']
      // Custom short words that are full English words, not abbreviations
      shortWords?: string[]; // e.g., ['oak', 'elm', 'ash'] for tree species
      // Disable specific checks
      disableChecks?: (
        | 'single-letter'
        | 'abbreviation'
        | 'convention-mix'
        | 'unclear'
        | 'poor-naming'
      )[];
    };
    [toolName: string]:
      | {
          enabled?: boolean;
          scoreWeight?: number;
          [key: string]: any;
        }
      | undefined;
  };

  // Scoring configuration
  scoring?: {
    threshold?: number; // Minimum passing score
    showBreakdown?: boolean; // Show detailed breakdown
    compareBaseline?: string; // Path to baseline JSON
    saveTo?: string; // Auto-save score to path
  };

  // Output preferences
  output?: {
    format?: 'console' | 'json' | 'html';
    file?: string;
  };

  // Visualizer preferences
  visualizer?: {
    groupingDirs?: string[];
    graph?: {
      maxNodes?: number;
      maxEdges?: number;
    };
  };
}

export interface Report {
  summary: {
    totalFiles: number;
    totalIssues: number;
    criticalIssues: number;
    majorIssues: number;
  };
  results: AnalysisResult[];
  metrics: {
    overallScore: number;
    tokenCostTotal: number;
    avgConsistency: number;
  };
}

// ============================================
// Graph Visualization Types
// ============================================

/**
 * Severity levels for issues
 */
export type GraphIssueSeverity = Severity;

/**
 * Base graph node
 */
export interface GraphNode {
  id: string;
  label: string;
  path?: string;
  size?: number;
  value?: number;
  color?: string;
  group?: string;
  x?: number;
  y?: number;
}

/**
 * Graph edge between nodes
 */
export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  type?: string;
  weight?: number;
}

/**
 * Graph metadata
 */
export interface GraphMetadata {
  projectName?: string;
  timestamp: string;
  totalFiles: number;
  totalDependencies: number;
  analysisTypes: string[];
  criticalIssues: number;
  majorIssues: number;
  minorIssues: number;
  infoIssues: number;
  /** AI token budget unit economics (v0.13+) */
  tokenBudget?: TokenBudget;
}

/**
 * Complete graph data structure for visualization
 */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters?: { id: string; name: string; nodeIds: string[] }[];
  issues?: {
    id: string;
    type: string;
    severity: Severity;
    nodeIds: string[];
    message: string;
  }[];
  metadata: GraphMetadata;
}
