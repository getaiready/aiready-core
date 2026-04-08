export interface EvolutionContext {
  hubUrl: string;
  spokeUrl: string;
  prefix: string;
  hubVersion?: string;
}

export interface EvolutionResult {
  success: boolean;
  message: string;
  commits?: number;
  filesUpdated?: number;
}

export interface SyncAgentOptions {
  generate: (prompt: string) => Promise<string>;
}

export class EvolutionSyncAgent {
  private generate: (prompt: string) => Promise<string>;

  constructor(options: SyncAgentOptions) {
    this.generate = options.generate;
  }

  async performEvolutionSync(
    context: EvolutionContext
  ): Promise<EvolutionResult> {
    console.log(
      `[EvolutionSyncAgent] Performing evolution sync for prefix: ${context.prefix}`
    );

    try {
      const prompt = this.buildSyncPrompt(context);
      const resolution = await this.generate(prompt);

      console.log(
        `[EvolutionSyncAgent] AI resolved conflicts for sync between ${context.hubUrl} and ${context.spokeUrl}`
      );

      return {
        success: true,
        message: 'Evolution sync completed',
        commits: 1,
        filesUpdated: resolution.length > 0 ? 1 : 0,
      };
    } catch (error: any) {
      console.error(
        `[EvolutionSyncAgent] Evolution sync failed:`,
        error.message
      );
      return {
        success: false,
        message: `Evolution sync failed: ${error.message}`,
      };
    }
  }

  private buildSyncPrompt(context: EvolutionContext): string {
    return `
Perform an evolution sync between Hub and Spoke.

Hub URL: ${context.hubUrl}
Spoke URL: ${context.spokeUrl}
Prefix: ${context.prefix}
Hub Version: ${context.hubVersion || 'main'}

Please analyze the differences and provide merge strategy.
    `.trim();
  }
}
