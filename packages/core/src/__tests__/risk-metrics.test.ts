import { describe, it, expect } from 'vitest';
import {
  calculateKnowledgeConcentration,
  calculateDebtInterest,
} from '../business/risk-metrics';

describe('Risk Metrics', () => {
  describe('calculateKnowledgeConcentration', () => {
    it('should calculate low risk correctly', () => {
      const result = calculateKnowledgeConcentration({
        uniqueConceptFiles: 10,
        totalFiles: 100,
        singleAuthorFiles: 5,
        orphanFiles: 2,
      });

      expect(result.score).toBeLessThan(30);
      expect(result.rating).toBe('low');
      expect(result.recommendations).toHaveLength(2);
    });

    it('should calculate moderate risk correctly', () => {
      const result = calculateKnowledgeConcentration({
        uniqueConceptFiles: 40,
        totalFiles: 100,
        singleAuthorFiles: 30,
        orphanFiles: 10,
      });

      expect(result.score).toBe(37);
      expect(result.rating).toBe('moderate');
    });

    it('should calculate high risk correctly', () => {
      const result = calculateKnowledgeConcentration({
        uniqueConceptFiles: 60,
        totalFiles: 100,
        singleAuthorFiles: 50,
        orphanFiles: 20,
      });

      expect(result.score).toBe(59);
      expect(result.rating).toBe('high');
    });

    it('should calculate critical risk correctly', () => {
      const result = calculateKnowledgeConcentration({
        uniqueConceptFiles: 80,
        totalFiles: 100,
        singleAuthorFiles: 70,
        orphanFiles: 40,
      });

      expect(result.score).toBe(83);
      expect(result.rating).toBe('critical');
    });

    it('should handle zero files', () => {
      const result = calculateKnowledgeConcentration({
        uniqueConceptFiles: 0,
        totalFiles: 0,
        singleAuthorFiles: 0,
        orphanFiles: 0,
      });

      expect(result.score).toBe(0);
      expect(result.rating).toBe('low');
      expect(result.recommendations).toHaveLength(0);
    });
  });

  describe('calculateDebtInterest', () => {
    it('should calculate interest correctly', () => {
      const principal = 1000;
      const monthlyRate = 0.05; // 5%
      const result = calculateDebtInterest(principal, monthlyRate);

      expect(result.principal).toBe(principal);
      expect(result.monthlyRate).toBe(monthlyRate);
      expect(result.monthlyCost).toBe(50);
      expect(result.annualRate).toBeCloseTo(Math.pow(1.05, 12) - 1);
      expect(result.projections.months6).toBeCloseTo(
        principal * Math.pow(1.05, 6)
      );
      expect(result.projections.months12).toBeCloseTo(
        principal * Math.pow(1.05, 12)
      );
      expect(result.projections.months24).toBeCloseTo(
        principal * Math.pow(1.05, 24)
      );
    });

    it('should handle zero principal', () => {
      const result = calculateDebtInterest(0, 0.05);
      expect(result.monthlyCost).toBe(0);
      expect(result.projections.months12).toBe(0);
    });
  });
});
