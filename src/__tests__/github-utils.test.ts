import { describe, it, expect, vi } from 'vitest';
import {
  emitAnnotation,
  severityToAnnotationLevel,
  emitIssuesAsAnnotations,
} from '../utils/github-utils';

describe('github-utils', () => {
  describe('severityToAnnotationLevel', () => {
    it('should map AIReady severity to correct GitHub annotation level', () => {
      expect(severityToAnnotationLevel('critical')).toBe('error');
      expect(severityToAnnotationLevel('high-risk')).toBe('error');
      expect(severityToAnnotationLevel('major')).toBe('warning');
      expect(severityToAnnotationLevel('minor')).toBe('notice');
      expect(severityToAnnotationLevel('info')).toBe('notice');
      expect(severityToAnnotationLevel('unknown')).toBe('notice');
    });
  });

  describe('emitAnnotation', () => {
    it('should format simple annotation correctly', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      emitAnnotation({
        level: 'error',
        file: 'src/index.ts',
        message: 'Something went wrong',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '::error file=src/index.ts::Something went wrong'
      );
      consoleSpy.mockRestore();
    });

    it('should include line, column and title if provided', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      emitAnnotation({
        level: 'warning',
        file: 'test.ts',
        line: 10,
        col: 5,
        title: 'Linter',
        message: 'Bad code',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '::warning file=test.ts,line=10,col=5,title=Linter::Bad code'
      );
      consoleSpy.mockRestore();
    });

    it('should escape newlines in messages', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      emitAnnotation({
        level: 'notice',
        file: 'file.ts',
        message: 'First line\nSecond line',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '::notice file=file.ts::First line%0ASecond line'
      );
      consoleSpy.mockRestore();
    });
  });

  describe('emitIssuesAsAnnotations', () => {
    it('should emit multiple issues', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const issues = [
        {
          severity: 'critical',
          fileName: 'f1.ts',
          message: 'M1',
          location: { start: { line: 1 } },
        },
        { severity: 'major', file: 'f2.ts', description: 'M2', line: 2 },
      ];

      emitIssuesAsAnnotations(issues);

      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenNthCalledWith(
        1,
        '::error file=f1.ts,line=1,title=AIReady: Issue::M1'
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(
        2,
        '::warning file=f2.ts,line=2,title=AIReady: Issue::M2'
      );

      consoleSpy.mockRestore();
    });
  });
});
