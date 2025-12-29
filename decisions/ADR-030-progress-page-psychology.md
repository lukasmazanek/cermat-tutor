# ADR-030: Progress Page Psychological Redesign

**Date:** 2024-12-29
**Status:** Accepted
**Role:** Psychologist + Architect

## Context

Stránka "Můj pokrok" zobrazuje statistiky o cvičení. Současný design obsahuje prvky, které mohou spouštět úzkost u studentky s přísným vnitřním kritikem:

- Procenta úspěšnosti (připomínají známky)
- Řazení podle nejnižší úspěšnosti (ukazuje "kde je špatná")
- Barevné kódování "struggling" oblastí
- Seznam ✓/○ (vypadá jako vysvědčení)
- Framing hintů jako "selhání"

## Decision

### Princip 1: Vést s RŮSTEM, ne stavem

```
PŘED:  "Úspěšnost: 45%"
PO:    "Tento týden +8 úloh oproti minulému"
```

Důvod: Růst je vždy pozitivní. Absolutní čísla jsou soud.

### Princip 2: Řadit podle SNAHY, ne úspěšnosti

```
PŘED:  Témata od nejhorší accuracy
PO:    Témata od nejvíce procvičované
```

Důvod: Snaha je pod její kontrolou. Úspěšnost ne vždy.

### Princip 3: Slavit KONZISTENCI

```
+ "Cvičíš už 3 dny v řadě!"
- NIKDY: "Propásla jsi 2 dny"
```

Důvod: Streak motivuje, guilt-tripping demotivuje.

### Princip 4: Normalizovat NÁPOVĚDY

```
PŘED:  "60% bez nápovědy" (hinty = selhání)
PO:    "Nápovědy ti pomohly v 8 úlohách" (hinty = nástroj)
```

Důvod: Ptát se na pomoc je skill, ne slabost.

### Princip 5: Odstranit PROCENTA

```
PŘED:  "45%", "80%"
PO:    "Zlepšuješ se ↑", "Tohle už zvládáš ⭐"
```

Důvod: Procenta spouští školní úzkost a srovnávání.

## Implementation

### Nová struktura stránky

```
┌─────────────────────────────────────┐
│  Můj pokrok                         │
│  Závod sama se sebou                │
├─────────────────────────────────────┤
│  🔥 X dní v řadě!                   │  ← Streak (jen když aktivní)
├─────────────────────────────────────┤
│  TENTO TÝDEN vs MINULÝ              │
│  ┌─────────┐  ┌─────────┐          │
│  │  +N     │  │  celkem │          │
│  │  úloh   │  │  prozk. │          │
│  └─────────┘  └─────────┘          │
├─────────────────────────────────────┤
│  CO PROZKOUMÁVÁŠ                    │
│  (řazeno podle aktivity, ne %)     │
│                                     │
│  Zlomky     ████████░░  15×        │
│  Rovnice    ██████░░░░  10×        │
├─────────────────────────────────────┤
│  TVŮJ RŮST                          │
│  (kvalitativní, ne číselný)        │
│                                     │
│  Zlomky: Zlepšuješ se ↑            │
│  Rovnice: Stabilní →               │
│  o X více: Objevuješ 🔍            │
└─────────────────────────────────────┘
```

### Odstraněné prvky

| Prvek | Důvod odstranění |
|-------|------------------|
| % accuracy prominentně | Spouští školní úzkost |
| Barevné kódování "struggling" | Stigmatizuje |
| Seznam ✓/○ | Připomíná vysvědčení |
| Řazení od nejhorší | Krmí vnitřního kritika |

### Nové prvky

| Prvek | Psychologický účel |
|-------|-------------------|
| Streak counter | Motivuje konzistenci |
| Týdenní porovnání | Ukazuje růst |
| Activity bars | Oceňuje snahu |
| Kvalitativní trendy | Feedback bez soudu |

### Trend algoritmus

```typescript
function getTrend(attempts: AttemptRecord[]): 'improving' | 'stable' | 'exploring' {
  if (attempts.length < 3) return 'exploring'  // Nová oblast

  const recent = attempts.slice(-5)
  const older = attempts.slice(-10, -5)

  if (older.length === 0) return 'exploring'

  const recentAccuracy = recent.filter(a => a.is_correct).length / recent.length
  const olderAccuracy = older.filter(a => a.is_correct).length / older.length

  if (recentAccuracy > olderAccuracy + 0.1) return 'improving'
  if (recentAccuracy < olderAccuracy - 0.1) return 'exploring'  // NE "declining"!
  return 'stable'
}
```

**Důležité:** Nikdy neříkáme "zhoršuješ se" - místo toho "objevuješ" (reframe jako učení).

## Psychological Safety Checklist

- [x] Žádná procenta prominentně
- [x] Žádné negativní framing
- [x] Hinty normalizované
- [x] Řazení podle snahy
- [x] Růst > absolutní stav
- [x] Streak bez guilt-trippingu

## Consequences

**Positive:**
- Snížení úzkosti při prohlížení pokroku
- Motivace přes růst a konzistenci
- Normalizace používání nápověd
- Focus na snahu (pod kontrolou) vs výsledky (méně pod kontrolou)

**Negative:**
- Méně "přesných" dat pro analytického rodiče
- Rodič může chtít vidět % (řešení: Supabase dashboard pro rodiče)

## Related

- [ADR-023](ADR-023-answer-persistence.md) - Data source (Supabase)
- [PDR-001](PDR-001-psychological-safety-review.md) - Psychological safety principles
- Profile: `data/psychology/profiles/anezka_mazankova.json`
