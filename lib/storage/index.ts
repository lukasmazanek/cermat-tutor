/**
 * ADR-023: Storage Layer
 *
 * Unified storage interface for attempt persistence.
 * Phase 1: localStorage (offline, no auth)
 * Phase 2: Supabase (when authenticated)
 *
 * Usage:
 *   import { storage, getActiveStorage } from '@lib/storage'
 *
 *   // Sync usage (localStorage fallback)
 *   await storage.saveAttempt({ ... })
 *
 *   // Async usage (uses Supabase if authenticated)
 *   const activeStorage = await getActiveStorage()
 *   await activeStorage.saveAttempt({ ... })
 */

import { localStorageProvider } from './localStorage'
import { supabaseStorageProvider } from './supabase'
import { isConfigured, isAuthenticated } from '../supabase'
import type { StorageProvider } from './types'

// Re-export types for convenience
export * from './types'

/**
 * Get the active storage provider based on auth state.
 * Returns Supabase if configured and authenticated, otherwise localStorage.
 */
export async function getActiveStorage(): Promise<StorageProvider> {
  if (isConfigured() && await isAuthenticated()) {
    return supabaseStorageProvider
  }
  return localStorageProvider
}

/**
 * Sync storage - always returns localStorage.
 * Use this when you need immediate sync access.
 * Data will be synced to Supabase on next getActiveStorage() call.
 */
export const storage = localStorageProvider

// Convenience functions using smart provider selection
export async function saveAttempt(...args: Parameters<StorageProvider['saveAttempt']>) {
  const provider = await getActiveStorage()
  return provider.saveAttempt(...args)
}

export async function getAttempts() {
  const provider = await getActiveStorage()
  return provider.getAttempts()
}

export async function startSession(topic: string) {
  const provider = await getActiveStorage()
  return provider.startSession(topic)
}

export async function endSession() {
  const provider = await getActiveStorage()
  return provider.endSession()
}

export function getCurrentSessionId() {
  // Session ID is local only (managed per-tab)
  return localStorageProvider.getCurrentSessionId()
}

export async function getTopicStats() {
  const provider = await getActiveStorage()
  return provider.getTopicStats()
}

export async function getAttemptsForQuestion(questionId: string) {
  const provider = await getActiveStorage()
  return provider.getAttemptsForQuestion(questionId)
}

export async function getAttemptsForTopic(topic: string) {
  const provider = await getActiveStorage()
  return provider.getAttemptsForTopic(topic)
}

export async function getRecentAttempts(days: number = 7) {
  const provider = await getActiveStorage()
  return provider.getRecentAttempts(days)
}
