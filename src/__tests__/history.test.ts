import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import {
  loadScoreHistory,
  saveScoreEntry,
  getHistorySummary,
  exportHistory,
  clearHistory,
} from '../utils/history';

vi.mock('fs');

describe('history', () => {
  const rootDir = '/root';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('loadScoreHistory', () => {
    it('should return empty array if file does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      expect(loadScoreHistory(rootDir)).toEqual([]);
    });

    it('should return parsed data if file exists', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify([{ overallScore: 80 }])
      );
      expect(loadScoreHistory(rootDir)).toEqual([{ overallScore: 80 }]);
    });

    it('should return empty array on parse error', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('invalid json');
      expect(loadScoreHistory(rootDir)).toEqual([]);
    });
  });

  describe('saveScoreEntry', () => {
    it('should save new entry and filter old entries', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      const oldTimestamp = new Date(
        Date.now() - 400 * 24 * 60 * 60 * 1000
      ).toISOString();
      const recentTimestamp = new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000
      ).toISOString();

      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify([
          { timestamp: oldTimestamp, overallScore: 50 },
          { timestamp: recentTimestamp, overallScore: 70 },
        ])
      );

      saveScoreEntry(rootDir, {
        overallScore: 90,
        breakdown: {},
        totalIssues: 0,
        totalTokens: 0,
      });

      expect(writeFileSync).toHaveBeenCalled();
      const savedData = JSON.parse(
        vi.mocked(writeFileSync).mock.calls[0][1] as string
      );
      expect(savedData).toHaveLength(2); // One year old removed, one recent kept, one new added
      expect(savedData[1].overallScore).toBe(90);
    });

    it('should create directory if it does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      saveScoreEntry(rootDir, {
        overallScore: 90,
        breakdown: {},
        totalIssues: 0,
        totalTokens: 0,
      });
      expect(mkdirSync).toHaveBeenCalled();
    });
  });

  describe('getHistorySummary', () => {
    it('should return default summary if history is empty', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const summary = getHistorySummary(rootDir);
      expect(summary.totalScans).toBe(0);
      expect(summary.avgScore).toBe(0);
    });

    it('should calculate summary correctly', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify([
          { timestamp: '2021-01-01', overallScore: 80 },
          { timestamp: '2021-01-02', overallScore: 90 },
        ])
      );
      const summary = getHistorySummary(rootDir);
      expect(summary.totalScans).toBe(2);
      expect(summary.avgScore).toBe(85);
      expect(summary.firstScan).toBe('2021-01-01');
      expect(summary.lastScan).toBe('2021-01-02');
    });
  });

  describe('exportHistory', () => {
    it('should export as JSON by default', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify([{ overallScore: 80 }])
      );
      const result = exportHistory(rootDir);
      expect(JSON.parse(result)).toHaveLength(1);
    });

    it('should export as CSV', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify([
          {
            timestamp: '2021-01-01',
            overallScore: 80,
            totalIssues: 5,
            totalTokens: 100,
            breakdown: { 'pattern-detect': 70 },
          },
        ])
      );
      const result = exportHistory(rootDir, 'csv');
      expect(result).toContain('timestamp,overallScore');
      expect(result).toContain('2021-01-01,80,5,100,70');
    });
  });

  describe('clearHistory', () => {
    it('should overwrite with empty array if file exists', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      clearHistory(rootDir);
      expect(writeFileSync).toHaveBeenCalledWith(expect.any(String), '[]');
    });

    it('should do nothing if file does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      clearHistory(rootDir);
      expect(writeFileSync).not.toHaveBeenCalled();
    });
  });
});
