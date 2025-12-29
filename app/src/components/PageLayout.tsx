/**
 * PageLayout - ADR-029 Component Consolidation
 * Centralized page structure with mobile-safe layout (ADR-010)
 *
 * Structure:
 * ┌─────────────────────────┐
 * │  Header (optional)      │ fixed
 * ├─────────────────────────┤
 * │                         │
 * │  Content (scrollable)   │ flex-1
 * │                         │
 * ├─────────────────────────┤
 * │  BottomBar (optional)   │ fixed
 * └─────────────────────────┘
 */

import { ReactNode } from 'react'
import BottomBar from './BottomBar'
import { ActionKey } from '../constants/bottomBar'

interface BottomBarSlots {
  1?: { onClick: () => void; disabled?: boolean }
  2?: { onClick: () => void; disabled?: boolean }
  3?: { action?: ActionKey; onClick: () => void; disabled?: boolean; active?: boolean }
  4?: { action?: ActionKey; onClick: () => void; disabled?: boolean }
  5?: { action?: ActionKey; onClick: () => void; disabled?: boolean }
}

interface PageLayoutProps {
  /** Header content (rendered in white bar with border) */
  header?: ReactNode
  /** Main scrollable content */
  children: ReactNode
  /** BottomBar slot configuration */
  bottomBar?: BottomBarSlots
  /** Additional className for content area */
  contentClassName?: string
  /** Use max-w-2xl constraint (default: true) */
  maxWidth?: boolean
  /** Background color (default: bg-slate-50) */
  bgColor?: string
}

function PageLayout({
  header,
  children,
  bottomBar,
  contentClassName = '',
  maxWidth = true,
  bgColor = 'bg-slate-50'
}: PageLayoutProps) {
  return (
    <div className={`h-screen h-[100dvh] ${bgColor} flex flex-col overflow-hidden`}>
      {/* Header zone */}
      {header && (
        <div className="bg-white border-b border-slate-200 flex-shrink-0">
          <div className={maxWidth ? 'max-w-2xl mx-auto' : ''}>
            {header}
          </div>
        </div>
      )}

      {/* Content zone - scrollable */}
      <main className={`flex-1 min-h-0 overflow-y-auto ${maxWidth ? 'max-w-2xl mx-auto w-full' : ''} pb-20 ${contentClassName}`}>
        {children}
      </main>

      {/* Bottom bar zone */}
      {bottomBar && <BottomBar slots={bottomBar} />}
    </div>
  )
}

export default PageLayout
