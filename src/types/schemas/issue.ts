import { z } from 'zod';
import { IssueTypeSchema, SeveritySchema } from '../enums';
import { LocationSchema } from '../common';

/**
 * Standard Issue schema used across all tools.
 */

/** Zod schema for Issue object */
export const IssueSchema = z.object({
  type: IssueTypeSchema,
  severity: SeveritySchema,
  message: z.string(),
  location: LocationSchema,
  suggestion: z.string().optional(),
});

export type Issue = z.infer<typeof IssueSchema>;
