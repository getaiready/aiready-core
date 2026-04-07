import { z } from 'zod';
import { SeveritySchema } from '../enums';

/**
 * Auto-exclusion configuration for common patterns.
 */
export const AutoExcludeSchema = z
  .object({
    /** Enable automatic detection of test files */
    tests: z.boolean().optional(),
    /** Enable automatic detection of mock files */
    mocks: z.boolean().optional(),
    /** Enable automatic detection of barrel/re-export files */
    barrels: z.boolean().optional(),
    /** Enable automatic detection of generated files */
    generated: z.boolean().optional(),
  })
  .optional();

/**
 * Tiered exclusion configuration - allows global and tool-specific excludes.
 */
const TieredExcludeSchema = z.record(z.string(), z.array(z.string()));

/**
 * Global AIReady Configuration Schema.
 * Strict definition for aiready.json and related config files.
 */
export const AIReadyConfigSchema = z
  .object({
    /** Extend from another config file (relative path) */
    extends: z.string().optional(),
    /** Files or directories to exclude from scan (flat array or tiered) */
    exclude: z.union([z.array(z.string()), TieredExcludeSchema]).optional(),
    /** Auto-exclusion settings for common patterns */
    autoExclude: AutoExcludeSchema,
    /** Fail CI/CD if score below threshold (0-100) */
    threshold: z.number().optional(),
    /** Fail on issues: critical, major, any */
    failOn: z.enum(['critical', 'major', 'any', 'none']).optional(),
    /** Scan-specific configuration */
    scan: z
      .object({
        include: z.array(z.string()).optional(),
        exclude: z.array(z.string()).optional(),
        parallel: z.boolean().optional(),
        deep: z.boolean().optional(),
        tools: z.array(z.string()).optional(),
      })
      .optional(),
    /** Output-specific configuration */
    output: z
      .object({
        /** Output format (json, console, html) */
        format: z.enum(['json', 'console', 'html']).optional(),
        /** Output file path */
        path: z.string().optional(),
        /** Output directory */
        saveTo: z.string().optional(),
        /** Whether to show score breakdown in console */
        showBreakdown: z.boolean().optional(),
        /** Baseline report to compare against */
        compareBaseline: z.string().optional(),
      })
      .optional(),
    /** Tool-specific configuration overrides (Strictly ToolName -> Config) */
    tools: z
      .record(
        z.string(),
        z
          .object({
            /** Whether to enable this tool */
            enabled: z.boolean().optional(),
            /** Severity overrides for specific categories */
            severityOverrides: z.record(z.string(), SeveritySchema).optional(),
          })
          .catchall(z.any())
      )
      .optional(),
    /** Scoring profile and weights */
    scoring: z
      .object({
        /** Name of the scoring profile (e.g. "strict", "balanced") */
        profile: z.string().optional(),
        /** Custom weights for tools and metrics */
        weights: z.record(z.string(), z.number()).optional(),
      })
      .optional(),
    /** Visualizer settings (interactive graph) */
    visualizer: z
      .object({
        groupingDirs: z.array(z.string()).optional(),
        graph: z
          .object({
            maxNodes: z.number().optional(),
            maxEdges: z.number().optional(),
          })
          .optional(),
      })
      .optional(),
  })
  .catchall(z.any());

export type AIReadyConfig = z.infer<typeof AIReadyConfigSchema>;
export type AutoExcludeConfig = z.infer<typeof AutoExcludeSchema>;
