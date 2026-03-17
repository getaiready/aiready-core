/**
 * Semantic Distance Metrics.
 * Measures the conceptual distance between files or domains using import overlap.
 *
 * @lastUpdated 2026-03-18
 */

export interface SemanticDistance {
  between: [string, string];
  distance: number;
  relationship: 'same-file' | 'same-domain' | 'cross-domain' | 'unrelated';
  path: string[];
  reason: string;
}

/**
 * Calculate the semantic distance between two files based on domain and dependency overlap.
 *
 * @param params - Comparison parameters.
 * @param params.file1 - Path to the first file.
 * @param params.file2 - Path to the second file.
 * @param params.file1Domain - Logical domain of the first file.
 * @param params.file2Domain - Logical domain of the second file.
 * @param params.file1Imports - Set of imports in the first file.
 * @param params.file2Imports - Set of imports in the second file.
 * @param params.sharedDependencies - Intersection of imports between both files.
 * @returns Calculated semantic distance and relationship assessment.
 */
export function calculateSemanticDistance(params: {
  file1: string;
  file2: string;
  file1Domain: string;
  file2Domain: string;
  file1Imports: string[];
  file2Imports: string[];
  sharedDependencies: string[];
}): SemanticDistance {
  const {
    file1,
    file2,
    file1Domain,
    file2Domain,
    sharedDependencies,
    file1Imports,
    file2Imports,
  } = params;

  const domainDistance =
    file1Domain === file2Domain ? 0 : file1Domain && file2Domain ? 0.5 : 0.8;

  const importOverlap =
    sharedDependencies.length /
    Math.max(1, Math.min(file1Imports.length, file2Imports.length));
  const importDistance = 1 - importOverlap;

  const distance =
    domainDistance * 0.4 +
    importDistance * 0.3 +
    (sharedDependencies.length > 0 ? 0 : 0.3);

  let relationship: SemanticDistance['relationship'];
  if (file1 === file2) relationship = 'same-file';
  else if (file1Domain === file2Domain) relationship = 'same-domain';
  else if (sharedDependencies.length > 0) relationship = 'cross-domain';
  else relationship = 'unrelated';

  const pathItems = [file1Domain, ...sharedDependencies, file2Domain].filter(
    (s): s is string => typeof s === 'string' && s.length > 0
  );

  return {
    between: [file1, file2],
    distance: Math.round(distance * 100) / 100,
    relationship,
    path: pathItems,
    reason:
      relationship === 'same-domain'
        ? `Both in "${file1Domain}" domain`
        : relationship === 'cross-domain'
          ? `Share ${sharedDependencies.length} dependency(ies)`
          : 'No strong semantic relationship detected',
  };
}
