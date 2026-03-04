/**
 * Future-Proof AI Metrics Abstraction Layer
 *
 * This module provides technology-agnostic metric primitives that will
 * remain valid across changes in AI models, tokenization, and paradigms.
 */

import type { ToolScoringOutput } from './scoring';
import {
  calculateCognitiveLoad,
  CognitiveLoad,
} from './metrics/cognitive-load';
import {
  calculateSemanticDistance,
  SemanticDistance,
} from './metrics/semantic-distance';
import {
  calculatePatternEntropy,
  calculateConceptCohesion,
  PatternEntropy,
  ConceptCohesion,
} from './metrics/structural-metrics';
import {
  calculateAiSignalClarity,
  AiSignalClarity,
} from './metrics/ai-signal-clarity';
import {
  calculateAgentGrounding,
  AgentGroundingScore,
} from './metrics/agent-grounding';
import {
  calculateTestabilityIndex,
  TestabilityIndex,
} from './metrics/testability-index';
import { calculateDocDrift, DocDriftRisk } from './metrics/doc-drift';
import {
  calculateDependencyHealth,
  DependencyHealthScore,
} from './metrics/dependency-health';
import {
  calculateChangeAmplification,
  ChangeAmplificationScore,
} from './metrics/change-amplification';
import { collectFutureProofRecommendations } from './metrics/remediation-utils';

export * from './metrics/cognitive-load';
export * from './metrics/semantic-distance';
export * from './metrics/structural-metrics';
export * from './metrics/ai-signal-clarity';
export * from './metrics/agent-grounding';
export * from './metrics/testability-index';
export * from './metrics/doc-drift';
export * from './metrics/dependency-health';
export * from './metrics/change-amplification';

/**
 * Aggregate Future-Proof Score (Base)
 */
export function calculateFutureProofScore(params: {
  cognitiveLoad: CognitiveLoad;
  patternEntropy: PatternEntropy;
  conceptCohesion: ConceptCohesion;
  semanticDistances?: SemanticDistance[];
}): ToolScoringOutput {
  const loadScore = 100 - params.cognitiveLoad.score;
  const entropyScore = 100 - params.patternEntropy.entropy * 100;
  const cohesionScore = params.conceptCohesion.score * 100;

  const overall = Math.round(
    loadScore * 0.4 + entropyScore * 0.3 + cohesionScore * 0.3
  );

  const factors: ToolScoringOutput['factors'] = [
    {
      name: 'Cognitive Load',
      impact: Math.round(loadScore - 50),
      description: params.cognitiveLoad.rating,
    },
    {
      name: 'Pattern Entropy',
      impact: Math.round(entropyScore - 50),
      description: params.patternEntropy.rating,
    },
    {
      name: 'Concept Cohesion',
      impact: Math.round(cohesionScore - 50),
      description: params.conceptCohesion.rating,
    },
  ];

  const recommendations: ToolScoringOutput['recommendations'] = [];
  for (const rec of params.patternEntropy.recommendations) {
    recommendations.push({
      action: rec,
      estimatedImpact: 5,
      priority: 'medium',
    });
  }
  if (params.conceptCohesion.rating === 'poor') {
    recommendations.push({
      action: 'Improve concept cohesion by grouping related exports',
      estimatedImpact: 8,
      priority: 'high',
    });
  }

  const semanticDistanceAvg = params.semanticDistances?.length
    ? params.semanticDistances.reduce((s, d) => s + d.distance, 0) /
      params.semanticDistances.length
    : 0;

  return {
    toolName: 'future-proof',
    score: overall,
    rawMetrics: {
      cognitiveLoadScore: params.cognitiveLoad.score,
      entropyScore: params.patternEntropy.entropy,
      cohesionScore: params.conceptCohesion.score,
      semanticDistanceAvg,
    },
    factors,
    recommendations,
  };
}

/**
 * Complete Extended Future-Proof Score
 */
export function calculateExtendedFutureProofScore(params: {
  cognitiveLoad: CognitiveLoad;
  patternEntropy: PatternEntropy;
  conceptCohesion: ConceptCohesion;
  aiSignalClarity: AiSignalClarity;
  agentGrounding: AgentGroundingScore;
  testability: TestabilityIndex;
  docDrift?: DocDriftRisk;
  dependencyHealth?: DependencyHealthScore;
  semanticDistances?: SemanticDistance[];
}): ToolScoringOutput {
  const loadScore = 100 - params.cognitiveLoad.score;
  const entropyScore = 100 - params.patternEntropy.entropy * 100;
  const cohesionScore = params.conceptCohesion.score * 100;
  const aiSignalClarityScore = 100 - params.aiSignalClarity.score;
  const groundingScore = params.agentGrounding.score;
  const testabilityScore = params.testability.score;
  const docDriftScore = params.docDrift ? 100 - params.docDrift.score : 100;
  const depsHealthScore = params.dependencyHealth?.score ?? 100;

  let totalWeight = 0.8;
  let overall =
    loadScore * 0.15 +
    entropyScore * 0.1 +
    cohesionScore * 0.1 +
    aiSignalClarityScore * 0.15 +
    groundingScore * 0.15 +
    testabilityScore * 0.15;

  if (params.docDrift) {
    overall += docDriftScore * 0.1;
    totalWeight += 0.1;
  }
  if (params.dependencyHealth) {
    overall += depsHealthScore * 0.1;
    totalWeight += 0.1;
  }

  overall = Math.round(overall / totalWeight);

  const factors: ToolScoringOutput['factors'] = [
    {
      name: 'Cognitive Load',
      impact: Math.round(loadScore - 50),
      description: params.cognitiveLoad.rating,
    },
    {
      name: 'Pattern Entropy',
      impact: Math.round(entropyScore - 50),
      description: params.patternEntropy.rating,
    },
    {
      name: 'Concept Cohesion',
      impact: Math.round(cohesionScore - 50),
      description: params.conceptCohesion.rating,
    },
    {
      name: 'AI Signal Clarity',
      impact: Math.round(aiSignalClarityScore - 50),
      description: `${params.aiSignalClarity.rating} risk`,
    },
    {
      name: 'Agent Grounding',
      impact: Math.round(groundingScore - 50),
      description: params.agentGrounding.rating,
    },
    {
      name: 'Testability',
      impact: Math.round(testabilityScore - 50),
      description: params.testability.rating,
    },
  ];

  if (params.docDrift) {
    factors.push({
      name: 'Documentation Drift',
      impact: Math.round(docDriftScore - 50),
      description: params.docDrift.rating,
    });
  }
  if (params.dependencyHealth) {
    factors.push({
      name: 'Dependency Health',
      impact: Math.round(depsHealthScore - 50),
      description: params.dependencyHealth.rating,
    });
  }

  const recommendations = collectFutureProofRecommendations(params);
  const semanticDistanceAvg = params.semanticDistances?.length
    ? params.semanticDistances.reduce((s, d) => s + d.distance, 0) /
      params.semanticDistances.length
    : 0;

  return {
    toolName: 'future-proof',
    score: overall,
    rawMetrics: {
      cognitiveLoadScore: params.cognitiveLoad.score,
      entropyScore: params.patternEntropy.entropy,
      cohesionScore: params.conceptCohesion.score,
      aiSignalClarityScore: params.aiSignalClarity.score,
      agentGroundingScore: params.agentGrounding.score,
      testabilityScore: params.testability.score,
      docDriftScore: params.docDrift?.score,
      dependencyHealthScore: params.dependencyHealth?.score,
      semanticDistanceAvg,
    },
    factors,
    recommendations,
  };
}
