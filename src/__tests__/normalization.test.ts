import { describe, it, expect } from 'vitest';
import {
  normalizeIssue,
  normalizeMetrics,
  normalizeAnalysisResult,
  normalizeSpokeOutput,
} from '../utils/normalization';
import { Severity, IssueType } from '../types';

describe('normalization', () => {
  describe('normalizeIssue', () => {
    it('should handle all file name fields sequentially', () => {
      expect(normalizeIssue({ fileName: 'a.ts' }).location.file).toBe('a.ts');
      expect(normalizeIssue({ file: 'b.ts' }).location.file).toBe('b.ts');
      expect(normalizeIssue({ filePath: 'c.ts' }).location.file).toBe('c.ts');
      expect(normalizeIssue({}).location.file).toBe('unknown');
    });

    it('should handle all severity options exhaustively', () => {
      expect(normalizeIssue({ severity: Severity.Critical }).severity).toBe(
        Severity.Critical
      );
      expect(normalizeIssue({ severityLevel: Severity.Major }).severity).toBe(
        Severity.Major
      );
      expect(normalizeIssue({}).severity).toBe(Severity.Info);
    });

    it('should handle location object', () => {
      const loc = { file: 'test.ts', line: 10 };
      expect(normalizeIssue({ location: loc }).location).toBe(loc);
    });

    it('should handle missing suggestion and type', () => {
      const result = normalizeIssue({});
      expect(result.type).toBe(IssueType.PatternInconsistency);
      expect(result.suggestion).toBeUndefined();
    });
  });

  describe('normalizeMetrics', () => {
    it('should handle all optional fields', () => {
      const raw = {
        tokenCost: 10,
        complexityScore: 5,
        consistencyScore: 3,
        docFreshnessScore: 4,
        aiSignalClarityScore: 5,
        agentGroundingScore: 2,
        testabilityScore: 3,
        docDriftScore: 1,
        dependencyHealthScore: 4,
        modelContextTier: 'standard',
        estimatedMonthlyCost: 100,
        estimatedDeveloperHours: 10,
        comprehensionDifficultyIndex: 5,
        totalSymbols: 100,
        totalExports: 20,
      };
      const result = normalizeMetrics(raw);
      expect(result).toEqual(raw);
    });

    it('should default tokenCost and complexityScore', () => {
      const result = normalizeMetrics({});
      expect(result.tokenCost).toBe(0);
      expect(result.complexityScore).toBe(0);
    });
  });

  describe('normalizeAnalysisResult', () => {
    it('should handle various file name fields in result', () => {
      expect(normalizeAnalysisResult({ fileName: 'a' }).fileName).toBe('a');
      expect(normalizeAnalysisResult({ file: 'b' }).fileName).toBe('b');
      expect(normalizeAnalysisResult({ filePath: 'c' }).fileName).toBe('c');
      expect(normalizeAnalysisResult({}).fileName).toBe('unknown');
    });

    it('should handle string issues with and without result-level severity', () => {
      const res1 = normalizeAnalysisResult({
        file: 'test.ts',
        issues: ['error'],
        severity: Severity.Critical,
      });
      expect(res1.issues[0].severity).toBe(Severity.Critical);

      const res2 = normalizeAnalysisResult({
        file: 'test.ts',
        issues: ['error'],
      });
      expect(res2.issues[0].severity).toBe(Severity.Info);
    });

    it('should handle object issues and merge severity', () => {
      const result = normalizeAnalysisResult({
        filePath: 'test.ts',
        severity: Severity.Major,
        issues: [{ message: 'detail', severity: Severity.Critical }],
      });
      expect(result.issues[0].severity).toBe(Severity.Critical);
    });
  });

  describe('normalizeSpokeOutput', () => {
    it('should handle missing summary and results', () => {
      const result = normalizeSpokeOutput({}, 'tool');
      expect(result.results).toEqual([]);
      expect(result.summary.totalFiles).toBe(0);
    });

    it('should use provided metadata', () => {
      const metadata = { toolName: 't', version: '1', config: {} };
      const result = normalizeSpokeOutput({ metadata }, 'fallback');
      expect(result.metadata.toolName).toBe('t');
      expect(result.metadata.version).toBe('1');
    });
  });
});
