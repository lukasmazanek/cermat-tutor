# ADR-026: Action Buttons at Top

## Status
Accepted

## Date
2025-12-29

## Context

As topics grow (currently 9), action buttons (Bleskové kolo, Rozpoznej typ, Mix všeho, Můj pokrok) get pushed below the fold. Users must scroll to access key functionality.

**Problem:** Quick actions should be immediately visible, especially "Můj pokrok" which supports the "Závod sama se sebou" intervention.

## Decision

### 1. Position: Action buttons ABOVE topic grid

```
┌─────────────────────────────────────┐
│  Header: "Co dnes prozkoumáme?"     │
├─────────────┬─────────────┬─────────┤
│  Můj pokrok │  Mix všeho  │  ACTION │
├─────────────┼─────────────┤  BUTTONS│
│  Bleskové   │ Rozpoznej   │  (top)  │
│    kolo     │    typ      │         │
├─────────────┴─────────────┴─────────┤
│  Průměry    │ Umocňování  │  TOPIC  │
├─────────────┼─────────────┤  GRID   │
│  Rovnice    │  Zlomky     │ (scroll)│
│    ...      │    ...      │         │
└─────────────────────────────────────┘
```

### 2. Order: Progress first

1. **Můj pokrok** (purple) - "Závod sama se sebou" intervention support
2. **Mix všeho** (blue) - Most common action
3. **Bleskové kolo** (amber) - Atomic skills drill
4. **Rozpoznej typ** (indigo) - Type recognition

### 3. Layout: 2×2 grid

- Consistent with topic grid (2 columns)
- Large touch targets maintained
- All 4 buttons visible without scroll

## Psychological Rationale

- **Progress first:** Reinforces "race against yourself" framing before seeing topics
- **Immediate visibility:** Reduces decision paralysis - clear actions available
- **Consistent layout:** 2×2 grid matches topic grid, predictable interface

## Implementation

In `TopicSelector.tsx`:

```tsx
// Order: Header → Action buttons (2×2) → Topic grid
<div>
  <Header />

  {/* Action buttons - always visible */}
  <div className="grid grid-cols-2 gap-2 mb-4">
    <ProgressButton />   {/* Můj pokrok */}
    <MixButton />        {/* Mix všeho */}
    <LightningButton />  {/* Bleskové kolo */}
    <TypeDrillButton />  {/* Rozpoznej typ */}
  </div>

  {/* Topic grid - scrollable */}
  <div className="grid grid-cols-2 gap-2">
    {topics.map(...)}
  </div>
</div>
```

## Consequences

### Positive
- Action buttons always visible on load
- "Můj pokrok" prominently placed for intervention support
- Scalable - topic list can grow without hiding actions
- Consistent 2-column layout throughout

### Negative
- Topics pushed down slightly (4 button slots = 2 rows)
- Less space for "last session" message

### Neutral
- Button styling remains unchanged
- Topic grid unchanged except position

## Related ADRs
- ADR-009: Centralized BottomBar (bottom navigation)
- ADR-006: UI Zones Layout (zone organization)
