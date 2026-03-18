import {
  AnalysisResult,
  Issue,
  Metrics,
  SpokeOutput,
  Severity,
  IssueType,
} from '../types';

/**
 * Normalizes raw issue data into a strict Issue object.
 */
export function normalizeIssue(raw: any): Issue {
  return {
    type: raw.type ?? IssueType.PatternInconsistency,
    severity: raw.severity ?? raw.severityLevel ?? Severity.Info,
    message: raw.message ?? 'Unknown issue',
    location: raw.location ?? {
      file: raw.fileName ?? raw.file ?? raw.filePath ?? 'unknown',
      line: raw.line ?? 1,
      column: raw.column,
    },
    suggestion: raw.suggestion,
  };
}

/**
 * Normalizes raw metrics into a strict Metrics object.
 */
export function normalizeMetrics(raw: any): Metrics {
  return {
    tokenCost: raw.tokenCost ?? 0,
    complexityScore: raw.complexityScore ?? 0,
    consistencyScore: raw.consistencyScore,
    docFreshnessScore: raw.docFreshnessScore,
    aiSignalClarityScore: raw.aiSignalClarityScore,
    agentGroundingScore: raw.agentGroundingScore,
    testabilityScore: raw.testabilityScore,
    docDriftScore: raw.docDriftScore,
    dependencyHealthScore: raw.dependencyHealthScore,
    modelContextTier: raw.modelContextTier,
    estimatedMonthlyCost: raw.estimatedMonthlyCost,
    estimatedDeveloperHours: raw.estimatedDeveloperHours,
    comprehensionDifficultyIndex: raw.comprehensionDifficultyIndex,
    totalSymbols: raw.totalSymbols,
    totalExports: raw.totalExports,
  };
}

/**
 * Normalizes raw analysis result from any spoke into a strict AnalysisResult object.
 */
export function normalizeAnalysisResult(raw: any): AnalysisResult {
  const fileName = raw.fileName ?? raw.file ?? raw.filePath ?? 'unknown';
  const rawIssues = Array.isArray(raw.issues) ? raw.issues : [];

  return {
    fileName,
    issues: rawIssues.map((issue: any) => {
      // Handle cases where issue might be a simple string (seen in some legacy outputs)
      if (typeof issue === 'string') {
        return {
          type: IssueType.PatternInconsistency, // Default fallback
          severity: raw.severity ?? Severity.Info,
          message: issue,
          location: { file: fileName, line: 1 },
        };
      }

      return normalizeIssue({
        ...issue,
        fileName: issue.fileName ?? fileName,
        severity: issue.severity ?? raw.severity,
      });
    }),
    metrics: normalizeMetrics(raw.metrics ?? {}),
  };
}

/**
 * Normalizes a full SpokeOutput.
 */
export function normalizeSpokeOutput(raw: any, toolName: string): SpokeOutput {
  const rawResults = Array.isArray(raw.results) ? raw.results : [];

  return {
    results: rawResults.map(normalizeAnalysisResult),
    summary: raw.summary ?? {
      totalFiles: rawResults.length,
      totalIssues: 0,
      criticalIssues: 0,
      majorIssues: 0,
    },
    metadata: {
      toolName: raw.metadata?.toolName ?? toolName,
      version: raw.metadata?.version,
      timestamp: raw.metadata?.timestamp ?? new Date().toISOString(),
      config: raw.metadata?.config,
    },
  };
}
