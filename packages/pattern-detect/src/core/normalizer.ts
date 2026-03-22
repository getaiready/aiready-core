/**
 * Normalizes source code for similarity comparison by removing variable-specific details.
 * This makes the comparison focus on code structure rather than naming.
 *
 * @param code - The raw source code to normalize
 * @param isPython - Whether the file is a Python file (influences comment removal)
 * @returns Normalized code with strings replaced by placeholder, numbers removed, and comments stripped
 */
export function normalizeCode(code: string, isPython: boolean = false): string {
  if (!code) return '';

  let normalized = code;
  if (isPython) {
    normalized = normalized.replace(/#.*/g, ''); // remove python comments
  } else {
    normalized = normalized
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, ''); // remove block comments
  }

  return normalized
    .replace(/"[^"]*"/g, '"STR"')
    .replace(/'[^']*'/g, "'STR'")
    .replace(/`[^`]*`/g, '`STR`')
    .replace(/\b\d+\b/g, 'NUM')
    .replace(/\s+/g, ' ')
    .trim();
}

const stopwords = new Set([
  'return',
  'const',
  'let',
  'var',
  'function',
  'class',
  'new',
  'if',
  'else',
  'for',
  'while',
  'async',
  'await',
  'try',
  'catch',
  'switch',
  'case',
  'default',
  'import',
  'export',
  'from',
  'true',
  'false',
  'null',
  'undefined',
  'this',
]);

/**
 * Tokenizes normalized code into meaningful identifiers for similarity comparison.
 * Filters out common programming keywords and short tokens to focus on domain-specific terms.
 *
 * @param norm - Normalized code string from normalizeCode()
 * @returns Array of meaningful tokens extracted from the code
 */
export function tokenize(norm: string): string[] {
  const punctuation = '(){}[];.,';
  const cleaned = norm
    .split('')
    .map((ch) => (punctuation.includes(ch) ? ' ' : ch))
    .join('');

  return cleaned
    .split(/\s+/)
    .filter((t) => t && t.length >= 3 && !stopwords.has(t.toLowerCase()));
}
