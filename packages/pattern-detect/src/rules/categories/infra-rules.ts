import { Severity } from '@aiready/core';
import { ContextRule } from '../types';

export const INFRA_RULES: ContextRule[] = [
  // Configuration Files - Often necessarily similar by design
  {
    name: 'config-files',
    detect: (file) => {
      return (
        file.endsWith('.config.ts') ||
        file.endsWith('.config.js') ||
        file.includes('jest.config') ||
        file.includes('vite.config') ||
        file.includes('webpack.config') ||
        file.includes('rollup.config') ||
        file.includes('tsconfig')
      );
    },
    severity: Severity.Info,
    reason: 'Configuration files often have similar structure by design',
    suggestion:
      'Consider shared config base only if configurations become hard to maintain',
  },

  // Migration Scripts - One-off scripts that are similar by nature
  {
    name: 'migration-scripts',
    detect: (file) => {
      return (
        file.includes('/migrations/') ||
        file.includes('/migrate/') ||
        file.includes('.migration.')
      );
    },
    severity: Severity.Info,
    reason: 'Migration scripts are typically one-off and intentionally similar',
    suggestion: 'Duplication is acceptable for migration scripts',
  },

  // Tool Implementations - Structural Boilerplate
  {
    name: 'tool-implementations',
    detect: (file, code) => {
      const isToolFile =
        file.includes('/tools/') ||
        file.endsWith('.tool.ts') ||
        code.includes('toolDefinitions');

      const hasToolStructure =
        code.includes('execute') &&
        (code.includes('try') || code.includes('catch'));

      return isToolFile && hasToolStructure;
    },
    severity: Severity.Info,
    reason:
      'Tool implementations share structural boilerplate but have distinct business logic',
    suggestion:
      'Tool duplication is acceptable for boilerplate interface wrappers',
  },

  // CLI Command Definitions - Commander.js boilerplate patterns
  {
    name: 'cli-command-definitions',
    detect: (file, code) => {
      const basename = file.split('/').pop() || '';
      const isCliFile =
        file.includes('/commands/') ||
        file.includes('/cli/') ||
        file.endsWith('.command.ts') ||
        basename === 'cli.ts' ||
        basename === 'cli.js' ||
        basename === 'cli.tsx' ||
        basename === 'cli-action.ts';

      const hasCommandPattern =
        (code.includes('.command(') || code.includes('defineCommand')) &&
        (code.includes('.description(') || code.includes('.option(')) &&
        (code.includes('.action(') || code.includes('async'));

      return isCliFile && hasCommandPattern;
    },
    severity: Severity.Info,
    reason:
      'CLI command definitions follow standard Commander.js patterns and are intentionally similar',
    suggestion:
      'Command boilerplate duplication is acceptable for CLI interfaces',
  },

  // DynamoDB Single-Table Design - Standard single-table patterns with prefixed keys
  {
    name: 'dynamodb-single-table',
    detect: (file, code) => {
      // Detect DynamoDB single-table patterns
      const hasDynamoDBPattern =
        code.includes('docClient') ||
        code.includes('dynamodb') ||
        code.includes('DynamoDB') ||
        code.includes('queryItems') ||
        code.includes('putItem') ||
        code.includes('getItem') ||
        code.includes('updateItem') ||
        code.includes('deleteItem');

      // Detect key prefix patterns (e.g., USER#, WORKSPACE#, CONSENSUS#)
      const hasKeyPrefix =
        (code.includes('userId:') && code.includes('#')) ||
        (code.includes('pk:') && code.includes('#')) ||
        (code.includes('Key:') && code.includes('#')) ||
        /[A-Z]+#/.test(code); // Matches patterns like WORKSPACE#, CONSENSUS#, BUILD#

      // Detect single-table query patterns
      const hasSingleTablePattern =
        code.includes('KeyConditionExpression') ||
        code.includes('pk =') ||
        code.includes('sk =') ||
        (code.includes('userId') && code.includes('timestamp'));

      return hasDynamoDBPattern && (hasKeyPrefix || hasSingleTablePattern);
    },
    severity: Severity.Info,
    reason:
      'DynamoDB single-table design with prefixed keys is a standard pattern for efficient data access',
    suggestion:
      'Single-table query patterns are intentionally similar and should not be refactored',
  },

  // CLI Main Function Boilerplate - Standard argument parsing patterns
  {
    name: 'cli-main-boilerplate',
    detect: (file, code) => {
      const basename = file.split('/').pop() || '';
      const isCliFile =
        file.includes('/cli/') ||
        file.includes('/commands/') ||
        basename.startsWith('cli') ||
        basename.endsWith('.cli.ts') ||
        basename.endsWith('.cli.js');

      // Detect main() function with argument parsing
      const hasMainFunction =
        code.includes('function main()') ||
        code.includes('async function main()') ||
        code.includes('const main =') ||
        code.includes('main()');

      // Detect argument parsing patterns
      const hasArgParsing =
        code.includes('process.argv') ||
        code.includes('yargs') ||
        code.includes('commander') ||
        code.includes('minimist') ||
        code.includes('.parse(') ||
        (code.includes('args') && code.includes('._'));

      return isCliFile && hasMainFunction && hasArgParsing;
    },
    severity: Severity.Info,
    reason:
      'CLI main functions with argument parsing follow standard boilerplate patterns',
    suggestion:
      'CLI argument parsing boilerplate is acceptable and should not be flagged as duplication',
  },
];
