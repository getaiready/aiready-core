import { describe, it, expect } from 'vitest';
import { calculateChangeAmplification } from '../metrics/change-amplification';

describe('calculateChangeAmplification scoring', () => {
  it('should return 100 for no files', () => {
    const result = calculateChangeAmplification({ files: [] });
    expect(result.score).toBe(100);
  });

  it('should return 100 for isolated files', () => {
    const result = calculateChangeAmplification({
      files: [
        { file: 'a.ts', fanIn: 0, fanOut: 0 },
        { file: 'b.ts', fanIn: 0, fanOut: 0 },
      ],
    });
    expect(result.score).toBe(100);
  });

  it('should have a floor of 5 even for extreme coupling', () => {
    const files = Array.from({ length: 100 }, (_, i) => ({
      file: `file${i}.ts`,
      fanIn: 100,
      fanOut: 100,
    }));
    const result = calculateChangeAmplification({ files });
    expect(result.score).toBe(5);
    expect(result.rating).toBe('explosive');
  });

  it('should not penalize moderately coupled projects too heavily', () => {
    const result = calculateChangeAmplification({
      files: [
        { file: 'app.ts', fanIn: 0, fanOut: 10 },
        { file: 'util.ts', fanIn: 10, fanOut: 0 },
      ],
    });
    // avgAmplification for app: 10 + 0*0.5 = 10
    // avgAmplification for util: 0 + 10*0.5 = 5
    // avg = 7.5
    // penalty = log2(8.5) * 15 approx 3.08 * 15 = 46
    // result.score approx 100 - 46 = 54
    expect(result.score).toBeGreaterThan(50);
    expect(result.score).toBeLessThan(60);
  });

  it('should use logarithmic penalty for max amplification', () => {
    const moderate = calculateChangeAmplification({
      files: [{ file: 'a.ts', fanIn: 20, fanOut: 0 }], // amp = 10
    });
    const high = calculateChangeAmplification({
      files: [{ file: 'a.ts', fanIn: 100, fanOut: 0 }], // amp = 50
    });

    expect(moderate.score).toBe(48); // 100 - log2(11)*15 approx 48
    expect(high.score).toBe(5); // Hits the floor
  });
});
