/**
 * Testability Index Metrics
 * Measures how verifiable AI-generated changes are.
 */

export interface TestabilityIndex {
  score: number;
  rating: 'excellent' | 'good' | 'moderate' | 'poor' | 'unverifiable';
  dimensions: {
    testCoverageRatio: number;
    purityScore: number;
    dependencyInjectionScore: number;
    interfaceFocusScore: number;
    observabilityScore: number;
  };
  aiChangeSafetyRating: 'safe' | 'moderate-risk' | 'high-risk' | 'blind-risk';
  recommendations: string[];
}

export function calculateTestabilityIndex(params: {
  testFiles: number;
  sourceFiles: number;
  pureFunctions: number;
  totalFunctions: number;
  injectionPatterns: number;
  totalClasses: number;
  bloatedInterfaces: number;
  totalInterfaces: number;
  externalStateMutations: number;
  hasTestFramework: boolean;
}): TestabilityIndex {
  const {
    testFiles,
    sourceFiles,
    pureFunctions,
    totalFunctions,
    injectionPatterns,
    totalClasses,
    bloatedInterfaces,
    totalInterfaces,
    externalStateMutations,
    hasTestFramework,
  } = params;

  const rawCoverageRatio = sourceFiles > 0 ? testFiles / sourceFiles : 0;
  const testCoverageRatio = Math.min(100, Math.round(rawCoverageRatio * 100));
  const purityScore = Math.round(
    (totalFunctions > 0 ? pureFunctions / totalFunctions : 0.5) * 100
  );
  const dependencyInjectionScore = Math.round(
    Math.min(
      100,
      (totalClasses > 0 ? injectionPatterns / totalClasses : 0.5) * 100
    )
  );
  const interfaceFocusScore = Math.max(
    0,
    Math.round(
      100 -
        (totalInterfaces > 0 ? (bloatedInterfaces / totalInterfaces) * 80 : 0)
    )
  );
  const observabilityScore = Math.max(
    0,
    Math.round(
      100 -
        (totalFunctions > 0
          ? (externalStateMutations / totalFunctions) * 100
          : 0)
    )
  );

  const frameworkWeight = hasTestFramework ? 1.0 : 0.8;
  const rawScore =
    (testCoverageRatio * 0.3 +
      purityScore * 0.25 +
      dependencyInjectionScore * 0.2 +
      interfaceFocusScore * 0.1 +
      observabilityScore * 0.15) *
    frameworkWeight;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let rating: TestabilityIndex['rating'];
  if (score >= 85) rating = 'excellent';
  else if (score >= 70) rating = 'good';
  else if (score >= 50) rating = 'moderate';
  else if (score >= 30) rating = 'poor';
  else rating = 'unverifiable';

  let aiChangeSafetyRating: TestabilityIndex['aiChangeSafetyRating'];
  if (rawCoverageRatio >= 0.5 && score >= 70) aiChangeSafetyRating = 'safe';
  else if (rawCoverageRatio >= 0.2 && score >= 50)
    aiChangeSafetyRating = 'moderate-risk';
  else if (rawCoverageRatio > 0) aiChangeSafetyRating = 'high-risk';
  else aiChangeSafetyRating = 'blind-risk';

  const recommendations: string[] = [];
  if (!hasTestFramework)
    recommendations.push(
      'Add a testing framework (Jest, Vitest, pytest) — AI changes cannot be verified without tests'
    );
  if (rawCoverageRatio < 0.3) {
    const neededTests = Math.round(sourceFiles * 0.3 - testFiles);
    recommendations.push(
      `Add ~${neededTests} test files to reach 30% coverage ratio — minimum for safe AI assistance`
    );
  }
  if (purityScore < 50)
    recommendations.push(
      'Extract pure functions from side-effectful code — pure functions are trivially AI-testable'
    );
  if (dependencyInjectionScore < 50 && totalClasses > 0)
    recommendations.push(
      'Adopt dependency injection — makes classes mockable and AI-generated code verifiable'
    );
  if (externalStateMutations > totalFunctions * 0.3)
    recommendations.push(
      'Reduce direct state mutations — return values instead to improve observability'
    );

  return {
    score,
    rating,
    dimensions: {
      testCoverageRatio,
      purityScore,
      dependencyInjectionScore,
      interfaceFocusScore,
      observabilityScore,
    },
    aiChangeSafetyRating,
    recommendations,
  };
}
