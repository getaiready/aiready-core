import { z } from 'zod';

/**
 * Severity levels for all AIReady issues.
 */
export enum Severity {
  Critical = 'critical',
  Major = 'major',
  Minor = 'minor',
  Info = 'info',
}

export const SeveritySchema = z.nativeEnum(Severity);

/**
 * Standardized issue types across all AIReady tools.
 */
export enum IssueType {
  // Pattern & Duplication
  DuplicatePattern = 'duplicate-pattern',
  PatternInconsistency = 'pattern-inconsistency',

  // Context & Fragmentation
  ContextFragmentation = 'context-fragmentation',
  DependencyHealth = 'dependency-health',
  CircularDependency = 'circular-dependency',

  // Documentation & Quality
  DocDrift = 'doc-drift',
  NamingInconsistency = 'naming-inconsistency',
  NamingQuality = 'naming-quality',
  ArchitectureInconsistency = 'architecture-inconsistency',
  DeadCode = 'dead-code',
  MissingTypes = 'missing-types',
  MagicLiteral = 'magic-literal',
  BooleanTrap = 'boolean-trap',

  // AI Readiness Dimensions
  AiSignalClarity = 'ai-signal-clarity',
  LowTestability = 'low-testability',
  AgentNavigationFailure = 'agent-navigation-failure',
  AmbiguousApi = 'ambiguous-api',
  ChangeAmplification = 'change-amplification',
}

export const IssueTypeSchema = z.nativeEnum(IssueType);

/**
 * Analysis processing status.
 */
export enum AnalysisStatus {
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

export const AnalysisStatusSchema = z.nativeEnum(AnalysisStatus);

/**
 * AI Model Context Tiers.
 */
export enum ModelTier {
  Compact = 'compact',
  Standard = 'standard',
  Extended = 'extended',
  Frontier = 'frontier',
}

export const ModelTierSchema = z.nativeEnum(ModelTier);

/**
 * Source code location schema.
 */
export const LocationSchema = z.object({
  file: z.string(),
  line: z.number(),
  column: z.number().optional(),
  endLine: z.number().optional(),
  endColumn: z.number().optional(),
});

export type Location = z.infer<typeof LocationSchema>;

/**
 * Standard Issue schema.
 */
export const IssueSchema = z.object({
  type: IssueTypeSchema,
  severity: SeveritySchema,
  message: z.string(),
  location: LocationSchema,
  suggestion: z.string().optional(),
});

export type Issue = z.infer<typeof IssueSchema>;

/**
 * Standard Metrics schema.
 */
export const MetricsSchema = z.object({
  tokenCost: z.number().optional(),
  complexityScore: z.number().optional(),
  consistencyScore: z.number().optional(),
  docFreshnessScore: z.number().optional(),

  // AI agent readiness metrics (v0.12+)
  aiSignalClarityScore: z.number().optional(),
  agentGroundingScore: z.number().optional(),
  testabilityScore: z.number().optional(),
  docDriftScore: z.number().optional(),
  dependencyHealthScore: z.number().optional(),
  modelContextTier: ModelTierSchema.optional(),

  // Business value metrics
  estimatedMonthlyCost: z.number().optional(),
  estimatedDeveloperHours: z.number().optional(),
  comprehensionDifficultyIndex: z.number().optional(),
});

export type Metrics = z.infer<typeof MetricsSchema>;

/**
 * Individual file/module analysis result.
 */
export const AnalysisResultSchema = z.object({
  fileName: z.string(),
  issues: z.array(IssueSchema),
  metrics: MetricsSchema,
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

/**
 * Standard spoke tool output contract.
 */
export const SpokeOutputSchema = z.object({
  results: z.array(AnalysisResultSchema),
  summary: z.any(),
  metadata: z
    .object({
      toolName: z.string(),
      version: z.string(),
      timestamp: z.string(),
    })
    .catchall(z.any())
    .optional(),
});

export type SpokeOutput = z.infer<typeof SpokeOutputSchema>;

/**
 * Master Unified Report contract (CLI -> Platform).
 */
export const UnifiedReportSchema = z
  .object({
    summary: z.object({
      totalFiles: z.number(),
      totalIssues: z.number(),
      criticalIssues: z.number(),
      majorIssues: z.number(),
    }),
    results: z.array(AnalysisResultSchema),
    scoring: z
      .object({
        overall: z.number(),
        rating: z.string(),
        timestamp: z.string(),
        breakdown: z.array(
          z
            .object({
              toolName: z.string(),
              score: z.number(),
            })
            .catchall(z.any())
        ),
      })
      .optional(),
  })
  .catchall(z.any());

export type UnifiedReport = z.infer<typeof UnifiedReportSchema>;
