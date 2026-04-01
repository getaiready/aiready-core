import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  displayStandardConsoleReport,
  getScoreColor,
} from '../utils/reporting';
import { Severity } from '../types';

describe('reporting', () => {
  describe('getScoreColor', () => {
    it('should return a function for high scores', () => {
      const color = getScoreColor(90);
      expect(typeof color).toBe('function');
      expect(color('test')).toContain('test');
    });

    it('should return a function for medium scores', () => {
      const color = getScoreColor(60);
      expect(typeof color).toBe('function');
      expect(color('test')).toContain('test');
    });

    it('should return a function for low scores', () => {
      const color = getScoreColor(40);
      expect(typeof color).toBe('function');
      expect(color('test')).toContain('test');
    });
  });

  describe('displayStandardConsoleReport', () => {
    let consoleSpy: any;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log title and score', () => {
      const data = {
        title: 'Test Report',
        score: 85,
        rating: 'A',
        dimensions: [{ name: 'Quality', value: 90 }],
        issues: [],
        elapsedTime: '1.5',
      };

      displayStandardConsoleReport(data);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test Report')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('85/100')
      );
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('A'));
    });

    it('should log safety rating if provided', () => {
      const data = {
        title: 'Test Report',
        score: 50,
        rating: 'C',
        dimensions: [],
        issues: [],
        elapsedTime: '1.0',
        safetyRating: 'high-risk',
      };

      displayStandardConsoleReport(data);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('HIGH RISK')
      );
    });

    it('should log issues if present', () => {
      const data = {
        title: 'Test Report',
        score: 70,
        rating: 'B',
        dimensions: [],
        issues: [
          {
            severity: Severity.Major,
            message: 'Bad code',
            suggestion: 'Fix it',
          },
        ],
        elapsedTime: '1.0',
      };

      displayStandardConsoleReport(data);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('MAJOR'));
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Bad code')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fix it')
      );
    });
  });
});
