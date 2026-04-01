import { describe, it, expect } from 'vitest';
import path from 'path';
import { getFileStructure } from '../src/tools/get-file-structure';

describe('getFileStructure', () => {
  const fixturePath = path.resolve(
    __dirname,
    'fixtures/simple-project/src/utils.ts'
  );

  it('should return the structure of a file', async () => {
    const structure = await getFileStructure(fixturePath);
    expect(structure).toBeDefined();
    expect(structure?.file).toBe(fixturePath);
    expect(structure?.functions.some((f) => f.name === 'add')).toBe(true);
    expect(structure?.interfaces.some((i) => i.name === 'CalcResult')).toBe(
      true
    );
  });
});
