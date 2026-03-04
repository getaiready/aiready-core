/**
 * Business Value Metrics Module
 *
 * Provides business-aligned metrics that quantify ROI and survive technology changes.
 */

import type { ToolScoringOutput } from './scoring';
import {
  calculateTokenBudget,
  estimateCostFromBudget,
} from './business/cost-metrics';
import { calculateProductivityImpact } from './business/productivity-metrics';
import { getModelPreset } from './business/pricing-models';

export * from './business/pricing-models';
export * from './business/cost-metrics';
export * from './business/productivity-metrics';
export * from './business/risk-metrics';
export * from './business/comprehension-metrics';

/**
 * Historical score entry for trend tracking
 */
export interface ScoreHistoryEntry {
  timestamp: string;
  overallScore: number;
  breakdown: Record<string, number>;
  totalIssues: number;
  totalTokens: number;
}

/**
 * Trend analysis comparing current vs historical scores
 */
export interface ScoreTrend {
  direction: 'improving' | 'stable' | 'degrading';
  change30Days: number;
  change90Days: number;
  velocity: number; // points per week
  projectedScore: number; // 30-day projection
}

/**
 * Calculate Aggregate Business ROI
 */
export function calculateBusinessROI(params: {
  tokenWaste: number;
  issues: { severity: string }[];
  developerCount?: number;
  modelId?: string;
}): {
  monthlySavings: number;
  productivityGainHours: number;
  annualValue: number;
} {
  const model = getModelPreset(params.modelId || 'claude-4.6');
  const devCount = params.developerCount || 5;

  const budget = calculateTokenBudget({
    totalContextTokens: params.tokenWaste * 2.5,
    wastedTokens: {
      duplication: params.tokenWaste * 0.7,
      fragmentation: params.tokenWaste * 0.3,
      chattiness: 0,
    },
  });

  const cost = estimateCostFromBudget(budget, model, {
    developerCount: devCount,
  });
  const productivity = calculateProductivityImpact(params.issues);

  const monthlySavings = cost.total;
  const productivityGainHours = productivity.totalHours;
  const annualValue = (monthlySavings + productivityGainHours * 75) * 12;

  return {
    monthlySavings: Math.round(monthlySavings),
    productivityGainHours: Math.round(productivityGainHours),
    annualValue: Math.round(annualValue),
  };
}
