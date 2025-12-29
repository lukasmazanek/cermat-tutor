# ADR-024: SI Units for Answer Validation

## Status
Accepted

## Date
2025-12-29

## Context

When problems require answers with units (time, length, area, volume), we need a consistent system for:
1. What units to accept
2. How to display units on keyboard
3. How to validate user input

Previously, units were inconsistent:
- `hodiny`, `hodin`, `hodiny` (different Czech declensions)
- `dní`, `dne`, `dnů` (different forms)
- `malířů`, `kuchaři` (counting people)

This caused validation issues and required complex variant matching.

## Decision

### 1. Use SI-style abbreviations for all physical units

| Quantity | Unit | Symbol | Example |
|----------|------|--------|---------|
| Time (hours) | hodina | `h` | `2h` |
| Time (days) | den | `d` | `6d` |
| Time (minutes) | minuta | `min` | `30min` |
| Time (seconds) | sekunda | `s` | `45s` |
| Length | metr | `m` | `5m` |
| Length | centimetr | `cm` | `120cm` |
| Area | metr čtvereční | `m²` | `25m²` |
| Area | centimetr čtvereční | `cm²` | `100cm²` |
| Volume | metr krychlový | `m³` | `8m³` |
| Volume | litr | `l` | `500l` |
| Currency | koruna | `Kč` | `150Kč` |

### 2. Counting quantities have no unit

When the answer is a count of people, objects, etc., use `unit: null`:
- "Kolik malířů?" → `12` (not `12 malířů`)
- "Kolik kuchařů?" → `4` (not `4 kuchaři`)

### 3. Unit is required when specified

If `answer.unit` is set in data, the user MUST include the unit in their answer:
- Expected: `2h`
- User types: `2` → "Správně! Nezapomeň na jednotku: h"
- User types: `2h` → ✓ Correct

### 4. Keyboard displays unit in 6th column

When a problem has a unit, the mobile keyboard expands to 6 columns with the unit button:

```
7  8  9  ÷  ⌫  [h]
4  5  6  ×  ^
1  2  3  −  +
0  ,  √  (  )
```

### 5. No spaces between number and unit

Valid: `2h`, `100cm²`, `500Kč`
Invalid: `2 h`, `100 cm²`, `500 Kč`

This simplifies parsing and matches SI convention.

## Data Format

```json
{
  "answer": {
    "correct": "2",
    "unit": "h",
    "variants": []
  }
}
```

The `variants` array can include alternative correct answers (e.g., fractions), but NOT unit variations. Unit is always the SI symbol.

## Validation Logic (mathParser.js)

```javascript
// Extract unit from end of input
const { value, unit } = extractUnit(normalized, expectedUnit)

// If unit required but not found
if (expectedUnit && !foundUnit) {
  const hintType = valueCorrect ? 'missing_unit_correct' : 'missing_unit'
  return { isCorrect: false, hint: ... }
}

// Value must match AND unit must match (if required)
return { isCorrect: valueCorrect }
```

## Examples

| Problem | Correct Answer | User Input | Result |
|---------|----------------|------------|--------|
| "Za kolik hodin?" | `2h` | `2` | ❌ "Nezapomeň na jednotku: h" |
| "Za kolik hodin?" | `2h` | `2h` | ✓ |
| "Kolik malířů?" | `12` | `12` | ✓ |
| "Kolik cm²?" | `100cm²` | `100` | ❌ "Nezapomeň na jednotku: cm²" |
| "Kolik cm²?" | `100cm²` | `100cm²` | ✓ |

## Consequences

### Positive
- Consistent validation across all problems
- No need for Czech declension handling
- Keyboard can display exact unit to type
- Matches scientific/technical notation students will encounter

### Negative
- Less natural Czech ("2h" vs "2 hodiny")
- Students must learn SI abbreviations

### Neutral
- Aligns with CERMAT test format (which uses SI units)

## Related ADRs
- ADR-017: Math Input Language (defines parsing rules)
- ADR-020: Evaluatable Expected Values (numeric validation)
- ADR-022: Multi-mode Questions (where units are stored)
