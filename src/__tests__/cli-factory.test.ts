import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createStandardProgressCallback,
  formatStandardCliResult,
} from '../utils/cli-factory';

describe('cli-factory', () => {
  describe('createStandardProgressCallback', () => {
    let stdoutSpy: any;

    beforeEach(() => {
      stdoutSpy = vi
        .spyOn(process.stdout, 'write')
        .mockImplementation(() => true);
    });

    afterEach(() => {
      stdoutSpy.mockRestore();
    });

    it('should write progress to stdout', () => {
      const callback = createStandardProgressCallback('TestTool');
      callback(50, 100, 'Processing...');

      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TestTool]')
      );
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('50%'));
      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing...')
      );
    });

    it('should write newline when finished', () => {
      const callback = createStandardProgressCallback('TestTool');
      callback(100, 100, 'Done');

      expect(stdoutSpy).toHaveBeenCalledWith('\n');
    });
  });

  describe('formatStandardCliResult', () => {
    let consoleSpy: any;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log overall score and issues count', () => {
      formatStandardCliResult('TestTool', 85, 2);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('TESTTOOL Analysis Complete')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Overall Score: 85/100')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Issues Found: 2')
      );
    });

    it('should log "None" when issues count is 0', () => {
      formatStandardCliResult('TestTool', 100, 0);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Issues Found: None')
      );
    });
  });
});
