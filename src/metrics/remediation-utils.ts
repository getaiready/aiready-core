import type { ToolScoringOutput } from '../scoring';
import type { CognitiveLoad } from './cognitive-load';
import type { PatternEntropy, ConceptCohesion } from './structural-metrics';
import type { AiSignalClarity } from './ai-signal-clarity';
import type { AgentGroundingScore } from './agent-grounding';
import type { TestabilityIndex } from './testability-index';
import type { DocDriftRisk } from './doc-drift';
import type { DependencyHealthScore } from './dependency-health';

/**
 * Collect and prioritize recommendations from all metric dimensions
 */
export function collectFutureProofRecommendations(params: {
  cognitiveLoad: CognitiveLoad;
  patternEntropy: PatternEntropy;
  conceptCohesion: ConceptCohesion;
  aiSignalClarity: AiSignalClarity;
  agentGrounding: AgentGroundingScore;
  testability: TestabilityIndex;
  docDrift?: DocDriftRisk;
  dependencyHealth?: DependencyHealthScore;
}): ToolScoringOutput['recommendations'] {
  const recommendations: ToolScoringOutput['recommendations'] = [];

  for (const rec of params.aiSignalClarity.recommendations) {
    recommendations.push({ action: rec, estimatedImpact: 8, priority: 'high' });
  }

  for (const rec of params.agentGrounding.recommendations) {
    recommendations.push({
      action: rec,
      estimatedImpact: 6,
      priority: 'medium',
    });
  }

  for (const rec of params.testability.recommendations) {
    const priority =
      params.testability.aiChangeSafetyRating === 'blind-risk'
        ? 'high'
        : 'medium';
    recommendations.push({ action: rec, estimatedImpact: 10, priority });
  }

  for (const rec of params.patternEntropy.recommendations) {
    recommendations.push({ action: rec, estimatedImpact: 5, priority: 'low' });
  }

  if (params.conceptCohesion.rating === 'poor') {
    recommendations.push({
      action: 'Improve concept cohesion by grouping related exports',
      estimatedImpact: 8,
      priority: 'high',
    });
  }

  if (params.docDrift) {
    for (const rec of params.docDrift.recommendations) {
      recommendations.push({
        action: rec,
        estimatedImpact: 8,
        priority: 'high',
      });
    }
  }

  if (params.dependencyHealth) {
    for (const rec of params.dependencyHealth.recommendations) {
      recommendations.push({
        action: rec,
        estimatedImpact: 7,
        priority: 'medium',
      });
    }
  }

  return recommendations;
}
