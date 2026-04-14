import { execFile } from 'child_process';
import { promisify } from 'util';
import { rgPath } from '@vscode/ripgrep';
import { existsSync } from 'fs';
import { join } from 'path';

const execFileAsync = promisify(execFile);

export interface GrepMatch {
  file: string;
  line: number;
  column: number;
  text: string;
  contextBefore?: string[];
  contextAfter?: string[];
}

export interface GrepOptions {
  path: string;
  pattern: string;
  isRegex?: boolean;
  context?: number;
  before?: number;
  after?: number;
  include?: string[];
  exclude?: string[];
  limit?: number;
  offset?: number;
  ignoreFile?: string;
  respectGitIgnore?: boolean;
}

export interface GrepResult {
  matches: GrepMatch[];
  summary: string;
  totalMatches: number;
  isTruncated: boolean;
}

/**
 * High-performance, context-aware grep search utility.
 * Powered by ripgrep via @vscode/ripgrep.
 */
export async function grepSearch(options: GrepOptions): Promise<GrepResult> {
  const {
    path,
    pattern,
    isRegex = true,
    context = 0,
    before = 0,
    after = 0,
    include = [],
    exclude = [],
    limit = 50,
    offset = 0,
    ignoreFile,
    respectGitIgnore = true,
  } = options;

  const args: string[] = ['--json', '--max-columns', '1000'];

  if (!isRegex) {
    args.push('--fixed-strings');
  }

  // Context lines
  if (context > 0) {
    args.push('--context', context.toString());
  } else {
    if (before > 0) args.push('--before-context', before.toString());
    if (after > 0) args.push('--after-context', after.toString());
  }

  // Ignores
  if (!respectGitIgnore) {
    args.push('--no-ignore-vcs');
  }

  if (ignoreFile && existsSync(ignoreFile)) {
    args.push('--ignore-file', ignoreFile);
  }

  // Common exclusions if not specified
  const defaultExclusions = [
    '**/node_modules/**',
    '**/dist/**',
    '**/.git/**',
    '**/build/**',
    '**/.next/**',
    '**/pnpm-lock.yaml',
  ];

  for (const exc of defaultExclusions) {
    args.push('--glob', `!${exc}`);
  }

  for (const exc of exclude) {
    args.push('--glob', `!${exc}`);
  }

  for (const inc of include) {
    args.push('--glob', inc);
  }

  args.push(pattern, path);

  try {
    const { stdout } = await execFileAsync(rgPath, args, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large result sets
    });

    const lines = stdout.split('\n').filter(Boolean);
    const matches: GrepMatch[] = [];
    let currentMatch: GrepMatch | null = null;
    let totalMatchCount = 0;

    for (const line of lines) {
      const data = JSON.parse(line);

      if (data.type === 'match') {
        const file = data.data.path.text;
        const lineNumber = data.data.line_number;
        const submatches = data.data.submatches;

        for (const submatch of submatches) {
          totalMatchCount++;

          // Skip until we reach offset
          if (totalMatchCount <= offset) continue;

          // Stop if we reached the limit
          if (matches.length >= limit) continue;

          matches.push({
            file,
            line: lineNumber,
            column: submatch.start,
            text: data.data.lines.text.trim(),
            contextBefore: [],
            contextAfter: [],
          });
        }
      } else if (data.type === 'context' && matches.length > 0) {
        // Context lines are streamed after/around matches
        // ripgrep's JSON output for context is a bit tricky to map to specific matches
        // when multiple matches are close to each other.
        // For now, we'll keep it simple and just associate context with the last match
        // if it's within a reasonable distance.
        const lastMatch = matches[matches.length - 1];
        if (
          lastMatch.file === data.data.path.text &&
          Math.abs(lastMatch.line - data.data.line_number) <=
            Math.max(context, before, after)
        ) {
          if (data.data.line_number < lastMatch.line) {
            lastMatch.contextBefore = lastMatch.contextBefore || [];
            lastMatch.contextBefore.push(data.data.lines.text.trim());
          } else {
            lastMatch.contextAfter = lastMatch.contextAfter || [];
            lastMatch.contextAfter.push(data.data.lines.text.trim());
          }
        }
      }
    }

    const isTruncated = totalMatchCount > offset + limit;
    const filesCount = new Set(matches.map((m) => m.file)).size;

    let summary = `Found ${totalMatchCount} matches across ${filesCount} files.`;
    if (isTruncated) {
      summary += ` Showing matches ${offset + 1} to ${offset + matches.length}.`;
    }

    return {
      matches,
      summary,
      totalMatches: totalMatchCount,
      isTruncated,
    };
  } catch (error: any) {
    if (error.code === 1) {
      // rg returns 1 if no matches found
      return {
        matches: [],
        summary: 'No matches found.',
        totalMatches: 0,
        isTruncated: false,
      };
    }
    throw error;
  }
}
