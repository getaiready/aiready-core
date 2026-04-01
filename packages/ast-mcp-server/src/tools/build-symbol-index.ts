import { symbolIndex } from '../index/symbol-index';

export async function buildSymbolIndex(path: string) {
  return await symbolIndex.buildIndex(path);
}
