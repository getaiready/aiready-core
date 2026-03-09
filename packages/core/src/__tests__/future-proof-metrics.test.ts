import { describe, it, expect } from 'vitest';
import {
  calculateFutureProofScore,
  calculateExtendedFutureProofScore,
} from '../future-proof-metrics';

describe('Future-Proof Metrics Advanced', () => {
  const baseParams = {
    cognitiveLoad: { score: 20, rating: 'low' } as any,
    patternEntropy: {
      entropy: 0.2,
      rating: 'low',
      recommendations: ['Reduce entropy'],
    } as any,
    conceptCohesion: { score: 0.8, rating: 'good' } as any,
  };

  it('should calculate aggregate score correctly with recommendations', () => {
    const result = calculateFutureProofScore(baseParams);
    expect(result.score).toBe(80);
    expect(result.recommendations).toContainEqual(
      expect.objectContaining({ action: 'Reduce entropy' })
    );
  });

  it('should add cohesion recommendation for poor rating', () => {
    const poorCohesion = {
      ...baseParams,
      conceptCohesion: { score: 0.2, rating: 'poor' } as any,
    };
    const result = calculateFutureProofScore(poorCohesion);
    expect(
      result.recommendations.some((r) =>
        r.action.includes('grouping related exports')
      )
    ).toBe(true);
  });

  it('should calculate extended score correctly', () => {
    const extendedParams = {
      ...baseParams,
      aiSignalClarity: { score: 10, rating: 'low', recommendations: [] } as any,
      agentGrounding: {
        score: 90,
        rating: 'excellent',
        recommendations: [],
      } as any,
      testability: { score: 85, rating: 'good', recommendations: [] } as any,
      docDrift: { score: 15, rating: 'minimal', recommendations: [] } as any,
      dependencyHealth: {
        score: 95,
        rating: 'excellent',
        recommendations: [],
      } as any,
    };

    const result = calculateExtendedFutureProofScore(extendedParams);
    expect(result.score).toBeGreaterThan(80);
    expect(result.factors.length).toBe(8);
  });

  it('should calculate extended score without optional params', () => {
    const extendedParams = {
      ...baseParams,
      aiSignalClarity: { score: 10, rating: 'low', recommendations: [] } as any,
      agentGrounding: {
        score: 90,
        rating: 'excellent',
        recommendations: [],
      } as any,
      testability: { score: 85, rating: 'good', recommendations: [] } as any,
    };

    const result = calculateExtendedFutureProofScore(extendedParams);
    expect(result.score).toBeGreaterThan(0);
    expect(result.factors.length).toBe(6);
  });
});
