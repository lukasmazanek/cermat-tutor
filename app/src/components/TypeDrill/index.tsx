import { useState, useEffect } from 'react'
import { AcademicCapIcon } from '@heroicons/react/24/outline'
import questionsData from '../../data/questions.json'
import TypeQuestion from './TypeQuestion'
import StrategyQuestion from './StrategyQuestion'
import Summary from './Summary'
import PageLayout from '../PageLayout'
import PageHeader from '../PageHeader'
import { UnifiedQuestion, QuestionsData } from '../../types'
import { TypeDrillQuestion, TypeDrillResult, TypeOption } from './types'
import { getQuestionText, getSolutionData } from '../../lib/questionUtils'
import { saveAttempt, saveError, startSession, endSession } from '../../hooks/useAttempts'

const data = questionsData as QuestionsData

// ADR-030: Topic-level strategy distractors (misconception-based)
const TOPIC_STRATEGY_DISTRACTORS: Record<string, string[]> = {
  // Kritické téma - misconception focus
  'o_x_vice': ['+ zlomek místo ×', '÷ místo ×'],

  // Pythagorova věta
  'pythagorean': ['a + b = c', 'a × b = c'],

  // Binomické vzorce - zapomenuté členy
  'binomial_squares': ['a² + b² (chybí 2ab)', 'a² − b² (chybí 2ab)'],

  // Zlomky
  'fractions': ['Násobit čitatele i jmenovatele', 'Sečíst čitatele'],

  // Rovnice
  'equations': ['Přičíst na obě strany', 'Vydělit jen jednu stranu'],

  // Průměry
  'averages': ['Sečíst a vydělit 2', 'Vzít prostřední hodnotu'],

  // Posloupnosti
  'sequences': ['Sečíst první a poslední', 'Násobit počtem členů'],

  // Převody jednotek
  'unit_conversions': ['× 10', '× 100'],

  // Úlohy o práci
  'work_problems': ['Sečíst časy', 'Přímá úměrnost'],

  // Úhly
  'angles': ['Odečíst od 90°', 'Vydělit počtem úhlů'],

  // Objem
  'volume': ['Délka × šířka', 'Obvod × výška'],

  // Obsah a obvod
  'area_perimeter': ['Sečíst všechny strany', 'Násobit všechny strany'],

  // Procenta (data: percents)
  'percents': ['Vydělit 100', 'Přičíst procenta'],

  // Poměry
  'ratios': ['Sečíst části', 'Vydělit části'],

  // Slovní úlohy
  'word_problems': ['Sečíst všechna čísla', 'Použít první operaci'],

  // Grafy a tabulky (data: tables_graphs)
  'tables_graphs': ['Odečíst z osy', 'Průměr hodnot'],

  // Soustavy rovnic (data: systems_equations)
  'systems_equations': ['Sečíst rovnice', 'Dosadit bez úpravy'],

  // Mocniny
  'powers': ['Sečíst exponenty', 'Násobit exponenty'],

  // Odmocniny (data: square_roots)
  'square_roots': ['Odmocnit každý člen', 'Vydělit 2'],

  // Výrazy
  'expressions': ['Sečíst koeficienty', 'Násobit vše'],

  // Funkce
  'functions': ['Dosadit do x', 'Vyřešit pro y'],

  // Kruhy
  'circles': ['πr', '2r'],

  // Konstrukce
  'constructions': ['Od oka', 'Bez kružítka'],

  // Desetinná čísla
  'decimals': ['Posunout čárku', 'Ignorovat čárku'],

  // Faktorizace
  'factoring': ['Rozdělit na členy', 'Sečíst členy'],

  // Celá čísla
  'integers': ['Sečíst', 'Odečíst']
}

// Helper: Get type distractors - kept as helper function, not transformation
function getTypeDistractors(typeId: string | null): TypeOption[] {
  const distractorMap: Record<string, TypeOption[]> = {
    'WORD-OXVICE': [
      { id: 'NUM-PROC', label: 'Procenta' },
      { id: 'ALG-EQ', label: 'Rovnice' }
    ],
    'ALG-EQ': [
      { id: 'ALG-EXPR', label: 'Úprava výrazu' },
      { id: 'NUM-ZLOM', label: 'Zlomky' }
    ],
    'NUM-ZLOM': [
      { id: 'NUM-PROC', label: 'Procenta' },
      { id: 'ALG-EQ', label: 'Rovnice' }
    ],
    'GEOM-PYTH': [
      { id: 'GEOM-OBSAH', label: 'Obsah/obvod' },
      { id: 'ALG-EQ', label: 'Rovnice' }
    ],
    'PYTH-PTYPE': [
      { id: 'GEOM-OBSAH', label: 'Obsah/obvod' },
      { id: 'NUM-PROC', label: 'Procenta' },
      { id: 'ALG-EQ', label: 'Rovnice' }
    ]
  }
  // Fallback: return common types as distractors
  return distractorMap[typeId || ''] || [
    { id: 'NUM-PROC', label: 'Procenta' },
    { id: 'ALG-EQ', label: 'Rovnice' }
  ]
}

// ADR-030: Get strategy distractors with 3-level hierarchy
function getStrategyDistractors(question: UnifiedQuestion): string[] {
  // 1. Question-level (highest priority)
  const strategyMode = (question.modes as Record<string, unknown>)?.strategy_recognition as { distractors?: string[] } | undefined
  if (strategyMode?.distractors && strategyMode.distractors.length >= 2) {
    return strategyMode.distractors
  }

  // 2. Topic-level defaults
  const topicDistractors = TOPIC_STRATEGY_DISTRACTORS[question.topic]
  if (topicDistractors && topicDistractors.length >= 2) {
    return topicDistractors
  }

  // 3. Generic fallback (should be rare)
  return ['Jiná strategie', 'Tipnout odpověď']
}

// NO TRANSFORMATION FUNCTION - extend UnifiedQuestion inline
function prepareTypeDrillQuestion(q: UnifiedQuestion): TypeDrillQuestion {
  return {
    ...q,
    typeDistractors: getTypeDistractors(q.meta.type_id),
    strategyDistractors: getStrategyDistractors(q)  // ADR-030: pass full question
  }
}

interface TypeDrillProps {
  onExit: () => void
  onViewProgress: () => void
}

function TypeDrill({ onExit, onViewProgress }: TypeDrillProps) {
  const [questions, setQuestions] = useState<TypeDrillQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  // Phase: 'type' | 'strategy' | 'feedback' | 'summary'
  const [phase, setPhase] = useState<'type' | 'strategy' | 'feedback' | 'summary'>('type')
  const [results, setResults] = useState<TypeDrillResult[]>([])
  const [currentResult, setCurrentResult] = useState<TypeDrillResult | null>(null)

  // Timing
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  // Initialize questions
  const initQuestions = (): TypeDrillQuestion[] => {
    // ADR-023: Start session when type drill begins
    startSession('typedrill')

    // ADR-022: Filter questions that support type_recognition mode
    // ADR-030: Also require valid strategy for strategy phase
    const typeDrillQuestions = data.questions
      .filter(q =>
        q.modes.type_recognition &&
        (q.question.context || q.question.stem) &&
        q.solution.strategy  // Must have strategy for strategy phase
      )
      .map(prepareTypeDrillQuestion)

    const shuffled = [...typeDrillQuestions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 10)
  }

  // Shuffle and pick 10 questions on mount
  useEffect(() => {
    setQuestions(initQuestions())
    setQuestionStartTime(Date.now())
  }, [])

  // Restart handler
  const handleRestart = () => {
    setQuestions(initQuestions())
    setCurrentIndex(0)
    setPhase('type')
    setResults([])
    setCurrentResult(null)
    setQuestionStartTime(Date.now())
  }

  const currentQuestion = questions[currentIndex]

  // Handle type answer
  const handleTypeAnswer = (answerId: string, isCorrect: boolean) => {
    setCurrentResult({
      questionId: currentQuestion.id,
      typeCorrect: isCorrect,
      typeAnswer: answerId,
      strategyCorrect: false,
      strategyAnswer: null,
      timeSpent: Date.now() - questionStartTime
    })

    // Move to strategy question
    setPhase('strategy')
  }

  // Handle strategy answer
  const handleStrategyAnswer = (answer: string, isCorrect: boolean) => {
    const finalResult: TypeDrillResult = {
      ...currentResult!,
      strategyCorrect: isCorrect,
      strategyAnswer: answer,
      timeSpent: Date.now() - questionStartTime
    }

    // ADR-023: Save attempt after both type and strategy are answered
    saveAttempt({
      question_id: currentQuestion.id,
      question_stem: currentQuestion.question.context || '',
      correct_answer: currentQuestion.meta.type_label || '',
      topic: currentQuestion.topic,
      difficulty: currentQuestion.difficulty,
      user_answer: `type:${currentResult!.typeAnswer || 'skipped'}|strategy:${answer}`,
      is_correct: currentResult!.typeCorrect && isCorrect,
      mode: 'type_recognition',
      hints_used: 0,
      hints_shown: [],
      time_spent_ms: Date.now() - questionStartTime
    })

    setCurrentResult(finalResult)
    setResults([...results, finalResult])
    setPhase('feedback')
  }

  // Continue to next question
  const handleContinue = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setPhase('type')
      setCurrentResult(null)
      setQuestionStartTime(Date.now())
    } else {
      // ADR-023: End session when type drill completes
      endSession()
      setPhase('summary')
    }
  }

  // Skip current question (records as skipped)
  const handleSkip = () => {
    const skippedResult: TypeDrillResult = {
      questionId: currentQuestion.id,
      typeCorrect: false,
      typeAnswer: null,
      strategyCorrect: false,
      strategyAnswer: null,
      timeSpent: Date.now() - questionStartTime,
      skipped: true
    }

    // ADR-023: Save skipped attempt
    saveAttempt({
      question_id: currentQuestion.id,
      question_stem: currentQuestion.question.context || '',
      correct_answer: currentQuestion.meta.type_label || '',
      topic: currentQuestion.topic,
      difficulty: currentQuestion.difficulty,
      user_answer: 'skipped',
      is_correct: false,
      mode: 'type_recognition',
      hints_used: 0,
      hints_shown: [],
      time_spent_ms: Date.now() - questionStartTime
    })

    setResults([...results, skippedResult])
    handleContinue()
  }

  // Report error - save to queue and skip
  const handleReportError = async () => {
    const questionText = currentQuestion.question.context || currentQuestion.question.stem || ''

    await saveError({
      question_id: currentQuestion.id,
      question_stem: questionText,
      correct_answer: currentQuestion.meta.type_label || '',
      topic: currentQuestion.topic,
      difficulty: currentQuestion.difficulty,
      user_answer: null,
      hints_shown: [],
      time_spent_ms: Date.now() - questionStartTime
    })

    // Skip to next question
    handleSkip()
  }

  // Auto-advance on correct answers
  useEffect(() => {
    if (phase === 'feedback' && currentResult?.typeCorrect && currentResult?.strategyCorrect) {
      const timer = setTimeout(handleContinue, 1200)
      return () => clearTimeout(timer)
    }
  }, [phase, currentResult])

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Načítám...</div>
      </div>
    )
  }

  if (phase === 'summary') {
    return (
      <Summary
        results={results}
        questions={questions}
        onExit={onExit}
        onViewProgress={onViewProgress}
        onRestart={handleRestart}
      />
    )
  }

  // ADR-029: Use centralized utilities
  const questionContext = getQuestionText(currentQuestion)
  const { strategy: correctStrategy, hints } = getSolutionData(currentQuestion)
  const typeLabel = currentQuestion.meta.type_label || ''
  const explanation = hints[0] || ''

  // ADR-031: HEADER template with PageLayout + PageHeader
  return (
    <PageLayout
      header={
        <PageHeader
          icon={AcademicCapIcon}
          title="Rozpoznej typ"
          progress={{ current: currentIndex + 1, total: questions.length }}
          iconColor="text-indigo-600"
          progressColor="bg-indigo-500"
        />
      }
      bottomBar={{
        1: { onClick: onExit },
        2: { onClick: onViewProgress },
        3: { action: 'error', onClick: handleReportError },
        5: {
          action: phase === 'feedback' ? 'continue' : 'skip',
          onClick: phase === 'feedback' ? handleContinue : handleSkip
        }
      }}
      contentClassName="px-4 py-6"
    >
      {/* Problem prompt */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <p className="text-lg text-slate-800 leading-relaxed">
          {questionContext}
        </p>
      </div>

      {/* Question phases */}
      {phase === 'type' && (
        <TypeQuestion
          question={currentQuestion}
          onAnswer={handleTypeAnswer}
        />
      )}

      {phase === 'strategy' && currentResult && (
        <StrategyQuestion
          question={currentQuestion}
          typeWasCorrect={currentResult.typeCorrect}
          onAnswer={handleStrategyAnswer}
        />
      )}

      {phase === 'feedback' && currentResult && (
        <div className="flex-1 flex flex-col">
          {/* Feedback display */}
          <div className={`rounded-xl p-4 ${
            currentResult.typeCorrect && currentResult.strategyCorrect
              ? 'bg-green-50 border border-green-200'
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <div className="space-y-3">
              {/* Type result */}
              <div className="flex items-start gap-2">
                <span className={currentResult.typeCorrect ? 'text-green-600' : 'text-amber-600'}>
                  {currentResult.typeCorrect ? '✓' : '○'}
                </span>
                <div>
                  <span className="font-medium text-slate-700">Typ: </span>
                  <span className={currentResult.typeCorrect ? 'text-green-700' : 'text-amber-700'}>
                    {typeLabel}
                  </span>
                </div>
              </div>

              {/* Strategy result */}
              <div className="flex items-start gap-2">
                <span className={currentResult.strategyCorrect ? 'text-green-600' : 'text-amber-600'}>
                  {currentResult.strategyCorrect ? '✓' : '○'}
                </span>
                <div>
                  <span className="font-medium text-slate-700">Strategie: </span>
                  <span className={currentResult.strategyCorrect ? 'text-green-700' : 'text-amber-700'}>
                    {correctStrategy}
                  </span>
                </div>
              </div>

              {/* Explanation */}
              <div className="pt-2 border-t border-slate-200 mt-2">
                <p className="text-slate-600 text-sm">
                  {explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

export default TypeDrill
