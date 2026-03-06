import { ToolName } from './types/schema';

/**
 * AI Readiness Scoring System
 *
 * Provides dynamic, composable scoring across multiple analysis tools.
 * Each tool contributes a 0-100 score with configurable weights.
 */

export interface ToolScoringOutput {
  /** Unique tool identifier (e.g., "pattern-detect") */
  toolName: string;

  /** Normalized 0-100 score for this tool */
  score: number;

  /** AI token budget unit economics (v0.13+) */
  tokenBudget?: import('./types').TokenBudget;

  /** Raw metrics used to calculate the score */
  rawMetrics: Record<string, any>;

  /** Factors that influenced the score */
  factors: Array<{
    name: string;
    impact: number; // +/- points contribution
    description: string;
  }>;

  /** Actionable recommendations with estimated impact */
  recommendations: Array<{
    action: string;
    estimatedImpact: number; // +points if fixed
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface ScoringResult {
  /** Overall AI Readiness Score (0-100) */
  overall: number;

  /** Rating category */
  rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Work' | 'Critical';

  /** Timestamp of score calculation */
  timestamp: string;

  /** Tools that contributed to this score */
  toolsUsed: string[];

  /** Breakdown by tool */
  breakdown: ToolScoringOutput[];

  /** Calculation details */
  calculation: {
    formula: string;
    weights: Record<string, number>;
    normalized: string;
  };
}

export interface ScoringConfig {
  /** Minimum passing score (exit code 1 if below) */
  threshold?: number;

  /** Show detailed breakdown in output */
  showBreakdown?: boolean;

  /** Path to baseline JSON for comparison */
  compareBaseline?: string;

  /** Auto-save score to this path */
  saveTo?: string;
}

/**
 * Default weights for known tools. Weights sum to 100 and read directly as
 * percentage contribution to the overall score.
 * New tools get weight of 5 if not specified.
 */
export const DEFAULT_TOOL_WEIGHTS: Record<string, number> = {
  [ToolName.PatternDetect]: 22,
  [ToolName.ContextAnalyzer]: 19,
  [ToolName.NamingConsistency]: 14,
  [ToolName.AiSignalClarity]: 11,
  [ToolName.AgentGrounding]: 10,
  [ToolName.TestabilityIndex]: 10,
  [ToolName.DocDrift]: 8,
  [ToolName.DependencyHealth]: 6,
  [ToolName.ChangeAmplification]: 8,
};

/**
 * Tool name normalization map (shorthand -> canonical name)
 */
export const TOOL_NAME_MAP: Record<string, string> = {
  patterns: ToolName.PatternDetect,
  'pattern-detect': ToolName.PatternDetect,
  context: ToolName.ContextAnalyzer,
  'context-analyzer': ToolName.ContextAnalyzer,
  consistency: ToolName.NamingConsistency,
  'naming-consistency': ToolName.NamingConsistency,
  'ai-signal': ToolName.AiSignalClarity,
  'ai-signal-clarity': ToolName.AiSignalClarity,
  grounding: ToolName.AgentGrounding,
  'agent-grounding': ToolName.AgentGrounding,
  testability: ToolName.TestabilityIndex,
  'testability-index': ToolName.TestabilityIndex,
  'doc-drift': ToolName.DocDrift,
  'deps-health': ToolName.DependencyHealth,
  'dependency-health': ToolName.DependencyHealth,
  'change-amp': ToolName.ChangeAmplification,
  'change-amplification': ToolName.ChangeAmplification,
};

/**
 * Model context tiers for context-aware threshold calibration.
 */
export type ModelContextTier =
  | 'compact' // 4k-16k  tokens
  | 'standard' // 16k-64k tokens
  | 'extended' // 64k-200k
  | 'frontier'; // 200k+

/**
 * Context budget thresholds per tier.
 */
export const CONTEXT_TIER_THRESHOLDS: Record<
  ModelContextTier,
  {
    idealTokens: number;
    criticalTokens: number;
    idealDepth: number;
  }
> = {
  compact: { idealTokens: 3_000, criticalTokens: 10_000, idealDepth: 4 },
  standard: { idealTokens: 5_000, criticalTokens: 15_000, idealDepth: 5 },
  extended: { idealTokens: 15_000, criticalTokens: 50_000, idealDepth: 7 },
  frontier: { idealTokens: 50_000, criticalTokens: 150_000, idealDepth: 10 },
};

/**
 * Project-size-adjusted minimum thresholds.
 */
export const SIZE_ADJUSTED_THRESHOLDS: Record<string, number> = {
  xs: 80, // < 50 files
  small: 75, // 50-200 files
  medium: 70, // 200-500 files
  large: 65, // 500-2000 files
  enterprise: 58, // 2000+ files
};

/**
 * Determine project size tier from file count
 */
export function getProjectSizeTier(
  fileCount: number
): keyof typeof SIZE_ADJUSTED_THRESHOLDS {
  if (fileCount < 50) return 'xs';
  if (fileCount < 200) return 'small';
  if (fileCount < 500) return 'medium';
  if (fileCount < 2000) return 'large';
  return 'enterprise';
}

/**
 * Get the recommended minimum threshold for a project
 */
export function getRecommendedThreshold(
  fileCount: number,
  modelTier: ModelContextTier = 'standard'
): number {
  const sizeTier = getProjectSizeTier(fileCount);
  const base = SIZE_ADJUSTED_THRESHOLDS[sizeTier];
  const modelBonus =
    modelTier === 'frontier' ? -3 : modelTier === 'extended' ? -2 : 0;
  return base + modelBonus;
}

/**
 * Normalize tool name from shorthand to canonical name
 */
export function normalizeToolName(shortName: string): string {
  return TOOL_NAME_MAP[shortName.toLowerCase()] || shortName;
}

/**
 * Get tool weight
 */
export function getToolWeight(
  toolName: string,
  toolConfig?: { scoreWeight?: number },
  cliOverride?: number
): number {
  if (cliOverride !== undefined) return cliOverride;
  if (toolConfig?.scoreWeight !== undefined) return toolConfig.scoreWeight;
  return DEFAULT_TOOL_WEIGHTS[toolName] || 5;
}

/**
 * Parse weight string from CLI
 */
export function parseWeightString(weightStr?: string): Map<string, number> {
  const weights = new Map<string, number>();
  if (!weightStr) return weights;

  const pairs = weightStr.split(',');
  for (const pair of pairs) {
    const [toolShortName, weightStr] = pair.split(':');
    if (toolShortName && weightStr) {
      const toolName = normalizeToolName(toolShortName.trim());
      const weight = parseInt(weightStr.trim(), 10);
      if (!isNaN(weight) && weight > 0) {
        weights.set(toolName, weight);
      }
    }
  }
  return weights;
}

/**
 * Calculate overall AI Readiness Score
 */
export function calculateOverallScore(
  toolOutputs: Map<string, ToolScoringOutput>,
  config?: any,
  cliWeights?: Map<string, number>
): ScoringResult {
  if (toolOutputs.size === 0) {
    throw new Error('No tool outputs provided for scoring');
  }

  const weights = new Map<string, number>();
  for (const [toolName] of toolOutputs.entries()) {
    const cliWeight = cliWeights?.get(toolName);
    const configWeight = config?.tools?.[toolName]?.scoreWeight;
    const weight =
      cliWeight ?? configWeight ?? DEFAULT_TOOL_WEIGHTS[toolName] ?? 5;
    weights.set(toolName, weight);
  }

  let weightedSum = 0;
  let totalWeight = 0;

  const breakdown: ToolScoringOutput[] = [];
  const toolsUsed: string[] = [];
  const calculationWeights: Record<string, number> = {};

  for (const [toolName, output] of toolOutputs.entries()) {
    const weight = weights.get(toolName) || 5;
    weightedSum += output.score * weight;
    totalWeight += weight;
    toolsUsed.push(toolName);
    calculationWeights[toolName] = weight;
    breakdown.push(output);
  }

  const overall = Math.round(weightedSum / totalWeight);
  const rating = getRating(overall);

  const formulaParts = Array.from(toolOutputs.entries()).map(
    ([name, output]) => {
      const w = weights.get(name) || 5;
      return `(${output.score} × ${w})`;
    }
  );
  const formulaStr = `[${formulaParts.join(' + ')}] / ${totalWeight} = ${overall}`;

  return {
    overall,
    rating,
    timestamp: new Date().toISOString(),
    toolsUsed,
    breakdown,
    calculation: {
      formula: formulaStr,
      weights: calculationWeights,
      normalized: formulaStr,
    },
  };
}

/**
 * Convert numeric score to rating category
 */
export function getRating(score: number): ScoringResult['rating'] {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Work';
  return 'Critical';
}

/**
 * Convert score to rating with project-size awareness.
 */
export function getRatingWithContext(
  score: number,
  fileCount: number,
  modelTier: ModelContextTier = 'standard'
): ScoringResult['rating'] {
  const threshold = getRecommendedThreshold(fileCount, modelTier);
  const normalized = score - threshold + 70;
  return getRating(normalized);
}

/**
 * Get rating display properties
 */
export function getRatingDisplay(rating: ScoringResult['rating']): {
  emoji: string;
  color: string;
} {
  switch (rating) {
    case 'Excellent':
      return { emoji: '✅', color: 'green' };
    case 'Good':
      return { emoji: '👍', color: 'blue' };
    case 'Fair':
      return { emoji: '⚠️', color: 'yellow' };
    case 'Needs Work':
      return { emoji: '🔨', color: 'orange' };
    case 'Critical':
      return { emoji: '❌', color: 'red' };
  }
}

/**
 * Format score for display
 */
export function formatScore(result: ScoringResult): string {
  const { emoji } = getRatingDisplay(result.rating);
  return `${result.overall}/100 (${result.rating}) ${emoji}`;
}

/**
 * Format individual tool score for display
 */
export function formatToolScore(output: ToolScoringOutput): string {
  let result = `  Score: ${output.score}/100\n\n`;

  if (output.factors && output.factors.length > 0) {
    result += `  Factors:\n`;
    output.factors.forEach((factor) => {
      const impactSign = factor.impact > 0 ? '+' : '';
      result += `    • ${factor.name}: ${impactSign}${factor.impact} - ${factor.description}\n`;
    });
    result += '\n';
  }

  if (output.recommendations && output.recommendations.length > 0) {
    result += `  Recommendations:\n`;
    output.recommendations.forEach((rec, i) => {
      const priorityIcon =
        rec.priority === 'high'
          ? '🔴'
          : rec.priority === 'medium'
            ? '🟡'
            : '🔵';
      result += `    ${i + 1}. ${priorityIcon} ${rec.action}\n`;
      result += `       Impact: +${rec.estimatedImpact} points\n\n`;
    });
  }

  return result;
}
