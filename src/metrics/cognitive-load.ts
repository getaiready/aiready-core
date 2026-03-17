/**
 * Cognitive Load Metrics.
 * Measures how much mental effort is required for an AI to understand a file.
 *
 * @lastUpdated 2026-03-18
 */

/**
 * Individual factor contributing to total cognitive load.
 */
export interface LoadFactor {
  name: string;
  score: number; // 0-100, higher = more load
  weight: number; // How much this factor contributes (0-1)
  description: string;
}

/**
 * Consolidated Cognitive Load measurement for a source file.
 */
export interface CognitiveLoad {
  score: number;
  rating: 'trivial' | 'easy' | 'moderate' | 'difficult' | 'expert';
  factors: LoadFactor[];
  rawValues: {
    size: number;
    complexity: number;
    dependencyCount: number;
    conceptCount: number;
  };
}

/**
 * Calculate the Cognitive Load for a file based on its structural properties.
 *
 * @param params - Metrics gathered from parsing the file.
 * @param params.linesOfCode - Number of lines of code.
 * @param params.exportCount - Number of public exports.
 * @param params.importCount - Number of external dependencies.
 * @param params.uniqueConcepts - Number of unique semantic concepts.
 * @param params.cyclomaticComplexity - Optional complexity score.
 * @returns Comprehensive CognitiveLoad analysis.
 */
export function calculateCognitiveLoad(params: {
  linesOfCode: number;
  exportCount: number;
  importCount: number;
  uniqueConcepts: number;
  cyclomaticComplexity?: number;
}): CognitiveLoad {
  const {
    linesOfCode,
    exportCount,
    importCount,
    uniqueConcepts,
    cyclomaticComplexity = 1,
  } = params;

  const sizeFactor: LoadFactor = {
    name: 'Size Complexity',
    score: Math.min(100, Math.max(0, (linesOfCode - 50) / 10)),
    weight: 0.3,
    description: `${linesOfCode} lines of code`,
  };

  const interfaceFactor: LoadFactor = {
    name: 'Interface Complexity',
    score: Math.min(100, exportCount * 5),
    weight: 0.25,
    description: `${exportCount} exported concepts`,
  };

  const dependencyFactor: LoadFactor = {
    name: 'Dependency Complexity',
    score: Math.min(100, importCount * 8),
    weight: 0.25,
    description: `${importCount} dependencies`,
  };

  const conceptDensity = linesOfCode > 0 ? uniqueConcepts / linesOfCode : 0;
  const conceptFactor: LoadFactor = {
    name: 'Conceptual Density',
    score: Math.min(100, conceptDensity * 500),
    weight: 0.2,
    description: `${uniqueConcepts} unique concepts`,
  };

  const factors = [
    sizeFactor,
    interfaceFactor,
    dependencyFactor,
    conceptFactor,
  ];
  const score = factors.reduce((sum, f) => sum + f.score * f.weight, 0);

  let rating: CognitiveLoad['rating'];
  if (score < 20) rating = 'trivial';
  else if (score < 40) rating = 'easy';
  else if (score < 60) rating = 'moderate';
  else if (score < 80) rating = 'difficult';
  else rating = 'expert';

  return {
    score: Math.round(score),
    rating,
    factors,
    rawValues: {
      size: linesOfCode,
      complexity: cyclomaticComplexity,
      dependencyCount: importCount,
      conceptCount: uniqueConcepts,
    },
  };
}
