import { typescriptAdapter } from '../adapters/typescript-adapter.js';
import { projectManager } from '../project-manager.js';
import { SyntaxKind } from 'ts-morph';
import { DefinitionLocation } from '../types.js';

export async function resolveDefinition(
  symbol: string,
  path: string
): Promise<DefinitionLocation[]> {
  return await typescriptAdapter.resolveDefinition(symbol, path);
}
