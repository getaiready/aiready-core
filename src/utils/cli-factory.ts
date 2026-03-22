import chalk from 'chalk';

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
