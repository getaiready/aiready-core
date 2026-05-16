import chalk from 'chalk';

/**
 * Get a formatted terminal divider string based on current terminal width.
 *
 * @param color - Chalk color function to use for the divider.
 * @param width - Optional fixed width for the divider.
 * @returns String representation of the divider.
 */
export function getTerminalDivider(
  color: any = chalk.cyan,
  width?: number
): string {
  if (width !== undefined) {
    return color('━'.repeat(width));
  }
  const terminalWidth = process.stdout.columns || 80;
  return color('━'.repeat(terminalWidth));
}

/**
 * Print a stylized terminal header with dividers.
 *
 * @param title - Header title text.
 * @param color - Chalk color function for the dividers (default: chalk.cyan.bold).
 * @param width - Optional width for the divider (default: 80).
 */
export function printTerminalHeader(
  title: string,
  color: any = chalk.cyan.bold,
  width: number = 80
): void {
  const divider = '━'.repeat(width);
  console.log(color(`\n${divider}`));
  console.log(color(`  ${title.toUpperCase()}`));
  console.log(color(`${divider}\n`));
}

/**
 * Generate a visual score bar for console output
 *
 * @param val - Score value between 0 and 100.
 * @param width - Width of the bar in characters (default: 10).
 * @returns String representation of the bar (e.g., "█████░░░░░").
 */
export function getScoreBar(val: number, width: number = 10): string {
  const clamped = Math.max(0, Math.min(100, val));
  const solid = Math.round((clamped / 100) * width);
  const empty = width - solid;
  return '█'.repeat(solid) + '░'.repeat(empty);
}

/**
 * Get status icon for safety ratings
 *
 * @param rating - The safety rating slug.
 * @returns Emoji icon representing the rating.
 */
export function getSafetyIcon(rating: string): string {
  switch (rating) {
    case 'safe':
      return '✅';
    case 'moderate-risk':
      return '⚠️ ';
    case 'high-risk':
      return '🔴';
    case 'blind-risk':
      return '💀';
    default:
      return '❓';
  }
}

export { getSeverityBadge, getSeverityLabel } from './severity-utils';
