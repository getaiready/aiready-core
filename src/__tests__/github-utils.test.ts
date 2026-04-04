import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  emitAnnotation,
  severityToAnnotationLevel,
  emitIssuesAsAnnotations,
} from '../utils/github-utils';

describe('github-utils', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(console.log).mockClear();
  });

  describe('emitAnnotation', () => {
    it('should format message correctly for GitHub Actions', () => {
      emitAnnotation({
        level: 'error',
        file: 'test.ts',
        line: 10,
        message: 'Test message\nwith newline',
      });
      expect(console.log).toHaveBeenCalledWith(
        '::error file=test.ts,line=10::Test message%0Awith newline'
      );
    });

    it('should handle missing metadata', () => {
      emitAnnotation({
        level: 'notice',
        file: '',
        message: 'Simple message',
      });
      expect(console.log).toHaveBeenCalledWith('::notice::Simple message');
    });
  });

  describe('severityToAnnotationLevel', () => {
    it('should map AIReady severities to GitHub levels', () => {
      expect(severityToAnnotationLevel('critical')).toBe('error');
      expect(severityToAnnotationLevel('high-risk')).toBe('error');
      expect(severityToAnnotationLevel('blind-risk')).toBe('error');
      expect(severityToAnnotationLevel('major')).toBe('warning');
      expect(severityToAnnotationLevel('moderate-risk')).toBe('warning');
      expect(severityToAnnotationLevel('minor')).toBe('notice');
      expect(severityToAnnotationLevel('info')).toBe('notice');
      expect(severityToAnnotationLevel('safe')).toBe('notice');
      expect(severityToAnnotationLevel('unknown')).toBe('notice');
    });
  });

  describe('emitIssuesAsAnnotations', () => {
    it('should emit multiple issues', () => {
      const issues = [
        { severity: 'critical', file: 'a.ts', line: 1, message: 'm1' },
        {
          severity: 'major',
          fileName: 'b.ts',
          location: { start: { line: 2, column: 5 } },
          description: 'm2',
        },
      ];
      emitIssuesAsAnnotations(issues);
      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('::error file=a.ts,line=1')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('::warning file=b.ts,line=2,col=5')
      );
    });
  });
});
