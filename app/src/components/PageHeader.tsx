/**
 * ADR-031: PageHeader Component
 *
 * Standardized header for HEADER template pages.
 * Structure: [Icon] Title          3/10
 *            ████████░░░░░░░░░░░░░░░░░░
 */

import { ComponentType } from 'react'

interface PageHeaderProps {
  /** Icon component from Heroicons */
  icon: ComponentType<{ className?: string }>
  /** Page title */
  title: string
  /** Progress indicator (e.g., 3/10) */
  progress?: { current: number; total: number }
  /** Icon color class (default: text-safe-blue) */
  iconColor?: string
  /** Progress bar color class (default: bg-safe-blue) */
  progressColor?: string
}

function PageHeader({
  icon: Icon,
  title,
  progress,
  iconColor = 'text-safe-blue',
  progressColor = 'bg-safe-blue'
}: PageHeaderProps) {
  const progressPercent = progress
    ? (progress.current / progress.total) * 100
    : 0

  return (
    <div className="px-4 py-3">
      {/* Title row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        </div>
        {progress && (
          <span className="text-sm font-medium text-slate-600">
            {progress.current}/{progress.total}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} rounded-full transition-all duration-300`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default PageHeader
