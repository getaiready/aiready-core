import { typescriptAdapter } from '../adapters/typescript-adapter';

export async function getFileStructure(file: string) {
  return await typescriptAdapter.getFileStructure(file);
}
