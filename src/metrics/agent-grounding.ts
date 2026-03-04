/**
 * Agent Grounding Metrics
 * Measures how well an AI agent can navigate a codebase independently.
 */

export interface AgentGroundingScore {
  score: number;
  rating: 'excellent' | 'good' | 'moderate' | 'poor' | 'disorienting';
  dimensions: {
    structureClarityScore: number;
    selfDocumentationScore: number;
    entryPointScore: number;
    apiClarityScore: number;
    domainConsistencyScore: number;
  };
  recommendations: string[];
}

export function calculateAgentGrounding(params: {
  deepDirectories: number;
  totalDirectories: number;
  vagueFileNames: number;
  totalFiles: number;
  hasRootReadme: boolean;
  readmeIsFresh: boolean;
  barrelExports: number;
  untypedExports: number;
  totalExports: number;
  inconsistentDomainTerms: number;
  domainVocabularySize: number;
}): AgentGroundingScore {
  const {
    deepDirectories,
    totalDirectories,
    vagueFileNames,
    totalFiles,
    hasRootReadme,
    readmeIsFresh,
    barrelExports,
    untypedExports,
    totalExports,
    inconsistentDomainTerms,
    domainVocabularySize,
  } = params;

  const structureClarityScore = Math.max(
    0,
    Math.round(
      100 -
        (totalDirectories > 0 ? (deepDirectories / totalDirectories) * 80 : 0)
    )
  );
  const selfDocumentationScore = Math.max(
    0,
    Math.round(100 - (totalFiles > 0 ? (vagueFileNames / totalFiles) * 90 : 0))
  );

  let entryPointScore = 60;
  if (hasRootReadme) entryPointScore += 25;
  if (readmeIsFresh) entryPointScore += 10;
  const barrelRatio = totalFiles > 0 ? barrelExports / (totalFiles * 0.1) : 0;
  entryPointScore += Math.round(Math.min(5, barrelRatio * 5));
  entryPointScore = Math.min(100, entryPointScore);

  const apiClarityScore = Math.max(
    0,
    Math.round(
      100 - (totalExports > 0 ? (untypedExports / totalExports) * 70 : 0)
    )
  );
  const domainConsistencyScore = Math.max(
    0,
    Math.round(
      100 -
        (domainVocabularySize > 0
          ? (inconsistentDomainTerms / domainVocabularySize) * 80
          : 0)
    )
  );

  const score = Math.round(
    structureClarityScore * 0.2 +
      selfDocumentationScore * 0.25 +
      entryPointScore * 0.2 +
      apiClarityScore * 0.15 +
      domainConsistencyScore * 0.2
  );

  let rating: AgentGroundingScore['rating'];
  if (score >= 85) rating = 'excellent';
  else if (score >= 70) rating = 'good';
  else if (score >= 50) rating = 'moderate';
  else if (score >= 30) rating = 'poor';
  else rating = 'disorienting';

  const recommendations: string[] = [];
  if (structureClarityScore < 70)
    recommendations.push(
      `Flatten ${deepDirectories} overly-deep directories to improve agent navigation`
    );
  if (selfDocumentationScore < 70)
    recommendations.push(
      `Rename ${vagueFileNames} vague files (utils, helpers, misc) to domain-specific names`
    );
  if (!hasRootReadme)
    recommendations.push(
      'Add a root README.md so agents understand the project context immediately'
    );
  else if (!readmeIsFresh)
    recommendations.push(
      'Update README.md — stale entry-point documentation disorients agents'
    );
  if (apiClarityScore < 70)
    recommendations.push(
      `Add TypeScript types to ${untypedExports} untyped exports to improve API discoverability`
    );
  if (domainConsistencyScore < 70)
    recommendations.push(
      `Unify ${inconsistentDomainTerms} inconsistent domain terms — agents need one word per concept`
    );

  return {
    score,
    rating,
    dimensions: {
      structureClarityScore,
      selfDocumentationScore,
      entryPointScore,
      apiClarityScore,
      domainConsistencyScore,
    },
    recommendations,
  };
}
