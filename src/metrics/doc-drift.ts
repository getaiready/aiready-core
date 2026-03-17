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
  const outdatedRisk = Math.min(100, outdatedComments * 15);
  const uncommentedRisk = Math.min(100, uncommentedRatio * 100);
  const complexityRisk = Math.min(100, undocumentedComplexity * 10);

  const risk = Math.round(
    outdatedRisk * 0.6 + uncommentedRisk * 0.2 + complexityRisk * 0.2
  );
  const finalRisk = Math.min(100, Math.max(0, risk));

  // Invert risk to get readiness score
  // If no exports found, readiness is 100% (no drift possible)
  const score = totalExports > 0 ? 100 - finalRisk : 100;

  let rating: DocDriftRisk['rating'];
  if (score >= 90)
    rating = 'minimal'; // low risk
  else if (score >= 75) rating = 'low';
  else if (score >= 60) rating = 'moderate';
  else if (score >= 40) rating = 'high';
  else rating = 'severe'; // high risk

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
    score: score,
    rating,
    dimensions: {
      uncommentedExports,
      outdatedComments,
      undocumentedComplexity,
    },
    recommendations,
  };
}
