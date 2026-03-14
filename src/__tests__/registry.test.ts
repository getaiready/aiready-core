import { describe, it, expect } from 'vitest';
import { ToolRegistry } from '../registry';
import { ToolName, ToolProvider } from '../index';

describe('ToolRegistry', () => {
  const mockProvider: ToolProvider = {
    id: ToolName.PatternDetect,
    alias: ['patterns'],
    analyze: async () => ({ issues: [], summary: {} as any, results: [] }),
    score: () => ({
      toolName: ToolName.PatternDetect,
      score: 100,
      rating: 'excellent' as any,
      rawMetrics: {},
      factors: [],
      recommendations: [],
    }),
  };

  it('should register and retrieve a tool', () => {
    const registry = new ToolRegistry();
    registry.register(mockProvider);
    expect(registry.get(ToolName.PatternDetect)).toBe(mockProvider);
  });
});
