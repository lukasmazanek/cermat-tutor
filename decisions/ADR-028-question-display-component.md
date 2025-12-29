# ADR-028: QuestionDisplay Component

## Status
Accepted

## Date
2025-12-29

## Context

DiagramRenderer is currently imported and used independently in multiple components:
- `ProblemCard.tsx`
- `LightningRound/Question.tsx`
- `LightningRound/Feedback.tsx`

Each component independently:
1. Imports DiagramRenderer
2. Checks if `question.diagram` exists
3. Renders the diagram with similar styling

**Problem:** When adding new pages/components that display questions, developers must remember to add diagram support. This has caused bugs multiple times (Lightning Round missing diagrams on questions, then on feedback).

## Decision

### Create a centralized `QuestionDisplay` component

```tsx
// components/QuestionDisplay.tsx
interface QuestionDisplayProps {
  question: {
    question: { stem?: string; context?: string }
    diagram?: DiagramConfig
  }
  className?: string
  textClassName?: string
}

function QuestionDisplay({ question, className, textClassName }: QuestionDisplayProps) {
  const text = question.question.context || question.question.stem || ''

  return (
    <div className={className}>
      {question.diagram && (
        <DiagramRenderer diagram={question.diagram} />
      )}
      <p className={textClassName}>
        {text}
      </p>
    </div>
  )
}
```

### Usage

```tsx
// Before (each component)
{question.diagram && <DiagramRenderer diagram={question.diagram} />}
<p className="...">{question.question.stem || question.question.context}</p>

// After (one line)
<QuestionDisplay question={question} className="..." />
```

### Components to refactor

| Component | Current | After |
|-----------|---------|-------|
| ProblemCard.tsx | DiagramRenderer + stem | QuestionDisplay |
| LightningRound/Question.tsx | DiagramRenderer + stem | QuestionDisplay |
| LightningRound/Feedback.tsx | DiagramRenderer + stem | QuestionDisplay |
| TypeDrill/index.tsx | stem only | QuestionDisplay |

## Consequences

### Positive
- **Single source of truth** for question rendering
- **Automatic diagram support** - new pages can't forget diagrams
- **Consistent styling** - text and diagram always styled the same
- **Easier maintenance** - change once, applies everywhere
- **Reduced code duplication**

### Negative
- Minor refactoring effort for existing components
- Slightly less flexibility (mitigated by className props)

### Neutral
- DiagramRenderer still exists as internal implementation detail
- No change to question data structure

## Implementation Plan

1. Create `components/QuestionDisplay.tsx`
2. Add props for className customization
3. Refactor ProblemCard.tsx
4. Refactor LightningRound/Question.tsx
5. Refactor LightningRound/Feedback.tsx
6. Refactor TypeDrill/index.tsx
7. Test all flows

## Related ADRs
- ADR-021: Automatic Geometry Diagrams
- ADR-027: Feedback Shows Question
