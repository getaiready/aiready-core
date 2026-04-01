import { describe, it, expect, beforeEach } from 'vitest';
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
    const registry = new ToolRegistry('test');
    registry.register(mockProvider);
    expect(registry.get(ToolName.PatternDetect)).toBe(mockProvider);
    expect(registry.id).toContain('registry-test-');
  });

  it('should find a tool by name or alias', () => {
    const registry = new ToolRegistry();
    registry.register(mockProvider);
    expect(registry.find(ToolName.PatternDetect)).toBe(mockProvider);
    expect(registry.find('patterns')).toBe(mockProvider);
    expect(registry.find('unknown')).toBeUndefined();
  });

  it('should get all providers', () => {
    const registry = new ToolRegistry();
    registry.register(mockProvider);
    expect(registry.getAll()).toHaveLength(1);
    expect(registry.getAll()[0]).toBe(mockProvider);
  });

  it('should clear providers', () => {
    const registry = new ToolRegistry();
    registry.register(mockProvider);
    registry.clear();
    expect(registry.getAll()).toHaveLength(0);
  });

  it('should get available IDs', () => {
    const registry = new ToolRegistry();
    const ids = registry.getAvailableIds();
    expect(ids).toContain(ToolName.PatternDetect);
    expect(ids).toContain(ToolName.ContextAnalyzer);
  });

  describe('Static Methods', () => {
    beforeEach(() => {
      ToolRegistry.clear();
    });

    it('should work via static methods', () => {
      ToolRegistry.register(mockProvider);
      expect(ToolRegistry.get(ToolName.PatternDetect)).toBe(mockProvider);
      expect(ToolRegistry.find('patterns')).toBe(mockProvider);
      expect(ToolRegistry.getAll()).toHaveLength(1);
      expect(ToolRegistry.getAvailableIds()).toContain(ToolName.PatternDetect);

      ToolRegistry.clear();
      expect(ToolRegistry.getAll()).toHaveLength(0);
    });
  });
});
