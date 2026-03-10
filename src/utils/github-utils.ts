/**
 * Utilities for GitHub Actions integration
 */

/**
 * Emit a GitHub Action annotation
 * Format: ::(error|warning|notice) file={file},line={line},col={col},title={title}::{message}
 */
export function emitAnnotation(params: {
  level: 'error' | 'warning' | 'notice';
  file: string;
  line?: number;
  col?: number;
  title?: string;
  message: string;
}): void {
  const { level, file, line, col, title, message } = params;

  const parts = [];
  if (file) parts.push(`file=${file}`);
  if (line) parts.push(`line=${line}`);
  if (col) parts.push(`col=${col}`);
  if (title) parts.push(`title=${title}`);

  const metadata = parts.length > 0 ? ` ${parts.join(',')}` : '';
  console.log(`::${level}${metadata}::${message.replace(/\n/g, '%0A')}`);
}

/**
 * Map AIReady severity to GitHub Action annotation level
 */
export function severityToAnnotationLevel(
  severity: string
): 'error' | 'warning' | 'notice' {
  switch (severity.toLowerCase()) {
    case 'critical':
    case 'high-risk':
    case 'blind-risk':
      return 'error';
    case 'major':
    case 'moderate-risk':
      return 'warning';
    case 'minor':
    case 'info':
    case 'safe':
    default:
      return 'notice';
  }
}

/**
 * Emit multiple annotations from an array of issues
 */
export function emitIssuesAsAnnotations(issues: any[]): void {
  issues.forEach((issue) => {
    emitAnnotation({
      level: severityToAnnotationLevel(issue.severity || 'info'),
      file: issue.file || issue.fileName || '',
      line: issue.line || issue.location?.start?.line,
      col: issue.column || issue.location?.start?.column,
      title: `${issue.tool || 'AIReady'}: ${issue.type || 'Issue'}`,
      message: issue.message || issue.description || 'No description provided',
    });
  });
}
