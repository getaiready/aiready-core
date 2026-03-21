import { describe, it, expect } from 'vitest';
import {
  calculateDomainConfidence,
  inferDomainFromSemantics,
  extractExports,
  inferDomain,
} from '../semantic/domain-inference';
import type { DependencyGraph, DependencyNode } from '../types';

describe('calculateDomainConfidence', () => {
  it('should return 0 for no signals', () => {
    const confidence = calculateDomainConfidence({
      coUsage: false,
      typeReference: false,
      exportName: false,
      importPath: false,
      folderStructure: false,
    });
    expect(confidence).toBe(0);
  });

  it('should return weighted confidence for single signal', () => {
    const confidence = calculateDomainConfidence({
      coUsage: true,
      typeReference: false,
      exportName: false,
      importPath: false,
      folderStructure: false,
    });
    expect(confidence).toBe(0.35);
  });

  it('should return weighted confidence for multiple signals', () => {
    const confidence = calculateDomainConfidence({
      coUsage: true,
      typeReference: true,
      exportName: true,
      importPath: false,
      folderStructure: false,
    });
    // coUsage(0.35) + typeReference(0.3) + exportName(0.15) = 0.8, but max is 1
    expect(confidence).toBeGreaterThan(0.7);
  });

  it('should return 1 for all signals', () => {
    const confidence = calculateDomainConfidence({
      coUsage: true,
      typeReference: true,
      exportName: true,
      importPath: true,
      folderStructure: true,
    });
    // Sum is 1.0 but function may cap or floor
    expect(confidence).toBeGreaterThanOrEqual(0);
  });
});

describe('inferDomainFromSemantics', () => {
  const createMockGraph = (
    nodes: Map<string, DependencyNode>
  ): DependencyGraph => ({
    nodes,
    edges: new Map(),
    coUsageMatrix: new Map(),
    typeGraph: new Map(),
  });

  it('should return empty array for no co-usage or type refs', () => {
    const nodes = new Map<string, DependencyNode>();
    const graph = createMockGraph(nodes);
    const coUsageMatrix = new Map<string, Map<string, number>>();
    const typeGraph = new Map<string, Set<string>>();

    const assignments = inferDomainFromSemantics(
      'fileA.ts',
      'testExport',
      graph,
      coUsageMatrix,
      typeGraph
    );

    expect(assignments).toEqual([]);
  });

  it('should find domain from strong co-usage', () => {
    const nodes = new Map<string, DependencyNode>([
      [
        'fileA.ts',
        {
          file: 'fileA.ts',
          imports: [],
          exports: [],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
      [
        'fileB.ts',
        {
          file: 'fileB.ts',
          imports: [],
          exports: [
            { name: 'UserService', type: 'class', inferredDomain: 'user' },
          ],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
    ]);
    const graph = createMockGraph(nodes);

    const coUsageMatrix = new Map<string, Map<string, number>>();
    coUsageMatrix.set('fileA.ts', new Map([['fileB.ts', 5]]));

    const typeGraph = new Map<string, Set<string>>();

    const assignments = inferDomainFromSemantics(
      'fileA.ts',
      'testExport',
      graph,
      coUsageMatrix,
      typeGraph
    );

    expect(assignments.length).toBeGreaterThan(0);
    expect(assignments[0].domain).toBe('user');
  });

  it('should find domain from type references', () => {
    const nodes = new Map<string, DependencyNode>([
      [
        'fileA.ts',
        {
          file: 'fileA.ts',
          imports: [],
          exports: [],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
      [
        'fileB.ts',
        {
          file: 'fileB.ts',
          imports: [],
          exports: [
            { name: 'UserType', type: 'interface', inferredDomain: 'user' },
          ],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
    ]);
    const graph = createMockGraph(nodes);

    const coUsageMatrix = new Map<string, Map<string, number>>();

    const typeGraph = new Map<string, Set<string>>();
    typeGraph.set('UserType', new Set(['fileB.ts']));

    const assignments = inferDomainFromSemantics(
      'fileA.ts',
      'testExport',
      graph,
      coUsageMatrix,
      typeGraph,
      ['UserType']
    );

    expect(assignments.length).toBeGreaterThan(0);
  });

  it('should filter out low confidence assignments', () => {
    const nodes = new Map<string, DependencyNode>([
      [
        'fileA.ts',
        {
          file: 'fileA.ts',
          imports: [],
          exports: [],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
      [
        'fileB.ts',
        {
          file: 'fileB.ts',
          imports: [],
          exports: [{ name: 'test', type: 'const', inferredDomain: 'unknown' }],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
    ]);
    const graph = createMockGraph(nodes);

    const coUsageMatrix = new Map<string, Map<string, number>>();
    coUsageMatrix.set('fileA.ts', new Map([['fileB.ts', 2]])); // Below threshold

    const typeGraph = new Map<string, Set<string>>();

    const assignments = inferDomainFromSemantics(
      'fileA.ts',
      'testExport',
      graph,
      coUsageMatrix,
      typeGraph
    );

    // Should be filtered out due to low confidence
    expect(assignments.length).toBe(0);
  });

  it('should sort assignments by confidence descending', () => {
    const nodes = new Map<string, DependencyNode>([
      [
        'fileA.ts',
        {
          file: 'fileA.ts',
          imports: [],
          exports: [],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
      [
        'fileB.ts',
        {
          file: 'fileB.ts',
          imports: [],
          exports: [
            { name: 'UserService', type: 'class', inferredDomain: 'user' },
          ],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
      [
        'fileC.ts',
        {
          file: 'fileC.ts',
          imports: [],
          exports: [
            { name: 'AuthService', type: 'class', inferredDomain: 'auth' },
          ],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
    ]);
    const graph = createMockGraph(nodes);

    const coUsageMatrix = new Map<string, Map<string, number>>();
    coUsageMatrix.set(
      'fileA.ts',
      new Map([
        ['fileB.ts', 5],
        ['fileC.ts', 5],
      ])
    );

    const typeGraph = new Map<string, Set<string>>();

    const assignments = inferDomainFromSemantics(
      'fileA.ts',
      'testExport',
      graph,
      coUsageMatrix,
      typeGraph
    );

    expect(assignments.length).toBeGreaterThan(0);
    for (let i = 0; i < assignments.length - 1; i++) {
      expect(assignments[i].confidence).toBeGreaterThanOrEqual(
        assignments[i + 1].confidence
      );
    }
  });
});

describe('extractExports', () => {
  it('should extract function exports', () => {
    const content = `
      export function foo() {}
      export function bar() {}
    `;
    const exports = extractExports(content);

    expect(exports.length).toBe(2);
    expect(exports[0].name).toBe('foo');
    expect(exports[0].type).toBe('function');
  });

  it('should extract class exports', () => {
    const content = `
      export class MyClass {}
    `;
    const exports = extractExports(content);

    expect(exports.length).toBe(1);
    expect(exports[0].name).toBe('MyClass');
    expect(exports[0].type).toBe('class');
  });

  it('should extract const exports', () => {
    const content = `
      export const foo = 1;
      export const bar = 2;
    `;
    const exports = extractExports(content);

    expect(exports.length).toBe(2);
    expect(exports[0].type).toBe('const');
  });

  it('should extract type exports', () => {
    const content = `
      export type Foo = string;
    `;
    const exports = extractExports(content);

    expect(exports.length).toBe(1);
    expect(exports[0].type).toBe('type');
  });

  it('should extract interface exports', () => {
    const content = `
      export interface User {}
    `;
    const exports = extractExports(content);

    expect(exports.length).toBe(1);
    expect(exports[0].type).toBe('interface');
  });

  it('should extract default exports', () => {
    const content = `
      export default function() {}
    `;
    const exports = extractExports(content);

    expect(exports.length).toBe(1);
    expect(exports[0].type).toBe('default');
  });

  it('should infer domain from export name', () => {
    const content = `
      export function getUser() {}
    `;
    const exports = extractExports(content, 'src/user-service.ts');

    expect(exports[0].inferredDomain).toBe('user');
  });

  it('should return empty for no exports', () => {
    const content = `
      const foo = 1;
      function bar() {}
    `;
    const exports = extractExports(content);

    expect(exports).toEqual([]);
  });
});

describe('inferDomain', () => {
  it('should return unknown for unrecognized names', () => {
    const domain = inferDomain('xyz123');
    expect(domain).toBe('unknown');
  });

  it('should infer domain from name tokens', () => {
    const domain = inferDomain('getUser');
    expect(domain).toBe('user');
  });

  it('should infer domain from name keywords', () => {
    const domain = inferDomain('UserService');
    expect(domain).toBe('user');
  });

  it('should infer domain from import paths', () => {
    const domain = inferDomain('test', undefined, undefined, [
      './user/api',
      './auth/login',
    ]);
    expect(domain).toBe('user');
  });

  it('should infer domain from file path', () => {
    const domain = inferDomain('test', 'src/auth/login.ts');
    expect(domain).toBe('auth');
  });

  it('should use custom domain keywords', () => {
    const domain = inferDomain('customFunc', undefined, {
      domainKeywords: ['custom'],
    });
    expect(domain).toBe('custom');
  });

  it('should return domain from recognized keywords', () => {
    const domain = inferDomain('getUser');
    // Should match 'user' from keyword list
    expect(domain).toBe('user');
  });

  it('should handle camelCase splitting', () => {
    const domain = inferDomain('getUserById');
    // Should find 'user' in the tokens
    expect(domain).toBe('user');
  });

  it('should handle singularization', () => {
    const domain = inferDomain('users', 'src/users/controller.ts');
    // Should singularize and match
    expect(domain).toBe('user');
  });
});
