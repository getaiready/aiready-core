import { dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Common utility to get the directory name from import.meta.url.
 * Handles both ESM and CJS compatibility for local development.
 *
 * @param importMetaUrl - The import.meta.url from the calling module.
 * @returns The absolute directory path of the calling module.
 */
export function getDirname(importMetaUrl?: string): string {
  if (importMetaUrl) {
    return dirname(fileURLToPath(importMetaUrl));
  }
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  throw new Error('getDirname: importMetaUrl is required in ESM environments');
}
