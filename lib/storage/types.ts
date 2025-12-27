/**
 * ADR-023: Storage Types
 *
 * Shared types for attempt and session persistence.
 * Used by both localStorage (Phase 1) and Supabase (Phase 2).
 */

// Attempt record - single answer to a question
export interface AttemptRecord {
  // Identification
  id: string
  user_id: string
  session_id: string

  // Question snapshot (for review without needing original data)
  question_id: string
  question_stem: string
  correct_answer: string
  topic: string
  difficulty: number

  // Answer
  user_answer: string
  is_correct: boolean
  mode: AttemptMode

  // Analysis context
  hints_used: number
  hints_shown: string[]
  time_spent_ms: number

  // Metadata
  created_at: string
}

export type AttemptMode = 'numeric' | 'type_recognition' | 'lightning'

// Session record - groups attempts together
export interface SessionRecord {
  id: string
  user_id: string
  topic: string
  started_at: string
  ended_at: string | null
  problems_count: number
}

// Input for saving attempt (without auto-generated fields)
export interface SaveAttemptInput {
  question_id: string
  question_stem: string
  correct_answer: string
  topic: string
  difficulty: number
  user_answer: string
  is_correct: boolean
  mode: AttemptMode
  hints_used: number
  hints_shown: string[]
  time_spent_ms: number
}

// Topic statistics (computed from attempts)
export interface TopicStats {
  topic: string
  total_attempts: number
  correct_count: number
  accuracy: number
  avg_hints: number
  avg_time_ms: number
}

// Storage provider interface - implemented by localStorage, Supabase, etc.
export interface StorageProvider {
  // Attempts
  getAttempts(): Promise<AttemptRecord[]>
  saveAttempt(input: SaveAttemptInput): Promise<AttemptRecord>
  getAttemptsForQuestion(questionId: string): Promise<AttemptRecord[]>
  getAttemptsForTopic(topic: string): Promise<AttemptRecord[]>
  getRecentAttempts(days: number): Promise<AttemptRecord[]>

  // Sessions
  getSessions(): Promise<SessionRecord[]>
  startSession(topic: string): Promise<string>
  endSession(): Promise<void>
  getCurrentSessionId(): string | null

  // Analytics
  getTopicStats(): Promise<TopicStats[]>
}
