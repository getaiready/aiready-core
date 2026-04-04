import { Octokit } from '@octokit/rest';

/**
 * Parse GitHub repository URL into owner and repo name.
 * Supports:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - git@github.com:owner/repo.git
 */
export function parseGitHubUrl(
  url: string
): { owner: string; repo: string } | null {
  try {
    if (!url.includes('github.com')) return null;

    const cleanUrl = url
      .replace('https://github.com/', '')
      .replace('http://github.com/', '')
      .replace('git@github.com:', '')
      .replace('.git', '');

    const parts = cleanUrl.split('/');
    if (parts.length < 2) return null;
    if (!parts[0] || !parts[1]) return null;

    return {
      owner: parts[0],
      repo: parts[1],
    };
  } catch (error) {
    return null;
  }
}

/**
 * Fetch repository information from GitHub.
 */
export async function getGitHubRepoInfo(url: string, accessToken: string) {
  const parsed = parseGitHubUrl(url);
  if (!parsed) throw new Error('Invalid GitHub URL');

  const octokit = new Octokit({ auth: accessToken });
  const { data } = await octokit.repos.get({
    owner: parsed.owner,
    repo: parsed.repo,
  });

  return data;
}

/**
 * Maximum repository size allowed for processing (in KB).
 * 500MB = 500 * 1024 KB = 512,000 KB
 */
export const MAX_REPO_SIZE_KB = 512000;
