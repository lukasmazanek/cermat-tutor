# ADR-025: Keyboard Block Layout

## Status
Accepted

## Date
2025-12-29

## Context

The mobile virtual keyboard needs a consistent, predictable layout. Previously, the keyboard layout changed significantly when optional keys (units, variables) were present, causing user confusion as key positions shifted.

Users expect:
1. Numbers and basic input keys to always be in the same position
2. Operators to be visually distinct and stable
3. Optional keys (units, variables) to appear without disrupting the core layout

## Decision

### Three-Block Architecture

The keyboard is divided into 3 distinct visual blocks:

```
┌─────────────┬─────────────┬─────────────┐
│   BLOCK 1   │   BLOCK 2   │   BLOCK 3   │
│   Numbers   │  Operators  │   Extras    │
│   (gray)    │  (purple)   │   (teal)    │
│   FIXED     │   FIXED     │  OPTIONAL   │
└─────────────┴─────────────┴─────────────┘
```

### Block 1: Numbers (Columns 1-3, gray)
- Always present, position never changes
- Contains: 0-9, decimal comma (,), delete (⌫)
- Color: `bg-slate-100` (gray)

Layout:
```
7  8  9
4  5  6
1  2  3
0  ,  ⌫
```

### Block 2: Operators (Columns 4-5, purple)
- Always present, position never changes
- Contains: ÷, ×, −, +, ^, √, (, )
- Color: `bg-purple-100` (purple)

Layout:
```
÷  ^
×  √
−  +
(  )
```

### Block 3: Extras (Column 6, teal) - OPTIONAL
- Only appears when unit or variable is needed
- Contains: unit (h, d, cm², etc.), variable (x, n, etc.)
- Color: `bg-teal-100` (teal/cyan)
- Position: Row 1 = unit (if present), Row 2 = variable (if present)

Layout (when present):
```
[unit]
[var]


```

### Complete Layouts

**Base (5 columns) - No extras:**
```
7  8  9  ÷  ^
4  5  6  ×  √
1  2  3  −  +
0  ,  ⌫  (  )
```

**Extended (6 columns) - With unit and/or variable:**
```
7  8  9  ÷  ^  [h]
4  5  6  ×  √  [x]
1  2  3  −  +
0  ,  ⌫  (  )
```

### Key Stability Guarantee

The position of ALL keys in Blocks 1 and 2 remains **identical** regardless of whether Block 3 is present. This ensures:
- Muscle memory works consistently
- No accidental key presses due to layout shift
- Predictable user experience

### Color Scheme

| Block | Background | Text | Purpose |
|-------|------------|------|---------|
| Block 1 | `bg-slate-100` | `text-slate-800` | Numbers, comma, delete |
| Block 1 (⌫) | `bg-red-50` | `text-red-600` | Delete key (distinct) |
| Block 2 | `bg-purple-100` | `text-purple-700` | Operators |
| Block 3 | `bg-teal-100` | `text-teal-700` | Extras (unit, variable) |

## Implementation

```jsx
// Always 4 rows
// Columns: 5 base, 6 with extras
const hasExtras = variableKey || answerUnit
const gridCols = hasExtras ? 'grid-cols-6' : 'grid-cols-5'

// Block 1: Numbers (positions fixed)
// Block 2: Operators (positions fixed)
// Block 3: Extras (only rendered when needed)
```

## Consequences

### Positive
- Consistent key positions across all problem types
- Clear visual distinction between key types
- Optional keys don't disrupt core layout
- Better muscle memory for frequent users

### Negative
- Slightly wider keyboard when extras present (6 vs 5 columns)
- Empty cells in Block 3 rows 3-4 when extras present

### Neutral
- Delete key remains in Block 1 (with numbers) but has distinct red color

## Related ADRs
- ADR-024: SI Units (defines what units appear in Block 3)
- ADR-017: Math Input Language (defines input parsing)
