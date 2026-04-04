import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateOverallScore, ScoringProfile } from '../scoring';
import type { ToolScoringOutput } from '../scoring-types';

describe('Scoring Engine Snapshots', () => {
  // Mock timestamp to keep snapshots stable
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-18T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createMockOutput = (
    name: string,
    score: number
  ): ToolScoringOutput => ({
    toolName: name,
    score,
    rawMetrics: { someMetric: 123 },
    factors: [
      {
        name: 'Factor A',
        impact: score > 50 ? 5 : -5,
        description: 'Test factor',
      },
    ],
    recommendations: [
      { action: 'Improve X', estimatedImpact: 10, priority: 'medium' },
    ],
  });

  it('Perfect Project (All 100s)', () => {
    const toolOutputs = new Map<string, ToolScoringOutput>([
      ['pattern-detect', createMockOutput('pattern-detect', 100)],
      ['context-analyzer', createMockOutput('context-analyzer', 100)],
      ['naming-consistency', createMockOutput('naming-consistency', 100)],
      ['ai-signal-clarity', createMockOutput('ai-signal-clarity', 100)],
    ]);

    const result = calculateOverallScore(toolOutputs);
    expect(result).toMatchSnapshot();
  });

  it('Critical Failure (All 0s)', () => {
    const toolOutputs = new Map<string, ToolScoringOutput>([
      ['pattern-detect', createMockOutput('pattern-detect', 0)],
      ['context-analyzer', createMockOutput('context-analyzer', 0)],
    ]);

    const result = calculateOverallScore(toolOutputs);
    expect(result).toMatchSnapshot();
  });

  it('Typical Project (Mixed Performance)', () => {
    const toolOutputs = new Map<string, ToolScoringOutput>([
      ['pattern-detect', createMockOutput('pattern-detect', 85)],
      ['context-analyzer', createMockOutput('context-analyzer', 70)],
      ['naming-consistency', createMockOutput('naming-consistency', 45)],
      ['ai-signal-clarity', createMockOutput('ai-signal-clarity', 92)],
    ]);

    const result = calculateOverallScore(toolOutputs);
    // Score should be weighted average of 85(22), 70(19), 45(14), 92(11)
    expect(result).toMatchSnapshot();
  });

  it('Agentic Profile weighting', () => {
    const toolOutputs = new Map<string, ToolScoringOutput>([
      ['ai-signal-clarity', createMockOutput('ai-signal-clarity', 100)],
      ['agent-grounding', createMockOutput('agent-grounding', 50)],
    ]);

    // Agentic profile gives equal weight (25/25) to these two
    const result = calculateOverallScore(toolOutputs, {
      profile: ScoringProfile.Agentic,
    });
    expect(result.overall).toBe(75);
    expect(result).toMatchSnapshot();
  });

  it('Manual CLI Weight Overrides', () => {
    const toolOutputs = new Map<string, ToolScoringOutput>([
      ['pattern-detect', createMockOutput('pattern-detect', 100)],
      ['context-analyzer', createMockOutput('context-analyzer', 0)],
    ]);

    const cliWeights = new Map([
      ['pattern-detect', 1],
      ['context-analyzer', 9],
    ]);

    // (100 * 1 + 0 * 9) / 10 = 10
    const result = calculateOverallScore(toolOutputs, undefined, cliWeights);
    expect(result.overall).toBe(10);
    expect(result).toMatchSnapshot();
  });
});
