import { describe, it, expect, vi } from 'vitest';
import { parseGitHubUrl, getGitHubRepoInfo, MAX_REPO_SIZE_KB } from '../github';
import { Octokit } from '@octokit/rest';

// Mock Octokit
vi.mock('@octokit/rest', () => {
  const mockGet = vi.fn();
  class MockOctokit {
    repos = {
      get: mockGet,
    };
  }
  return {
    Octokit: MockOctokit,
  };
});

describe('GitHub Utilities', () => {
  describe('parseGitHubUrl', () => {
    it('should parse standard HTTPS URLs', () => {
      expect(parseGitHubUrl('https://github.com/owner/repo')).toEqual({
        owner: 'owner',
        repo: 'repo',
      });
    });

    it('should parse HTTPS URLs with .git extension', () => {
      expect(parseGitHubUrl('https://github.com/owner/repo.git')).toEqual({
        owner: 'owner',
        repo: 'repo',
      });
    });

    it('should parse SSH URLs', () => {
      expect(parseGitHubUrl('git@github.com:owner/repo.git')).toEqual({
        owner: 'owner',
        repo: 'repo',
      });
    });

    it('should return null for invalid URLs', () => {
      expect(parseGitHubUrl('https://google.com')).toBeNull();
      expect(parseGitHubUrl('https://github.com/onlyowner')).toBeNull();
      expect(parseGitHubUrl('not-a-url')).toBeNull();
    });
  });

  describe('getGitHubRepoInfo', () => {
    it('should fetch repo info using Octokit', async () => {
      const mockData = { name: 'repo', size: 1000, default_branch: 'main' };
      const octokitInstance = new Octokit();
      (octokitInstance.repos.get as any).mockResolvedValue({ data: mockData });

      const info = await getGitHubRepoInfo(
        'https://github.com/owner/repo',
        'fake-token'
      );

      expect(info).toEqual(mockData);
      expect(octokitInstance.repos.get).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
      });
    });

    it('should throw error for invalid URLs', async () => {
      await expect(
        getGitHubRepoInfo('https://google.com/foo/bar', 'token')
      ).rejects.toThrow('Invalid GitHub URL');
    });
  });

  describe('MAX_REPO_SIZE_KB', () => {
    it('should be 512,000 KB (500MB)', () => {
      expect(MAX_REPO_SIZE_KB).toBe(512000);
    });
  });
});
