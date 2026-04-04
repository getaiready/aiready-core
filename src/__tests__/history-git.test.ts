import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import {
  getFileCommitTimestamps,
  getLineRangeLastModifiedCached,
  getRepoMetadata,
} from '../utils/history-git';

vi.mock('child_process');

describe('history-git', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getFileCommitTimestamps', () => {
    it('should parse git blame output correctly', () => {
      const mockOutput =
        'abcd1234 (Author 1234567890 -0700 1) line 1\n' +
        'efgh5678 (Author 1234567891 -0700 2) line 2\n';
      vi.mocked(execSync).mockReturnValue(mockOutput as any);

      const result = getFileCommitTimestamps('test.ts');
      expect(result[1]).toBe(1234567890);
      expect(result[2]).toBe(1234567891);
    });

    it('should return empty object on execSync error', () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('Git failed');
      });
      const result = getFileCommitTimestamps('test.ts');
      expect(result).toEqual({});
    });
  });

  describe('getLineRangeLastModifiedCached', () => {
    it('should find the latest timestamp in range', () => {
      const timestamps = {
        1: 1000,
        2: 3000,
        3: 2000,
        4: 4000,
      };
      expect(getLineRangeLastModifiedCached(timestamps, 1, 3)).toBe(3000);
      expect(getLineRangeLastModifiedCached(timestamps, 4, 4)).toBe(4000);
      expect(getLineRangeLastModifiedCached(timestamps, 10, 15)).toBe(0);
    });
  });

  describe('getRepoMetadata', () => {
    it('should extract metadata from git commands', () => {
      vi.mocked(execSync).mockImplementation((cmd: any) => {
        if (cmd.startsWith('git config --get remote.origin.url'))
          return 'https://github.com/test/repo.git';
        if (cmd.startsWith('git rev-parse --abbrev-ref HEAD')) return 'main';
        if (cmd.startsWith('git rev-parse HEAD')) return 'latest-commit-hash';
        if (cmd.startsWith('git log -1 --format=%ae'))
          return 'author@example.com';
        return '';
      });

      const metadata = getRepoMetadata('/root');
      expect(metadata.url).toBe('https://github.com/test/repo.git');
      expect(metadata.branch).toBe('main');
      expect(metadata.commit).toBe('latest-commit-hash');
      expect(metadata.author).toBe('author@example.com');
    });

    it('should handle partial git failures gracefully', () => {
      vi.mocked(execSync).mockImplementation((cmd: any) => {
        if (cmd.startsWith('git rev-parse HEAD')) return 'latest-commit-hash';
        throw new Error('Command failed');
      });

      const metadata = getRepoMetadata('/root');
      expect(metadata.commit).toBe('latest-commit-hash');
      expect(metadata.url).toBeUndefined();
      expect(metadata.branch).toBeUndefined();
      expect(metadata.author).toBeUndefined();
    });

    it('should handle complete failure if not a git repo', () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('Not a git repo');
      });
      const metadata = getRepoMetadata('/root');
      expect(metadata).toEqual({});
    });
  });
});
