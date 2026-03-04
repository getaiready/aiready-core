/**
 * Knowledge and Technical Debt Risk Metrics
 */

export interface KnowledgeConcentrationRisk {
  score: number;
  rating: 'low' | 'moderate' | 'high' | 'critical';
  analysis: {
    uniqueConceptFiles: number;
    totalFiles: number;
    concentrationRatio: number;
    singleAuthorFiles: number;
    orphanFiles: number;
  };
  recommendations: string[];
}

export function calculateKnowledgeConcentration(params: {
  uniqueConceptFiles: number;
  totalFiles: number;
  singleAuthorFiles: number;
  orphanFiles: number;
}): KnowledgeConcentrationRisk {
  const { uniqueConceptFiles, totalFiles, singleAuthorFiles, orphanFiles } =
    params;
  const concentrationRatio =
    totalFiles > 0
      ? (uniqueConceptFiles + singleAuthorFiles) / (totalFiles * 2)
      : 0;
  const score = Math.round(
    Math.min(
      100,
      concentrationRatio * 100 + (orphanFiles / Math.max(1, totalFiles)) * 20
    )
  );

  let rating: KnowledgeConcentrationRisk['rating'];
  if (score < 30) rating = 'low';
  else if (score < 50) rating = 'moderate';
  else if (score < 75) rating = 'high';
  else rating = 'critical';

  const recommendations: string[] = [];
  if (singleAuthorFiles > 0)
    recommendations.push(
      `Distribute knowledge for ${singleAuthorFiles} single-author files.`
    );
  if (orphanFiles > 0)
    recommendations.push(
      `Link ${orphanFiles} orphan files to the rest of the codebase.`
    );

  return {
    score,
    rating,
    recommendations,
    analysis: {
      uniqueConceptFiles,
      totalFiles,
      concentrationRatio,
      singleAuthorFiles,
      orphanFiles,
    },
  };
}

export interface TechnicalDebtInterest {
  monthlyRate: number;
  annualRate: number;
  principal: number;
  projections: { months6: number; months12: number; months24: number };
  monthlyCost: number;
}

export function calculateDebtInterest(
  principal: number,
  monthlyGrowthRate: number
): TechnicalDebtInterest {
  const monthlyRate = monthlyGrowthRate;
  const annualRate = Math.pow(1 + monthlyRate, 12) - 1;
  const monthlyCost = principal * monthlyRate;

  return {
    monthlyRate,
    annualRate,
    principal,
    monthlyCost,
    projections: {
      months6: principal * Math.pow(1 + monthlyRate, 6),
      months12: principal * Math.pow(1 + monthlyRate, 12),
      months24: principal * Math.pow(1 + monthlyRate, 24),
    },
  };
}
