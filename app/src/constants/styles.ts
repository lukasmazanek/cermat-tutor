/**
 * Centralized Tailwind Style Constants
 * ADR-029: Component Consolidation - Phase 2
 *
 * Single source of truth for repeated style patterns.
 * Use these instead of duplicating class strings across components.
 */

// ============================================
// CARD STYLES
// ============================================

export const CARD = {
  /** Base card without padding */
  base: 'bg-white rounded-2xl shadow-sm',
  /** Small card (p-4) */
  sm: 'bg-white rounded-2xl shadow-sm p-4',
  /** Medium card (p-5) - most common */
  md: 'bg-white rounded-2xl shadow-sm p-5',
  /** Large card (p-6) */
  lg: 'bg-white rounded-2xl shadow-sm p-6',
  /** Centered card for summaries */
  centered: 'bg-white rounded-2xl shadow-sm p-6 max-w-sm w-full text-center'
} as const

// ============================================
// BUTTON STYLES
// ============================================

export const BUTTON = {
  /** Multiple choice option - default state */
  option: `w-full p-4 rounded-xl text-left transition-gentle active:scale-[0.98]
    bg-white border-2 border-slate-200 text-slate-700
    disabled:opacity-50`,

  /** Multiple choice option - selected state */
  optionSelected: 'bg-indigo-100 border-2 border-indigo-400 text-indigo-800',

  /** Multiple choice option - compact (p-3) for Lightning Round */
  optionCompact: `w-full p-3 rounded-xl text-left transition-gentle active:scale-[0.98]
    bg-white border-2 border-slate-200 text-base font-medium text-slate-700
    focus:outline-none disabled:opacity-50`
} as const

// ============================================
// FEEDBACK STYLES
// ============================================

export const FEEDBACK = {
  /** Correct answer feedback */
  correct: 'bg-green-50 border border-green-200',
  /** Incorrect answer feedback */
  incorrect: 'bg-amber-50 border border-amber-200',
  /** Hint container */
  hint: 'bg-purple-50 border border-purple-100',
  /** Info/neutral feedback */
  info: 'bg-indigo-50 border border-indigo-100'
} as const

// ============================================
// STATUS INDICATOR STYLES
// ============================================

export const STATUS = {
  /** Success indicator */
  success: 'bg-green-50 text-green-700',
  /** Warning indicator */
  warning: 'bg-amber-50 text-amber-700',
  /** Info indicator */
  info: 'bg-indigo-50 text-indigo-700'
} as const

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Combine base button class with selected state
 */
export function getOptionClass(isSelected: boolean): string {
  if (isSelected) {
    return `w-full p-4 rounded-xl text-left transition-gentle active:scale-[0.98]
      ${BUTTON.optionSelected} disabled:opacity-50`
  }
  return BUTTON.option
}
