import type { CostConfig, TokenBudget } from '../types';
import { ModelPricingPreset, getModelPreset } from './pricing-models';

/**
 * Default cost configuration
 */
export const DEFAULT_COST_CONFIG: CostConfig = {
  pricePer1KTokens: 0.005,
  queriesPerDevPerDay: 60,
  developerCount: 5,
  daysPerMonth: 30,
};

/**
 * Calculate estimated monthly cost of AI context waste
 * @deprecated Since v0.13
 */
export function calculateMonthlyCost(
  tokenWaste: number,
  config: Partial<CostConfig> = {}
): { total: number; range: [number, number]; confidence: number } {
  const budget = calculateTokenBudget({
    totalContextTokens: tokenWaste * 2.5,
    wastedTokens: {
      duplication: tokenWaste * 0.7,
      fragmentation: tokenWaste * 0.3,
      chattiness: 0,
    },
  });

  const preset = getModelPreset('claude-4.6');
  return estimateCostFromBudget(budget, preset, config);
}

/**
 * Calculate token budget and unit economics
 */
export function calculateTokenBudget(params: {
  totalContextTokens: number;
  estimatedResponseTokens?: number;
  wastedTokens: {
    duplication: number;
    fragmentation: number;
    chattiness: number;
  };
}): TokenBudget {
  const { totalContextTokens, wastedTokens } = params;
  const estimatedResponseTokens =
    params.estimatedResponseTokens ?? totalContextTokens * 0.2;
  const totalWaste =
    wastedTokens.duplication +
    wastedTokens.fragmentation +
    wastedTokens.chattiness;

  const efficiencyRatio = Math.max(
    0,
    Math.min(
      1,
      (totalContextTokens - totalWaste) / Math.max(1, totalContextTokens)
    )
  );

  return {
    totalContextTokens: Math.round(totalContextTokens),
    estimatedResponseTokens: Math.round(estimatedResponseTokens),
    wastedTokens: {
      total: Math.round(totalWaste),
      bySource: {
        duplication: Math.round(wastedTokens.duplication),
        fragmentation: Math.round(wastedTokens.fragmentation),
        chattiness: Math.round(wastedTokens.chattiness),
      },
    },
    efficiencyRatio: Math.round(efficiencyRatio * 100) / 100,
    potentialRetrievableTokens: Math.round(totalWaste * 0.8),
  };
}

/**
 * Estimate dollar cost from a token budget
 */
export function estimateCostFromBudget(
  budget: TokenBudget,
  model: ModelPricingPreset,
  config: Partial<CostConfig> = {}
): { total: number; range: [number, number]; confidence: number } {
  const cfg = { ...DEFAULT_COST_CONFIG, ...config };

  const wastePerQuery = budget.wastedTokens.total;
  const tokensPerDay = wastePerQuery * cfg.queriesPerDevPerDay;
  const tokensPerMonth = tokensPerDay * cfg.daysPerMonth;
  const totalWeight = cfg.developerCount;

  const price = config.pricePer1KTokens ?? model.pricePer1KInputTokens;
  const baseCost = (tokensPerMonth / 1000) * price * totalWeight;

  let confidence = 0.85;
  if (model.contextTier === 'frontier') confidence = 0.7;

  const variance = 0.25;
  const range: [number, number] = [
    Math.round(baseCost * (1 - variance) * 100) / 100,
    Math.round(baseCost * (1 + variance) * 100) / 100,
  ];

  return {
    total: Math.round(baseCost * 100) / 100,
    range,
    confidence,
  };
}
