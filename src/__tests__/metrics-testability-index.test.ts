import { describe, it, expect } from 'vitest';
import { calculateTestabilityIndex } from '../metrics/testability-index';

describe('Testability Index Metric', () => {
  it('should calculate safe rating for high coverage and framework', () => {
    const result = calculateTestabilityIndex({
      testFiles: 50,
      sourceFiles: 100,
      pureFunctions: 80,
      totalFunctions: 100,
      injectionPatterns: 5,
      totalClasses: 5,
      bloatedInterfaces: 0,
      totalInterfaces: 10,
      externalStateMutations: 5,
      hasTestFramework: true,
    });

    expect(result.score).toBeGreaterThan(70);
    expect(result.aiChangeSafetyRating).toBe('safe');
  });

  it('should calculate blind-risk for zero tests', () => {
    const result = calculateTestabilityIndex({
      testFiles: 0,
      sourceFiles: 100,
      pureFunctions: 10,
      totalFunctions: 100,
      injectionPatterns: 0,
      totalClasses: 5,
      bloatedInterfaces: 5,
      totalInterfaces: 10,
      externalStateMutations: 50,
      hasTestFramework: false,
    });

    expect(result.aiChangeSafetyRating).toBe('blind-risk');
    expect(
      result.recommendations.some((r) => r.includes('Add a testing framework'))
    ).toBe(true);
  });

  it('should give functional-first codebases full DI score when no classes exist', () => {
    const result = calculateTestabilityIndex({
      testFiles: 30,
      sourceFiles: 100,
      pureFunctions: 80,
      totalFunctions: 100,
      injectionPatterns: 0,
      totalClasses: 0, // No classes = functional-first
      bloatedInterfaces: 0,
      totalInterfaces: 0,
      externalStateMutations: 10,
      hasTestFramework: true,
    });

    // Functional-first codebases should get 100% DI score (N/A = full marks)
    expect(result.dimensions.dependencyInjectionScore).toBe(100);
    // Should NOT recommend DI for functional-first codebases
    expect(
      result.recommendations.some((r) => r.includes('dependency injection'))
    ).toBe(false);
  });

  it('should penalize DI score when classes exist but lack injection', () => {
    const result = calculateTestabilityIndex({
      testFiles: 30,
      sourceFiles: 100,
      pureFunctions: 80,
      totalFunctions: 100,
      injectionPatterns: 0,
      totalClasses: 10, // Has classes but no DI
      bloatedInterfaces: 0,
      totalInterfaces: 5,
      externalStateMutations: 10,
      hasTestFramework: true,
    });

    // Should penalize when classes exist but don't use DI
    expect(result.dimensions.dependencyInjectionScore).toBe(0);
    // Should recommend DI when classes exist without it
    expect(
      result.recommendations.some((r) => r.includes('dependency injection'))
    ).toBe(true);
  });
});
