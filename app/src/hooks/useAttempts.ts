/**
 * ADR-023: Attempt Tracking Hook
 *
 * React hook for attempt persistence.
 * Uses lib/storage for actual data operations.
 *
 * This is a thin wrapper providing React integration.
 * All storage logic is in lib/storage.
 */

// Re-export everything from storage layer for convenience
export {
  // Types
  type AttemptRecord,
  type SessionRecord,
  type SaveAttemptInput,
  type TopicStats,
  type AttemptMode,

  // Functions
  storage,
  saveAttempt,
  getAttempts,
  startSession,
  endSession,
  getCurrentSessionId,
  getTopicStats,
  getAttemptsForQuestion,
  getAttemptsForTopic,
  getRecentAttempts
} from '@lib/storage'

// Future: Add React hooks with state management
// export function useAttempts() { ... }
// export function useTopicStats() { ... }
