import { describe, it, expect, vi } from 'vitest';
import { generateHTMLReport } from '../../report/html-report';
import type { ContextSummary, ContextAnalysisResult } from '../../types';

// Mock @aiready/core
vi.mock('@aiready/core', () => ({
  generateReportHead: (title: string) => `<head><title>${title}</title></head>`,
  generateStatCards: (stats: any[]) =>
    `<div class="stats">${stats.map((s) => s.label).join(', ')}</div>`,
  generateTable: (options: { headers: string[]; rows: string[][] }) =>
    `<table><thead><tr>${options.headers.map((h) => `<th>${h}</th>`).join('')}</thead><tbody>${options.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`,
  generateReportFooter: (options: any) =>
    `<footer>${options.title} - ${options.packageUrl}</footer>`,
}));

describe('generateHTMLReport', () => {
  const createMockSummary = (
    overrides: Partial<ContextSummary> = {}
  ): ContextSummary => ({
    totalFiles: 10,
    totalTokens: 50000,
    avgContextBudget: 5000,
    maxContextBudget: 10000,
    avgImportDepth: 3,
    maxImportDepth: 7,
    deepFiles: [],
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
  ];

  it('should generate HTML report with all sections', () => {
    const summary = createMockSummary({
      criticalIssues: 2,
      majorIssues: 1,
      minorIssues: 1,
    });
    const results = createMockResults();

    const html = generateHTMLReport(summary, results);

    expect(html).toContain('AIReady Context Analysis Report');
    expect(html).toContain('head');
    expect(html).toContain('body');
  });

  it('should include stats cards', () => {
    const summary = createMockSummary();
    const results: ContextAnalysisResult[] = [];

    const html = generateHTMLReport(summary, results);

    expect(html).toContain('Files Analyzed');
    expect(html).toContain('Total Tokens');
    expect(html).toContain('Avg Context Budget');
    expect(html).toContain('Total Issues');
  });

  it('should include issues summary when issues exist', () => {
    const summary = createMockSummary({
      criticalIssues: 2,
      majorIssues: 3,
      minorIssues: 1,
      totalPotentialSavings: 5000,
    });
    const results: ContextAnalysisResult[] = [];

    const html = generateHTMLReport(summary, results);

    expect(html).toContain('Issues Summary');
    expect(html).toContain('Critical:');
    expect(html).toContain('Major:');
    expect(html).toContain('Minor:');
    expect(html).toContain('Potential Savings');
  });

  it('should not include issues section when no issues', () => {
    const summary = createMockSummary({
      criticalIssues: 0,
      majorIssues: 0,
      minorIssues: 0,
    });
    const results: ContextAnalysisResult[] = [];

    const html = generateHTMLReport(summary, results);

    expect(html).not.toContain('Issues Summary');
  });

  it('should include fragmented modules when present', () => {
    const summary = createMockSummary({
      fragmentedModules: [
        {
          domain: 'src/features',
          files: ['a.ts', 'b.ts', 'c.ts'],
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

    const html = generateHTMLReport(summary, results);

    expect(html).toContain('Fragmented Modules');
    expect(html).toContain('src/features');
    expect(html).toContain('Domain');
    expect(html).toContain('Files');
    expect(html).toContain('Fragmentation');
  });

  it('should not include fragmented modules when none exist', () => {
    const summary = createMockSummary({
      fragmentedModules: [],
    });
    const results: ContextAnalysisResult[] = [];

    const html = generateHTMLReport(summary, results);

    expect(html).not.toContain('Fragmented Modules');
  });

  it('should include expensive files when present', () => {
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

    const html = generateHTMLReport(summary, results);

    expect(html).toContain('Most Expensive Files');
    expect(html).toContain('src/services/user-service.ts');
    expect(html).toContain('Context Budget');
    expect(html).toContain('Severity');
  });

  it('should not include expensive files when none exist', () => {
    const summary = createMockSummary({
      topExpensiveFiles: [],
    });
    const results: ContextAnalysisResult[] = [];

    const html = generateHTMLReport(summary, results);

    expect(html).not.toContain('Most Expensive Files');
  });

  it('should include footer with package info', () => {
    const summary = createMockSummary();
    const results: ContextAnalysisResult[] = [];

    const html = generateHTMLReport(summary, results);

    expect(html).toContain('<footer>');
    expect(html).toContain('context-analyzer');
    expect(html).toContain('github.com');
  });

  it('should include token values in stats', () => {
    const summary = createMockSummary({
      totalTokens: 50000,
      avgContextBudget: 5000,
    });
    const results: ContextAnalysisResult[] = [];

    const html = generateHTMLReport(summary, results);

    // Should include stats section
    expect(html).toContain('Total Tokens');
  });

  it('should show issues when present', () => {
    const summary = createMockSummary({
      criticalIssues: 1,
      majorIssues: 0,
      minorIssues: 0,
    });
    const results: ContextAnalysisResult[] = [];

    const html = generateHTMLReport(summary, results);

    // Should show issues section
    expect(html).toContain('Issues Summary');
  });
});
