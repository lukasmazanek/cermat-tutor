# ADR-030: Strategy Distractors

**Date:** 2025-12-31
**Status:** Accepted
**Type:** Feature/Training
**Related:** [ADR-008](ADR-008-type-recognition-drill.md), [ADR-022](ADR-022-multi-mode-questions.md)

## Context

V "Rozpoznej typ" drillu (ADR-008) má každá otázka dvě fáze:
1. **Typ úlohy** - 3-4 možnosti (funguje dobře)
2. **Strategie** - pouze 2 možnosti u většiny témat (problém!)

### Aktuální stav

```typescript
// TypeDrill/index.tsx:48-57
function getStrategyDistractors(topic: string): string[] {
  const map: Record<string, string[]> = {
    'o_x_vice': ['+ zlomek', '÷ zlomek'],
    'equations': ['Vytýkej', 'Rozlož'],
    'fractions': ['Násob přímo', 'Převrať'],
    'pythagorean': ['a + b', 'a × b']
  }
  return map[topic] || ['Jiná strategie']  // ← PROBLÉM
}
```

**Výsledek:** 22 z 26 témat má pouze 2 možnosti (1 správná + "Jiná strategie"), což je:
- Triviální (50% šance na úspěch hádáním)
- Needukovatelné ("Jiná strategie" nic neučí)
- Nekonzistentní s TypeQuestion (3-4 možnosti)

## QAR Summary

| # | Otázka | Rozhodnutí |
|---|--------|------------|
| Q1 | Kde mají distraktory žít? | **D** - Hybrid: question → topic → generic |
| Q2 | Kolik distraktorů minimum? | **A** - 2 distraktory (3 možnosti celkem) |
| Q3 | Co mají distraktory reprezentovat? | **B** - Časté chyby/misconceptions |

## Decision

### 1. Tříúrovňová hierarchie distraktorů

```
Priorita 1: question.modes.strategy_recognition.distractors
    ↓ (pokud chybí)
Priorita 2: TOPIC_STRATEGY_DISTRACTORS[topic]
    ↓ (pokud chybí)
Priorita 3: ["Jiná strategie", "Zkusit tipnout"]
```

### 2. Topic-level defaults

Pokrytí všech 26 témat s misconception-based distraktory:

```typescript
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

  // Procenta
  'percentages': ['Vydělit 100', 'Přičíst procenta'],

  // Poměry
  'ratios': ['Sečíst části', 'Vydělit části'],

  // Pravděpodobnost
  'probability': ['Sečíst pravděpodobnosti', 'Násobit vše'],

  // Měřítko
  'scale': ['× měřítko', '÷ měřítko (obráceně)'],

  // Slovní úlohy
  'word_problems': ['Sečíst všechna čísla', 'Použít první operaci'],

  // Grafy a tabulky
  'graphs_tables': ['Odečíst z osy', 'Průměr hodnot'],

  // Soustavy rovnic
  'systems': ['Sečíst rovnice', 'Dosadit bez úpravy'],

  // Nerovnice
  'inequalities': ['Změnit znaménko vždy', 'Nezměnit znaménko nikdy'],

  // Mocniny
  'powers': ['Sečíst exponenty', 'Násobit exponenty'],

  // Odmocniny
  'roots': ['Odmocnit každý člen', 'Vydělit 2'],

  // Výrazy
  'expressions': ['Sečíst koeficienty', 'Násobit vše'],

  // Absolutní hodnota
  'absolute_value': ['Odstranit závorky', 'Změnit znaménko'],

  // Funkce
  'functions': ['Dosadit do x', 'Vyřešit pro y']
}
```

### 3. Question-level override (volitelné)

Pro otázky s konkrétními misconceptions lze přidat do dat:

```json
{
  "id": "oxv-001",
  "modes": {
    "strategy_recognition": {
      "answer": "× (1 + 1/3)",
      "distractors": ["+ 1/3", "÷ 3"]
    }
  }
}
```

## Implementation

### Změny v TypeDrill/index.tsx

```typescript
// Nová konstanta s topic defaults
const TOPIC_STRATEGY_DISTRACTORS: Record<string, string[]> = {
  // ... viz výše
}

// Upravená funkce
function getStrategyDistractors(question: TypeDrillQuestion): string[] {
  // 1. Question-level (highest priority)
  const strategyMode = question.modes?.strategy_recognition
  if (strategyMode?.distractors?.length >= 2) {
    return strategyMode.distractors
  }

  // 2. Topic-level defaults
  const topicDistractors = TOPIC_STRATEGY_DISTRACTORS[question.topic]
  if (topicDistractors?.length >= 2) {
    return topicDistractors
  }

  // 3. Generic fallback (should be rare)
  return ['Jiná strategie', 'Tipnout odpověď']
}
```

### Změny v StrategyQuestion.tsx

```typescript
// Aktuálně:
...question.strategyDistractors.map(d => ({ id: d, label: d, isCorrect: false }))

// Beze změny - jen dostane lepší data
```

## Psychological Safety

| Princip | Implementace |
|---------|--------------|
| Misconception-based | Distraktory = časté chyby = učí i špatnou volbou |
| Consistent difficulty | 3 možnosti vždy (ne 2 vs 4) |
| No "trap" answers | Distraktory jsou plausible, ne zjevně špatné |
| Learning from errors | Feedback vysvětlí proč je distraktor špatný |

## Implementation Checklist

- [x] Přidat `TOPIC_STRATEGY_DISTRACTORS` konstantu do TypeDrill/index.tsx
- [x] Upravit `getStrategyDistractors()` na tříúrovňovou hierarchii
- [x] Aktualizovat typy (přijímá `UnifiedQuestion` místo `string`)
- [x] Filtrovat otázky bez strategie (`q.solution.strategy` required)
- [ ] Volitelně: přidat `strategy_recognition` mode do kritických otázek
- [x] Test a deploy

## Consequences

**Positive:**
- Konzistentní 3 možnosti ve všech tématech
- Edukovatelné distraktory (časté chyby)
- Flexibilní hierarchie pro budoucí rozšíření
- Follows ADR-022 pattern (multi-mode questions)

**Negative:**
- Větší kódová základna (26 topic entries)
- Některé distraktory jsou generické (potřeba iterovat)

## Future Extensions

1. **Analytics na distraktory** - které jsou nejčastěji vybírány → identifikace misconceptions
2. **A/B testing** - různé distraktory pro různé studenty
3. **Adaptive distractors** - personalizované podle chyb studenta

## Related

- [ADR-008](ADR-008-type-recognition-drill.md) - Type Recognition Drill
- [ADR-022](ADR-022-multi-mode-questions.md) - Multi-Mode Questions
- [EDR-001](EDR-001-atomic-skills-approach.md) - Atomic Skills (misconceptions as targets)
