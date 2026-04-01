import { typescriptAdapter } from '../adapters/typescript-adapter.js';

export async function findReferences(
  symbol: string,
  path: string,
  limit: number = 50,
  offset: number = 0
) {
  return await typescriptAdapter.findReferences(symbol, path, limit, offset);
}
