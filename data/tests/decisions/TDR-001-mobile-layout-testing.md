# TDR-001: Mobile Layout Testing Pattern

## Status
Accepted

## Date
2024-12-25

## Category
Pattern

## Context

During QAR testing on 2024-12-25, a critical production bug was discovered on iOS devices in the LightningRound component. Answer options were cut off and hidden behind the BottomBar, making the app unusable on mobile.

**Root causes identified:**
1. `min-h-screen` doesn't work correctly with iOS dynamic viewport (address bar show/hide)
2. `flex-1 overflow-auto` doesn't enable scrolling without `min-h-0`
3. Missing bottom padding for BottomBar space

**Why it wasn't caught earlier:**
- Testing was done in Chrome DevTools mobile emulation, not on real devices
- DevTools doesn't simulate iOS dynamic viewport behavior
- No systematic mobile layout checklist existed

## Decision

All screens with scrollable content and BottomBar MUST be tested using the Mobile Layout Critical Checks pattern before deployment.

### Mandatory Checks

| Check | What to Look For | Correct Pattern |
|-------|------------------|-----------------|
| Viewport height | `min-h-screen` on main container | Use `h-[100dvh]` instead |
| Flex scroll | `flex-1 overflow-auto` without `min-h-0` | Add `min-h-0` |
| BottomBar space | Missing bottom padding | Add `pb-20` or `pb-24` |
| Content cut-off | Last element hidden by BottomBar | Test on real device |

### Required Test Procedure

1. Open on **REAL mobile device** (not just DevTools)
2. Verify ALL interactive elements are visible
3. Verify scroll works smoothly
4. Test with address bar open AND closed
5. Test in both portrait and landscape

### Devices for Testing

| Priority | Device Type | Why |
|----------|-------------|-----|
| **Critical** | iPhone (Safari) | iOS dynamic viewport, most problematic |
| **Critical** | Android (Chrome) | Primary mobile browser |
| High | iPad | Tablet breakpoint validation |
| Medium | Desktop browsers | Baseline functionality |

## Rationale

**Why real device testing is mandatory:**
- Chrome DevTools mobile emulation does NOT simulate iOS Safari dynamic viewport
- The `100vh` vs `100dvh` difference only manifests on real iOS devices
- Touch scrolling behavior differs from mouse scrolling
- Address bar hide/show affects available viewport height

**Why this pattern prevents bugs:**
- `h-[100dvh]` uses dynamic viewport height that adjusts with address bar
- `min-h-0` allows flex children to shrink below their content height (enables scroll)
- `pb-20` ensures content isn't hidden behind fixed BottomBar

## Consequences

### Positive
- Prevents content cut-off bugs on iOS
- Consistent scroll behavior across all devices
- Catches mobile-specific issues before deployment
- Builds confidence in mobile experience

### Negative
- Requires access to real iOS device for testing
- Adds time to QA process
- May slow down rapid iteration

### Mitigation
- Use BrowserStack or similar for device access if physical device unavailable
- Include mobile check as part of standard PR review
- Automate visual regression testing in future

## Implementation

### QAR Checklist Addition

Added to `/test` role in Section 3a: Mobile Layout Critical Checks

```markdown
### 3a. Mobile Layout Critical Checks (MANDATORY)

| Check | What to Look For | Correct |
|-------|------------------|---------|
| Viewport height | `min-h-screen` on main container | Use `h-[100dvh]` |
| Flex scroll | `flex-1 overflow-auto` without `min-h-0` | Add `min-h-0` |
| BottomBar space | Missing `pb-20` or `pb-24` | Add padding |
| Content cut-off | Last element hidden by BottomBar | Test on real device |

**Test procedure:**
1. Open on REAL mobile device (not just DevTools)
2. Verify ALL interactive elements are visible
3. Verify scroll works
4. Test with address bar open/closed
```

### Affected Scenarios

All scenarios involving screens with BottomBar:
- `topic_practice.md` - ProblemCard screen
- `type_drill.md` - TypeDrill screen
- `lightning_round.md` - LightningRound screen
- `progress_view.md` - ProgressPage screen

### Screen Inventory Check

Before any deployment, verify all screens use correct pattern:

| Screen | Expected Pattern | Verified |
|--------|------------------|----------|
| ProblemCard | `h-[100dvh]` + `min-h-0` + `pb-20` | ✓ |
| TypeDrill | `h-[100dvh]` + `min-h-0` + `pb-20` | ✓ |
| LightningRound | `h-[100dvh]` + `min-h-0` + `pb-20` | ✓ |
| ProgressPage | `h-[100dvh]` + `min-h-0` + `pb-20` | ✓ |

## Touch State Testing (Added 2024-12-25)

### Problem: Sticky Hover/Focus on Touch Devices

On touch devices, CSS `:hover` and `:focus` states can persist after tapping ("sticky states"). This causes visual bugs where buttons appear selected when they shouldn't be.

### Forbidden Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| `hover:border-*` | Border stays after tap | Remove or use `md:hover:` |
| `focus:border-*` | Focus persists across questions | Use `focus:outline-none` only |
| `active:border-*` | Can persist on some browsers | Use `active:bg-*` instead |

### Safe Patterns for Touch

```jsx
// GOOD - background changes don't persist
className="active:bg-amber-50 active:scale-[0.98] focus:outline-none"

// BAD - border/outline can persist on touch
className="hover:border-amber-300 focus:border-amber-500 active:border-amber-400"
```

### Key Strategy for Lists

When rendering lists where items change (e.g., quiz answers), use unique keys to force remount:

```jsx
// GOOD - forces remount on question change
<div key={question.id}>
  {answers.map((a, i) => (
    <button key={`${question.id}-${i}`}>...</button>
  ))}
</div>

// BAD - buttons persist, states leak
<div>
  {answers.map((a, i) => (
    <button key={i}>...</button>
  ))}
</div>
```

### Touch State Checklist

Before deploying any interactive component:

- [ ] No `hover:border-*` on touch-target buttons
- [ ] No `focus:border-*` (use `focus:outline-none` or `focus-visible:`)
- [ ] Use `active:bg-*` instead of `active:border-*`
- [ ] Lists use unique keys including parent ID
- [ ] Test on real iOS device (Safari)
- [ ] Tap multiple items rapidly - no ghost selections

## Related

- **ADR-010**: Mobile-Safe Layout Pattern (architecture decision)
- **ADR-009**: Centralized UI Controls (BottomBar specification)
- **/test role**: Section 3a added for this pattern
