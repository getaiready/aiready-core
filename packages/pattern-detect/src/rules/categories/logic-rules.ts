import { Severity } from '@aiready/core';
import { ContextRule } from '../types';

export const LOGIC_RULES: ContextRule[] = [
  // Enum Semantic Difference - Different enum names indicate different semantic meanings
  {
    name: 'enum-semantic-difference',
    detect: (file, code) => {
      // Match enum declarations with their names
      const enumRegex =
        /(?:export\s+)?(?:const\s+)?enum\s+([A-Z][a-zA-Z0-9]*)/g;
      const enums: string[] = [];
      let match;

      while ((match = enumRegex.exec(code)) !== null) {
        enums.push(match[1]);
      }

      // If this code block contains an enum, flag it for special handling
      // This will reduce severity to Info, indicating it's acceptable duplication
      return enums.length > 0;
    },
    severity: Severity.Info,
    reason:
      'Enums with different names represent different semantic domain concepts, even if they share similar values',
    suggestion:
      'Different enums (e.g., EscalationPriority vs HealthSeverity) serve different purposes and should not be merged',
  },

  // Enum Value Similarity - Common enum values like LOW, MEDIUM, HIGH are standard
  {
    name: 'enum-value-similarity',
    detect: (file, code) => {
      // Check if code contains common enum value patterns
      const hasCommonEnumValues =
        (code.includes("LOW = 'low'") ||
          code.includes('LOW = 0') ||
          code.includes("LOW = 'LOW'")) &&
        (code.includes("HIGH = 'high'") ||
          code.includes('HIGH = 2') ||
          code.includes("HIGH = 'HIGH'")) &&
        (code.includes("MEDIUM = 'medium'") ||
          code.includes('MEDIUM = 1') ||
          code.includes("MEDIUM = 'MEDIUM'"));

      // Check if this is an enum definition (not just using enum values)
      const isEnumDefinition =
        /(?:export\s+)?(?:const\s+)?enum\s+/.test(code) ||
        (code.includes('enum ') && code.includes('{') && code.includes('}'));

      return hasCommonEnumValues && isEnumDefinition;
    },
    severity: Severity.Info,
    reason:
      'Common enum values (LOW, MEDIUM, HIGH, CRITICAL) are standard patterns used across different domain enums',
    suggestion:
      'Enum value similarity is expected for severity/priority enums and should not be flagged as duplication',
  },

  // Re-export / Barrel files - Intentional API surface consolidation
  {
    name: 're-export-files',
    detect: (file, code) => {
      const isIndexFile =
        file.endsWith('/index.ts') ||
        file.endsWith('/index.js') ||
        file.endsWith('/index.tsx') ||
        file.endsWith('/index.jsx');
      const lines = code.split('\n').filter((l) => l.trim());
      if (lines.length === 0) return false;
      const reExportLines = lines.filter(
        (l) =>
          /^export\s+(\{[^}]+\}|\*)\s+from\s+/.test(l.trim()) ||
          /^export\s+\*\s+as\s+\w+\s+from\s+/.test(l.trim())
      ).length;
      return (
        isIndexFile && reExportLines > 0 && reExportLines / lines.length > 0.5
      );
    },
    severity: Severity.Info,
    reason:
      'Barrel/index files intentionally re-export for API surface consolidation',
    suggestion:
      'Re-exports in barrel files are expected and not true duplication',
  },

  // Type Definitions - Duplication for type safety and module independence
  {
    name: 'type-definitions',
    detect: (file, code) => {
      const isTypeFile = file.endsWith('.d.ts') || file.includes('/types/');

      // Only match if it's a type-only file (no implementation)
      const hasOnlyTypeDefinitions =
        (code.includes('interface ') ||
          code.includes('type ') ||
          code.includes('enum ')) &&
        !code.includes('function ') &&
        !code.includes('class ') &&
        !code.includes('const ') &&
        !code.includes('let ') &&
        !code.includes('export default');

      // Also match interface-only snippets in component files
      const isInterfaceOnlySnippet =
        code.trim().startsWith('interface ') &&
        code.includes('{') &&
        code.includes('}') &&
        !code.includes('function ') &&
        !code.includes('const ') &&
        !code.includes('return ');

      return (isTypeFile && hasOnlyTypeDefinitions) || isInterfaceOnlySnippet;
    },
    severity: Severity.Info,
    reason:
      'Type/interface definitions are intentionally duplicated for module independence',
    suggestion:
      'Extract to shared types package only if causing maintenance burden',
  },

  // Cross-Package Type Definitions - Different packages may have similar types
  {
    name: 'cross-package-types',
    detect: (file, code) => {
      // Detect if this is a type definition in a different package
      const hasTypeDefinition =
        code.includes('interface ') ||
        code.includes('type ') ||
        code.includes('enum ');

      // Check if file is in a packages/ or apps/ directory structure
      const isPackageOrApp =
        file.includes('/packages/') ||
        file.includes('/apps/') ||
        file.includes('/core/');

      // Extract package name from path
      const packageMatch = file.match(/\/(packages|apps|core)\/([^/]+)\//);
      const hasPackageStructure = packageMatch !== null;

      return hasTypeDefinition && isPackageOrApp && hasPackageStructure;
    },
    severity: Severity.Info,
    reason:
      'Types in different packages/modules are often intentionally similar for module independence',
    suggestion:
      'Cross-package type duplication is acceptable for decoupled module architecture',
  },

  // Utility Functions - Small helpers in dedicated utility files
  {
    name: 'utility-functions',
    detect: (file, code) => {
      const isUtilFile =
        file.endsWith('.util.ts') ||
        file.endsWith('.helper.ts') ||
        file.endsWith('.utils.ts');

      const hasUtilPattern =
        code.includes('function format') ||
        code.includes('function parse') ||
        code.includes('function sanitize') ||
        code.includes('function normalize') ||
        code.includes('function convert');

      return isUtilFile && hasUtilPattern;
    },
    severity: Severity.Info,
    reason:
      'Utility functions in dedicated utility files may be intentionally similar',
    suggestion:
      'Consider extracting to shared utilities only if causing significant duplication',
  },

  // React/Vue Hooks - Standard patterns
  {
    name: 'shared-hooks',
    detect: (file, code) => {
      const isHookFile =
        file.includes('/hooks/') ||
        file.endsWith('.hook.ts') ||
        file.endsWith('.hook.tsx');

      const hasHookPattern =
        code.includes('function use') ||
        code.includes('export function use') ||
        code.includes('const use') ||
        code.includes('export const use');

      return isHookFile && hasHookPattern;
    },
    severity: Severity.Info,
    reason:
      'Hooks follow standard patterns and are often intentionally similar across components',
    suggestion:
      'Consider extracting common hook logic only if hooks become complex',
  },

  // Score/Rating Helper Functions - Common threshold patterns
  {
    name: 'score-helpers',
    detect: (file, code) => {
      const isHelperFile =
        file.includes('/utils/') ||
        file.includes('/helpers/') ||
        file.endsWith('.util.ts');

      const hasScorePattern =
        (code.includes('if (score >=') || code.includes('if (score >')) &&
        code.includes('return') &&
        code.includes("'") &&
        code.split('if (score').length >= 3; // Multiple score thresholds

      return isHelperFile && hasScorePattern;
    },
    severity: Severity.Info,
    reason:
      'Score/rating helper functions use common threshold patterns that are intentionally similar',
    suggestion:
      'Score formatting duplication is acceptable for consistent UI display',
  },

  // D3/Canvas Event Handlers - Standard visualization patterns
  {
    name: 'visualization-handlers',
    detect: (file, code) => {
      const isVizFile =
        file.includes('/visualizer/') ||
        file.includes('/charts/') ||
        file.includes('GraphCanvas') ||
        file.includes('ForceDirected');

      const hasVizPattern =
        (code.includes('dragstarted') ||
          code.includes('dragged') ||
          code.includes('dragended')) &&
        (code.includes('simulation') ||
          code.includes('d3.') ||
          code.includes('alphaTarget'));

      return isVizFile && hasVizPattern;
    },
    severity: Severity.Info,
    reason:
      'D3/visualization event handlers follow standard patterns and are intentionally similar',
    suggestion:
      'Visualization boilerplate duplication is acceptable for interactive charts',
  },

  // Icon/Switch Statement Helpers - Common enum-to-value patterns
  {
    name: 'switch-helpers',
    detect: (file, code) => {
      const hasSwitchPattern =
        code.includes('switch (') &&
        code.includes("case '") &&
        code.includes('return') &&
        code.split('case ').length >= 4; // Multiple cases

      const hasIconPattern =
        code.includes('getIcon') ||
        code.includes('getColor') ||
        code.includes('getLabel') ||
        code.includes('getRating');

      return hasSwitchPattern && hasIconPattern;
    },
    severity: Severity.Info,
    reason:
      'Switch statement helpers for enum-to-value mapping are inherently similar',
    suggestion:
      'Switch duplication is acceptable for mapping enums to display values',
  },

  // Common API/Utility Functions - Legitimate duplication across modules
  {
    name: 'common-api-functions',
    detect: (file, code) => {
      const isApiFile =
        file.includes('/api/') ||
        file.includes('/lib/') ||
        file.includes('/utils/') ||
        file.endsWith('.ts');

      const hasCommonApiPattern =
        (code.includes('getStripe') &&
          code.includes('process.env.STRIPE_SECRET_KEY')) ||
        (code.includes('getUserByEmail') && code.includes('queryItems')) ||
        (code.includes('updateUser') &&
          code.includes('buildUpdateExpression')) ||
        (code.includes('listUserRepositories') &&
          code.includes('queryItems')) ||
        (code.includes('listTeamRepositories') &&
          code.includes('queryItems')) ||
        (code.includes('getRemediation') && code.includes('queryItems')) ||
        (code.includes('formatBreakdownKey') &&
          code.includes('.replace(/([A-Z])/g')) ||
        (code.includes('queryItems') &&
          code.includes('KeyConditionExpression')) ||
        (code.includes('putItem') && code.includes('createdAt')) ||
        (code.includes('updateItem') && code.includes('buildUpdateExpression'));

      return isApiFile && hasCommonApiPattern;
    },
    severity: Severity.Info,
    reason:
      'Common API/utility functions are legitimately duplicated across modules for clarity and independence',
    suggestion:
      'Consider extracting to shared utilities only if causing significant duplication',
  },

  // Validation Functions - Inherently similar patterns
  {
    name: 'validation-functions',
    detect: (file, code) => {
      const hasValidationPattern =
        code.includes('isValid') ||
        code.includes('validate') ||
        code.includes('checkValid') ||
        code.includes('isEmail') ||
        code.includes('isPhone') ||
        code.includes('isUrl') ||
        code.includes('isNumeric') ||
        code.includes('isAlpha') ||
        code.includes('isAlphanumeric') ||
        code.includes('isEmpty') ||
        code.includes('isNotEmpty') ||
        code.includes('isRequired') ||
        code.includes('isOptional');

      return hasValidationPattern;
    },
    severity: Severity.Info,
    reason:
      'Validation functions are inherently similar and often intentionally duplicated for domain clarity',
    suggestion:
      'Consider extracting to shared validators only if validation logic becomes complex',
  },

  // Singleton Getter Pattern - Standard singleton initialization pattern
  {
    name: 'singleton-getter',
    detect: (file, code) => {
      // Detect singleton getter functions like getSemanticLoopDetector(), getCircuitBreaker()
      const hasSingletonGetter =
        /(?:export\s+)?(?:async\s+)?function\s+get[A-Z][a-zA-Z0-9]*\s*\(/.test(
          code
        ) ||
        /(?:export\s+)?const\s+get[A-Z][a-zA-Z0-9]*\s*=\s*(?:async\s+)?\(\)\s*=>/.test(
          code
        );

      // Check for singleton initialization pattern
      const hasSingletonPattern =
        (code.includes('if (!') &&
          code.includes('instance') &&
          code.includes(' = ')) ||
        (code.includes('if (!_') && code.includes(' = new ')) ||
        (code.includes('if (') &&
          code.includes(' === null') &&
          code.includes(' = new '));

      return hasSingletonGetter && hasSingletonPattern;
    },
    severity: Severity.Info,
    reason:
      'Singleton getter functions follow standard initialization pattern and are intentionally similar',
    suggestion:
      'Singleton getters are boilerplate and acceptable duplication for lazy initialization',
  },
];
