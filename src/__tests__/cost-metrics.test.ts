import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyCost,
  calculateDetailedTokenROI,
  calculateTokenBudget,
  estimateCostFromBudget,
} from '../business/cost-metrics';
import { getModelPreset } from '../business/pricing-models';

describe('cost-metrics', () => {
  describe('calculateMonthlyCost', () => {
    it('should calculate cost with default config', () => {
      const result = calculateMonthlyCost(1000);
      expect(result.total).toBeGreaterThan(0);
      expect(result.confidence).toBe(0.85);
    });

    it('should use base multipliers correctly', () => {
      expect(calculateMonthlyCost(60000).total).toBeGreaterThan(
        calculateMonthlyCost(15000).total
      );
      expect(calculateMonthlyCost(15000).total).toBeGreaterThan(
        calculateMonthlyCost(5000).total
      );
    });

    it('should use provided options', () => {
      const result = calculateMonthlyCost(
        1000,
        {},
        {
          avgContextBudget: 5000,
          fragmentationScore: 0.5,
          potentialSavings: 200,
        }
      );
      expect(result.total).toBeGreaterThan(0);
    });
  });

  describe('calculateDetailedTokenROI', () => {
    it('should calculate ROI metrics', () => {
      const params = {
        totalTokens: 10000,
        avgContextBudget: 50000,
        potentialSavings: 2000,
        fragmentationScore: 0.1,
        developerCount: 5,
      };
      const result = calculateDetailedTokenROI(params);
      expect(result.monthlySavings).toBeGreaterThan(0);
      expect(result.efficiencyGain).toBeGreaterThan(0);
    });

    it('should handle zero developer count without division by zero', () => {
      const result = calculateDetailedTokenROI({
        totalTokens: 100,
        avgContextBudget: 1000,
        potentialSavings: 5,
        fragmentationScore: 0.1,
        developerCount: 0,
      });
      expect(result.contextTaxPerDev).toBeDefined();
    });
  });

  describe('calculateTokenBudget', () => {
    it('should calculate budget with custom response tokens', () => {
      const result = calculateTokenBudget({
        totalContextTokens: 1000,
        estimatedResponseTokens: 500,
        wastedTokens: { duplication: 100, fragmentation: 100, chattiness: 100 },
      });
      expect(result.estimatedResponseTokens).toBe(500);
      expect(result.wastedTokens.total).toBe(300);
    });
  });

  describe('estimateCostFromBudget', () => {
    it('should use frontier confidence for frontier models', () => {
      const budget = calculateTokenBudget({
        totalContextTokens: 1000,
        wastedTokens: { duplication: 0, fragmentation: 0, chattiness: 0 },
      });
      const model = getModelPreset('gpt-5.3'); // Tier is frontier
      const result = estimateCostFromBudget(budget, model);
      expect(result.confidence).toBe(0.7);
    });

    it('should use custom price if provided', () => {
      const budget = calculateTokenBudget({
        totalContextTokens: 1000,
        wastedTokens: { duplication: 100, fragmentation: 0, chattiness: 0 },
      });
      const model = getModelPreset('claude-3.5-sonnet');
      const result = estimateCostFromBudget(budget, model, {
        pricePer1KTokens: 1.0,
      });
      // 100 wasted tokens * 60 queries * 30 days * 5 devs = 900,000 tokens / 1000 * $1.0 = $900
      expect(result.total).toBe(900);
    });
  });
});
