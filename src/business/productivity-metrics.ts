import type { ProductivityImpact, AcceptancePrediction } from '../types';
import type { ToolScoringOutput } from '../scoring';

/**
 * Severity time estimates (hours to fix)
 */
export const SEVERITY_TIME_ESTIMATES = {
  critical: 4,
  major: 2,
  minor: 0.5,
  info: 0.25,
};

const DEFAULT_HOURLY_RATE = 75;

/**
 * Calculate productivity impact from issues
 */
export function calculateProductivityImpact(
  issues: { severity: string }[],
  hourlyRate: number = DEFAULT_HOURLY_RATE
): ProductivityImpact {
  const counts = {
    critical: issues.filter((i) => i.severity === 'critical').length,
    major: issues.filter((i) => i.severity === 'major').length,
    minor: issues.filter((i) => i.severity === 'minor').length,
    info: issues.filter((i) => i.severity === 'info').length,
  };

  const hours = {
    critical: counts.critical * SEVERITY_TIME_ESTIMATES.critical,
    major: counts.major * SEVERITY_TIME_ESTIMATES.major,
    minor: counts.minor * SEVERITY_TIME_ESTIMATES.minor,
    info: counts.info * SEVERITY_TIME_ESTIMATES.info,
  };

  const totalHours = hours.critical + hours.major + hours.minor + hours.info;
  const totalCost = totalHours * hourlyRate;

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    hourlyRate,
    totalCost: Math.round(totalCost),
    bySeverity: {
      critical: {
        hours: Math.round(hours.critical * 10) / 10,
        cost: Math.round(hours.critical * hourlyRate),
      },
      major: {
        hours: Math.round(hours.major * 10) / 10,
        cost: Math.round(hours.major * hourlyRate),
      },
      minor: {
        hours: Math.round(hours.minor * 10) / 10,
        cost: Math.round(hours.minor * hourlyRate),
      },
    },
  };
}

/**
 * Predict AI suggestion acceptance rate
 */
export function predictAcceptanceRate(
  toolOutputs: Map<string, ToolScoringOutput>
): AcceptancePrediction {
  const factors: AcceptancePrediction['factors'] = [];
  const baseRate = 0.3;

  const patterns = toolOutputs.get('pattern-detect');
  if (patterns) {
    factors.push({
      name: 'Semantic Duplication',
      impact: Math.round((patterns.score - 50) * 0.003 * 100),
    });
  }

  const context = toolOutputs.get('context-analyzer');
  if (context) {
    factors.push({
      name: 'Context Efficiency',
      impact: Math.round((context.score - 50) * 0.004 * 100),
    });
  }

  const consistency = toolOutputs.get('consistency');
  if (consistency) {
    factors.push({
      name: 'Code Consistency',
      impact: Math.round((consistency.score - 50) * 0.002 * 100),
    });
  }

  const aiSignalClarity = toolOutputs.get('ai-signal-clarity');
  if (aiSignalClarity) {
    factors.push({
      name: 'AI Signal Clarity',
      impact: Math.round((50 - aiSignalClarity.score) * 0.002 * 100),
    });
  }

  const totalImpact = factors.reduce((sum, f) => sum + f.impact / 100, 0);
  const rate = Math.max(0.05, Math.min(0.8, baseRate + totalImpact));

  let confidence = 0.35;
  if (toolOutputs.size >= 4) confidence = 0.75;
  else if (toolOutputs.size >= 3) confidence = 0.65;
  else if (toolOutputs.size >= 2) confidence = 0.5;

  return { rate: Math.round(rate * 100) / 100, confidence, factors };
}
