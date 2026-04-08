import { Octokit } from '@octokit/rest';

export interface GitHubIssue {
  title: string;
  body: string;
  labels?: string[];
}

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Creates an issue in a repository.
   */
  async createHubIssue(
    owner: string,
    repo: string,
    issue: GitHubIssue
  ): Promise<number> {
    const { data } = await this.octokit.issues.create({
      owner,
      repo,
      title: issue.title,
      body: issue.body,
      labels: issue.labels || ['innovation-harvest'],
    });

    return data.number;
  }

  /**
   * Creates a Pull Request in a repository.
   */
  async createPullRequest(
    owner: string,
    repo: string,
    pr: { title: string; body: string; head: string; base: string }
  ): Promise<number> {
    const { data } = await this.octokit.pulls.create({
      owner,
      repo,
      title: pr.title,
      body: pr.body,
      head: pr.head,
      base: pr.base,
    });

    return data.number;
  }

  /**
   * Scans a repository content.
   */
  async listRecentChangesInRepo(
    owner: string,
    repo: string,
    path: string = ''
  ): Promise<string[]> {
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    if (Array.isArray(data)) {
      return data.map((file) => file.path);
    }
    return [];
  }
}
