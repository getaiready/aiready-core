import type { TechnicalValueChain, ComprehensionDifficulty } from '../types';
import type { ModelContextTier } from '../scoring';
import { CONTEXT_TIER_THRESHOLDS } from '../scoring';

/**
 * Calculate Technical Value Chain
 */
export function calculateTechnicalValueChain(params: {
  businessLogicDensity: number;
  dataAccessComplexity: number;
  apiSurfaceArea: number;
}): TechnicalValueChain {
  const { businessLogicDensity, dataAccessComplexity, apiSurfaceArea } = params;
  const score =
    (businessLogicDensity * 0.5 +
      (1 - dataAccessComplexity / 10) * 0.3 +
      (1 - apiSurfaceArea / 20) * 0.2) *
    100;

  return {
    score: Math.round(Math.max(0, Math.min(100, score))),
    density: businessLogicDensity,
    complexity: dataAccessComplexity,
    surface: apiSurfaceArea,
  };
}

/**
 * Calculate Comprehension Difficulty Index (CDI)
 */
export function calculateComprehensionDifficulty(
  contextBudget: number,
  importDepth: number,
  fragmentation: number,
  modelTier: ModelContextTier = 'frontier'
): ComprehensionDifficulty {
  const threshold = CONTEXT_TIER_THRESHOLDS[modelTier];
  const budgetRatio = contextBudget / threshold;

  const score =
    (budgetRatio * 0.6 + (importDepth / 10) * 0.2 + fragmentation * 0.2) * 100;
  const finalScore = Math.round(Math.max(0, Math.min(100, score)));

  let rating: ComprehensionDifficulty['rating'];
  if (finalScore < 20) rating = 'trivial';
  else if (finalScore < 40) rating = 'easy';
  else if (finalScore < 60) rating = 'moderate';
  else if (finalScore < 85) rating = 'difficult';
  else rating = 'expert';

  return {
    score: finalScore,
    rating,
    factors: { budgetRatio, depthRatio: importDepth / 10, fragmentation },
  };
}
