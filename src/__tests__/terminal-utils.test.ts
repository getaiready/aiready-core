import { describe, it, expect, vi } from 'vitest';
import chalk from 'chalk';
import {
  getTerminalDivider,
  printTerminalHeader,
  getScoreBar,
  getSafetyIcon,
} from '../utils/terminal-utils';

describe('terminal-utils', () => {
  describe('getTerminalDivider', () => {
    it('should return a divider string with default width', () => {
      const divider = getTerminalDivider();
      expect(divider).toBeDefined();
      expect(typeof divider).toBe('string');
    });

    it('should handle missing process.stdout.columns', () => {
      const originalColumns = process.stdout.columns;
      Object.defineProperty(process.stdout, 'columns', {
        value: undefined,
        configurable: true,
      });

      const divider = getTerminalDivider(chalk.white, 50);
      expect(divider).toBeDefined();

      Object.defineProperty(process.stdout, 'columns', {
        value: originalColumns,
        configurable: true,
      });
    });
  });

  describe('printTerminalHeader', () => {
    it('should print header to console', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      printTerminalHeader('Test Title');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('getScoreBar', () => {
    it('should return correct bar for various scores', () => {
      expect(getScoreBar(0)).toBe('░░░░░░░░░░');
      expect(getScoreBar(50)).toBe('█████░░░░░');
      expect(getScoreBar(100)).toBe('██████████');
      expect(getScoreBar(-10)).toBe('░░░░░░░░░░');
      expect(getScoreBar(110)).toBe('██████████');
    });
  });

  describe('getSafetyIcon', () => {
    it('should return correct icons', () => {
      expect(getSafetyIcon('safe')).toBe('✅');
      expect(getSafetyIcon('moderate-risk')).toBe('⚠️ ');
      expect(getSafetyIcon('high-risk')).toBe('🔴');
      expect(getSafetyIcon('blind-risk')).toBe('💀');
      expect(getSafetyIcon('unknown')).toBe('❓');
    });
  });
});
