import { describe, it, expect } from 'vitest';
import path from 'path';
import { findReferences } from '../src/tools/find-references';

describe('findReferences', () => {
  const fixturePath = path.resolve(__dirname, 'fixtures/simple-project');

  it('should find references to a function', async () => {
    const { references, total_count } = await findReferences(
      'add',
      fixturePath
    );
    expect(total_count).toBeGreaterThan(0);
    expect(references.some((ref) => ref.file.includes('index.ts'))).toBe(true);
  });

  it('should find references to a class', async () => {
    const { references, total_count } = await findReferences(
      'App',
      fixturePath
    );
    expect(total_count).toBeGreaterThan(0);
  });
});
