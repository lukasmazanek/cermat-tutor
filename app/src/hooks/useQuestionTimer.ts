/**
 * useQuestionTimer Hook
 * ADR-029: Component Consolidation - Phase 3
 *
 * Tracks time spent on a question/problem.
 * Automatically resets when questionId changes.
 *
 * Used in: ProblemCard, LightningRound, TypeDrill
 */

import { useState, useEffect, useCallback } from 'react'

interface UseQuestionTimerReturn {
  /** Get elapsed time in milliseconds */
  getElapsedMs: () => number
  /** Get elapsed time in seconds */
  getElapsedSeconds: () => number
  /** Manually reset the timer */
  reset: () => void
  /** The start timestamp (for debugging) */
  startTime: number
}

/**
 * Hook to track time spent on a question
 *
 * @param questionId - When this changes, timer resets automatically
 * @returns Timer utilities
 *
 * @example
 * const { getElapsedMs, reset } = useQuestionTimer(question.id)
 *
 * // In submit handler:
 * saveAttempt({ time_spent_ms: getElapsedMs() })
 *
 * // Manual reset (e.g., after answer):
 * reset()
 */
export function useQuestionTimer(questionId?: string): UseQuestionTimerReturn {
  const [startTime, setStartTime] = useState(() => Date.now())

  // Reset timer when question changes
  useEffect(() => {
    setStartTime(Date.now())
  }, [questionId])

  const getElapsedMs = useCallback(() => {
    return Date.now() - startTime
  }, [startTime])

  const getElapsedSeconds = useCallback(() => {
    return Math.round((Date.now() - startTime) / 1000 * 10) / 10
  }, [startTime])

  const reset = useCallback(() => {
    setStartTime(Date.now())
  }, [])

  return {
    getElapsedMs,
    getElapsedSeconds,
    reset,
    startTime
  }
}

export default useQuestionTimer
