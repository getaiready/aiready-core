import { describe, it, expect } from 'vitest';
import {
  parseFileExports,
  calculateImportSimilarity,
} from '../utils/ast-parser';

describe('AST Parser', () => {
  describe('parseFileExports', () => {
    it('should extract exports from TypeScript code', async () => {
      const code = `
        import { someFunc } from './utils';
        export const myConst = 1;
        export function myFunc() { return someFunc(); }
        export class MyClass {}
        export default function() {}
      `;
      const result = await parseFileExports(code, 'test.ts');

      expect(result.exports).toHaveLength(4); // myConst, myFunc, MyClass, default
      expect(result.imports).toHaveLength(1);

      const myFunc = result.exports.find((e) => e.name === 'myFunc');
      expect(myFunc?.type).toBe('function');
      expect(myFunc?.imports).toContain('someFunc');
    });

    it('should handle interfaces and types', async () => {
      const code = `
        export interface MyInterface { prop: string; }
        export type MyType = string | number;
      `;
      const result = await parseFileExports(code, 'test.ts');

      expect(result.exports.map((e: any) => e.type)).toContain('interface');
      expect(result.exports.map((e: any) => e.type)).toContain('type');
    });
  });

  describe('calculateImportSimilarity', () => {
    it('should calculate similarity based on used imports', () => {
      const e1: any = { imports: ['a', 'b', 'c'] };
      const e2: any = { imports: ['b', 'c', 'd'] };

      // Intersection: {b, c} (2)
      // Union: {a, b, c, d} (4)
      // Similarity: 2/4 = 0.5
      expect(calculateImportSimilarity(e1, e2)).toBe(0.5);
    });

    it('should return 1 for empty imports', () => {
      const e1: any = { imports: [] };
      const e2: any = { imports: [] };
      expect(calculateImportSimilarity(e1, e2)).toBe(1);
    });
  });
});
