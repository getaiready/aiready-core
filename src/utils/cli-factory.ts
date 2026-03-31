import chalk from 'chalk';
import { Command } from 'commander';

interface CommandOptions {
  output?: string;
  include?: string[];
  exclude?: string[];
  json?: boolean;
}

/**
 * Standard progress callback for AIReady spoke tools.
 * Unified to remove structural duplication across spokes.
 *
 * @param toolName - The name of the tool reporting progress.
 */
export function createStandardProgressCallback(toolName: string) {
  return (processed: number, total: number, message: string) => {
    const percent = Math.round((processed / Math.max(1, total)) * 100);
    process.stdout.write(
      `\r\x1b[K   [${toolName}] ${chalk.cyan(`${percent}%`)} ${message}`
    );
    if (processed === total) {
      process.stdout.write('\n');
    }
  };
}

/**
 * Standard result formatter for CLI output.
 *
 * @param toolName - Canonical ToolName.
 * @param score - Calculated readiness score (0-100).
 * @param issuesCount - Number of identified issues.
 */
export function formatStandardCliResult(
  toolName: string,
  score: number,
  issuesCount: number
) {
  const scoreColor =
    score >= 75 ? chalk.green : score >= 50 ? chalk.yellow : chalk.red;

  console.log(`\n${chalk.bold(toolName.toUpperCase())} Analysis Complete`);
  console.log(`  Overall Score: ${scoreColor(score)}/100`);
  console.log(
    `  Issues Found: ${issuesCount > 0 ? chalk.red(issuesCount) : chalk.green('None')}`
  );
}

/**
 * Common CLI action helper to unify try-catch and output handling.
 */
export async function runStandardCliAction(
  toolName: string,
  action: () => Promise<{ score: number; issuesCount: number }>
) {
  try {
    const { score, issuesCount } = await action();
    formatStandardCliResult(toolName, score, issuesCount);
  } catch (error: any) {
    console.error(
      chalk.red(`\n❌ [${toolName}] critical error: ${error.message}`)
    );
    process.exit(1);
  }
}

/**
 * Factory to create standardized Commander commands for AIReady spokes.
 * This avoids duplicating the same boilerplate (setup, options, error handling)
 * across 10+ different analysis tools, addressing context fragmentation and duplication.
 *
 * @param name - The name of the command (e.g., 'scan', 'context')
 * @param description - Command description for help text
 * @param runAction - The actual analysis logic to execute
 * @returns A configured Commander Command object
 */
export function createStandardCommand(
  name: string,
  description: string,
  runAction: (options: CommandOptions) => Promise<any>
): Command {
  const command = new Command(name);

  command
    .description(description)
    .option('-o, --output <path>', 'Output file path')
    .option('-i, --include <patterns...>', 'Include specific file patterns')
    .option('-e, --exclude <patterns...>', 'Exclude specific file patterns')
    .option('--json', 'Output strictly as JSON')
    .action(async (options: CommandOptions) => {
      try {
        const result = await runAction(options);

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          // Final result display logic would go here if not handled by runAction
        }
      } catch (error: any) {
        console.error(
          chalk.red(`\n❌ [${name}] critical error: ${error.message}`)
        );
        process.exit(1);
      }
    });

  return command;
}
