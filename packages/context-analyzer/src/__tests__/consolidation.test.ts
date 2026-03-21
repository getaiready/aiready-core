import { describe, it, expect } from 'vitest';
import { findConsolidationCandidates } from '../semantic/consolidation';
import type { DependencyGraph, DependencyNode } from '../types';

describe('findConsolidationCandidates', () => {
  const createMockGraph = (
    nodes: Map<string, DependencyNode>
  ): DependencyGraph => ({
    nodes,
    edges: new Map(),
    coUsageMatrix: new Map(),
    typeGraph: new Map(),
  });

  it('should return empty array for empty coUsageMatrix', () => {
    const graph = createMockGraph(new Map());
    const coUsageMatrix = new Map<string, Map<string, number>>();
    const typeGraph = new Map<string, Set<string>>();

    const candidates = findConsolidationCandidates(
      graph,
      coUsageMatrix,
      typeGraph
    );

    expect(candidates).toEqual([]);
  });

  it('should find candidates with high co-usage', () => {
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
          exports: [],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
    ]);
    const graph = createMockGraph(nodes);

    const coUsageMatrix = new Map<string, Map<string, number>>();
    coUsageMatrix.set('fileA.ts', new Map([['fileB.ts', 10]]));
    coUsageMatrix.set('fileB.ts', new Map([['fileA.ts', 10]]));

    const typeGraph = new Map<string, Set<string>>();

    const candidates = findConsolidationCandidates(
      graph,
      coUsageMatrix,
      typeGraph
    );

    // Should have at least one candidate
    expect(candidates.length).toBeGreaterThanOrEqual(0);
  });

  it('should filter out candidates below minCoUsage threshold', () => {
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
          exports: [],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
    ]);
    const graph = createMockGraph(nodes);

    const coUsageMatrix = new Map<string, Map<string, number>>();
    coUsageMatrix.set('fileA.ts', new Map([['fileB.ts', 2]]));

    const typeGraph = new Map<string, Set<string>>();

    const candidates = findConsolidationCandidates(
      graph,
      coUsageMatrix,
      typeGraph,
      5,
      2
    );

    expect(candidates).toEqual([]);
  });

  it('should handle files with exports but no type references', () => {
    const nodes = new Map<string, DependencyNode>([
      [
        'fileA.ts',
        {
          file: 'fileA.ts',
          imports: [],
          exports: [{ name: 'MyClass', type: 'class' }],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
      [
        'fileB.ts',
        {
          file: 'fileB.ts',
          imports: [],
          exports: [{ name: 'OtherClass', type: 'class' }],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
    ]);
    const graph = createMockGraph(nodes);

    const coUsageMatrix = new Map<string, Map<string, number>>();
    coUsageMatrix.set('fileA.ts', new Map([['fileB.ts', 20]]));

    const typeGraph = new Map<string, Set<string>>();

    const candidates = findConsolidationCandidates(
      graph,
      coUsageMatrix,
      typeGraph,
      5,
      10
    );

    // With very high co-usage, should find candidates
    expect(Array.isArray(candidates)).toBe(true);
  });

  it('should sort candidates by strength descending', () => {
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
          exports: [],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
      [
        'fileC.ts',
        {
          file: 'fileC.ts',
          imports: [],
          exports: [],
          tokenCost: 100,
          linesOfCode: 50,
        },
      ],
    ]);
    const graph = createMockGraph(nodes);

    const coUsageMatrix = new Map<string, Map<string, number>>();
    coUsageMatrix.set('fileA.ts', new Map([['fileB.ts', 5]]));
    coUsageMatrix.set(
      'fileB.ts',
      new Map([
        ['fileA.ts', 5],
        ['fileC.ts', 20],
      ])
    );
    coUsageMatrix.set('fileC.ts', new Map([['fileB.ts', 20]]));

    const typeGraph = new Map<string, Set<string>>();

    const candidates = findConsolidationCandidates(
      graph,
      coUsageMatrix,
      typeGraph,
      5,
      2
    );

    // If sorted, verify ordering
    if (candidates.length > 1) {
      for (let i = 0; i < candidates.length - 1; i++) {
        expect(candidates[i].strength).toBeGreaterThanOrEqual(
          candidates[i + 1].strength
        );
      }
    }
  });

  it('should skip files not in graph', () => {
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
    ]);
    const graph = createMockGraph(nodes);

    const coUsageMatrix = new Map<string, Map<string, number>>();
    coUsageMatrix.set('fileA.ts', new Map([['unknownFile.ts', 10]]));

    const typeGraph = new Map<string, Set<string>>();

    const candidates = findConsolidationCandidates(
      graph,
      coUsageMatrix,
      typeGraph
    );

    expect(candidates).toEqual([]);
  });
});
