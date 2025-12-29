/**
 * AnswerOptions Component
 * ADR-029: Component Consolidation - Phase 2
 *
 * Unified multiple-choice answer buttons used in:
 * - LightningRound/Question (immediate mode)
 * - TypeDrill/TypeQuestion (selection mode)
 * - TypeDrill/StrategyQuestion (selection mode)
 */

import { useState } from 'react'
import { BUTTON, getOptionClass } from '../constants/styles'

export interface AnswerOption {
  /** Unique identifier for the option */
  id: string
  /** Display label */
  label: string
  /** Whether this is the correct answer */
  isCorrect: boolean
}

interface AnswerOptionsProps {
  /** Array of answer options to display */
  options: AnswerOption[]
  /** Unique question ID (used for React keys) */
  questionId: string
  /** Called when an option is selected */
  onSelect: (option: AnswerOption) => void
  /**
   * Selection mode:
   * - 'immediate': Click instantly triggers onSelect (LightningRound)
   * - 'delayed': Shows selection briefly, then triggers onSelect (TypeDrill)
   */
  mode?: 'immediate' | 'delayed'
  /** Delay in ms before onSelect is called in delayed mode (default: 300) */
  delay?: number
  /** Use compact button style (p-3 instead of p-4) */
  compact?: boolean
  /** Use monospace font for labels */
  mono?: boolean
  /** Disable all buttons */
  disabled?: boolean
  /** Additional className for the container */
  className?: string
}

/**
 * Renders multiple-choice answer options
 *
 * @example Immediate mode (Lightning Round)
 * <AnswerOptions
 *   options={shuffledAnswers}
 *   questionId={question.id}
 *   onSelect={(opt) => handleAnswer(opt.label)}
 *   mode="immediate"
 *   compact
 * />
 *
 * @example Delayed mode (Type Drill)
 * <AnswerOptions
 *   options={typeOptions}
 *   questionId={question.id}
 *   onSelect={(opt) => handleTypeAnswer(opt.id, opt.isCorrect)}
 *   mode="delayed"
 * />
 */
function AnswerOptions({
  options,
  questionId,
  onSelect,
  mode = 'immediate',
  delay = 300,
  compact = false,
  mono = false,
  disabled = false,
  className = ''
}: AnswerOptionsProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleClick = (option: AnswerOption) => {
    if (disabled || selected !== null) return

    if (mode === 'immediate') {
      onSelect(option)
    } else {
      // Delayed mode - show selection, then fire callback
      setSelected(option.id)
      setTimeout(() => {
        onSelect(option)
        setSelected(null)
      }, delay)
    }
  }

  const getButtonClass = (option: AnswerOption): string => {
    if (compact) {
      // Compact mode: simpler styling, no selection state
      return BUTTON.optionCompact
    }

    // Standard mode: with selection state
    return getOptionClass(selected === option.id)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {options.map((option, index) => (
        <button
          key={`${questionId}-${option.id}-${index}`}
          onClick={() => handleClick(option)}
          disabled={disabled || selected !== null}
          className={getButtonClass(option)}
        >
          <span className={mono ? 'font-mono' : 'font-medium'}>
            {option.label}
          </span>
        </button>
      ))}
    </div>
  )
}

export default AnswerOptions
