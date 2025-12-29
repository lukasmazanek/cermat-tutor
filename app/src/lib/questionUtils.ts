/**
 * Question utilities - ADR-029 Component Consolidation
 * Centralized functions for accessing question data
 */

import { UnifiedQuestion } from '../types'

/**
 * Extract display text from a question (context preferred over stem)
 * Used by: ProblemCard, LightningRound/Question, LightningRound/Feedback, TypeDrill, VisualExplainer
 */
export function getQuestionText(question: { question: { stem?: string | null; context?: string | null } }): string {
  return question.question.context || question.question.stem || ''
}

/**
 * Extract solution data from a question with safe defaults
 * Used by: LightningRound/Feedback, TypeDrill, ProblemCard
 */
export function getSolutionData(question: UnifiedQuestion) {
  return {
    strategy: question.solution.strategy || '',
    steps: question.solution.steps || [],
    hints: question.hints || []
  }
}
