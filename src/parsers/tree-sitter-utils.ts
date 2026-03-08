import * as Parser from 'web-tree-sitter';
import * as path from 'path';
import * as fs from 'fs';

let isTreeSitterInitialized = false;

/**
 * Initialize tree-sitter once
 */
export async function initTreeSitter(): Promise<void> {
  if (isTreeSitterInitialized) return;

  try {
    const wasmPath = getWasmPath('web-tree-sitter');
    await Parser.Parser.init({
      locateFile() {
        return wasmPath || 'web-tree-sitter.wasm';
      },
    });
    isTreeSitterInitialized = true;
  } catch (error) {
    console.error('Failed to initialize web-tree-sitter:', error);
    isTreeSitterInitialized = true;
  }
}

/**
 * Deep search for a file in node_modules/.pnpm
 */
function findInPnpmStore(
  startDir: string,
  fileName: string,
  depth: number = 0
): string | null {
  if (depth > 5) return null;

  const pnpmDir = path.join(startDir, 'node_modules', '.pnpm');
  if (fs.existsSync(pnpmDir)) {
    // We found a .pnpm store, let's look for our file anywhere inside it
    // This is expensive but only happens once per language
    return findFileRecursively(pnpmDir, fileName, 0);
  }

  const parent = path.dirname(startDir);
  if (parent === startDir) return null;
  return findInPnpmStore(parent, fileName, depth + 1);
}

function findFileRecursively(
  dir: string,
  fileName: string,
  depth: number
): string | null {
  if (depth > 4) return null; // Don't go too deep

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    // Look for exact match in this dir first
    for (const entry of entries) {
      if (entry.isFile() && entry.name === fileName) {
        // Verification: ensure it's in a path that looks like a treesitter or wasm dir
        const fullPath = path.join(dir, entry.name);
        if (
          fullPath.includes('tree-sitter') ||
          fullPath.includes('wasm') ||
          fullPath.includes('artifacts')
        ) {
          return fullPath;
        }
      }
    }

    // Then recurse
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const found = findFileRecursively(
          path.join(dir, entry.name),
          fileName,
          depth + 1
        );
        if (found) return found;
      }
    }
  } catch (err) {
    // Ignore permission errors etc
  }

  return null;
}

/**
 * Find a WASM file for a specific language
 */
export function getWasmPath(language: string): string | null {
  const wasmFileName =
    language === 'web-tree-sitter'
      ? 'web-tree-sitter.wasm'
      : `tree-sitter-${language}.wasm`;

  // 1. Check local/bundled paths first
  const immediatePaths = [
    path.join(process.cwd(), wasmFileName),
    path.join(__dirname, wasmFileName),
    path.join(__dirname, 'assets', wasmFileName),
  ];

  for (const p of immediatePaths) {
    if (fs.existsSync(p)) return p;
  }

  // 2. Search in .pnpm store (climbing up from __dirname)
  const pnpmPath = findInPnpmStore(__dirname, wasmFileName);
  if (pnpmPath) return pnpmPath;

  // 3. Search in .pnpm store (climbing up from CWD)
  const pnpmPathCwd = findInPnpmStore(process.cwd(), wasmFileName);
  if (pnpmPathCwd) return pnpmPathCwd;

  console.warn(
    `[Parser] WASM file for ${language} not found. CWD: ${process.cwd()}, DIR: ${__dirname}`
  );
  return null;
}

/**
 * Load a language and return a configured parser
 */
export async function setupParser(
  language: string
): Promise<Parser.Parser | null> {
  await initTreeSitter();

  const wasmPath = getWasmPath(language);
  if (!wasmPath) {
    // console.warn(`WASM file for ${language} not found.`);
    return null;
  }

  try {
    const parser = new Parser.Parser();
    const Lang = await Parser.Language.load(wasmPath);
    parser.setLanguage(Lang);
    return parser;
  } catch (error) {
    // console.error(`Failed to setup parser for ${language}:`, error);
    return null;
  }
}
