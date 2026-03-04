/**
 * Structural Metrics
 * Measures pattern entropy and concept cohesion.
 */

export interface PatternEntropy {
  domain: string;
  entropy: number;
  rating:
    | 'crystalline'
    | 'well-structured'
    | 'moderate'
    | 'fragmented'
    | 'chaotic';
  distribution: {
    locationCount: number;
    dominantLocation: string;
    giniCoefficient: number;
  };
  recommendations: string[];
}

export interface FileWithDomain {
  path: string;
  domain: string;
}

export function calculatePatternEntropy(
  files: FileWithDomain[]
): PatternEntropy {
  if (files.length === 0) {
    return {
      domain: 'unknown',
      entropy: 0,
      rating: 'crystalline',
      distribution: {
        locationCount: 0,
        dominantLocation: '',
        giniCoefficient: 0,
      },
      recommendations: ['No files to analyze'],
    };
  }

  const dirGroups = new Map<string, number>();
  for (const file of files) {
    const parts = file.path.split('/').slice(0, 4).join('/') || 'root';
    dirGroups.set(parts, (dirGroups.get(parts) || 0) + 1);
  }

  const counts = Array.from(dirGroups.values());
  const total = counts.reduce((a, b) => a + b, 0);
  let entropy = 0;
  for (const count of counts) {
    const p = count / total;
    if (p > 0) entropy -= p * Math.log2(p);
  }

  const maxEntropy = Math.log2(dirGroups.size || 1);
  const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0;

  const sortedCounts = counts.sort((a, b) => a - b);
  let gini = 0;
  for (let i = 0; i < sortedCounts.length; i++) {
    gini += (2 * (i + 1) - sortedCounts.length - 1) * sortedCounts[i];
  }
  gini /= total * sortedCounts.length;

  let dominantLocation = '';
  let maxCount = 0;
  for (const [loc, count] of dirGroups.entries()) {
    if (count > maxCount) {
      maxCount = count;
      dominantLocation = loc;
    }
  }

  let rating: PatternEntropy['rating'];
  if (normalizedEntropy < 0.2) rating = 'crystalline';
  else if (normalizedEntropy < 0.4) rating = 'well-structured';
  else if (normalizedEntropy < 0.6) rating = 'moderate';
  else if (normalizedEntropy < 0.8) rating = 'fragmented';
  else rating = 'chaotic';

  const recommendations: string[] = [];
  if (normalizedEntropy > 0.5)
    recommendations.push(
      `Consolidate ${files.length} files into fewer directories by domain`
    );
  if (dirGroups.size > 5)
    recommendations.push(
      'Consider barrel exports to reduce directory navigation'
    );
  if (gini > 0.5)
    recommendations.push('Redistribute files more evenly across directories');

  return {
    domain: files[0]?.domain || 'mixed',
    entropy: Math.round(normalizedEntropy * 100) / 100,
    rating,
    distribution: {
      locationCount: dirGroups.size,
      dominantLocation,
      giniCoefficient: Math.round(gini * 100) / 100,
    },
    recommendations,
  };
}

export interface ConceptCohesion {
  score: number;
  rating: 'excellent' | 'good' | 'moderate' | 'poor';
  analysis: {
    uniqueDomains: number;
    domainConcentration: number;
    exportPurposeClarity: number;
  };
}

export function calculateConceptCohesion(params: {
  exports: Array<{ name: string; inferredDomain?: string; domains?: string[] }>;
}): ConceptCohesion {
  const { exports } = params;

  if (exports.length === 0) {
    return {
      score: 1,
      rating: 'excellent',
      analysis: {
        uniqueDomains: 0,
        domainConcentration: 0,
        exportPurposeClarity: 1,
      },
    };
  }

  const allDomains: string[] = [];
  for (const exp of exports) {
    if (exp.inferredDomain) allDomains.push(exp.inferredDomain);
    if (exp.domains) allDomains.push(...exp.domains);
  }

  const uniqueDomains = new Set(allDomains);
  const domainCounts = new Map<string, number>();
  for (const d of allDomains)
    domainCounts.set(d, (domainCounts.get(d) || 0) + 1);
  const maxCount = Math.max(...Array.from(domainCounts.values()), 1);
  const domainConcentration = maxCount / allDomains.length;
  const exportPurposeClarity =
    1 - (uniqueDomains.size - 1) / Math.max(1, exports.length);

  const score = domainConcentration * 0.5 + exportPurposeClarity * 0.5;

  let rating: ConceptCohesion['rating'];
  if (score > 0.8) rating = 'excellent';
  else if (score > 0.6) rating = 'good';
  else if (score > 0.4) rating = 'moderate';
  else rating = 'poor';

  return {
    score: Math.round(score * 100) / 100,
    rating,
    analysis: {
      uniqueDomains: uniqueDomains.size,
      domainConcentration: Math.round(domainConcentration * 100) / 100,
      exportPurposeClarity: Math.round(exportPurposeClarity * 100) / 100,
    },
  };
}
