# ADR-013: Single Source of Truth for Data

## Status
Accepted

## Date
2024-12-25

## Context

Data jsou duplicitní:
- `data/` obsahuje zdrojová/analytická data
- `app/src/data/` obsahuje kopie pro React import

Problém: Změny v `data/` se neprojeví v aplikaci bez ruční kopie.

## Decision

**Jeden zdroj pravdy v `data/`** s build-time synchronizací do `app/src/data/`.

### Struktura zdrojových dat

```
data/
├── problems/
│   └── problem_bank.json       # Hlavní banka problémů
├── drills/
│   ├── lightning_questions.json # Bleskové kolo
│   └── type_drill.json         # TypeDrill (budoucí)
├── taxonomy/
│   └── topic_type_mapping.json # Mapování témat
├── psychology/
│   └── profiles/
│       └── anezka_mazankova.json
└── config/
    └── app_config.json         # Budoucí konfigurace
```

### Synchronizační skript

```bash
# scripts/sync-data.sh
cp data/problems/problem_bank.json app/src/data/
cp data/drills/*.json app/src/data/drills/
cp data/taxonomy/*.json app/src/data/
cp data/psychology/profiles/*.json app/src/data/profiles/
```

### NPM Scripts

```json
{
  "scripts": {
    "sync-data": "bash scripts/sync-data.sh",
    "prebuild": "npm run sync-data",
    "predev": "npm run sync-data"
  }
}
```

### Co se synchronizuje

| Zdroj | Cíl | Účel |
|-------|-----|------|
| `data/problems/*.json` | `app/src/data/` | Banka problémů |
| `data/drills/*.json` | `app/src/data/drills/` | Drill obsah |
| `data/taxonomy/*.json` | `app/src/data/` | Mapování |
| `data/psychology/profiles/*.json` | `app/src/data/profiles/` | Adaptivita |

### Co se NESYNCHRONIZUJE

- `data/tests/` - analytická data, ne runtime
- `data/analysis/` - pouze pro vývoj
- `data/sessions/` - citlivá data

## Consequences

### Positive
- Jeden zdroj pravdy
- Editace dat bez zásahu do app kódu
- Automatická synchronizace při build/dev
- Připraveno pro budoucí adaptivní engine

### Negative
- Extra build step
- Nutnost spustit sync po změně dat (automatizováno)

## Implementation Steps

1. Přesunout `lightning_questions.json` do `data/drills/`
2. Přesunout `topic_type_mapping.json` do `data/taxonomy/`
3. Vytvořit `scripts/sync-data.sh`
4. Upravit `package.json` scripts
5. Vytvořit `app/src/data/profiles/` pro psychologická data
6. Otestovat build pipeline

## Related

- ADR-012: Pythagorean Lightning (data structure)
