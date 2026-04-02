import { z } from 'zod';

/**
 * Common tool options
 */
export interface ToolOptions {
  /** Maximum number of results to return */
  maxResults?: number;
  /** Severity filter */
  severity?: 'info' | 'warning' | 'error' | 'critical';
  /** Output format */
  outputFormat?: 'json' | 'text' | 'html';
  /** Additional configuration */
  config?: Record<string, unknown>;
  /** Custom key-value pairs */
  [key: string]: any;
}

/**
 * Source code location schema.
 */
/** Zod schema for Location object */
export const LocationSchema = z.object({
  file: z.string(),
  line: z.number(),
  column: z.number().optional(),
  endLine: z.number().optional(),
  endColumn: z.number().optional(),
});

export type Location = z.infer<typeof LocationSchema>;

/**
 * Scan options for tool providers
 */
export interface ScanOptions extends ToolOptions {
  /** Target output format */
  output?: string | { format: string; file?: string };
  /** Visual format (json/console/html) */
  format?: 'json' | 'console' | 'html';
  /** Whether to run in parallel */
  parallel?: boolean;
}
