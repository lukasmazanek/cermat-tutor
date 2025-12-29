/**
 * ADR-030: Session Summary with Psychological Safety
 *
 * Key principles:
 * - Main metric = total explored (effort)
 * - Hints reframed as positive learning tool
 * - No emphasis on "bez nápovědy" as success metric
 * - Only positive comparisons shown
 */

import questionsData from '../data/questions.json'
import { TrophyIcon } from '@heroicons/react/24/outline'
import BottomBar from './BottomBar'
import { SessionAttempt, SessionMetrics, Session, QuestionsData } from '../types'

const data = questionsData as QuestionsData

interface SessionSummaryProps {
  attempts: SessionAttempt[]
  totalProblems: number
  topic: string | null
  sessionMetrics: SessionMetrics
  onNewSession: () => void
  onViewProgress: () => void
  onHome?: () => void
}

function SessionSummary({ attempts, totalProblems: _totalProblems, topic, sessionMetrics: _sessionMetrics, onNewSession, onViewProgress, onHome }: SessionSummaryProps) {
  // Calculate metrics - focus on exploration, not correctness
  const totalExplored = attempts.length
  const hintsUsedCount = attempts.filter(a => a.hintsUsed > 0).length
  const correctWithHints = attempts.filter(a => a.hintsUsed > 0 && a.correct).length

  // Get topic name for display
  const topicName = topic === 'mixed'
    ? 'Mix všeho'
    : (topic && data.topics[topic]?.name_cs) || topic

  // Get comparison with previous same-topic session (only positive!)
  const getComparisonMessage = (): string | null => {
    try {
      const progress = JSON.parse(localStorage.getItem('tutor_progress') || '[]') as Session[]
      const sameTopic = progress.filter(s => s.topic === topic)
      const previousSame = sameTopic.length >= 2 ? sameTopic[sameTopic.length - 2] : null

      if (!previousSame) return null

      const prevExplored = previousSame.problemsExplored || 0
      const diff = totalExplored - prevExplored

      if (diff > 0) {
        return `+${diff} více než minule!`
      } else if (diff === 0 && prevExplored > 0) {
        return 'Stejně jako minule - stabilní!'
      }
      // If less, return nothing - no negative comparisons
      return null
    } catch {
      return null
    }
  }

  const comparisonMessage = getComparisonMessage()

  // Calculate total stats from localStorage
  const getTotalStats = (): { sessions: number; problems: number } => {
    try {
      const progress = JSON.parse(localStorage.getItem('tutor_progress') || '[]') as Session[]
      const totalProblemsEver = progress.reduce((sum, s) => sum + (s.problemsExplored || 0), 0)
      return {
        sessions: progress.length,
        problems: totalProblemsEver
      }
    } catch {
      return { sessions: 0, problems: 0 }
    }
  }

  const stats = getTotalStats()

  return (
    <div className="h-screen h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      {/* Scrollable centered content - ADR-015 CENTERED template */}
      <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-4 py-6 pb-20">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-sm w-full text-center">
          {/* Celebration - not about score */}
          <div className="flex justify-center mb-4">
            <TrophyIcon className="w-12 h-12 sm:w-16 sm:h-16 text-amber-500" />
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-2">
            Skvělé prozkoumávání!
          </h1>

          <p className="text-slate-600 mb-6">
            Dnes jsi prozkoumala {totalExplored} {totalExplored === 1 ? 'úlohu' : totalExplored < 5 ? 'úlohy' : 'úloh'}
            {topicName && <span className="text-slate-400"> z tématu {topicName}</span>}
          </p>

          {/* Main metric: Total explored (effort-based) */}
          <div className="bg-safe-blue/10 rounded-xl p-4 mb-4">
            <div className="text-4xl font-bold text-safe-blue">
              {totalExplored}
            </div>
            <div className="text-sm text-blue-700">
              úloh prozkoumáno
            </div>
            {comparisonMessage && (
              <div className="text-sm text-green-600 mt-2 font-medium">
                {comparisonMessage}
              </div>
            )}
          </div>

          {/* Hints helped - positive framing */}
          {hintsUsedCount > 0 && (
            <div className="bg-purple-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xl">💡</span>
                <span className="font-medium text-purple-800">
                  Nápovědy ti pomohly
                </span>
              </div>
              <div className="text-sm text-purple-600">
                {correctWithHints > 0
                  ? `${correctWithHints}× ses díky nim naučila správný postup`
                  : `${hintsUsedCount}× jsi je použila k učení`
                }
              </div>
            </div>
          )}

          {/* Total progress - "race against yourself" */}
          {stats.problems > 0 && (
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-lg font-medium text-slate-700">
                {stats.problems} úloh celkem
              </div>
              <div className="text-sm text-slate-500">
                za {stats.sessions} cvičení
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BottomBar - ADR-015 */}
      <BottomBar
        slots={{
          1: { onClick: onHome || onNewSession },
          2: { onClick: onViewProgress },
          5: { action: 'continue', onClick: onNewSession }
        }}
      />
    </div>
  )
}

export default SessionSummary
