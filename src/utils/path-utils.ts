import { dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Common utility to get the directory name from import.meta.url.
 * Handles both ESM and CJS compatibility for local development.
 *
 * @param importMetaUrl - The import.meta.url from the calling module.
 * @returns The absolute directory path of the calling module.
 */
export function getDirname(importMetaUrl: string): string {
  // If we're in a CJS environment, return the global __dirname (if it exists)
  // Otherwise, derive it from the passed importMetaUrl
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  return dirname(fileURLToPath(importMetaUrl));
}
