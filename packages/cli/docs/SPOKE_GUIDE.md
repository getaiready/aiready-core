# Building a New AIReady Spoke

This guide explains how to build a new analysis tool ("spoke") and integrate it into the AIReady ecosystem. AIReady uses a hub-and-spoke architecture where independent tools are coordinated by a central CLI and Hub (@aiready/core).

## 🚀 Getting Started

### 1. Create Package Structure

If you are contributing to the monorepo:

```bash
mkdir -p packages/your-tool/src
cd packages/your-tool
```

### 2. Create `package.json`

Your tool should depend on `@aiready/core` for shared types and utilities.

```json
{
  "name": "@aiready/your-tool",
  "version": "0.1.0",
  "description": "Brief description of what this tool does",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "bin": {
    "aiready-yourtool": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsup src/index.ts src/cli.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts src/cli.ts --format cjs,esm --dts --watch",
    "test": "vitest run",
    "lint": "eslint src",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@aiready/core": "workspace:*",
    "commander": "^12.1.0"
  },
  "devDependencies": {
    "tsup": "^8.3.5"
  },
  "keywords": ["aiready", "your-keywords"],
  "license": "MIT"
}
```

### 3. Implement the Analysis Logic

Create `src/analyzer.ts` to contain your core logic.

```typescript
import { scanFiles, readFileContent } from '@aiready/core';
import type {
  AnalysisResult,
  Issue,
  ScanOptions,
  SpokeOutput,
} from '@aiready/core';

export async function analyzeYourTool(
  options: ScanOptions
): Promise<SpokeOutput> {
  const files = await scanFiles(options);
  const results: AnalysisResult[] = [];

  // Your analysis logic here
  // 1. Iterate through files
  // 2. Detect issues
  // 3. Return standardized AnalysisResult[]

  return {
    results,
    summary: {
      totalFiles: files.length,
      totalIssues: results.reduce((acc, r) => acc + r.issues.length, 0),
      // ... other summary stats
    },
  };
}
```

### 4. Implement ToolProvider and Register

Every spoke must implement the `ToolProvider` interface and register with the global `ToolRegistry` so that it is automatically discovered by the unified CLI.

1.  **Create `src/provider.ts`**:

    ```typescript
    import {
      ToolProvider,
      ToolName,
      SpokeOutput,
      ScanOptions,
      ToolScoringOutput,
    } from '@aiready/core';
    import { analyzeYourTool } from './analyzer';

    export const YourToolProvider: ToolProvider = {
      id: ToolName.YourToolID, // Use an existing ToolName or request a new one
      alias: ['your-alias'],

      async analyze(options: ScanOptions): Promise<SpokeOutput> {
        const output = await analyzeYourTool(options);
        return {
          ...output,
          metadata: { toolName: ToolName.YourToolID, version: '0.1.0' },
        };
      },

      score(output: SpokeOutput, options: ScanOptions): ToolScoringOutput {
        // Implement scoring logic (0-100)
        return {
          score: 100, // Example
          metrics: output.summary,
        };
      },

      defaultWeight: 10,
    };
    ```

2.  **Register in `src/index.ts`**:

    ```typescript
    import { ToolRegistry } from '@aiready/core';
    import { YourToolProvider } from './provider';

    // Register with global registry for automatic CLI discovery
    ToolRegistry.register(YourToolProvider);

    export { YourToolProvider };
    export * from './analyzer';
    ```

### 5. Create Standalone CLI (`src/cli.ts`)

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { analyzeYourTool } from './analyzer';
import chalk from 'chalk';

const program = new Command();

program
  .name('aiready-yourtool')
  .description('Description of your tool')
  .version('0.1.0')
  .argument('<directory>', 'Directory to analyze')
  .action(async (directory, options) => {
    console.log(chalk.blue('🔍 Analyzing...\n'));
    const output = await analyzeYourTool({ rootDir: directory });
    console.log(JSON.stringify(output, null, 2));
  });

program.parse();
```

## 📋 Standard Specs to Follow

To ensure your tool integrates perfectly with the AIReady ecosystem, it must follow these rules:

1.  **Standard Options**: Support `--include`, `--exclude`, and `--output` (standardized via `ScanOptions`).
2.  **No Direct Dependencies**: Spokes should never depend on other spokes. Only depend on `@aiready/core`.
3.  **Standard Issue Types**: Use `IssueType` from `@aiready/core` whenever possible.
4.  **Severity Levels**: Use `critical`, `major`, `minor`, and `info`.
5.  **Non-Blocking**: The `analyze` function should be asynchronous and handle large codebases efficiently.

## 🧪 Testing

Use `vitest` for unit and integration tests. Ensure you test your `ToolProvider` implementation using the `validateSpokeOutput` utility from `@aiready/core`.

```typescript
import { validateSpokeOutput } from '@aiready/core/types/contract';

test('output matches AIReady contract', async () => {
  const output = await analyzeYourTool({ rootDir: './test' });
  const validation = validateSpokeOutput('your-tool', output);
  expect(validation.valid).toBe(true);
});
```
