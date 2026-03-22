import chalk from 'chalk';
import { Severity } from '../types';
import { getScoreBar, getSafetyIcon, getSeverityColor } from './cli-helpers';

/**
 * Interface for standard CLI report data
 */
export interface StandardReportData {
  title: string;
  subtitle?: string;
  score: number;
  rating: string;
  dimensions: Array<{
    name: string;
    value: number;
    label?: string;
  }>;
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
  issues: Array<{
    severity: Severity | string;
    message: string;
    suggestion?: string;
  }>;
  recommendations?: string[];
  elapsedTime: string;
  noIssuesMessage?: string;
  safetyRating?: string;
}

/**
 * Get color for score values
 */
export function getScoreColor(score: number) {
  if (score >= 85) return chalk.green;
  if (score >= 70) return chalk.cyan;
  if (score >= 50) return chalk.yellow;
  if (score >= 30) return chalk.red;
  return chalk.bgRed.white;
}

/**
 * Display a standardized console report for any AIReady spoke CLI
 *
 * @param data - The report data to display
 * @lastUpdated 2026-03-22
 */
export function displayStandardConsoleReport(data: StandardReportData): void {
  const {
    title,
    score,
    rating,
    dimensions,
    stats = [],
    issues,
    recommendations = [],
    elapsedTime,
    noIssuesMessage = '✨ No issues found!',
    safetyRating,
  } = data;

  console.log(chalk.bold(`\n${title}\n`));

  // Safety rating banner if present
  if (safetyRating) {
    if (safetyRating === 'blind-risk' || safetyRating === '💀 blind-risk') {
      console.log(
        chalk.bgRed.white.bold(
          '  💀 BLIND RISK — NO TESTS DETECTED. AI-GENERATED CHANGES CANNOT BE VERIFIED.  '
        )
      );
      console.log();
    } else if (
      safetyRating === 'high-risk' ||
      safetyRating === '🔴 high-risk'
    ) {
      console.log(
        chalk.red.bold(
          `  🔴 HIGH RISK — Insufficient test coverage. AI changes may introduce silent bugs.`
        )
      );
      console.log();
    }
  }

  // Score and stats
  const safetyColor = safetyRating
    ? getSeverityColor(safetyRating, chalk)
    : getScoreColor(score);

  if (safetyRating) {
    console.log(
      `AI Change Safety: ${safetyColor(`${getSafetyIcon(safetyRating)} ${safetyRating.toUpperCase()}`)}`
    );
  }

  console.log(
    `Score:            ${getScoreColor(score)(score + '/100')} (${rating.toUpperCase()})`
  );

  if (stats.length > 0) {
    const statsStr = stats
      .map((s) => `${s.label}: ${chalk.cyan(s.value)}`)
      .join('   ');
    console.log(statsStr);
  }

  console.log(`Analysis Time:    ${chalk.gray(elapsedTime + 's')}\n`);

  // Dimensions
  console.log(chalk.bold('📐 Dimension Scores\n'));
  for (const dim of dimensions) {
    const color = getScoreColor(dim.value);
    console.log(
      `  ${dim.name.padEnd(22)} ${color(getScoreBar(dim.value))} ${dim.value}/100`
    );
  }

  // Issues
  if (issues.length > 0) {
    console.log(chalk.bold('\n⚠️  Issues\n'));
    for (const issue of issues) {
      const sev = getSeverityColor(issue.severity, chalk);
      console.log(`${sev(issue.severity.toUpperCase())}  ${issue.message}`);
      if (issue.suggestion) {
        console.log(
          `         ${chalk.dim('→')} ${chalk.italic(issue.suggestion)}`
        );
      }
      console.log();
    }
  } else {
    console.log(chalk.green(`\n${noIssuesMessage}\n`));
  }

  // Recommendations
  if (recommendations.length > 0) {
    console.log(chalk.bold('💡 Recommendations\n'));
    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  }
  console.log();
}
