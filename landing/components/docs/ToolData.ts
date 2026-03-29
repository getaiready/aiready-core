export const tools = [
  {
    id: 'pattern-detect',
    icon: '🛡️',
    name: 'Pattern Detection',
    package: '@aiready/pattern-detect',
    description:
      'Find semantic duplicates that look different but do the same thing',
    color: 'from-blue-600 to-cyan-500',
    features: [
      'Semantic detection using Jaccard similarity on AST tokens',
      'Pattern classification (API handlers, validators, utilities)',
      'Token cost analysis showing wasted AI context budget',
      'Auto-excludes tests and build outputs',
      'Adaptive threshold based on codebase size',
    ],
    quickStart: `# Run without installation
npx @aiready/pattern-detect ./src

# Or use unified CLI
npx @aiready/cli scan ./src`,
    output: `📊 Duplicate Pattern Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 Files analyzed: 47
⚠️  Duplicate patterns: 12 files with 23 issues
💰 Wasted tokens: 8,450

CRITICAL (6 files)
  src/handlers/users.ts - 4 duplicates (1,200 tokens)
  src/handlers/posts.ts - 3 duplicates (950 tokens)`,
  },
  {
    id: 'context-analyzer',
    icon: '📈',
    name: 'Context Analysis',
    package: '@aiready/context-analyzer',
    description:
      'Analyze import depth, cohesion, and fragmentation for AI optimization',
    color: 'from-cyan-600 to-teal-500',
    features: [
      'Context budget calculation (file + dependencies)',
      'Deep import chain detection',
      'Low cohesion identification (God objects)',
      'High fragmentation analysis (scattered domains)',
      'Framework-aware (Next.js, AWS CDK)',
    ],
    quickStart: `# Run without installation
npx @aiready/context-analyzer ./src

# Or use unified CLI
npx @aiready/cli scan ./src`,
    output: `📊 Context Analysis Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 Files analyzed: 47
⚠️  Issues found: 8 files with problems

CRITICAL (3 files)
  src/services/user.ts
    • Context budget: 15,234 tokens (HIGH)
    • Import depth: 8 levels (DEEP)
    • Cohesion: 0.23 (LOW)`,
  },
  {
    id: 'consistency',
    icon: '⚡',
    name: 'Consistency Checker',
    package: '@aiready/consistency',
    description:
      'Catch naming issues and architectural drift before they become problems',
    color: 'from-purple-600 to-pink-500',
    features: [
      'Naming quality checks (single-letter vars, abbreviations)',
      'Convention enforcement (camelCase vs snake_case)',
      'Boolean naming validation (is/has/can prefixes)',
      'Pattern consistency (error handling, async patterns)',
      '100+ built-in acceptable abbreviations',
    ],
    quickStart: `# Run without installation
npx @aiready/consistency ./src

# Or use unified CLI
npx @aiready/cli scan ./src`,
    output: `📊 Consistency Analysis
━━━━━━━━━━━━━━━━━━━━━━━━
📁 Files analyzed: 47
⚠️  Issues found: 15 naming + 8 pattern issues

CRITICAL (2 files)
  src/utils/helpers.ts:12 - poor-naming: x
  src/api/users.ts:45 - convention-mix: user_name`,
  },
  {
    id: 'visualize',
    icon: '🖼️',
    name: 'Visualizer',
    package: 'packages/visualizer (or npm run visualize)',
    description:
      'Generate interactive visualizations from AIReady JSON reports',
    color: 'from-amber-500 to-amber-400',
    features: [
      'Generate an HTML visualization from an AIReady report',
      'Auto-runs a scan if no report is present',
      'Opens result in the browser with --open',
      'Customizable output path and input report',
    ],
    quickStart: `# From repo root
  npm run visualize -- . --open

  # Or with pnpm
  pnpm run visualize -- . --open`,
    output: `🔍 Visualization generated
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Output: visualization.html
    Open it in your browser to explore discovery charts and token waste breakdowns`,
  },
];

export const sections = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'ai-agent', label: 'Use with AI Agent' },
  { id: 'tools', label: 'Tools' },
  { id: 'scoring', label: 'AI Readiness Scoring' },
  { id: 'metrics', label: 'Understanding Metrics' },
  { id: 'unified-cli', label: 'Unified CLI' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'visualize', label: 'Visualize' },
  { id: 'consulting', label: 'Consulting Audit' },
  { id: 'options', label: 'CLI Options' },
  { id: 'contributing', label: 'Contributing' },
];
