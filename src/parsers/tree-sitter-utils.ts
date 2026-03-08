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
 * Find a WASM file for a specific language
 */
export function getWasmPath(language: string): string | null {
  const wasmFileName =
    language === 'web-tree-sitter'
      ? 'web-tree-sitter.wasm'
      : `tree-sitter-${language}.wasm`;

  const possiblePaths: string[] = [
    // 1. Current directory (Lambda/SST root or bundled CLI)
    path.join(process.cwd(), wasmFileName),
    path.join(__dirname, wasmFileName),
  ];

  // 2. Add relative paths from __dirname (up to 6 levels for deep monorepo artifacts)
  let currentDir = __dirname;
  for (let i = 0; i < 6; i++) {
    possiblePaths.push(
      path.join(
        currentDir,
        'node_modules/@unit-mesh/treesitter-artifacts/wasm',
        wasmFileName
      )
    );
    possiblePaths.push(
      path.join(currentDir, 'node_modules/web-tree-sitter', wasmFileName)
    );
    possiblePaths.push(
      path.join(currentDir, 'node_modules/tree-sitter-wasms/out', wasmFileName)
    );
    currentDir = path.dirname(currentDir);
  }

  // 3. Add relative paths from process.cwd()
  let currentCwd = process.cwd();
  for (let i = 0; i < 6; i++) {
    possiblePaths.push(
      path.join(
        currentCwd,
        'node_modules/@unit-mesh/treesitter-artifacts/wasm',
        wasmFileName
      )
    );
    possiblePaths.push(
      path.join(currentCwd, 'node_modules/web-tree-sitter', wasmFileName)
    );
    currentCwd = path.dirname(currentCwd);
  }

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  console.warn(
    `[Parser] WASM file for ${language} not found. Checked ${possiblePaths.length} paths. CWD: ${process.cwd()}, DIR: ${__dirname}`
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
    console.error(`Failed to setup parser for ${language}:`, error);
    return null;
  }
}
