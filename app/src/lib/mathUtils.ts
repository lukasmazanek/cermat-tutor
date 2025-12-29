/**
 * Math Utilities
 * ADR-029: Component Consolidation - Phase 3
 *
 * Common math functions used across components.
 */

/**
 * Calculate percentage with safe division
 *
 * @param value - The numerator
 * @param total - The denominator
 * @returns Rounded percentage (0-100), or 0 if total is 0
 *
 * @example
 * calculatePercentage(7, 10) // => 70
 * calculatePercentage(1, 3)  // => 33
 * calculatePercentage(0, 0)  // => 0 (safe)
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Format milliseconds to seconds with one decimal
 *
 * @param ms - Time in milliseconds
 * @returns Formatted string like "2.5"
 *
 * @example
 * formatTimeSeconds(2500) // => "2.5"
 * formatTimeSeconds(1234) // => "1.2"
 */
export function formatTimeSeconds(ms: number): string {
  return (ms / 1000).toFixed(1)
}

/**
 * Calculate average from array of numbers
 *
 * @param values - Array of numbers
 * @returns Average, or 0 if empty array
 *
 * @example
 * calculateAverage([10, 20, 30]) // => 20
 * calculateAverage([])           // => 0
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}
