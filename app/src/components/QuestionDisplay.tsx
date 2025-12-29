/**
 * QuestionDisplay - ADR-028
 * Centralized component for rendering question text + diagram
 * Single source of truth - prevents forgetting diagram support in new pages
 */

import DiagramRenderer from './diagrams/DiagramRenderer'
import { getQuestionText } from '../lib/questionUtils'
import { DiagramConfig } from '../types'

interface QuestionDisplayProps {
  question: {
    question: { stem?: string | null; context?: string | null }
    diagram?: DiagramConfig
  }
  /** Container className */
  className?: string
  /** Text paragraph className */
  textClassName?: string
  /** Show monospace font (for type recognition) */
  mono?: boolean
}

/**
 * Renders question with optional diagram
 *
 * @example
 * <QuestionDisplay
 *   question={problem}
 *   className="bg-white rounded-2xl shadow-sm p-5"
 *   textClassName="text-lg text-center text-slate-800 font-medium"
 * />
 */
function QuestionDisplay({ question, className, textClassName, mono }: QuestionDisplayProps) {
  const text = getQuestionText(question)

  return (
    <div className={className}>
      {question.diagram && (
        <DiagramRenderer diagram={question.diagram} />
      )}
      <p className={`${textClassName || ''} ${mono ? 'font-mono' : ''}`}>
        {text}
      </p>
    </div>
  )
}

export default QuestionDisplay
