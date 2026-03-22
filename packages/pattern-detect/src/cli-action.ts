import { analyzePatterns, generateSummary } from './index';
import type { PatternType } from './detector';
import { filterBySeverity } from './context-rules';
import chalk from 'chalk';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import {
  loadConfig,
  mergeConfigWithDefaults,
  resolveOutputPath,
  Severity,
  getSeverityBadge,
  getSeverityValue,
  printTerminalHeader,
  getTerminalDivider,
} from '@aiready/core';
import { getPatternIcon, generateHTMLReport } from './cli-output';
import {
  DEFAULT_MIN_SIMILARITY,
  DEFAULT_MIN_LINES,
  DEFAULT_BATCH_SIZE,
  DEFAULT_MIN_SHARED_TOKENS,
  DEFAULT_MAX_CANDIDATES_PER_BLOCK,
  DEFAULT_MAX_RESULTS,
  DEFAULT_MIN_CLUSTER_TOKEN_COST,
  DEFAULT_MIN_CLUSTER_FILES,
} from './constants';

export async function patternActionHandler(directory: string, options: any) {
  console.log(chalk.blue('🔍 Analyzing patterns...\n'));

  const startTime = Date.now();

  // Load config file if it exists
  const config = await loadConfig(directory);

  // Define defaults
  const defaults = {
    minSimilarity: DEFAULT_MIN_SIMILARITY,
    minLines: DEFAULT_MIN_LINES,
    batchSize: DEFAULT_BATCH_SIZE,
    approx: true,
    minSharedTokens: DEFAULT_MIN_SHARED_TOKENS,
    maxCandidatesPerBlock: DEFAULT_MAX_CANDIDATES_PER_BLOCK,
    streamResults: true,
    include: undefined,
    exclude: undefined,
    excludePatterns: undefined,
    confidenceThreshold: 0,
    ignoreWhitelist: undefined,
    minSeverity: Severity.Minor,
    excludeTestFixtures: false,
    excludeTemplates: false,
    includeTests: false,
    maxResults: DEFAULT_MAX_RESULTS,
    groupByFilePair: true,
    createClusters: true,
    minClusterTokenCost: DEFAULT_MIN_CLUSTER_TOKEN_COST,
    minClusterFiles: DEFAULT_MIN_CLUSTER_FILES,
    showRawDuplicates: false,
  };

  // Merge config with defaults
  const mergedConfig = mergeConfigWithDefaults(config, defaults);

  // Override with CLI options (CLI takes precedence)
  const finalOptions = {
    rootDir: directory,
    minSimilarity: options.similarity
      ? parseFloat(options.similarity)
      : mergedConfig.minSimilarity,
    minLines: options.minLines
      ? parseInt(options.minLines)
      : mergedConfig.minLines,
    batchSize: options.batchSize
      ? parseInt(options.batchSize)
      : mergedConfig.batchSize,
    approx: options.approx !== false && mergedConfig.approx, // CLI --no-approx takes precedence
    minSharedTokens: options.minSharedTokens
      ? parseInt(options.minSharedTokens)
      : mergedConfig.minSharedTokens,
    maxCandidatesPerBlock: options.maxCandidates
      ? parseInt(options.maxCandidates)
      : mergedConfig.maxCandidatesPerBlock,
    streamResults:
      options.streamResults !== false && mergedConfig.streamResults,
    include: options.include?.split(',') || mergedConfig.include,
    exclude: options.exclude?.split(',') || mergedConfig.exclude,
    excludePatterns:
      options.excludePatterns?.split(',') || mergedConfig.excludePatterns,
    confidenceThreshold: options.confidenceThreshold
      ? parseFloat(options.confidenceThreshold)
      : mergedConfig.confidenceThreshold,
    ignoreWhitelist:
      options.ignoreWhitelist?.split(',') || mergedConfig.ignoreWhitelist,
    minSeverity: (options.minSeverity || mergedConfig.minSeverity) as Severity,
    excludeTestFixtures:
      options.excludeTestFixtures || mergedConfig.excludeTestFixtures,
    excludeTemplates: options.excludeTemplates || mergedConfig.excludeTemplates,
    includeTests: options.includeTests || mergedConfig.includeTests,
    maxResults: options.maxResults
      ? parseInt(options.maxResults)
      : mergedConfig.maxResults,
    groupByFilePair:
      options.groupByFilePair !== false && mergedConfig.groupByFilePair,
    createClusters:
      options.createClusters !== false && mergedConfig.createClusters,
    minClusterTokenCost: options.minClusterTokens
      ? parseInt(options.minClusterTokens)
      : mergedConfig.minClusterTokenCost,
    minClusterFiles: options.minClusterFiles
      ? parseInt(options.minClusterFiles)
      : mergedConfig.minClusterFiles,
    showRawDuplicates:
      options.showRawDuplicates || mergedConfig.showRawDuplicates,
  };

  // Test files are excluded by default in core's DEFAULT_EXCLUDE
  // If user explicitly wants to include tests, we need to remove test patterns from exclude
  if (finalOptions.includeTests && finalOptions.exclude) {
    const testPatterns = [
      '**/*.test.*',
      '**/*.spec.*',
      '**/__tests__/**',
      '**/test/**',
      '**/tests/**',
    ];
    finalOptions.exclude = finalOptions.exclude.filter(
      (pattern: string) => !testPatterns.includes(pattern)
    );
  }

  const {
    results,
    duplicates: rawDuplicates,
    groups,
    clusters,
  } = await analyzePatterns(finalOptions);

  // Apply severity filtering
  let filteredDuplicates = rawDuplicates;

  // Filter by minimum severity
  if (finalOptions.minSeverity) {
    filteredDuplicates = filterBySeverity(
      filteredDuplicates,
      finalOptions.minSeverity
    );
  }

  // Filter out test fixtures if requested
  if (finalOptions.excludeTestFixtures) {
    filteredDuplicates = filteredDuplicates.filter(
      (d) => d.matchedRule !== 'test-fixtures'
    );
  }

  // Filter out templates if requested
  if (finalOptions.excludeTemplates) {
    filteredDuplicates = filteredDuplicates.filter(
      (d) => d.matchedRule !== 'templates'
    );
  }

  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const summary = generateSummary(results);
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);

  if (options.output === 'json') {
    const jsonOutput = {
      summary,
      results,
      duplicates: rawDuplicates,
      groups: groups || [],
      clusters: clusters || [],
      timestamp: new Date().toISOString(),
    };

    const outputPath = resolveOutputPath(
      options.outputFile,
      `pattern-report-${new Date().toISOString().split('T')[0]}.json`,
      directory
    );

    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2));
    console.log(chalk.green(`\n✓ JSON report saved to ${outputPath}`));
    return;
  }

  if (options.output === 'html') {
    const html = generateHTMLReport(summary, results);
    const outputPath = resolveOutputPath(
      options.outputFile,
      `pattern-report-${new Date().toISOString().split('T')[0]}.html`,
      directory
    );

    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(outputPath, html);
    console.log(chalk.green(`\n✓ HTML report saved to ${outputPath}`));
    return;
  }

  // Console output
  printTerminalHeader('PATTERN ANALYSIS SUMMARY');

  console.log(chalk.white(`📁 Files analyzed: ${chalk.bold(results.length)}`));
  console.log(
    chalk.yellow(
      `⚠  AI confusion patterns detected: ${chalk.bold(totalIssues)}`
    )
  );
  console.log(
    chalk.red(
      `💰 Token cost (wasted): ${chalk.bold(summary.totalTokenCost.toLocaleString())}`
    )
  );
  console.log(chalk.gray(`⏱  Analysis time: ${chalk.bold(elapsedTime + 's')}`));

  // Show breakdown by pattern type (only if duplicates exist)
  const sortedTypes = Object.entries(summary.patternsByType)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  if (sortedTypes.length > 0) {
    console.log('\n' + getTerminalDivider());
    console.log(chalk.bold.white('  PATTERNS BY TYPE'));
    console.log(getTerminalDivider() + '\n');

    sortedTypes.forEach(([type, count]) => {
      const icon = getPatternIcon(type as PatternType);
      console.log(
        `${icon} ${chalk.white(type.padEnd(15))} ${chalk.bold(count)}`
      );
    });
  }

  // Show grouped duplicates by file pair (reduces noise)
  if (!finalOptions.showRawDuplicates && groups && groups.length > 0) {
    console.log('\n' + getTerminalDivider());
    console.log(
      chalk.bold.white(`  📦 DUPLICATE GROUPS (${groups.length} file pairs)`)
    );
    console.log(getTerminalDivider() + '\n');

    const topGroups = groups
      .sort((a, b) => {
        const bVal = getSeverityValue(b.severity);
        const aVal = getSeverityValue(a.severity);
        const severityDiff = bVal - aVal;
        if (severityDiff !== 0) return severityDiff;
        return b.totalTokenCost - a.totalTokenCost;
      })
      .slice(0, finalOptions.maxResults);

    topGroups.forEach((group, idx) => {
      const severityBadge = getSeverityBadge(group.severity);
      const [file1, file2] = group.filePair.split('::');
      const file1Name = file1.split('/').pop() || file1;
      const file2Name = file2.split('/').pop() || file2;

      console.log(
        `${idx + 1}. ${severityBadge} ${chalk.bold(file1Name)} ↔ ${chalk.bold(file2Name)}`
      );
      console.log(
        `   Occurrences: ${chalk.bold(group.occurrences)} | Total tokens: ${chalk.bold(group.totalTokenCost.toLocaleString())} | Avg similarity: ${chalk.bold(Math.round(group.averageSimilarity * 100) + '%')}`
      );

      // Show first 3 line ranges
      const displayRanges = group.lineRanges.slice(0, 3);
      displayRanges.forEach((range) => {
        console.log(
          `   ${chalk.gray(file1)}:${chalk.cyan(`${range.file1.start}-${range.file1.end}`)} ↔ ${chalk.gray(file2)}:${chalk.cyan(`${range.file2.start}-${range.file2.end}`)}`
        );
      });

      if (group.lineRanges.length > 3) {
        console.log(
          `   ${chalk.gray(`... and ${group.lineRanges.length - 3} more ranges`)}`
        );
      }
      console.log();
    });

    if (groups.length > topGroups.length) {
      console.log(
        chalk.gray(
          `   ... and ${groups.length - topGroups.length} more file pairs`
        )
      );
    }
  }

  // Show refactor clusters (high-level patterns)
  if (!finalOptions.showRawDuplicates && clusters && clusters.length > 0) {
    console.log('\n' + getTerminalDivider());
    console.log(
      chalk.bold.white(`  🎯 REFACTOR CLUSTERS (${clusters.length} patterns)`)
    );
    console.log(getTerminalDivider() + '\n');

    clusters
      .sort((a, b) => b.totalTokenCost - a.totalTokenCost)
      .forEach((cluster, idx) => {
        const severityBadge = getSeverityBadge(cluster.severity);
        console.log(`${idx + 1}. ${severityBadge} ${chalk.bold(cluster.name)}`);
        console.log(
          `   Total tokens: ${chalk.bold(cluster.totalTokenCost.toLocaleString())} | Avg similarity: ${chalk.bold(Math.round(cluster.averageSimilarity * 100) + '%')} | Duplicates: ${chalk.bold(cluster.duplicateCount)}`
        );

        // Show first 5 files
        const displayFiles = cluster.files.slice(0, 5);
        console.log(
          `   Files (${cluster.files.length}): ${displayFiles.map((f) => chalk.gray(f.split('/').pop() || f)).join(', ')}`
        );
        if (cluster.files.length > 5) {
          console.log(
            `   ${chalk.gray(`... and ${cluster.files.length - 5} more files`)}`
          );
        }

        if (cluster.reason) {
          console.log(`   ${chalk.italic.gray(cluster.reason)}`);
        }
        if (cluster.suggestion) {
          console.log(
            `   ${chalk.cyan('→')} ${chalk.italic(cluster.suggestion)}`
          );
        }
        console.log();
      });
  }

  // Show top duplicates with detailed information (raw view or fallback)
  if (
    totalIssues > 0 &&
    (finalOptions.showRawDuplicates || !groups || groups.length === 0)
  ) {
    console.log('\n' + getTerminalDivider());
    console.log(chalk.bold.white('  TOP DUPLICATE PATTERNS'));
    console.log(getTerminalDivider() + '\n');

    const topDuplicates = filteredDuplicates
      .sort((a, b) => {
        const bVal = getSeverityValue(b.severity);
        const aVal = getSeverityValue(a.severity);
        const severityDiff = bVal - aVal;
        if (severityDiff !== 0) return severityDiff;
        return b.similarity - a.similarity;
      })
      .slice(0, finalOptions.maxResults);

    topDuplicates.forEach((dup) => {
      const severityBadge = getSeverityBadge(dup.severity);

      // Get relative file names for cleaner display
      const file1Name = dup.file1.split('/').pop() || dup.file1;
      const file2Name = dup.file2.split('/').pop() || dup.file2;

      console.log(
        `${severityBadge} ${chalk.bold(file1Name)} ↔ ${chalk.bold(file2Name)}`
      );
      console.log(
        `   Similarity: ${chalk.bold(Math.round(dup.similarity * 100) + '%')} | Pattern: ${dup.patternType} | Tokens: ${chalk.bold(dup.tokenCost.toLocaleString())}`
      );
      console.log(
        `   ${chalk.gray(dup.file1)}:${chalk.cyan(dup.line1 + '-' + dup.endLine1)}`
      );
      console.log(
        `   ${chalk.gray(dup.file2)}:${chalk.cyan(dup.line2 + '-' + dup.endLine2)}`
      );

      if (dup.reason) {
        console.log(`   ${chalk.italic.gray(dup.reason)}`);
      }
      if (dup.suggestion) {
        console.log(`   ${chalk.cyan('→')} ${chalk.italic(dup.suggestion)}`);
      }
      console.log();
    });

    // Show count of filtered duplicates
    if (filteredDuplicates.length > topDuplicates.length) {
      console.log(
        chalk.gray(
          `   ... and ${filteredDuplicates.length - topDuplicates.length} more duplicates`
        )
      );
    }
  }

  // Show detailed issues for critical ones
  const allIssues = results.flatMap((r) =>
    r.issues.map((issue) => ({ ...issue, file: r.fileName }))
  );

  const criticalIssues = allIssues.filter(
    (issue) => getSeverityValue(issue.severity) === 4
  );

  if (criticalIssues.length > 0) {
    console.log(getTerminalDivider());
    console.log(chalk.bold.white('  CRITICAL ISSUES (>95% similar)'));
    console.log(getTerminalDivider() + '\n');

    criticalIssues.slice(0, 5).forEach((issue) => {
      console.log(
        chalk.red('● ') + chalk.white(`${issue.file}:${issue.location.line}`)
      );
      console.log(`  ${chalk.dim(issue.message)}`);
      console.log(`  ${chalk.green('→')} ${chalk.italic(issue.suggestion)}\n`);
    });
  }

  // Show a success message if no duplicates
  if (totalIssues === 0) {
    console.log(chalk.green('\n✨ Great! No duplicate patterns detected.\n'));
    console.log(
      chalk.yellow(
        '💡 If you expected to find duplicates, try adjusting parameters:'
      )
    );
    console.log(chalk.dim('   • Lower similarity threshold: --similarity 0.3'));
    console.log(chalk.dim('   • Reduce minimum lines: --min-lines 3'));
    console.log(chalk.dim('   • Include test files: --include-tests'));
    console.log(
      chalk.dim('   • Lower shared tokens threshold: --min-shared-tokens 5')
    );
    console.log('');
  }

  // Show guidance if very few results
  if (totalIssues > 0 && totalIssues < 5) {
    console.log(
      chalk.yellow('\n💡 Few results found. To find more duplicates, try:')
    );
    console.log(chalk.dim('   • Lower similarity threshold: --similarity 0.3'));
    console.log(chalk.dim('   • Reduce minimum lines: --min-lines 3'));
    console.log(chalk.dim('   • Include test files: --include-tests'));
    console.log(
      chalk.dim('   • Lower shared tokens threshold: --min-shared-tokens 5')
    );
    console.log('');
  }

  console.log(getTerminalDivider());

  if (totalIssues > 0) {
    console.log(
      chalk.white(
        `\n💡 Run with ${chalk.bold('--output json')} or ${chalk.bold('--output html')} for detailed reports`
      )
    );
  }

  console.log(
    chalk.dim(
      '\n⭐ Like AIReady? Star us on GitHub: https://github.com/caopengau/aiready-pattern-detect'
    )
  );
  console.log(
    chalk.dim(
      '🐛 Found a bug? Report it: https://github.com/caopengau/aiready-pattern-detect/issues\n'
    )
  );
}
