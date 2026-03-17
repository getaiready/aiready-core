/**
 * Dependency Health Metrics.
 * Measures the health, recency, and security of project dependencies.
 *
 * @lastUpdated 2026-03-18
 */

export interface DependencyHealthScore {
  score: number;
  rating: 'excellent' | 'good' | 'moderate' | 'poor' | 'hazardous';
  dimensions: {
    outdatedPackages: number;
    deprecatedPackages: number;
    trainingCutoffSkew: number;
  };
  aiKnowledgeConfidence: 'high' | 'moderate' | 'low' | 'blind';
  recommendations: string[];
}

/**
 * Calculate Dependency Health metrics based on version freshness and package metadata.
 *
 * @param params - Metrics gathered from package.json and registry lookups.
 * @param params.totalPackages - Total number of dependencies analyzed.
 * @param params.outdatedPackages - Count of packages with newer versions available.
 * @param params.deprecatedPackages - Count of packages marked as deprecated by maintainers.
 * @param params.trainingCutoffSkew - Normalized skew between dependency release dates and AI training cutoffs.
 * @returns Comprehensive DependencyHealthScore.
 */
export function calculateDependencyHealth(params: {
  totalPackages: number;
  outdatedPackages: number;
  deprecatedPackages: number;
  trainingCutoffSkew: number;
}): DependencyHealthScore {
  const {
    totalPackages,
    outdatedPackages,
    deprecatedPackages,
    trainingCutoffSkew,
  } = params;

  const outdatedRatio =
    totalPackages > 0 ? outdatedPackages / totalPackages : 0;
  const deprecatedRatio =
    totalPackages > 0 ? deprecatedPackages / totalPackages : 0;

  const outdatedScore = Math.max(0, 100 - outdatedRatio * 200);
  const deprecatedScore = Math.max(0, 100 - deprecatedRatio * 500);
  const skewScore = Math.max(0, 100 - trainingCutoffSkew * 100);

  const score = Math.round(
    Math.min(
      100,
      Math.max(0, outdatedScore * 0.3 + deprecatedScore * 0.4 + skewScore * 0.3)
    )
  );

  let rating: DependencyHealthScore['rating'];
  if (score >= 85) rating = 'excellent';
  else if (score >= 70) rating = 'good';
  else if (score >= 50) rating = 'moderate';
  else if (score >= 30) rating = 'poor';
  else rating = 'hazardous';

  let aiKnowledgeConfidence: DependencyHealthScore['aiKnowledgeConfidence'];
  if (trainingCutoffSkew < 0.2 && deprecatedPackages === 0)
    aiKnowledgeConfidence = 'high';
  else if (trainingCutoffSkew < 0.5 && deprecatedPackages <= 2)
    aiKnowledgeConfidence = 'moderate';
  else if (trainingCutoffSkew < 0.8) aiKnowledgeConfidence = 'low';
  else aiKnowledgeConfidence = 'blind';

  const recommendations: string[] = [];
  if (deprecatedPackages > 0)
    recommendations.push(`Replace ${deprecatedPackages} deprecated packages.`);
  if (outdatedRatio > 0.2)
    recommendations.push(`Update ${outdatedPackages} outdated packages.`);
  if (trainingCutoffSkew > 0.5)
    recommendations.push('High training cutoff skew detected.');

  return {
    score,
    rating,
    dimensions: { outdatedPackages, deprecatedPackages, trainingCutoffSkew },
    aiKnowledgeConfidence,
    recommendations,
  };
}
