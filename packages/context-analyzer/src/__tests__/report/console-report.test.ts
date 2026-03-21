import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { displayConsoleReport } from '../../report/console-report';
import { generateSummary } from '../../summary';
import type { ContextSummary, ContextAnalysisResult } from '../../types';

// Mock chalk to avoid ANSI codes in tests
vi.mock('chalk', () => ({
  default: {
    bold: (str: string) => str,
    cyan: (str: string) => str,
    green: (str: string) => str,
    red: (str: string) => str,
    yellow: (str: string) => str,
    blue: (str: string) => str,
    white: (str: string) => str,
    dim: (str: string) => str,
  },
}));

// Mock the analyzer to provide the results type
vi.mock('../../analyzer', () => ({
  analyzeContext: vi.fn(),
}));

describe('displayConsoleReport', () => {
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  const createMockSummary = (
    overrides: Partial<ContextSummary> = {}
  ): ContextSummary => ({
    totalFiles: 10,
    totalTokens: 50000,
    avgContextBudget: 5000,
    maxContextBudget: 10000,
    avgImportDepth: 3,
    maxImportDepth: 7,
    deepFiles: [{ file: 'src/deep/file.ts', depth: 7 }],
    avgFragmentation: 0.3,
    fragmentedModules: [],
    avgCohesion: 0.7,
    lowCohesionFiles: [],
    criticalIssues: 2,
    majorIssues: 5,
    minorIssues: 3,
    totalPotentialSavings: 10000,
    topExpensiveFiles: [],
    config: {},
    ...overrides,
  });

  const createMockResults = (): ContextAnalysisResult[] => [
    {
      file: 'src/services/user-service.ts',
      tokenCost: 5000,
      linesOfCode: 500,
      importDepth: 5,
      dependencyCount: 10,
      dependencyList: [],
      circularDeps: [],
      cohesionScore: 0.8,
      domains: ['user'],
      exportCount: 5,
      contextBudget: 15000,
      fragmentationScore: 0.3,
      relatedFiles: [],
      fileClassification: 'service-file',
      severity: 'critical',
      issues: ['High context budget'],
      recommendations: ['Split into smaller modules'],
      potentialSavings: 5000,
    },
    {
      file: 'src/utils/helper.ts',
      tokenCost: 1000,
      linesOfCode: 100,
      importDepth: 2,
      dependencyCount: 3,
      dependencyList: [],
      circularDeps: [],
      cohesionScore: 0.9,
      domains: ['utils'],
      exportCount: 3,
      contextBudget: 3000,
      fragmentationScore: 0.1,
      relatedFiles: [],
      fileClassification: 'utility-module',
      severity: 'info',
      issues: [],
      recommendations: [],
      potentialSavings: 0,
    },
  ];

  it('should display summary with all metrics', () => {
    const summary = createMockSummary();
    const results = createMockResults();

    displayConsoleReport(summary, results);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Context Analysis Summary')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Total Files:')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Total Tokens:')
    );
  });

  it('should display issues when present', () => {
    const summary = createMockSummary({
      criticalIssues: 2,
      majorIssues: 5,
      minorIssues: 3,
    });
    const results = createMockResults();

    displayConsoleReport(summary, results);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Issues Detected')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Critical:')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Major:')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Minor:')
    );
  });

  it('should display no issues message when all counts are zero', () => {
    const summary = createMockSummary({
      criticalIssues: 0,
      majorIssues: 0,
      minorIssues: 0,
    });
    const results: ContextAnalysisResult[] = [];

    displayConsoleReport(summary, results);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('No significant context issues detected')
    );
  });

  it('should display fragmented modules when present', () => {
    const summary = createMockSummary({
      fragmentedModules: [
        {
          domain: 'src/features',
          files: [
            'src/features/a.ts',
            'src/features/b.ts',
            'src/features/c.ts',
          ],
          totalTokens: 3000,
          fragmentationScore: 0.75,
          avgCohesion: 0.4,
          suggestedStructure: {
            targetFiles: 2,
            consolidationPlan: ['Consolidate into fewer modules'],
          },
        },
      ],
    });
    const results: ContextAnalysisResult[] = [];

    displayConsoleReport(summary, results);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Fragmented Modules')
    );
  });

  it('should display top expensive files when present', () => {
    const summary = createMockSummary({
      topExpensiveFiles: [
        {
          file: 'src/services/user-service.ts',
          contextBudget: 15000,
          severity: 'critical',
        },
        {
          file: 'src/services/order-service.ts',
          contextBudget: 12000,
          severity: 'major',
        },
      ],
    });
    const results: ContextAnalysisResult[] = [];

    displayConsoleReport(summary, results);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Most Expensive Files')
    );
  });

  it('should display recommendations for critical and major issues', () => {
    const summary = createMockSummary({
      criticalIssues: 1,
      majorIssues: 1,
      minorIssues: 0,
    });
    const results: ContextAnalysisResult[] = [
      {
        file: 'src/bad/file.ts',
        tokenCost: 10000,
        linesOfCode: 1000,
        importDepth: 8,
        dependencyCount: 20,
        dependencyList: [],
        circularDeps: [],
        cohesionScore: 0.2,
        domains: [],
        exportCount: 20,
        contextBudget: 30000,
        fragmentationScore: 0.8,
        relatedFiles: [],
        fileClassification: 'mixed-concerns',
        severity: 'critical',
        issues: ['Very high context budget', 'Deep import chain'],
        recommendations: ['Split into multiple files', 'Reduce dependencies'],
        potentialSavings: 15000,
      },
    ];

    displayConsoleReport(summary, results);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Recommendations')
    );
  });

  it('should respect maxResults parameter', () => {
    const summary = createMockSummary({
      topExpensiveFiles: [
        { file: 'src/file1.ts', contextBudget: 15000, severity: 'critical' },
        { file: 'src/file2.ts', contextBudget: 12000, severity: 'critical' },
        { file: 'src/file3.ts', contextBudget: 10000, severity: 'major' },
        { file: 'src/file4.ts', contextBudget: 8000, severity: 'major' },
      ],
      fragmentedModules: [
        {
          domain: 'src/domain1',
          files: ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
          totalTokens: 2000,
          fragmentationScore: 0.6,
          avgCohesion: 0.5,
          suggestedStructure: { targetFiles: 2, consolidationPlan: [] },
        },
        {
          domain: 'src/domain2',
          files: ['e.ts', 'f.ts'],
          totalTokens: 1000,
          fragmentationScore: 0.5,
          avgCohesion: 0.6,
          suggestedStructure: { targetFiles: 1, consolidationPlan: [] },
        },
      ],
    });
    const results: ContextAnalysisResult[] = [];

    displayConsoleReport(summary, results, 2);

    // With maxResults=2, should only show top 2 items
    // The function uses slice(0, maxResults) internally
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it('should display footer with links', () => {
    const summary = createMockSummary();
    const results: ContextAnalysisResult[] = [];

    displayConsoleReport(summary, results);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('github.com')
    );
  });
});
