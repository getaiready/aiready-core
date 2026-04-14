import { describe, it, expect } from 'vitest';
import { grepSearch } from '../utils/grep';
import { resolve } from 'path';

describe('grepSearch', () => {
  it('should find patterns in the current directory', async () => {
    // Search for "grepSearch" in this project (packages/core)
    const result = await grepSearch({
      path: resolve('.'),
      pattern: 'grepSearch',
      limit: 10,
    });

    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.summary).toContain('matches across');
    expect(result.matches[0].text).toContain('grepSearch');
  });

  it('should support context lines', async () => {
    // Search for "GrepMatch" with context
    const result = await grepSearch({
      path: resolve('.'),
      pattern: 'export interface GrepMatch',
      context: 2,
      limit: 1,
    });

    if (result.matches.length > 0) {
      const match = result.matches[0];
      expect(match.contextAfter?.length).toBeGreaterThan(0);
    }
  });

  it('should return empty matches if nothing is found', async () => {
    const result = await grepSearch({
      path: resolve('.'),
      pattern: 'THIS_PATTERN_SHOULD_NOT_EXIST_1234567890',
      exclude: ['src/__tests__/grep.test.ts'],
    });

    expect(result.matches.length).toBe(0);
    expect(result.totalMatches).toBe(0);
    expect(result.summary).toBe('No matches found.');
  });
});
