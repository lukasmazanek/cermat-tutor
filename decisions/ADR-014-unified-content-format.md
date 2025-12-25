# ADR-014: Unified Content Format

## Status
Accepted

## Date
2024-12-25

## Context

Máme duplicitní data v různých formátech:
- problem_bank.json (plné problémy)
- lightning_questions.json (MC drill)
- exercises/*.json (další cvičení)
- type_drill.json (type recognition)

Potřebujeme jeden zdrojový formát, ze kterého se generují všechny výstupní formáty.

## Decision

### Jednotný formát otázky

```json
{
  "id": "ox-001",
  "topic": "o_x_vice",
  "tags": ["procenta", "slovni-uloha"],
  "difficulty": 1,

  "question": {
    "stem": "o třetinu více než x =",
    "context": "Cena vzrostla o třetinu. Původní cena byla 120 Kč. Kolik stojí nyní?",
    "image": null
  },

  "answer": {
    "correct": "4/3 × x",
    "numeric": 160,
    "unit": "Kč",
    "variants": ["x × 4/3", "x + x/3", "1.333x"]
  },

  "distractors": [
    {
      "value": "x × 1/3",
      "error_type": "partial_multiplier",
      "explanation": "Násobí jen zlomkem, zapomíná že přidáváme K originálu"
    },
    {
      "value": "x + 1/3",
      "error_type": "additive_confusion",
      "explanation": "Přičítá konstantu 1/3 místo třetiny Z x"
    },
    {
      "value": "x + 40",
      "error_type": "numeric_guess",
      "explanation": "Tipuje číslo"
    }
  ],

  "hints": [
    {
      "level": 1,
      "text": "\"o třetinu více\" = původní + třetina z původního"
    },
    {
      "level": 2,
      "text": "Matematicky: x + x/3 = x × (1 + 1/3) = x × 4/3"
    }
  ],

  "solution": {
    "steps": [
      "o třetinu více = násobit (1 + 1/3)",
      "= násobit 4/3",
      "120 × 4/3 = 160 Kč"
    ],
    "strategy": "× (1 + zlomek)"
  },

  "meta": {
    "type_id": "WORD-OXVICE",
    "type_label": "o X více/méně",
    "source": "CERMAT-2022",
    "created": "2024-12-25"
  }
}
```

### Pole a jejich využití

| Pole | Lightning | ProblemCard | TypeDrill | Flashcard |
|------|-----------|-------------|-----------|-----------|
| `question.stem` | ✓ otázka | - | - | front |
| `question.context` | - | ✓ zadání | ✓ prompt | - |
| `answer.correct` | ✓ správně | ✓ odpověď | - | back |
| `answer.numeric` | - | ✓ validace | - | - |
| `distractors[].value` | ✓ možnosti | - | - | - |
| `hints[]` | ✓ hint | ✓ hinty | - | - |
| `solution.steps` | - | ✓ kroky | - | back |
| `solution.strategy` | - | - | ✓ správná | - |
| `meta.type_id` | - | - | ✓ správný typ | - |

### Generování výstupů

```javascript
// Lightning format
function toLightning(q) {
  return {
    id: q.id,
    question: q.question.stem,
    correct: q.answer.correct,
    distractors: q.distractors.map(d => d.value),
    hint: q.hints[0]?.text
  }
}

// ProblemCard format
function toProblemCard(q) {
  return {
    id: q.id,
    problem_cs: q.question.context || q.question.stem,
    answer: q.answer.numeric || q.answer.correct,
    answer_unit: q.answer.unit,
    hints: q.hints.map(h => h.text),
    solution_steps: q.solution.steps
  }
}

// TypeDrill format
function toTypeDrill(q, taxonomy) {
  return {
    id: q.id,
    prompt: q.question.context,
    type: {
      correct: q.meta.type_id,
      correct_label: q.meta.type_label,
      distractors: taxonomy.getDistractorsFor(q.meta.type_id)
    },
    strategy: {
      correct: q.solution.strategy,
      distractors: taxonomy.getStrategyDistractors(q.topic)
    }
  }
}
```

### Struktura souborů

```
data/
├── source/
│   ├── content/
│   │   ├── o_x_vice.json       # Array of unified questions
│   │   ├── equations.json
│   │   ├── pythagorean.json
│   │   ├── fractions.json
│   │   └── constructions.json
│   │
│   ├── taxonomy.json           # Type hierarchy + strategies
│   └── error_patterns.json     # Common errors by topic
│
├── generated/                  # Output of build step
│   ├── lightning.json
│   ├── problem_card.json
│   ├── type_drill.json
│   └── flashcards.json
│
└── student/
    └── profiles/
        └── anezka_mazankova.json
```

### Migrace

1. Extrahovat unikátní otázky ze všech současných souborů
2. Konvertovat do unified formátu
3. Vytvořit generovací skripty
4. Smazat duplicitní soubory

## Consequences

### Positive
- Jeden zdroj pravdy
- Snadné přidávání nových otázek
- Konzistentní metadata
- Generované formáty vždy synchronizované

### Negative
- Větší upfront práce (migrace)
- Komplexnější source formát
- Nutnost generovacího kroku

## Open Questions

1. Jak řešit otázky které existují jen v jednom formátu? (např. čistě drill bez kontextu)
2. Jak verzovat obsah?
3. Kde ukládat studentův progress?
