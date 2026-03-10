import { describe, it, expect } from 'vitest';
import { calculateAiSignalClarity } from '../metrics/ai-signal-clarity';

describe('AI Signal Clarity Metric', () => {
  it('should calculate minimal risk for clean code', () => {
    const result = calculateAiSignalClarity({
      overloadedSymbols: 0,
      magicLiterals: 0,
      booleanTraps: 0,
      implicitSideEffects: 0,
      deepCallbacks: 0,
      ambiguousNames: 0,
      undocumentedExports: 0,
      largeFiles: 0,
      totalSymbols: 100,
      totalExports: 20,
    });

    expect(result.score).toBe(0);
    expect(result.rating).toBe('minimal');
  });

  it('should calculate high risk for messy code', () => {
    const result = calculateAiSignalClarity({
      overloadedSymbols: 50,
      magicLiterals: 200,
      booleanTraps: 50,
      implicitSideEffects: 15,
      deepCallbacks: 10,
      ambiguousNames: 40,
      undocumentedExports: 15,
      largeFiles: 10,
      totalSymbols: 100,
      totalExports: 20,
    });

    expect(result.score).toBeGreaterThan(50);
    expect(['high', 'severe']).toContain(result.rating);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});
