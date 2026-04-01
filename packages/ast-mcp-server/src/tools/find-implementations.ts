import { typescriptAdapter } from '../adapters/typescript-adapter';

export async function findImplementations(
  symbol: string,
  path: string,
  limit: number = 50,
  offset: number = 0
) {
  return await typescriptAdapter.findImplementations(
    symbol,
    path,
    limit,
    offset
  );
}
