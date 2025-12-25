# ADR-012: Pythagorean Theorem in Lightning Round

## Status
Accepted

## Date
2024-12-25

## Context

Lightning Round obsahuje pouze "o X více/méně" drill. Pro komplexnější procvičování je potřeba přidat další témata, začínaje Pythagorovou větou (jedna z Anežčiných silných stránek).

## Decision

Přidat kategorii Pythagorova věta (PYTH) do Lightning Round se třemi typy otázek.

### Tři typy otázek v mixu

#### 1. Výpočet (calculation)
Rychlý drill na výpočet.

| Formát | Příklad | Odpověď |
|--------|---------|---------|
| Vzorcem | a=3, b=4, c=? | 5 |
| Slovně | Odvěsny 3 a 4. Přepona? | 5 |
| Vizuálně | [trojúhelník] c=? | 5 |

#### 2. Vzorec (type_recognition)
Jaký vzorec použít v rámci Pythagorovy věty.

| Prompt | Správně | Distractor |
|--------|---------|------------|
| Hledám přeponu c = | √(a² + b²) | a + b |
| Hledám odvěsnu a = | √(c² - b²) | c - b |

#### 3. Rozpoznej typ (problem_type)
Klasifikace typu úlohy (jako v TypeDrill).

| Prompt | Správně | Distractors |
|--------|---------|-------------|
| "Odvěsny jsou 3 a 4. Jaká je přepona?" | Pythagorova věta | Obvod/obsah, Rovnice |
| "Je trojúhelník 5,12,13 pravoúhlý?" | Pythagorova věta | Konstrukce, Posloupnost |

### Obtížnosti

1. **Základní trojice** (memorizable): (3,4,5), (5,12,13), (6,8,10)
2. **Rozšířené**: (8,15,17), (7,24,25), (9,40,41)
3. **S odmocninami**: výsledek √13, √29, √41

### Data Structure

```json
{
  "id": "PYTH-01",
  "type": "calculation",
  "format": "formula",
  "question": "a = 3, b = 4, c = ?",
  "correct": "5",
  "distractors": ["7", "12"],
  "hint": {
    "rule": "c² = a² + b²",
    "explanation": "c = √(9 + 16) = √25 = 5"
  }
}
```

### Výběr kategorie

Přidat možnost výběru kategorie na úvodní obrazovce Lightning Round:
- o X více/méně (OXV)
- Pythagorova věta (PYTH)
- Mix všech (budoucí)

## Consequences

### Positive
- Rozšiřuje drill o další téma
- Tři typy otázek posilují různé aspekty učení
- Začíná se silnou stránkou (confidence building)

### Negative
- Více dat v JSON
- UI pro výběr kategorie

## Related

- ADR-011: Type Recognition in Lightning Round
- EDR-002: Lightning Round design
