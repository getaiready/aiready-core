import { describe, it, expect } from 'vitest';
import { TypeScriptParser } from '../parsers/typescript-parser';

describe('Modern TypeScript Support', () => {
  const parser = new TypeScriptParser();

  describe('BigInt Literals', () => {
    it('should identify BigInt literal as primitive', () => {
      const code = 'export const BIG_VAL = 100n;';
      const result = parser.parse(code, 'test.ts');

      expect(result.exports).toHaveLength(1);
      expect(result.exports[0].name).toBe('BIG_VAL');
      expect(result.exports[0].isPrimitive).toBe(true);
    });

    it('should handle BigInt in impure function check', () => {
      const code = `
        export function useBigInt() {
          const x = 100n;
          return x;
        }
      `;
      const result = parser.parse(code, 'test.ts');
      expect(result.exports[0].isPure).toBe(true);
    });
  });

  describe('Modern Syntax', () => {
    it('should parse optional chaining', async () => {
      const code = 'const x = obj?.prop?.method?.();';
      const ast = await parser.getAST(code, 'test.ts');
      expect(ast).toBeDefined();
    });

    it('should parse nullish coalescing', async () => {
      const code = 'const x = val ?? "default";';
      const ast = await parser.getAST(code, 'test.ts');
      expect(ast).toBeDefined();
    });
  });
});
