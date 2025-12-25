# ADR-010: Mobile-Safe Layout Pattern

## Status
Accepted

## Date
2024-12-25

## Context

During QAR testing, a critical production bug was discovered on iOS devices where content was hidden behind the BottomBar. The root causes were:

1. `min-h-screen` doesn't work correctly with iOS dynamic viewport (address bar show/hide)
2. `flex-1 overflow-auto` doesn't enable scrolling without `min-h-0`
3. Missing padding for BottomBar space

This affected the LightningRound component where answer options were cut off on mobile.

## Decision

All screens with scrollable content and BottomBar MUST use this pattern:

```jsx
<div className="h-[100dvh] flex flex-col overflow-hidden">
  <header>...</header>
  <main className="flex-1 min-h-0 overflow-y-auto pb-20">
    {/* content */}
  </main>
  <BottomBar />
</div>
```

### Key Elements

| Element | Purpose |
|---------|---------|
| `h-[100dvh]` | Dynamic viewport height - works with iOS address bar |
| `flex flex-col` | Vertical layout for header/content/footer |
| `overflow-hidden` | Prevents body scroll, contains scroll to main |
| `flex-1` | Main content takes remaining space |
| `min-h-0` | **CRITICAL** - enables flex child to shrink below content height |
| `overflow-y-auto` | Enables vertical scrolling in main content |
| `pb-20` | Padding for BottomBar (80px = h-16 + safe area) |

### Wrong vs Correct

| Wrong | Correct |
|-------|---------|
| `min-h-screen` | `h-[100dvh]` |
| `flex-1 overflow-auto` | `flex-1 min-h-0 overflow-y-auto` |
| No bottom padding | `pb-20` or `pb-24` |

## Affected Components

Components that MUST follow this pattern:

| Component | Has BottomBar | Scrollable | Status |
|-----------|---------------|------------|--------|
| ProblemCard | Yes | Yes | Verify |
| TypeDrill | Yes | Yes | Verify |
| LightningRound | Yes | Yes | **Fixed** |
| ProgressPage | Yes | Yes | Verify |

Components that DON'T need this pattern:
- TopicSelector (no BottomBar, home screen)
- SessionSummary (no BottomBar, CTA only)
- TypeDrill/Summary (no BottomBar, CTA only)
- LightningRound/Summary (no BottomBar, CTA only)

## Psychological Rationale

For anxious learners like our target user:

1. **Predictability** - Same experience across all devices reduces uncertainty
2. **No hidden content** - Seeing all options reduces anxiety about "missing something"
3. **Smooth scrolling** - Natural interaction builds confidence in the app

## Testing Requirements

Added to /test QAR checklist (Section 3a):

1. Open on REAL mobile device (not just DevTools)
2. Verify ALL interactive elements are visible
3. Verify scroll works
4. Test with address bar open/closed

## Consequences

### Positive
- Consistent mobile experience across iOS and Android
- No content hidden by BottomBar
- Smooth scrolling behavior
- Prevents future mobile layout bugs

### Negative
- Slightly more complex layout structure
- Requires understanding of flex layout behavior
- Must remember `min-h-0` (easy to forget)

## Related

- ADR-009: Centralized UI Controls (BottomBar)
- /test: QAR Section 3a (Mobile Layout Critical Checks)
