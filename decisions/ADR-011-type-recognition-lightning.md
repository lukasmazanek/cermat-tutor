# ADR-011: Type Recognition Questions in Lightning Round

## Status
Accepted

## Date
2024-12-25

## Context

Anežka má misconception u "o X více/méně" - zaměňuje operace. Myslí si, že "o třetinu více" znamená přičíst 1/3 (konstantu), místo správného přičtení třetiny z původní hodnoty (což je násobení).

Lightning Round je ideální pro quick-fire drill, ale testuje pouze výpočet, ne pochopení operace.

## Decision

Přidat otázky na rozpoznání operace jako **samostatné položky** v Lightning Round mixu.

### Formát otázek

Prompt ve tvaru: `o [zlomek] více/méně než x =`

Dva formáty odpovědí (střídají se):

**Formát násobení:**
| Prompt | Správně | Distractor |
|--------|---------|------------|
| o třetinu více než x = | x × 4/3 | x × 1/3 |
| o čtvrtinu méně než x = | x × 3/4 | x × 1/4 |
| o polovinu více než x = | x × 3/2 | x × 1/2 |

**Formát sčítání:**
| Prompt | Správně | Distractor |
|--------|---------|------------|
| o třetinu více než x = | x + x/3 | x + 1/3 |
| o čtvrtinu méně než x = | x - x/4 | x - 1/4 |
| o polovinu více než x = | x + x/2 | x + 1/2 |

### Klíčový rozdíl (co učíme)

- ✓ **Správně**: třetina **z x** (relativní) → `x/3` nebo `x × 1/3`
- ✗ **Špatně**: třetina jako konstanta (absolutní) → `1/3`

### Mix strategie

- Náhodný poměr výpočtových a typových otázek
- Připraveno pro adaptivní poměr v budoucnu (na základě chybovosti)

## Data Structure

Nový typ otázky v `lightning_questions.json`:

```json
{
  "id": "type-001",
  "type": "type_recognition",
  "question": "o třetinu více než x =",
  "correct": "x × 4/3",
  "distractors": ["x × 1/3"],
  "hint": {
    "rule": "o třetinu více = násobit (1 + 1/3)",
    "explanation": "Přidáváme třetinu z x, ne konstantu 1/3"
  }
}
```

## Consequences

### Positive
- Interleaving výpočtů a typů posiluje učení
- Ověřuje pochopení, nejen mechanický výpočet
- Používá proměnnou x - učí obecný vzorec
- Dva formáty (násobení/sčítání) ukazují ekvivalenci

### Negative
- Rozšíření datové struktury
- Komponenta musí rozlišovat typy otázek

## Related

- ADR-009: Centralized UI Controls
- EDR-002: Lightning Round design
- TDR-001: Mobile Layout Testing (touch states)
