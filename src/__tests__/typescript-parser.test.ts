import { describe, it, expect } from 'vitest';
import { TypeScriptParser } from '../parsers/typescript-parser';

describe('TypeScript Parser', () => {
  const parser = new TypeScriptParser();

  it('should parse TypeScript code and extract exports', () => {
    const code = `
      export function hello(name: string): string {
        return \`Hello, \${name}!\`;
      }
      export const VERSION = '1.0.0';
    `;
    const result = parser.parse(code, 'test.ts');

    expect(result.exports).toHaveLength(2);
    expect(result.exports[0].name).toBe('hello');
    expect(result.exports[0].type).toBe('function');
    expect(result.exports[1].name).toBe('VERSION');
    expect(result.exports[1].type).toBe('const');
  });

  it('should detect JSDoc documentation', () => {
    const code = `
      /**
       * This is a test function
       * @param x test
       */
      export function test(x: number) {}
    `;
    const result = parser.parse(code, 'test.ts');
    expect(result.exports[0].documentation?.content).toContain(
      'This is a test function'
    );
  });

  it('should identify impure functions', () => {
    const code = `
      export function impure() {
        console.log('side effect');
      }
      export function pure(x: number) {
        return x * 2;
      }
    `;
    const result = parser.parse(code, 'test.ts');
    expect(result.exports[0].isPure).toBe(false);
    expect(result.exports[1].isPure).toBe(true);
  });

  it('should extract class constructor parameters', () => {
    const code = `
      export class Service {
        constructor(public db: any, private logger: Logger) {}
      }
    `;
    const result = parser.parse(code, 'test.ts');
    expect(result.exports[0].name).toBe('Service');
    expect(result.exports[0].type).toBe('class');
    expect(result.exports[0].parameters).toEqual(['db', 'logger']);
  });
});
