/**
 * ADR-023: Storage Layer (Simplified)
 * ADR-032: Multi-user support
 *
 * Unified storage interface for attempt persistence.
 * - Uses Supabase when configured (env variables set)
 * - Falls back to localStorage otherwise
 *
 * Multi-user setup via setCurrentUserId().
 *
 * Usage:
 *   import { storage, getActiveStorage, setCurrentUserId } from '@lib/storage'
 *
 *   // Set current user (called when profile is selected)
 *   setCurrentUserId('anezka')
 *
 *   // Get active provider (Supabase if configured, else localStorage)
 *   const activeStorage = await getActiveStorage()
 *   await activeStorage.saveAttempt({ ... })
 */

import { localStorageProvider, setCurrentUserId, getCurrentUserId } from './localStorage'
import { supabaseStorageProvider } from './supabase'
import { isConfigured } from '../supabase'
import type { StorageProvider } from './types'

// Re-export types for convenience
export * from './types'

// ADR-032: Re-export user ID functions
export { setCurrentUserId, getCurrentUserId }

/**
 * Get the active storage provider.
 * Returns Supabase if configured, otherwise localStorage.
 */
export function getActiveStorage(): StorageProvider {
  if (isConfigured()) {
    return supabaseStorageProvider
  }
  return localStorageProvider
}

/**
 * Sync storage - always returns localStorage.
 * Use this when you need immediate sync access without Supabase.
 */
export const storage = localStorageProvider

// Convenience functions using smart provider selection
export function saveAttempt(...args: Parameters<StorageProvider['saveAttempt']>) {
  const provider = getActiveStorage()
  return provider.saveAttempt(...args)
}

export function getAttempts() {
  const provider = getActiveStorage()
  return provider.getAttempts()
}

export function startSession(topic: string) {
  const provider = getActiveStorage()
  return provider.startSession(topic)
}

export function endSession() {
  const provider = getActiveStorage()
  return provider.endSession()
}

export function getCurrentSessionId() {
  const provider = getActiveStorage()
  return provider.getCurrentSessionId()
}

export function getTopicStats() {
  const provider = getActiveStorage()
  return provider.getTopicStats()
}

export function getAttemptsForQuestion(questionId: string) {
  const provider = getActiveStorage()
  return provider.getAttemptsForQuestion(questionId)
}

export function getAttemptsForTopic(topic: string) {
  const provider = getActiveStorage()
  return provider.getAttemptsForTopic(topic)
}

export function getRecentAttempts(days: number = 7) {
  const provider = getActiveStorage()
  return provider.getRecentAttempts(days)
}

// Error queue
export function saveError(...args: Parameters<StorageProvider['saveError']>) {
  const provider = getActiveStorage()
  return provider.saveError(...args)
}

export function getErrorQueue() {
  const provider = getActiveStorage()
  return provider.getErrorQueue()
}

export function markErrorReviewed(id: string) {
  const provider = getActiveStorage()
  return provider.markErrorReviewed(id)
}
