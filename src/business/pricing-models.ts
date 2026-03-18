import type { ModelContextTier } from '../scoring';

/**
 * AI model pricing presets for cost estimation.
 * Prices are input token costs per 1K tokens (USD), as of Q1 2026.
 */
export interface ModelPricingPreset {
  name: string;
  pricePer1KInputTokens: number;
  pricePer1KOutputTokens: number;
  contextTier: ModelContextTier;
  /** Approximate daily queries per active dev for this model class */
  typicalQueriesPerDevPerDay: number;
}

export const MODEL_PRICING_PRESETS: Record<string, ModelPricingPreset> = {
  'gpt-5.4-mini': {
    name: 'GPT-5.4 Mini',
    pricePer1KInputTokens: 0.0001,
    pricePer1KOutputTokens: 0.0004,
    contextTier: 'extended',
    typicalQueriesPerDevPerDay: 200,
  },
  'gpt-5.3': {
    name: 'GPT-5.3',
    pricePer1KInputTokens: 0.002,
    pricePer1KOutputTokens: 0.008,
    contextTier: 'frontier',
    typicalQueriesPerDevPerDay: 100,
  },
  'claude-4.6': {
    name: 'Claude 4.6',
    pricePer1KInputTokens: 0.0015,
    pricePer1KOutputTokens: 0.0075,
    contextTier: 'frontier',
    typicalQueriesPerDevPerDay: 100,
  },
  'gemini-3.1': {
    name: 'Gemini 3.1 Pro',
    pricePer1KInputTokens: 0.0008,
    pricePer1KOutputTokens: 0.003,
    contextTier: 'frontier',
    typicalQueriesPerDevPerDay: 120,
  },
  'gemini-1-5-pro': {
    name: 'Gemini 1.5 Pro (legacy)',
    pricePer1KInputTokens: 0.00125,
    pricePer1KOutputTokens: 0.005,
    contextTier: 'frontier',
    typicalQueriesPerDevPerDay: 80,
  },
  copilot: {
    name: 'GitHub Copilot (subscription)',
    pricePer1KInputTokens: 0.00008,
    pricePer1KOutputTokens: 0.00008,
    contextTier: 'frontier',
    typicalQueriesPerDevPerDay: 150,
  },
  'cursor-pro': {
    name: 'Cursor Pro (subscription)',
    pricePer1KInputTokens: 0.00008,
    pricePer1KOutputTokens: 0.00008,
    contextTier: 'frontier',
    typicalQueriesPerDevPerDay: 200,
  },
};

/**
 * Get a model pricing preset by ID, with fallback to claude-4.6 (2026 default)
 */
export function getModelPreset(modelId: string): ModelPricingPreset {
  return (
    MODEL_PRICING_PRESETS[modelId] ?? MODEL_PRICING_PRESETS['gpt-5.4-mini']
  );
}
