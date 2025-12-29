import { useMemo } from 'react'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import AnswerOptions, { AnswerOption } from '../AnswerOptions'
import { TypeDrillQuestion } from './types'
import { STATUS } from '../../constants/styles'

interface StrategyQuestionProps {
  question: TypeDrillQuestion
  typeWasCorrect: boolean
  onAnswer: (answer: string, isCorrect: boolean) => void
}

function StrategyQuestion({ question, typeWasCorrect, onAnswer }: StrategyQuestionProps) {
  // UNIFIED FORMAT: Get strategy from solution
  const correctStrategy = question.solution.strategy || ''
  const typeLabel = question.meta.type_label || ''

  // Build options: correct + distractors, shuffled
  const options: AnswerOption[] = useMemo(() => {
    return [
      { id: correctStrategy, label: correctStrategy, isCorrect: true },
      ...question.strategyDistractors.map(d => ({ id: d, label: d, isCorrect: false }))
    ].sort(() => Math.random() - 0.5)
  }, [question.id])

  const handleSelect = (option: AnswerOption) => {
    onAnswer(option.label, option.isCorrect)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Type result indicator - ADR-029: Use STATUS constants */}
      <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg ${
        typeWasCorrect ? STATUS.success : STATUS.warning
      }`}>
        {typeWasCorrect ? (
          <CheckCircleIcon className="w-5 h-5" />
        ) : (
          <ExclamationCircleIcon className="w-5 h-5" />
        )}
        <span className="text-sm">
          Typ: {typeLabel}
          {typeWasCorrect ? '' : ' (správná odpověď)'}
        </span>
      </div>

      <h3 className="text-lg font-medium text-slate-700 mb-4">
        Jaká je správná strategie?
      </h3>

      {/* ADR-029: Centralized AnswerOptions component */}
      <AnswerOptions
        options={options}
        questionId={question.id}
        onSelect={handleSelect}
        mode="delayed"
        mono
      />
    </div>
  )
}

export default StrategyQuestion
