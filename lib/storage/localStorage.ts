/**
 * ADR-023: localStorage Implementation
 *
 * Phase 1 storage provider using browser localStorage.
 * Will be replaced/augmented by Supabase in Phase 2.
 */

import {
  AttemptRecord,
  SessionRecord,
  SaveAttemptInput,
  TopicStats,
  StorageProvider
} from './types'

// Storage keys
const ATTEMPTS_KEY = 'tutor_attempts'
const SESSIONS_KEY = 'tutor_sessions'
const CURRENT_SESSION_KEY = 'tutor_current_session'

// UUID generator (simple version for browser)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// localStorage implementation of StorageProvider
class LocalStorageProvider implements StorageProvider {
  // Attempts

  async getAttempts(): Promise<AttemptRecord[]> {
    try {
      return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]')
    } catch {
      return []
    }
  }

  async saveAttempt(input: SaveAttemptInput): Promise<AttemptRecord> {
    const attempt: AttemptRecord = {
      id: generateUUID(),
      user_id: 'local',
      session_id: this.getCurrentSessionId() || generateUUID(),
      ...input,
      created_at: new Date().toISOString()
    }

    const attempts = await this.getAttempts()
    attempts.push(attempt)
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts))

    return attempt
  }

  async getAttemptsForQuestion(questionId: string): Promise<AttemptRecord[]> {
    const attempts = await this.getAttempts()
    return attempts.filter(a => a.question_id === questionId)
  }

  async getAttemptsForTopic(topic: string): Promise<AttemptRecord[]> {
    const attempts = await this.getAttempts()
    return attempts.filter(a => a.topic === topic)
  }

  async getRecentAttempts(days: number = 7): Promise<AttemptRecord[]> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const attempts = await this.getAttempts()
    return attempts.filter(a => new Date(a.created_at) >= cutoff)
  }

  // Sessions

  async getSessions(): Promise<SessionRecord[]> {
    try {
      return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]')
    } catch {
      return []
    }
  }

  async startSession(topic: string): Promise<string> {
    const sessionId = generateUUID()
    sessionStorage.setItem(CURRENT_SESSION_KEY, sessionId)

    const session: SessionRecord = {
      id: sessionId,
      user_id: 'local',
      topic,
      started_at: new Date().toISOString(),
      ended_at: null,
      problems_count: 0
    }

    const sessions = await this.getSessions()
    sessions.push(session)
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))

    return sessionId
  }

  async endSession(): Promise<void> {
    const sessionId = sessionStorage.getItem(CURRENT_SESSION_KEY)
    if (!sessionId) return

    const sessions = await this.getSessions()
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      session.ended_at = new Date().toISOString()
      const attempts = await this.getAttempts()
      session.problems_count = attempts.filter(a => a.session_id === sessionId).length
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
    }

    sessionStorage.removeItem(CURRENT_SESSION_KEY)
  }

  getCurrentSessionId(): string | null {
    return sessionStorage.getItem(CURRENT_SESSION_KEY)
  }

  // Analytics

  async getTopicStats(): Promise<TopicStats[]> {
    const attempts = await this.getAttempts()
    const byTopic = new Map<string, AttemptRecord[]>()

    for (const attempt of attempts) {
      const list = byTopic.get(attempt.topic) || []
      list.push(attempt)
      byTopic.set(attempt.topic, list)
    }

    const stats: TopicStats[] = []
    for (const [topic, topicAttempts] of byTopic) {
      const correct = topicAttempts.filter(a => a.is_correct).length
      stats.push({
        topic,
        total_attempts: topicAttempts.length,
        correct_count: correct,
        accuracy: topicAttempts.length > 0 ? correct / topicAttempts.length : 0,
        avg_hints: topicAttempts.reduce((sum, a) => sum + a.hints_used, 0) / topicAttempts.length || 0,
        avg_time_ms: topicAttempts.reduce((sum, a) => sum + a.time_spent_ms, 0) / topicAttempts.length || 0
      })
    }

    return stats
  }
}

// Singleton instance
export const localStorageProvider = new LocalStorageProvider()
