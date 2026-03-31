/**
 * Change Amplification Metrics.
 * Measures how a change in one file ripples through the system via dependency fan-out.
 *
 * @lastUpdated 2026-03-18
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

/**
 * Calculate Change Amplification metrics for a set of files in a dependency graph.
 *
 * @param params - Structural metrics gathered from link analysis.
 * @param params.files - List of files with their fan-in/fan-out counts.
 * @returns Comprehensive ChangeAmplificationScore.
 */
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
    .map((f) => {
      // Barrels, loggers, and types naturally have high fan-in
      // We reduce the fan-in weight for these to avoid flagging them as hotspots
      const lowerFile = f.file.toLowerCase();
      const isSharedInfra =
        lowerFile.endsWith('logger.ts') ||
        lowerFile.endsWith('logger.js') ||
        lowerFile.endsWith('constants.ts') ||
        lowerFile.endsWith('constants.js') ||
        lowerFile.endsWith('types.ts') ||
        lowerFile.endsWith('types.js') ||
        lowerFile.endsWith('index.ts') ||
        lowerFile.endsWith('index.js');

      const fanInWeight = isSharedInfra ? 0.1 : 0.5;
      return {
        ...f,
        amplificationFactor: f.fanOut + f.fanIn * fanInWeight,
      };
    })
    .sort((a, b) => b.amplificationFactor - a.amplificationFactor);

  const maxAmplification = hotspots[0].amplificationFactor;
  const avgAmplification =
    hotspots.reduce((sum, h) => sum + h.amplificationFactor, 0) /
    hotspots.length;

  // Use a more balanced scoring formula
  // Base score 100
  // Subtract based on log of avg amplification to not penalize small increases too heavily
  // Subtract based on max amplification hotspots exceeding threshold
  const avgPenalty = Math.log2(avgAmplification + 1) * 15;
  // Use a logarithmic penalty for max amplification to avoid 100+ point drops
  const maxPenalty =
    maxAmplification > 30 ? Math.log10(maxAmplification - 29) * 30 : 0;

  // Ensure a score floor of 5 so it's never 0
  const score = Math.max(5, Math.min(100, 100 - avgPenalty - maxPenalty));

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
