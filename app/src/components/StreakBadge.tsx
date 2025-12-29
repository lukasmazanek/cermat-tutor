/**
 * StreakBadge Component
 * ADR-029: Component Consolidation - Phase 3
 *
 * Displays a streak counter with fire icon.
 * Only shows when streak meets threshold (default: 3).
 *
 * Used in: LightningRound/Question, LightningRound/Feedback
 */

import { FireIcon } from '@heroicons/react/24/solid'

interface StreakBadgeProps {
  /** Current streak count */
  streak: number
  /** Minimum streak to show badge (default: 3) */
  threshold?: number
  /** Additional className */
  className?: string
}

/**
 * Displays streak counter when threshold is met
 *
 * @example
 * <StreakBadge streak={streak} />
 *
 * @example Custom threshold
 * <StreakBadge streak={streak} threshold={5} />
 */
function StreakBadge({ streak, threshold = 3, className = '' }: StreakBadgeProps) {
  if (streak < threshold) return null

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <FireIcon className="w-5 h-5 text-orange-500" />
      <span className="text-orange-600 font-bold">{streak}</span>
    </div>
  )
}

export default StreakBadge
