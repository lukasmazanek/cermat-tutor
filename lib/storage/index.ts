/**
 * ADR-023: Storage Layer
 *
 * Unified storage interface for attempt persistence.
 * Currently uses localStorage, will add Supabase in Phase 2.
 *
 * Usage:
 *   import { storage } from '@lib/storage'
 *   await storage.saveAttempt({ ... })
 */

import { localStorageProvider } from './localStorage'
import type { StorageProvider } from './types'

// Re-export types for convenience
export * from './types'

// Current storage provider
// Phase 2: This will check auth state and return supabaseProvider if logged in
function getStorageProvider(): StorageProvider {
  // TODO Phase 2: Check if user is authenticated
  // if (supabaseAuth.user) return supabaseProvider
  return localStorageProvider
}

// Export singleton storage instance
export const storage = getStorageProvider()

// Convenience functions for direct import (matches old API)
export const saveAttempt = storage.saveAttempt.bind(storage)
export const getAttempts = storage.getAttempts.bind(storage)
export const startSession = storage.startSession.bind(storage)
export const endSession = storage.endSession.bind(storage)
export const getCurrentSessionId = storage.getCurrentSessionId.bind(storage)
export const getTopicStats = storage.getTopicStats.bind(storage)
export const getAttemptsForQuestion = storage.getAttemptsForQuestion.bind(storage)
export const getAttemptsForTopic = storage.getAttemptsForTopic.bind(storage)
export const getRecentAttempts = storage.getRecentAttempts.bind(storage)
