import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runBatchAnalysis } from '../utils/analysis-orchestrator';

describe('analysis-orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run analysis on all items and report progress', async () => {
    const items = [1, 2, 3];
    const label = 'Testing';
    const toolId = 'test-tool';
    const onProgress = vi.fn();
    const processFn = vi
      .fn()
      .mockImplementation(async (item: number) => item * 2);
    const onResult = vi.fn();

    await runBatchAnalysis(
      items,
      label,
      toolId,
      onProgress,
      processFn,
      onResult
    );

    expect(processFn).toHaveBeenCalledTimes(3);
    expect(processFn).toHaveBeenCalledWith(1);
    expect(processFn).toHaveBeenCalledWith(2);
    expect(processFn).toHaveBeenCalledWith(3);

    expect(onResult).toHaveBeenCalledTimes(3);
    expect(onResult).toHaveBeenCalledWith(2);
    expect(onResult).toHaveBeenCalledWith(4);
    expect(onResult).toHaveBeenCalledWith(6);

    expect(onProgress).toHaveBeenCalledTimes(1);
    expect(onProgress).toHaveBeenCalledWith(3, 3, 'Testing (3/3)');
  });

  it('should continue processing items when processFn throws', async () => {
    const items = [1, 2, 3];
    const label = 'Testing Error';
    const toolId = 'test-tool-error';
    const onProgress = vi.fn();
    const processFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Failed at 1'))
      .mockResolvedValue(10);
    const onResult = vi.fn();

    // Mock console.error to avoid noise in tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await runBatchAnalysis(
      items,
      label,
      toolId,
      onProgress,
      processFn,
      onResult
    );

    expect(processFn).toHaveBeenCalledTimes(3);
    expect(onResult).toHaveBeenCalledTimes(2);
    expect(onResult).toHaveBeenCalledWith(10);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      '[test-tool-error] Error processing 1:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should handle undefined onProgress', async () => {
    const items = [1];
    const label = 'Testing Undefined Progress';
    const toolId = 'test-tool-undef';
    const processFn = vi.fn().mockResolvedValue(100);
    const onResult = vi.fn();

    await runBatchAnalysis(
      items,
      label,
      toolId,
      undefined,
      processFn,
      onResult
    );

    expect(processFn).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(100);
  });
});
