/**
 * Shared rating helper functions for scoring and display.
 * Extracted to eliminate duplication between scoring.ts and CLI output modules.
 */

/**
 * AI Readiness Rating categories.
 * Provides a high-level qualitative assessment based on the numeric score.
 */
export enum ReadinessRating {
  Excellent = 'Excellent',
  Good = 'Good',
  Fair = 'Fair',
  NeedsWork = 'Needs Work',
  Critical = 'Critical',
}

/**
 * Metadata for a given score range.
 */
interface RatingMetadata {
  label: string;
  slug: string;
  emoji: string;
  rating: ReadinessRating;
}

/**
 * Get all metadata for a specific score.
 * Unified to remove structural duplication.
 *
 * @param score The numerical AI readiness score (0-100)
 * @returns Metadata object including label, slug, emoji, and rating category
 */
export function getRatingMetadata(score: number): RatingMetadata {
  if (score >= 90) {
    return {
      label: 'Excellent',
      slug: 'excellent',
      emoji: '✅',
      rating: ReadinessRating.Excellent,
    };
  }
  if (score >= 75) {
    return {
      label: 'Good',
      slug: 'good',
      emoji: '👍',
      rating: ReadinessRating.Good,
    };
  }
  if (score >= 60) {
    return {
      label: 'Fair',
      slug: 'fair',
      emoji: '👌',
      rating: ReadinessRating.Fair,
    };
  }
  if (score >= 40) {
    return {
      label: 'Needs Work',
      slug: 'needs-work',
      emoji: '🔨',
      rating: ReadinessRating.NeedsWork,
    };
  }
  return {
    label: 'Critical',
    slug: 'critical',
    emoji: '🚨',
    rating: ReadinessRating.Critical,
  };
}

/**
 * Get rating label from score
 * @param score The numerical AI readiness score (0-100)
 * @returns Human-readable rating label
 */
export function getRatingLabel(score: number): string {
  return getRatingMetadata(score).label;
}

/**
 * Get rating slug from score (URL-friendly)
 * @param score The numerical score
 * @returns A kebab-case string (e.g., 'excellent', 'needs-work')
 */
export function getRatingSlug(score: number): string {
  return getRatingMetadata(score).slug;
}

/**
 * Get rating emoji from score
 * @param score The numerical score
 * @returns Emoji string for display
 */
export function getRatingEmoji(score: number): string {
  return getRatingMetadata(score).emoji;
}

/**
 * Get tool emoji from score (alias for getRatingEmoji)
 * @param score The numerical score
 * @returns Emoji string for display
 */
export function getToolEmoji(score: number): string {
  return getRatingEmoji(score);
}

/**
 * Get priority icon from priority level
 * @param priority Priority level string
 * @returns Emoji string for display
 */
export function getPriorityIcon(priority: string): string {
  switch (priority) {
    case 'critical':
      return '🔴';
    case 'high':
      return '🟠';
    case 'medium':
      return '🟡';
    case 'low':
      return '🔵';
    default:
      return '⚪';
  }
}

/**
 * Convert numeric score to ReadinessRating enum
 * @param score The numerical AI readiness score (0-100)
 * @returns The corresponding ReadinessRating category
 */
export function getRating(score: number): ReadinessRating {
  return getRatingMetadata(score).rating;
}
