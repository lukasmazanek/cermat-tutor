import { useMemo } from 'react'
import AnswerOptions, { AnswerOption } from '../AnswerOptions'
import { TypeDrillQuestion } from './types'

interface TypeQuestionProps {
  question: TypeDrillQuestion
  onAnswer: (answerId: string, isCorrect: boolean) => void
}

function TypeQuestion({ question, onAnswer }: TypeQuestionProps) {
  // UNIFIED FORMAT: Build options from question meta + distractors
  const options: AnswerOption[] = useMemo(() => {
    const correctId = question.meta.type_id || ''
    const correctLabel = question.meta.type_label || ''

    return [
      { id: correctId, label: correctLabel, isCorrect: true },
      ...question.typeDistractors.map(d => ({ id: d.id, label: d.label, isCorrect: false }))
    ].sort(() => Math.random() - 0.5)
  }, [question.id])

  const handleSelect = (option: AnswerOption) => {
    onAnswer(option.id, option.isCorrect)
  }

  return (
    <div className="flex-1 flex flex-col">
      <h3 className="text-lg font-medium text-slate-700 mb-4">
        Jaký je to typ úlohy?
      </h3>

      {/* ADR-029: Centralized AnswerOptions component */}
      <AnswerOptions
        options={options}
        questionId={question.id}
        onSelect={handleSelect}
        mode="delayed"
      />
    </div>
  )
}

export default TypeQuestion
