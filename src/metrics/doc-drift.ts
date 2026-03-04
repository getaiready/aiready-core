/**
 * Documentation Drift Metrics
 * Measures the risk of documentation becoming out of sync with code.
 */

export interface DocDriftRisk {
  score: number;
  rating: 'minimal' | 'low' | 'moderate' | 'high' | 'severe';
  dimensions: {
    uncommentedExports: number;
    outdatedComments: number;
    undocumentedComplexity: number;
  };
  recommendations: string[];
}

export function calculateDocDrift(params: {
  uncommentedExports: number;
  totalExports: number;
  outdatedComments: number;
  undocumentedComplexity: number;
}): DocDriftRisk {
  const {
    uncommentedExports,
    totalExports,
    outdatedComments,
    undocumentedComplexity,
  } = params;

  const uncommentedRatio =
    totalExports > 0 ? uncommentedExports / totalExports : 0;
  const outdatedScore = Math.min(100, outdatedComments * 15);
  const uncommentedScore = Math.min(100, uncommentedRatio * 100);
  const complexityScore = Math.min(100, undocumentedComplexity * 10);

  const score = Math.round(
    outdatedScore * 0.6 + uncommentedScore * 0.2 + complexityScore * 0.2
  );
  const finalScore = Math.min(100, Math.max(0, score));

  let rating: DocDriftRisk['rating'];
  if (finalScore < 10) rating = 'minimal';
  else if (finalScore < 30) rating = 'low';
  else if (finalScore < 60) rating = 'moderate';
  else if (finalScore < 85) rating = 'high';
  else rating = 'severe';

  const recommendations: string[] = [];
  if (outdatedComments > 0)
    recommendations.push(
      `Update or remove ${outdatedComments} outdated comments that contradict the code.`
    );
  if (uncommentedRatio > 0.3)
    recommendations.push(
      `Add JSDoc to ${uncommentedExports} uncommented exports.`
    );
  if (undocumentedComplexity > 0)
    recommendations.push(
      `Explain the business logic for ${undocumentedComplexity} highly complex functions.`
    );

  return {
    score: finalScore,
    rating,
    dimensions: {
      uncommentedExports,
      outdatedComments,
      undocumentedComplexity,
    },
    recommendations,
  };
}
