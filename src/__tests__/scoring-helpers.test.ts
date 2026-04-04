import { describe, it, expect } from 'vitest';
import { buildStandardToolScore } from '../utils/scoring-helpers';

import { ToolName } from '../types';
import { ReadinessRating } from '../utils/rating-helpers';

describe('scoring-helpers', () => {
  describe('buildStandardToolScore', () => {
    it('should correctly build a ToolScoringOutput', () => {
      const report = {
        toolName: ToolName.TestabilityIndex,
        score: 85,
        rawData: { some: 'data' },
        dimensions: {
          testCoverageRatio: 90,
          purityScore: 80,
        },
        dimensionNames: {
          testCoverageRatio: 'Test Coverage',
          purityScore: 'Function Purity',
        },
        recommendations: ['Add more tests'],
        rating: ReadinessRating.Excellent,
      };

      const output = buildStandardToolScore(report);

      expect(output.toolName).toBe(ToolName.TestabilityIndex);
      expect(output.score).toBe(85);
      expect(output.rawMetrics.rating).toBe(ReadinessRating.Excellent);
      expect(output.factors).toHaveLength(2);
      expect(output.factors[0].name).toBe('Test Coverage');
      expect(output.factors[0].impact).toBe(40); // 90 - 50
      expect(output.recommendations).toHaveLength(1);
      expect(output.recommendations[0].action).toBe('Add more tests');
      expect(output.recommendations[0].priority).toBe('medium');
    });

    it('should use high priority for low scores', () => {
      const output = buildStandardToolScore({
        toolName: ToolName.TestabilityIndex,
        score: 40,
        rawData: {},
        dimensions: {},
        dimensionNames: {},
        recommendations: ['Fix everything'],
        rating: ReadinessRating.Critical,
      });

      expect(output.recommendations[0].priority).toBe('high');
    });

    it('should correctly format all dimension descriptions', () => {
      const report = {
        toolName: ToolName.TestabilityIndex,
        score: 85,
        rawData: {
          score: 85,
          testFiles: 5,
          sourceFiles: 10,
          pureFunctions: 8,
          totalFunctions: 10,
          injectionPatterns: 2,
          totalClasses: 4,
          deepDirectories: 1,
          totalDirectories: 5,
          untypedExports: 3,
          totalExports: 6,
        },
        dimensions: {
          testCoverageRatio: 90,
          purityScore: 80,
          dependencyInjectionScore: 70,
          structureClarityScore: 60,
          apiClarityScore: 50,
          graphStabilityScore: 40,
        },
        dimensionNames: {
          testCoverageRatio: 'Test Coverage',
          purityScore: 'Function Purity',
          dependencyInjectionScore: 'DI Score',
          structureClarityScore: 'Structure Clarity',
          apiClarityScore: 'API Clarity',
          graphStabilityScore: 'Graph Stability',
        },
        recommendations: [],
      };

      const output = buildStandardToolScore(report);

      expect(
        output.factors.find((f) => f.name === 'Test Coverage')?.description
      ).toBe('5 test files / 10 source files');
      expect(
        output.factors.find((f) => f.name === 'Function Purity')?.description
      ).toBe('8/10 functions are pure');
      expect(
        output.factors.find((f) => f.name === 'DI Score')?.description
      ).toBe('2/4 classes use DI');
      expect(
        output.factors.find((f) => f.name === 'Structure Clarity')?.description
      ).toBe('1 of 5 dirs exceed recommended depth');
      expect(
        output.factors.find((f) => f.name === 'API Clarity')?.description
      ).toBe('3 of 6 exports lack type annotations');
      expect(
        output.factors.find((f) => f.name === 'Graph Stability')?.description
      ).toBe('85/100');
    });
  });
});
