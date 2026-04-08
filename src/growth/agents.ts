import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface IssueContext {
  number: number;
  title: string;
  body: string;
  labels: string[];
  author?: string;
}

export interface ResolveResult {
  success: boolean;
  message: string;
  changes?: string[];
}

export interface ResolverOptions {
  generate: (prompt: string) => Promise<string>;
  trustedAuthors?: string[];
}

export class GitHubIssueResolverAgent {
  private generate: (prompt: string) => Promise<string>;

  private trustedAuthors: string[];

  constructor(options: ResolverOptions) {
    this.generate = options.generate;

    if (!options.trustedAuthors || options.trustedAuthors.length === 0) {
      throw new Error(
        '[GitHubIssueResolverAgent] Security Error: trustedAuthors must be explicitly configured.'
      );
    }
    this.trustedAuthors = options.trustedAuthors;
  }

  async resolve(
    issue: IssueContext,
    workingDir: string
  ): Promise<ResolveResult> {
    console.log(
      `[GitHubIssueResolverAgent] Resolving issue #${issue.number}: ${issue.title}`
    );

    const strategy = await this.identifyStrategy(issue);
    console.log(`[GitHubIssueResolverAgent] Selected Strategy: ${strategy}`);

    try {
      switch (strategy) {
        case 'CORE_EVOLUTION_SYNC':
          if (issue.author && !this.trustedAuthors.includes(issue.author)) {
            console.warn(
              `[GitHubIssueResolverAgent] Unauthorized evolution attempt by ${issue.author}. Blocking.`
            );
            return {
              success: false,
              message: `Unauthorized actor: ${issue.author} is not in trustedAuthors list.`,
            };
          }
          return await this.executeSubtreeSync(issue, workingDir);
        case 'EVOLUTION_CONTRIBUTION':
          return await this.applyContributionPattern(issue, workingDir);
        case 'BUG_FIX':
          return await this.applyAgenticPatch(issue, workingDir);
        default:
          return { success: false, message: `Unknown strategy: ${strategy}` };
      }
    } catch (error: any) {
      console.error(
        `[GitHubIssueResolverAgent] Resolution failed for issue #${issue.number}:`,
        error.message
      );
      return {
        success: false,
        message: `Resolution failed: ${error.message}`,
      };
    }
  }

  private async identifyStrategy(issue: IssueContext): Promise<string> {
    if (issue.labels.includes('evolution-sync')) return 'CORE_EVOLUTION_SYNC';
    if (issue.labels.includes('evolution-contribution'))
      return 'EVOLUTION_CONTRIBUTION';
    if (issue.labels.includes('bug')) return 'BUG_FIX';

    const prompt = `
      Analyze the GitHub Issue:
      Title: ${issue.title}
      Labels: ${issue.labels.join(', ')}

      Categorize into: CORE_EVOLUTION_SYNC, EVOLUTION_CONTRIBUTION, BUG_FIX, or UNKNOWN.
      Only return the category name.
    `;

    return (await this.generate(prompt)).trim();
  }

  private async executeSubtreeSync(
    issue: IssueContext,
    workingDir: string
  ): Promise<ResolveResult> {
    const hubVersion = this.extractVersion(issue.body);
    const prefix = 'core/';
    const hubUrl = 'https://github.com/serverlessclaw/serverlessclaw.git';

    console.log(
      `[GitHubIssueResolverAgent] Performing Subtree Pull (Hub v${hubVersion}) into ${workingDir}...`
    );

    try {
      // Ensure hub remote exists
      try {
        execSync(`git remote add hub ${hubUrl}`, {
          cwd: workingDir,
          stdio: 'ignore',
        });
      } catch (e: any) {
        if (!e.message.includes('already exists')) {
          console.warn(
            `[GitHubIssueResolverAgent] Remote add warning: ${e.message}`
          );
        }
      }

      execSync(`git fetch hub`, { cwd: workingDir, stdio: 'pipe' });

      // Perform subtree pull
      console.log(
        `[GitHubIssueResolverAgent] Executing subtree pull for v${hubVersion}...`
      );
      execSync(
        `git subtree pull --prefix=${prefix} hub ${hubVersion} --squash -m "chore(sync): evolution upgrade to ${hubVersion}"`,
        {
          cwd: workingDir,
          env: { ...process.env, GIT_MERGE_AUTOEDIT: 'no' },
        }
      );

      return {
        success: true,
        message: `Successfully sync'd Hub ${hubVersion} via subtree merge`,
      };
    } catch (error: any) {
      console.error(
        `[GitHubIssueResolverAgent] Subtree sync failed: ${error.message}`
      );
      throw new Error(`Subtree sync failed: ${error.message}`);
    }
  }

  private async applyContributionPattern(
    issue: IssueContext,
    workingDir: string
  ): Promise<ResolveResult> {
    console.log(
      `[GitHubIssueResolverAgent] Pattern absorption requested: ${issue.title}`
    );
    return {
      success: true,
      message: `Contribution strategy identified. Pattern "${issue.title}" is ready for human screening and promotion.`,
    };
  }

  private async applyAgenticPatch(
    issue: IssueContext,
    workingDir: string
  ): Promise<ResolveResult> {
    console.log(`[GitHubIssueResolverAgent] Bug fix requested: ${issue.title}`);
    return {
      success: true,
      message: `Patch strategy identified. Agentic fix for "${issue.title}" is being drafted.`,
    };
  }

  private extractVersion(body: string): string {
    const match = body.match(/v\d+\.\d+\.\d+/);
    if (match) return match[0];

    const branchMatch = body.match(/branch:?\s*([a-zA-Z0-9.\-_/]+)/i);
    if (branchMatch) return branchMatch[1];

    return 'main';
  }
}
