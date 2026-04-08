export interface IssueContext {
  number: number;
  title: string;
  body: string;
  labels: string[];
}

export interface ResolveResult {
  success: boolean;
  message: string;
  changes?: string[];
}

export interface ResolverOptions {
  generate: (prompt: string) => Promise<string>;
}

export class GitHubIssueResolverAgent {
  private generate: (prompt: string) => Promise<string>;

  constructor(options: ResolverOptions) {
    this.generate = options.generate;
  }

  async resolve(
    issue: IssueContext,
    workingDir: string
  ): Promise<ResolveResult> {
    console.log(
      `[GitHubIssueResolverAgent] Resolving issue #${issue.number}: ${issue.title}`
    );

    try {
      const prompt = this.buildResolutionPrompt(issue);
      const resolution = await this.generate(prompt);

      console.log(
        `[GitHubIssueResolverAgent] Generated resolution for issue #${issue.number}`
      );

      return {
        success: true,
        message: 'Issue resolved successfully',
        changes: [resolution],
      };
    } catch (error: any) {
      console.error(
        `[GitHubIssueResolverAgent] Failed to resolve issue #${issue.number}:`,
        error.message
      );
      return {
        success: false,
        message: `Resolution failed: ${error.message}`,
      };
    }
  }

  private buildResolutionPrompt(issue: IssueContext): string {
    return `
Issue #${issue.number}: ${issue.title}

Description:
${issue.body}

Labels: ${issue.labels.join(', ')}

Please provide a resolution plan for this issue.
    `.trim();
  }
}
