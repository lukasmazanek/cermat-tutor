import { TagIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import QuestionDisplay from '../QuestionDisplay'
import StreakBadge from '../StreakBadge'
import { LightningQuestion } from './types'

interface QuestionProps {
  question: LightningQuestion
  onAnswer: (answer: string) => void
  streak: number
}

function Question({ question, onAnswer, streak }: QuestionProps) {
  const originalType = question.meta.type_id || ''
  const isTypeRecognition = originalType === 'type_recognition'
  const isProblemType = originalType === 'problem_type'

  return (
    <div className="p-4">
      {/* Streak indicator - ADR-029: Centralized StreakBadge */}
      <StreakBadge streak={streak} className="mb-3" />

      {/* Type recognition badge */}
      {isTypeRecognition && (
        <div className="flex items-center justify-center gap-1 mb-3">
          <TagIcon className="w-4 h-4 text-indigo-500" />
          <span className="text-indigo-600 text-sm font-medium">Rozpoznej vzorec</span>
        </div>
      )}

      {/* Problem type badge */}
      {isProblemType && (
        <div className="flex items-center justify-center gap-1 mb-3">
          <QuestionMarkCircleIcon className="w-4 h-4 text-emerald-500" />
          <span className="text-emerald-600 text-sm font-medium">Rozpoznej typ úlohy</span>
        </div>
      )}

      {/* Question - ADR-028 */}
      <QuestionDisplay
        question={question}
        className="bg-white rounded-2xl shadow-sm p-5 mb-4"
        textClassName="text-lg text-center text-slate-800 font-medium"
        mono={isTypeRecognition}
      />

      {/* Answer buttons - key on container forces remount to clear states */}
      <div key={question.id} className="space-y-2">
        {question.shuffledAnswers.map((answer, index) => (
          <button
            key={`${question.id}-${index}`}
            onClick={() => onAnswer(answer)}
            className={`w-full p-3 rounded-xl bg-white border-2 border-slate-200
              text-base font-medium text-slate-700
              transition-gentle active:scale-[0.98] active:bg-amber-50
              focus:outline-none ${isTypeRecognition ? 'font-mono' : ''}`}
          >
            {answer}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Question
