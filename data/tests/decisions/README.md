# Test Decision Records (TDR)

This folder contains Test Decision Records - documented decisions about testing strategies, patterns, and processes for the CERMAT Math Tutor application.

## Index

| TDR | Title | Category | Status | Date |
|-----|-------|----------|--------|------|
| [TDR-001](TDR-001-mobile-layout-testing.md) | Mobile Layout Testing Pattern | Pattern | Accepted | 2024-12-25 |

## Categories

| Category | Description |
|----------|-------------|
| **Strategy** | Testing approach, priorities, coverage decisions |
| **Pattern** | Reusable testing patterns and checklists |
| **Process** | QA workflows, regression testing, deployment gates |
| **Tool** | Testing tools, automation, device lab decisions |

## Template

```markdown
# TDR-XXX: [Title]

## Status
Proposed | Accepted | Deprecated | Superseded by TDR-XXX

## Date
YYYY-MM-DD

## Category
Strategy | Pattern | Process | Tool

## Context
[What situation or problem prompted this decision?]

## Decision
[What testing decision was made?]

## Rationale
[Why was this decision made? What alternatives were considered?]

## Consequences

### Positive
- [Benefits of this decision]

### Negative
- [Drawbacks or trade-offs]

## Implementation

### Checklist
- [ ] Step 1
- [ ] Step 2

### Affected Scenarios
- [List of test scenarios impacted]

## Related
- [Links to ADRs, other TDRs, test scenarios]
```

## Relationship to Other Records

```
┌─────────────────┐     informs      ┌─────────────────┐
│      ADR        │ ───────────────► │      TDR        │
│ (Architecture)  │                  │ (Testing)       │
│                 │ ◄─────────────── │                 │
│                 │   validates      │                 │
└─────────────────┘                  └─────────────────┘
         │                                    │
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│      EDR        │                  │   Scenarios     │
│ (Educational)   │                  │ (Test Cases)    │
└─────────────────┘                  └─────────────────┘
```

## When to Create a TDR

Create a TDR when:
1. Establishing a new testing pattern (e.g., mobile layout testing)
2. Changing regression test scope
3. Adding/removing test scenarios
4. Defining deployment gates
5. Choosing testing tools or automation approach
6. Learning from production bugs (post-mortem → prevention)

## File Naming

Format: `TDR-XXX-short-description.md`

Examples:
- `TDR-001-mobile-first-testing.md`
- `TDR-002-qar-regression-checklist.md`
- `TDR-003-device-testing-matrix.md`
