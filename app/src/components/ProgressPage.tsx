/**
 * ADR-030: Progress Page with Psychological Safety Design
 *
 * Key principles:
 * - Lead with GROWTH, not state
 * - Sort by EFFORT, not accuracy
 * - Celebrate CONSISTENCY
 * - Normalize HINTS as learning tools
 * - Remove PERCENTAGES (trigger school anxiety)
 */

import { useState, useMemo, useEffect } from 'react'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import questionsData from '../data/questions.json'
import PageLayout from './PageLayout'
import PageHeader from './PageHeader'
import { QuestionsData } from '../types'
import { getAttempts, AttemptRecord } from '../hooks/useAttempts'

const data = questionsData as QuestionsData

interface ProgressPageProps {
  onBack: () => void
}

function ProgressPage({ onBack }: ProgressPageProps) {
  const [allAttempts, setAllAttempts] = useState<AttemptRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const attempts = await getAttempts()
      setAllAttempts(attempts)
      setIsLoading(false)
    }
    loadData()
  }, [])

  // Calculate streak (consecutive days with activity)
  const streak = useMemo(() => {
    if (allAttempts.length === 0) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get unique days with activity
    const activeDays = new Set<string>()
    allAttempts.forEach(a => {
      const date = new Date(a.created_at)
      date.setHours(0, 0, 0, 0)
      activeDays.add(date.toISOString())
    })

    // Count consecutive days from today backwards
    let count = 0
    const checkDate = new Date(today)

    while (true) {
      const dateStr = checkDate.toISOString()
      if (activeDays.has(dateStr)) {
        count++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (count === 0) {
        // If today has no activity, check if yesterday started a streak
        checkDate.setDate(checkDate.getDate() - 1)
        if (!activeDays.has(checkDate.toISOString())) break
      } else {
        break
      }
    }

    return count
  }, [allAttempts])

  // Weekly comparison
  const weeklyStats = useMemo(() => {
    const now = new Date()
    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(now.getDate() - now.getDay())
    thisWeekStart.setHours(0, 0, 0, 0)

    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)

    const thisWeek = allAttempts.filter(a => new Date(a.created_at) >= thisWeekStart)
    const lastWeek = allAttempts.filter(a => {
      const date = new Date(a.created_at)
      return date >= lastWeekStart && date < thisWeekStart
    })

    return {
      thisWeek: thisWeek.length,
      lastWeek: lastWeek.length,
      difference: thisWeek.length - lastWeek.length,
      total: allAttempts.length
    }
  }, [allAttempts])

  // Topic activity stats (sorted by activity, not accuracy)
  const topicActivity = useMemo(() => {
    const byTopic = new Map<string, AttemptRecord[]>()

    allAttempts.forEach(a => {
      const list = byTopic.get(a.topic) || []
      list.push(a)
      byTopic.set(a.topic, list)
    })

    const stats = Array.from(byTopic.entries()).map(([topic, attempts]) => {
      // Calculate trend (improving, stable, exploring)
      const trend = calculateTrend(attempts)
      const hintsHelped = attempts.filter(a => a.hints_used > 0 && a.is_correct).length

      return {
        topic,
        count: attempts.length,
        trend,
        hintsHelped
      }
    })

    // Sort by activity (most practiced first)
    return stats.sort((a, b) => b.count - a.count)
  }, [allAttempts])

  // Get topic name
  const getTopicName = (topicId: string): string => {
    return data.topics[topicId]?.name_cs || topicId
  }

  if (isLoading) {
    return (
      <div className="h-screen h-[100dvh] bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400">Načítám...</div>
      </div>
    )
  }

  // ADR-031: HEADER template with PageLayout + PageHeader
  return (
    <PageLayout
      header={
        <PageHeader
          icon={ChartBarIcon}
          title="Můj pokrok"
          iconColor="text-purple-600"
          progressColor="bg-purple-500"
        />
      }
      bottomBar={{
        1: { onClick: onBack },
      }}
      contentClassName="px-4 py-6"
    >
      {/* Subtitle */}
      <p className="text-slate-500 text-sm mb-6 -mt-4">
        Závod sama se sebou
      </p>

      {/* Streak - only show if active */}
      {streak > 0 && (
        <StreakBanner streak={streak} />
      )}

      {/* Weekly comparison */}
      <WeeklyComparison stats={weeklyStats} />

      {/* Topic activity */}
      {topicActivity.length > 0 && (
        <TopicActivitySection
          topics={topicActivity}
          getTopicName={getTopicName}
        />
      )}

      {/* Hints helped */}
      {allAttempts.length > 0 && (
        <HintsHelpedCard attempts={allAttempts} />
      )}

      {/* Empty state */}
      {allAttempts.length === 0 && (
        <EmptyState />
      )}
    </PageLayout>
  )
}

// Calculate trend without using "declining" - reframe as "exploring"
function calculateTrend(attempts: AttemptRecord[]): 'improving' | 'stable' | 'exploring' {
  if (attempts.length < 3) return 'exploring'

  // Sort by date, newest first
  const sorted = [...attempts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const recent = sorted.slice(0, 5)
  const older = sorted.slice(5, 10)

  if (older.length < 2) return 'exploring'

  const recentCorrect = recent.filter(a => a.is_correct).length / recent.length
  const olderCorrect = older.filter(a => a.is_correct).length / older.length

  if (recentCorrect > olderCorrect + 0.15) return 'improving'
  if (recentCorrect < olderCorrect - 0.15) return 'exploring' // NOT "declining"!
  return 'stable'
}

// Streak banner component
function StreakBanner({ streak }: { streak: number }) {
  return (
    <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔥</span>
        <div>
          <div className="text-xl font-bold text-amber-800">
            {streak} {streak === 1 ? 'den' : streak < 5 ? 'dny' : 'dní'} v řadě!
          </div>
          <div className="text-sm text-amber-700">
            Skvělá práce, pokračuj!
          </div>
        </div>
      </div>
    </div>
  )
}

// Weekly comparison component
interface WeeklyStats {
  thisWeek: number
  lastWeek: number
  difference: number
  total: number
}

function WeeklyComparison({ stats }: { stats: WeeklyStats }) {
  const showComparison = stats.lastWeek > 0

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* This week with growth indicator */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        {showComparison && stats.difference !== 0 && (
          <div className={`text-sm font-medium mb-1 ${
            stats.difference > 0 ? 'text-green-600' : 'text-slate-400'
          }`}>
            {stats.difference > 0 ? `+${stats.difference} ↑` : `${stats.difference}`}
          </div>
        )}
        <div className="text-3xl font-bold text-safe-blue">
          {stats.thisWeek}
        </div>
        <div className="text-sm text-slate-500">
          tento týden
        </div>
      </div>

      {/* Total explored */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="text-3xl font-bold text-purple-600">
          {stats.total}
        </div>
        <div className="text-sm text-slate-500">
          celkem prozkoumáno
        </div>
      </div>
    </div>
  )
}

// Topic activity section (sorted by effort, not accuracy)
interface TopicStat {
  topic: string
  count: number
  trend: 'improving' | 'stable' | 'exploring'
  hintsHelped: number
}

function TopicActivitySection({
  topics,
  getTopicName
}: {
  topics: TopicStat[]
  getTopicName: (id: string) => string
}) {
  const maxCount = Math.max(...topics.map(t => t.count))

  const getTrendDisplay = (trend: string) => {
    switch (trend) {
      case 'improving':
        return { text: 'Zlepšuješ se', icon: '↑', color: 'text-green-600' }
      case 'stable':
        return { text: 'Stabilní', icon: '→', color: 'text-blue-600' }
      case 'exploring':
        return { text: 'Objevuješ', icon: '🔍', color: 'text-purple-600' }
      default:
        return { text: '', icon: '', color: '' }
    }
  }

  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-slate-600 mb-3">
        Co prozkoumáváš
      </h2>
      <div className="space-y-3">
        {topics.map(topic => {
          const trend = getTrendDisplay(topic.trend)
          const barWidth = (topic.count / maxCount) * 100

          return (
            <div key={topic.topic} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-slate-800">
                  {getTopicName(topic.topic)}
                </div>
                <div className={`text-sm font-medium ${trend.color}`}>
                  {trend.icon} {trend.text}
                </div>
              </div>

              {/* Activity bar (not accuracy!) */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-safe-blue rounded-full transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              <div className="text-xs text-slate-500">
                {topic.count}× prozkoumáno
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Hints helped card - reframe hints as positive
function HintsHelpedCard({ attempts }: { attempts: AttemptRecord[] }) {
  const hintsHelped = attempts.filter(a => a.hints_used > 0 && a.is_correct).length
  const totalWithHints = attempts.filter(a => a.hints_used > 0).length

  if (totalWithHints === 0) return null

  return (
    <div className="bg-purple-50 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="text-2xl">💡</div>
        <div>
          <div className="font-medium text-purple-800">
            Nápovědy ti pomohly
          </div>
          <div className="text-sm text-purple-600">
            {hintsHelped}× ses díky nim naučila správný postup
          </div>
        </div>
      </div>
    </div>
  )
}

// Empty state
function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">🚀</div>
      <h2 className="text-lg font-medium text-slate-700 mb-2">
        Začni objevovat!
      </h2>
      <p className="text-slate-500">
        Vyber si téma a prozkoumej první úlohy.
        <br />
        Tvůj pokrok se bude zobrazovat tady.
      </p>
    </div>
  )
}

export default ProgressPage
