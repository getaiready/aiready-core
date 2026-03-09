import { describe, it, expect } from 'vitest';
import { validateSpokeOutput } from '../types/contract';

describe('Tool Contracts', () => {
  it('should validate correctly formed spoke output', () => {
    const output = {
      results: [{ fileName: 'f1.ts', issues: [] }],
      summary: { totalFiles: 1 },
    };
    const result = validateSpokeOutput('test', output);
    expect(result.valid).toBe(true);
  });

  it('should fail on missing summary', () => {
    const output = {
      results: [],
    };
    const result = validateSpokeOutput('test', output);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("test: missing 'summary'");
  });

  it('should allow file/filePath as alias for fileName', () => {
    const output = {
      results: [
        { file: 'f1.ts', issues: [] },
        { filePath: 'f2.ts', issues: [] },
      ],
      summary: {},
    };
    const result = validateSpokeOutput('test', output);
    expect(result.valid).toBe(true);
  });
});
