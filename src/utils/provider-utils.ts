import { SpokeOutputSchema } from '../types/schema';
import type {
  AnalysisResult,
  ScanOptions,
  SpokeOutput,
  ToolName,
} from '../types';
import type { ToolProvider } from '../types/contract';
import type { ToolScoringOutput } from '../scoring';

/**
 * Groups a flat array of issues by their `location.file` path into the
 * `AnalysisResult[]` shape expected by `SpokeOutputSchema`.
 *
 * Shared across multiple spoke providers that follow the simple analyze → group
 * → schema-parse pattern (doc-drift, deps, etc.).
 */
export function groupIssuesByFile(issues: any[]): AnalysisResult[] {
  const fileIssuesMap = new Map<string, any[]>();
  for (const issue of issues) {
    const file = issue.location?.file ?? 'unknown';
    if (!fileIssuesMap.has(file)) fileIssuesMap.set(file, []);
    fileIssuesMap.get(file)!.push(issue);
  }
  return Array.from(fileIssuesMap.entries()).map(([fileName, issueList]) => ({
    fileName,
    issues: issueList,
    metrics: {},
  }));
}

/**
 * Builds a simple `ToolScoringOutput` from a spoke summary object.
 * Shared across providers whose scoring logic is purely pass-through
 * (score and recommendations are already computed in the analyzer).
 */
export function buildSimpleProviderScore(
  toolName: string,
  summary: any,
  rawData: any = {}
): ToolScoringOutput {
  return {
    toolName,
    score: summary.score ?? 0,
    rawMetrics: { ...summary, ...rawData },
    factors: [],
    recommendations: (summary.recommendations ?? []).map((action: string) => ({
      action,
      estimatedImpact: 5,
      priority: 'medium' as const,
    })),
  };
}

/**
 * Builds and validates a `SpokeOutput` with common provider metadata.
 * This removes repeated schema/metadata boilerplate from spoke providers.
 */
export function buildSpokeOutput(
  toolName: string,
  version: string,
  summary: any,
  results: AnalysisResult[],
  metadata: Record<string, unknown> = {}
): SpokeOutput {
  return SpokeOutputSchema.parse({
    results,
    summary,
    metadata: {
      toolName,
      version,
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  });
}

export interface ProviderFactoryConfig<TReport> {
  id: ToolName;
  alias: string[];
  version: string;
  defaultWeight: number;
  analyzeReport: (options: ScanOptions) => Promise<TReport>;
  getResults: (report: TReport) => AnalysisResult[];
  getSummary: (report: TReport) => any;
  getMetadata?: (report: TReport) => Record<string, unknown>;
  score: (output: SpokeOutput, options: ScanOptions) => ToolScoringOutput;
}

/**
 * Creates a tool provider from shared analyze/score plumbing.
 * Spokes only provide report adapters and scoring behavior.
 */
export function createProvider<TReport>(
  config: ProviderFactoryConfig<TReport>
): ToolProvider {
  return {
    id: config.id,
    alias: config.alias,
    defaultWeight: config.defaultWeight,
    async analyze(options: ScanOptions): Promise<SpokeOutput> {
      const report = await config.analyzeReport(options);
      return buildSpokeOutput(
        config.id,
        config.version,
        config.getSummary(report),
        config.getResults(report),
        config.getMetadata?.(report) ?? {}
      );
    },
    score(output: SpokeOutput, options: ScanOptions): ToolScoringOutput {
      return config.score(output, options);
    },
  };
}
