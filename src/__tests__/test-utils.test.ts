import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import {
  isTestFile,
  detectTestFramework,
  isIgnorableSourceFile,
  isBuildArtifact,
} from '../utils/test-utils';

vi.mock('fs');

describe('test-utils', () => {
  describe('isTestFile', () => {
    it('should identify various test file patterns', () => {
      expect(isTestFile('src/utils.test.ts')).toBe(true);
      expect(isTestFile('src/utils.spec.js')).toBe(true);
      expect(isTestFile('pkg/main_test.go')).toBe(true);
      expect(isTestFile('tests/test_api.py')).toBe(true);
      expect(isTestFile('src/__tests__/internal.ts')).toBe(true);
      expect(isTestFile('src/app.ts')).toBe(false);
    });

    it('should respect extra patterns', () => {
      expect(isTestFile('src/app.ts', ['app.ts'])).toBe(true);
    });
  });

  describe('detectTestFramework', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should detect Vitest in package.json', () => {
      vi.mocked(existsSync).mockImplementation((p) =>
        p.toString().endsWith('package.json')
      );
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({ devDependencies: { vitest: '^1.0.0' } })
      );
      expect(detectTestFramework('/root')).toBe(true);
    });

    it('should detect Pytest in requirements.txt', () => {
      vi.mocked(existsSync).mockImplementation((p) =>
        p.toString().endsWith('requirements.txt')
      );
      vi.mocked(readFileSync).mockReturnValue('pytest==7.0.0');
      expect(detectTestFramework('/root')).toBe(true);
    });

    it('should detect Go testing in go.mod', () => {
      vi.mocked(existsSync).mockImplementation((p) =>
        p.toString().endsWith('go.mod')
      );
      expect(detectTestFramework('/root')).toBe(true);
    });

    it('should return false if no framework detected', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      expect(detectTestFramework('/root')).toBe(false);
    });

    it('should handle read errors gracefully', () => {
      vi.mocked(existsSync).mockImplementation((p) =>
        p.toString().endsWith('package.json')
      );
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('Read error');
      });
      expect(detectTestFramework('/root')).toBe(false);
    });
  });

  describe('isIgnorableSourceFile', () => {
    it('should identify ignorable files', () => {
      expect(isIgnorableSourceFile('/src/types.ts')).toBe(true);
      expect(isIgnorableSourceFile('/src/interfaces/user.ts')).toBe(true);
      expect(isIgnorableSourceFile('/src/constants.ts')).toBe(true);
      expect(isIgnorableSourceFile('/src/models/data.ts')).toBe(true);
      expect(isIgnorableSourceFile('/src/app.ts')).toBe(false);
    });
  });

  describe('isBuildArtifact', () => {
    it('should identify build artifacts', () => {
      expect(isBuildArtifact('/node_modules/lodash/index.js')).toBe(true);
      expect(isBuildArtifact('/dist/index.js')).toBe(true);
      expect(isBuildArtifact('/build/main.o')).toBe(true);
      expect(isBuildArtifact('/src/index.ts')).toBe(false);
    });
  });
});
