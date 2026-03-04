/**
 * Change Amplification Metrics
 * Measures how a change in one file ripples through the system.
 */

export interface ChangeAmplificationScore {
  score: number;
  rating: 'isolated' | 'contained' | 'amplified' | 'explosive';
  avgAmplification: number;
  maxAmplification: number;
  hotspots: Array<{
    file: string;
    fanOut: number;
    fanIn: number;
    amplificationFactor: number;
  }>;
  recommendations: string[];
}

export function calculateChangeAmplification(params: {
  files: Array<{ file: string; fanOut: number; fanIn: number }>;
}): ChangeAmplificationScore {
  const { files } = params;
  if (files.length === 0) {
    return {
      score: 100,
      rating: 'isolated',
      avgAmplification: 1,
      maxAmplification: 1,
      hotspots: [],
      recommendations: [],
    };
  }

  const hotspots = files
    .map((f) => ({ ...f, amplificationFactor: f.fanOut + f.fanIn * 0.5 }))
    .sort((a, b) => b.amplificationFactor - a.amplificationFactor);

  const maxAmplification = hotspots[0].amplificationFactor;
  const avgAmplification =
    hotspots.reduce((sum, h) => sum + h.amplificationFactor, 0) /
    hotspots.length;

  let score = Math.max(
    0,
    Math.min(
      100,
      100 -
        avgAmplification * 5 -
        (maxAmplification > 20 ? maxAmplification - 20 : 0)
    )
  );

  let rating: ChangeAmplificationScore['rating'] = 'isolated';
  if (score < 40) rating = 'explosive';
  else if (score < 70) rating = 'amplified';
  else if (score < 90) rating = 'contained';

  const recommendations: string[] = [];
  if (score < 70 && hotspots.length > 0) {
    recommendations.push(
      `Refactor top hotspot '${hotspots[0].file}' to reduce coupling.`
    );
  }
  if (maxAmplification > 30) {
    recommendations.push(
      'Break down key bottlenecks with amplification factor > 30.'
    );
  }

  return {
    score: Math.round(score),
    rating,
    avgAmplification,
    maxAmplification,
    hotspots: hotspots.slice(0, 10),
    recommendations,
  };
}
