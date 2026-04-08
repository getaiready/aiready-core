import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { pathToFileURL } from 'url';
import {
  AIReadyConfigSchema,
  AutoExcludeSchema,
} from '../types/schemas/config';
import type { AIReadyConfig } from '../types';

const CONFIG_FILES = [
  'aiready.json',
  'aiready.config.json',
  '.aiready.json',
  '.aireadyrc.json',
  'aiready.config.js',
  '.aireadyrc.js',
];

export const DEFAULT_AUTO_EXCLUDE_PATTERNS = {
  tests: [
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.test.js',
    '**/*.test.jsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/*.spec.js',
    '**/*.spec.jsx',
    '**/__tests__/**',
    '**/tests/**',
  ],
  mocks: [
    '**/__mocks__/**',
    '**/*.mock.ts',
    '**/*.mock.tsx',
    '**/*.mock.js',
    '**/*.mock.jsx',
  ],
  barrels: ['**/index.ts', '**/index.js'],
  generated: [
    '**/.next/**',
    '**/.sst/**',
    '**/.cache/**',
    '**/dist/**',
    '**/build/**',
  ],
};

export interface ValidationWarning {
  line?: number;
  rule: string;
  message: string;
  suggestion?: string;
}

const loadedConfigs = new Set<string>();

function deepMerge<T extends Record<string, any>>(base: T, override: T): T {
  const result = { ...base } as any;

  for (const key of Object.keys(override)) {
    const baseVal = base[key];
    const overrideVal = override[key];

    if (
      baseVal &&
      overrideVal &&
      typeof baseVal === 'object' &&
      typeof overrideVal === 'object' &&
      !Array.isArray(baseVal) &&
      !Array.isArray(overrideVal)
    ) {
      result[key] = deepMerge(baseVal, overrideVal);
    } else if (overrideVal !== undefined) {
      result[key] = overrideVal;
    }
  }

  return result as T;
}

function checkPatternWarnings(
  config: AIReadyConfig,
  configPath: string
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const excludeArray = Array.isArray(config.exclude)
    ? config.exclude
    : config.exclude
      ? Object.values(config.exclude).flat()
      : [];

  const seen = new Set<string>();

  for (const pattern of excludeArray) {
    if (seen.has(pattern)) {
      warnings.push({
        rule: 'duplicate-exclude',
        message: `Duplicate pattern '${pattern}' in exclude array`,
      });
    }
    seen.add(pattern);

    if (pattern.match(/^\*\*\/[^/]+\.[^/]+$/)) {
      warnings.push({
        rule: 'single-file-glob',
        message: `Single-file glob '${pattern}' - use without ** prefix`,
        suggestion: pattern.replace(/^\*\*\//, ''),
      });
    }

    const normalized = pattern.replace(/^\*\*\//, '').replace(/^\*\//, '');
    for (const other of seen) {
      if (other === pattern) continue;
      const otherNormalized = other.replace(/^\*\*\//, '').replace(/^\*\//, '');
      if (normalized === otherNormalized) {
        warnings.push({
          rule: 'overlapping-pattern',
          message: `Patterns '${pattern}' and '${other}' likely match the same files`,
        });
      }
    }
  }

  if (config.extends) {
    warnings.push({
      rule: 'config-inheritance',
      message: `Config extends '${config.extends}' - ensure base config exists`,
    });
  }

  return warnings;
}

function resolveConfigPath(
  extendsPath: string,
  baseConfigPath: string
): string {
  const baseDir = dirname(baseConfigPath);
  return resolve(baseDir, extendsPath);
}

async function loadConfigWithInheritance(
  configPath: string,
  alreadyLoaded: Set<string> = new Set()
): Promise<{ config: AIReadyConfig; warnings: ValidationWarning[] }> {
  const resolvedPath = resolve(configPath);

  if (alreadyLoaded.has(resolvedPath)) {
    throw new Error(
      `Circular config inheritance detected: ${Array.from(alreadyLoaded).join(' -> ')} -> ${resolvedPath}`
    );
  }

  alreadyLoaded.add(resolvedPath);

  const content = readFileSync(resolvedPath, 'utf-8');
  let rawConfig = JSON.parse(content);

  const warnings: ValidationWarning[] = [];

  const legacyKeys = ['toolConfigs', 'scanConfig', 'aiReady'];
  const foundLegacy = legacyKeys.filter((key) => key in rawConfig);
  if (foundLegacy.length > 0) {
    console.warn(
      `⚠️ Legacy configuration keys found: ${foundLegacy.join(', ')}. Please migrate to the new schema.`
    );
  }

  if (rawConfig.extends) {
    const baseConfigPath = resolveConfigPath(rawConfig.extends, resolvedPath);

    if (!existsSync(baseConfigPath)) {
      throw new Error(
        `Base config not found: ${rawConfig.extends} (resolved to ${baseConfigPath})`
      );
    }

    const baseResult = await loadConfigWithInheritance(
      baseConfigPath,
      alreadyLoaded
    );
    rawConfig = deepMerge(baseResult.config, rawConfig);
    warnings.push(...baseResult.warnings);
  }

  warnings.push(...checkPatternWarnings(rawConfig, resolvedPath));

  const config = AIReadyConfigSchema.parse(rawConfig);

  return { config, warnings };
}

function applyAutoExclusions(
  config: AIReadyConfig,
  projectRoot: string
): AIReadyConfig {
  const autoExclude = config.autoExclude ?? {
    tests: true,
    mocks: true,
    barrels: false,
    generated: true,
  };

  if (
    !autoExclude.tests &&
    !autoExclude.mocks &&
    !autoExclude.barrels &&
    !autoExclude.generated
  ) {
    return config;
  }

  const patterns: string[] = [];

  if (autoExclude.tests) {
    patterns.push(...DEFAULT_AUTO_EXCLUDE_PATTERNS.tests);
  }
  if (autoExclude.mocks) {
    patterns.push(...DEFAULT_AUTO_EXCLUDE_PATTERNS.mocks);
  }
  if (autoExclude.barrels) {
    patterns.push(...DEFAULT_AUTO_EXCLUDE_PATTERNS.barrels);
  }
  if (autoExclude.generated) {
    patterns.push(...DEFAULT_AUTO_EXCLUDE_PATTERNS.generated);
  }

  const existingExclude = config.exclude ?? [];
  const existingArray = Array.isArray(existingExclude)
    ? existingExclude
    : (existingExclude?.global ?? []);

  return {
    ...config,
    exclude: [...existingArray, ...patterns],
  };
}

/**
 * Search upwards for AIReady configuration files and load the first one found.
 * @param rootDir Starting directory for the search
 * @param options Options for config loading
 * @returns Parsed configuration object or null if not found
 */
export async function loadConfig(
  rootDir: string,
  options?: {
    validate?: boolean;
    applyAutoExclude?: boolean;
  }
): Promise<{ config: AIReadyConfig | null; warnings: ValidationWarning[] }> {
  const warnings: ValidationWarning[] = [];

  let currentDir = resolve(rootDir);

  while (true) {
    const foundConfigs: string[] = [];
    for (const configFile of CONFIG_FILES) {
      if (existsSync(join(currentDir, configFile))) {
        foundConfigs.push(configFile);
      }
    }

    if (foundConfigs.length > 0) {
      if (foundConfigs.length > 1) {
        console.warn(
          `⚠️ Multiple configuration files found in ${currentDir}: ${foundConfigs.join(
            ', '
          )}. Using ${foundConfigs[0]}.`
        );
      }

      const configFile = foundConfigs[0];
      const configPath = join(currentDir, configFile);

      try {
        const result = await loadConfigWithInheritance(configPath);
        warnings.push(...result.warnings);

        let config = result.config;

        if (options?.applyAutoExclude !== false) {
          config = applyAutoExclusions(config, currentDir);
        }

        return { config, warnings };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const configError = new Error(
          `Failed to load config from ${configPath}: ${errorMessage}`
        );
        try {
          (configError as unknown as Record<string, unknown>).cause =
            error instanceof Error ? error : undefined;
        } catch {
          /* ignore */
        }
        throw configError;
      }
    }

    const parent = dirname(currentDir);
    if (parent === currentDir) {
      break;
    }
    currentDir = parent;
  }

  return { config: null, warnings };
}

export function validateConfig(configPath: string): ValidationWarning[] {
  try {
    const content = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content);
    return checkPatternWarnings(config, configPath);
  } catch (error) {
    return [
      {
        rule: 'parse-error',
        message: `Failed to parse config: ${error instanceof Error ? error.message : String(error)}`,
      },
    ];
  }
}

/**
 * Merge user-provided configuration with default settings.
 * @param userConfig The configuration loaded from file
 * @param defaults The default configuration object
 * @returns Merged configuration with all defaults applied
 */
export function mergeConfigWithDefaults<T extends Record<string, any>>(
  userConfig: AIReadyConfig | null,
  defaults: T
): T {
  if (!userConfig) return defaults;

  const mergedConfig = { ...defaults } as any;

  if (userConfig.scan) {
    if (userConfig.scan.include) mergedConfig.include = userConfig.scan.include;
    if (userConfig.scan.exclude) mergedConfig.exclude = userConfig.scan.exclude;
    if (userConfig.scan.tools) mergedConfig.tools = userConfig.scan.tools;
  }

  if (userConfig.threshold !== undefined)
    mergedConfig.threshold = userConfig.threshold;
  if (userConfig.failOn !== undefined) mergedConfig.failOn = userConfig.failOn;

  if (userConfig.tools) {
    if (!mergedConfig.toolConfigs) mergedConfig.toolConfigs = {};
    for (const [toolName, toolConfig] of Object.entries(userConfig.tools)) {
      if (typeof toolConfig === 'object' && toolConfig !== null) {
        const toolConfigs = mergedConfig.toolConfigs as Record<string, unknown>;
        toolConfigs[toolName] = {
          ...(toolConfigs[toolName] as Record<string, unknown>),
          ...toolConfig,
        };
      }
    }
  }

  if (userConfig.output) {
    mergedConfig.output = {
      ...(mergedConfig.output as Record<string, unknown>),
      ...userConfig.output,
    };
  }

  if (userConfig.scoring) {
    mergedConfig.scoring = {
      ...(mergedConfig.scoring as Record<string, unknown>),
      ...userConfig.scoring,
    };
  }

  return mergedConfig as T;
}
