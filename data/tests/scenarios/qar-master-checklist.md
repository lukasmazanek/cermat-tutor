# QAR Master Checklist

Complete Quality Assurance Regression checklist covering all ADRs.

## Pre-Test Setup

- [ ] Clear localStorage (`localStorage.clear()`)
- [ ] Test on real mobile device (not just DevTools)
- [ ] Have desktop browser ready
- [ ] App URL: https://lukasmazanek.github.io/tutor/

---

## 0. Screen Inventory (ADR-015)

| Screen | Category | BottomBar | Layout Template |
|--------|----------|-----------|-----------------|
| TopicSelector | HOME | No | Grid centered |
| ProblemCard | PROBLEM | Yes (5 slots) | h-[100dvh] flex |
| TypeDrill | SELECTION→PROBLEM | Yes | h-[100dvh] flex |
| TypeDrill/Summary | CENTERED | Yes (restart) | Centered card |
| LightningRound | PROBLEM | Yes | h-[100dvh] flex |
| LightningRound/Summary | CENTERED | Yes (restart) | Centered card |
| ProgressPage | DASHBOARD | Yes (1 slot) | Scrollable list |
| SessionSummary | CENTERED | No (CTA only) | Centered card |
| VisualExplainer | TUTORIAL | Yes | Step carousel |

---

## 1. Core Flows

### Flow A: Topic Practice (ProblemCard)
- [ ] TopicSelector loads
- [ ] Select "o X více/méně" topic
- [ ] ProblemCard displays question
- [ ] Virtual keyboard appears (mobile)
- [ ] Unit button shows when unit required (ADR-017)
- [ ] Enter correct answer → green feedback
- [ ] Auto-advance after 1.5s
- [ ] Enter wrong answer → amber feedback
- [ ] Hint button reveals progressive hints (ADR-005)
- [ ] After all hints → solution + "Pokračovat"
- [ ] Complete 6 problems → SessionSummary
- [ ] "Nová session" returns to home

### Flow B: Type Recognition Drill
- [ ] Start TypeDrill from home
- [ ] Strategy question displays
- [ ] 4 options rendered
- [ ] Correct answer → checkmark + auto-advance
- [ ] Wrong answer → show correct + manual continue
- [ ] Complete drill → Summary screen
- [ ] "Znovu" restarts drill
- [ ] Home button returns to TopicSelector

### Flow C: Lightning Round (ADR-007)
- [ ] Start Lightning from home
- [ ] Question displays with 3-4 options
- [ ] Correct → auto-advance (0.8s)
- [ ] Streak counter appears at ≥3
- [ ] Wrong → hint shows, manual continue
- [ ] Streak resets silently (no negative message)
- [ ] Complete → Summary with stats
- [ ] "Znovu" restarts
- [ ] Home returns to TopicSelector

### Flow D: Progress View
- [ ] Click progress icon from any screen
- [ ] ProgressPage loads with session history
- [ ] Sessions grouped by date
- [ ] Back button returns to previous screen

---

## 2. BottomBar Consistency (ADR-009)

### Slot Configuration by Screen

| Screen | Slot 1 | Slot 2 | Slot 3 | Slot 4 | Slot 5 |
|--------|--------|--------|--------|--------|--------|
| ProblemCard | home | progress | toggle | hint | submit/continue |
| TypeDrill | home | progress | - | - | skip |
| LightningRound | home | progress | - | - | continue |
| ProgressPage | home | - | - | - | - |
| Summary screens | home | progress | - | - | restart |

### Visual Checks
- [ ] Icons match across all screens (same Heroicon)
- [ ] Colors consistent (gray default, blue primary)
- [ ] Disabled state = 50% opacity
- [ ] Active toggle = indigo background
- [ ] Touch targets ≥ 44px

---

## 3. Math Input (ADR-017)

### Numeric Mode Tests
| Input | Expected | Accept? |
|-------|----------|---------|
| `400` | 400 | Yes |
| `500*0.8` | 400 | Yes |
| `500×0,8` | 400 | Yes |
| `500:1.25` | 400 | Yes |
| `200+200` (no original) | 400 | No (hint) |
| `400 Kč` | 400 Kč | Yes |
| `400` (unit required) | 400 Kč | No (hint about unit) |

### Symbolic Mode Tests
| Input | Expected | Accept? |
|-------|----------|---------|
| `1,3x` | 1.3x | Yes |
| `x*1.3` | 1.3x | Yes |
| `(1+0.3)x` | 1.3x | Yes |
| `6/5x` | 1.2x | Yes |
| `4/3x` | 4/3x | Yes |
| `1.3` (missing x) | 1.3x | No (hint) |

### Keyboard Tests (ADR-004)
- [ ] Mobile keyboard shows all needed keys
- [ ] Unit button replaces √ when unit required
- [ ] `×` button works
- [ ] `÷` button works
- [ ] `x` (variable) button works
- [ ] Backspace deletes correctly
- [ ] Decimal `,` works

---

## 4. Mobile Layout (ADR-010)

### Critical Checks
- [ ] `h-[100dvh]` on main container (not `min-h-screen`)
- [ ] `flex-1 min-h-0 overflow-y-auto` for scrollable content
- [ ] `pb-20` or `pb-24` before BottomBar
- [ ] No content hidden behind BottomBar
- [ ] Works with iOS address bar visible/hidden

### Real Device Test
- [ ] Load on actual iPhone/Android
- [ ] Scroll content fully visible
- [ ] BottomBar always accessible
- [ ] Virtual keyboard doesn't break layout
- [ ] No horizontal scroll

---

## 5. Progressive Hints (ADR-005)

- [ ] Hint button reveals first step
- [ ] Each tap reveals next step cumulatively
- [ ] Step counter shows (X/Y kroků)
- [ ] After all steps: solution box appears
- [ ] Input field hidden after solution
- [ ] "Pokračovat" button in BottomBar
- [ ] Falls back to hints[] if no solution_steps

---

## 6. Responsive Breakpoints (ADR-001)

### Mobile (< 640px)
- [ ] Single column layout
- [ ] Full-width cards
- [ ] Virtual keyboard visible
- [ ] Touch-friendly targets

### Tablet (640-1024px)
- [ ] MC options in 2 columns
- [ ] Larger diagrams (h-32)
- [ ] More breathing room

### Desktop (> 1024px)
- [ ] max-w-2xl constraint
- [ ] Symbol bar instead of full keyboard (ADR-002)
- [ ] Hover states work

---

## 7. Psychological Safety

- [ ] No "Špatně" or negative words
- [ ] Feedback says "Zkus jiný přístup"
- [ ] Hints accessible without shame
- [ ] Progress shows growth, not failure
- [ ] Streak resets silently
- [ ] Encouraging language throughout

---

## 8. Data Validation (ADR-014, ADR-016)

Run before testing:
```bash
npm run validate
```

- [ ] All questions pass validation
- [ ] No embedded units in answer.correct
- [ ] Symbolic answers have numeric: null
- [ ] All required fields present

---

## Issue Tracking

### Critical Issues
(Block deploy)

### Major Issues
(Fix before next deploy)

### Minor Issues
(Track for later)

---

## Sign-off

- Tester: _____________
- Date: _____________
- Build: _____________
- Result: PASS / FAIL
