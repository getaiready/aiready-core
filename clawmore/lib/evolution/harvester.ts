import { Octokit } from '@octokit/rest';
import { z } from 'zod';
import { getUserMetadata, createInnovationPatternRecord } from '../db';

export const InnovationPatternSchema = z.object({
  title: z.string().describe('Short, descriptive title of the optimization'),
  rationale: z
    .string()
    .describe('Why this change improves the serverless architecture'),
  logic: z.string().describe('The abstracted code logic or pattern'),
  category: z.enum(['performance', 'security', 'cost', 'reliability']),
  filesAffected: z
    .array(z.string())
    .describe('List of generic file paths this pattern applies to'),
});

export type InnovationPattern = z.infer<typeof InnovationPatternSchema>;

export class Harvester {
  private octokit: Octokit;

  constructor(githubToken: string) {
    this.octokit = new Octokit({ auth: githubToken });
  }

  /**
   * Scans a Spoke repository for recent mutations and extracts anonymous design improvements.
   * This uses the "Air-Gap" philosophy to ensure NO PII or client secrets are harvested.
   */
  public async harvestInnovation(
    owner: string,
    repo: string,
    userEmail: string
  ): Promise<InnovationPattern[]> {
    console.log(`[Harvester] Checking opt-in status for ${userEmail}...`);

    // 1. Check if user has opted into co-evolution
    const metadata = await getUserMetadata(userEmail);
    if (!metadata?.coEvolutionOptIn) {
      console.log(
        `[Harvester] Skipping ${owner}/${repo} - User has NOT opted into co-evolution.`
      );
      return [];
    }

    console.log(`[Harvester] Scanning ${owner}/${repo} for innovation DNA...`);

    // 2. Get recent commits within the core blueprint prefix
    const { data: commits } = await this.octokit.repos.listCommits({
      owner,
      repo,
      path: 'infrastructure/core', // Only scan core paths as per sync-rules.json
      per_page: 5,
    });

    if (commits.length === 0) return [];

    // 3. AI Extraction (Simulated for now, would use OpenAI/Anthropic)
    // We would fetch the commit diffs and feed them to an LLM with the Zod schema
    const extractedPatterns: InnovationPattern[] = [
      {
        title: 'Global EventBridge Error Handling Pattern',
        rationale:
          'Standardizes dead-letter queue attachment for all cross-account events',
        logic: 'export const withDLQ = (bus) => { ... }',
        category: 'reliability',
        filesAffected: ['infrastructure/core/bus.ts'],
      },
    ];

    // 4. Persistence for Curation
    for (const pattern of extractedPatterns) {
      await createInnovationPatternRecord({
        pattern,
        sourceRepo: repo,
        sourceOwner: owner,
      });
      console.log(`[Harvester] Recorded pending innovation: ${pattern.title}`);
    }

    return extractedPatterns;
  }
}
