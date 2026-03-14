import { describe, it, expect } from 'vitest';
import { generateHTML } from '../utils/visualization';
import { GraphData } from '../types';

describe('Visualization Utilities', () => {
  it('should generate HTML with graph data payload', () => {
    const mockGraph: GraphData = {
      nodes: [{ id: 'file1.ts', label: 'file1.ts', group: 'src', size: 10 }],
      edges: [{ source: 'file1.ts', target: 'file2.ts', type: 'dependency' }],
      metadata: {
        totalFiles: 1,
        totalDependencies: 1,
        timestamp: new Date().toISOString(),
        analysisTypes: [],
        criticalIssues: 0,
        majorIssues: 0,
        minorIssues: 0,
        infoIssues: 0,
      },
    };

    const html = generateHTML(mockGraph);

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<canvas id="canvas"');
    expect(html).toContain('file1.ts');
    expect(html).toContain('dependency');
  });
});
