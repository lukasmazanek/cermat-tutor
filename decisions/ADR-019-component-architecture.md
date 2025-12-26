# ADR-019: Component Architecture

## Status
Navrženo (2025-12-26)

## Kontext

Projekt potřebuje konzistentní pravidla pro strukturu komponent, state management a data flow. Bez jasných pravidel:

1. Komponenty rostou chaoticky
2. Není jasné kam umístit novou komponentu
3. Props drilling vs Context rozhodování ad-hoc
4. Nekonzistentní naming a interface

## Rozhodnutí

### 1. Atomic Design Hierarchie

```
Atoms → Molecules → Organisms → Pages
```

| Vrstva | Popis | Příklad |
|--------|-------|---------|
| **Atoms** | Základní UI prvky, žádná business logika | `Button`, `Input`, `Icon` |
| **Molecules** | Kompozice atoms, jednoduchá funkcionalita | `MathKeyboard`, `BottomBar`, `HintBox` |
| **Organisms** | Komplexní UI sekce, business logika | `ProblemCard`, `TypeDrill`, `LightningRound` |
| **Pages** | Entry points, orchestrace, providers | `TopicSelector`, `ProgressPage` |

### 2. Struktura složek

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Icon.jsx
│   ├── molecules/
│   │   ├── MathKeyboard.jsx
│   │   ├── BottomBar/
│   │   │   ├── index.jsx
│   │   │   └── Slot.jsx
│   │   └── HintBox.jsx
│   ├── organisms/
│   │   ├── ProblemCard.jsx
│   │   ├── TypeDrill/
│   │   │   ├── index.jsx
│   │   │   └── Summary.jsx
│   │   └── LightningRound/
│   │       ├── index.jsx
│   │       └── Summary.jsx
│   └── pages/
│       ├── TopicSelector.jsx
│       ├── ProgressPage.jsx
│       └── SessionSummary.jsx
├── hooks/                    # shared React hooks
│   ├── useLocalStorage.js
│   ├── useProgress.js
│   └── useMobile.js
└── lib/                      # pure utilities (no React)
    ├── mathParser.js
    └── formatters.js
```

**Pravidla:**
- 1 soubor → flat (`MathKeyboard.jsx`)
- 2+ souborů → složka (`BottomBar/index.jsx`)
- Sub-komponenty jsou privátní (neexportovat globálně)

### 3. Naming konvence

| Pravidlo | Příklad | Anti-pattern |
|----------|---------|--------------|
| PascalCase komponenty | `MathKeyboard` | `mathKeyboard` |
| Bez suffixu vrstvy | `Button` | `ButtonAtom` |
| Složka = komponenta | `BottomBar/index.jsx` | `BottomBar/BottomBar.jsx` |
| camelCase hooks | `useProgress` | `UseProgress` |
| camelCase utilities | `formatAnswer` | `FormatAnswer` |

### 4. Props Interface

#### Atoms - jednoduché, generické
```jsx
<Button
  onClick={fn}
  disabled={bool}
  variant="primary|secondary|danger"
  size="sm|md|lg"
>
  {children}
</Button>
```

#### Molecules - specifické pro účel
```jsx
<MathKeyboard
  value={string}           // controlled input
  onChange={fn}            // (newValue) => void
  unit={string|null}       // optional unit button
/>
```

#### Organisms - business props + callbacks
```jsx
<ProblemCard
  problem={object}         // data
  progress={{ current, total }}
  onAnswer={fn}            // (result) => void
  onExit={fn}
/>
```

#### Pages - minimal props
```jsx
<TopicSelector
  onSelectTopic={fn}       // navigation only
/>
// Data z hooks: useProgress(), useQuestions()
```

**Pravidla:**

| Pravidlo | Popis |
|----------|-------|
| Controlled inputs | `value` + `onChange` |
| Callbacks prefix | `on` + akce: `onClick`, `onAnswer` |
| Boolean bez `is` | `disabled`, ne `isDisabled` |
| Children pro obsah | `<Button>{children}</Button>` |

### 5. State Management

3 vrstvy podle scope:

| Vrstva | Nástroj | Příklad |
|--------|---------|---------|
| **UI state** | `useState` | `userAnswer`, `isOpen`, `feedback` |
| **Shared state** | `Context` | `ProgressContext`, `SettingsContext` |
| **Persistent** | `localStorage` + hook | `useLocalStorage('progress')` |

**Kdo může co:**

```
┌─────────────────────────────────────────────┐
│ Pages - Context Providers                   │
│  └── Organisms - useContext OK              │
│       └── Molecules - props only            │
│            └── Atoms - props only           │
└─────────────────────────────────────────────┘
```

| Vrstva | useState | useContext | Provider |
|--------|----------|------------|----------|
| Atoms | ❌ | ❌ | ❌ |
| Molecules | ✅ (UI only) | ❌ | ❌ |
| Organisms | ✅ | ✅ | ❌ |
| Pages | ✅ | ✅ | ✅ |

### 6. Data Flow

**Unidirectional - jednosměrný tok:**

```
        DATA DOWN (props, context)
             │
             ▼
┌────────────────────────────┐
│   Page                     │
│    └── Organism            │
│         └── Molecule       │
│              └── Atom      │
└────────────────────────────┘
             │
             ▲
        CALLBACKS UP (onX)
```

**Pravidla:**

| Pravidlo | Správně | Špatně |
|----------|---------|--------|
| Data dolů | `<Card problem={p} />` | Child čte global store |
| Callbacks nahoru | `<Input onChange={fn} />` | Child modifikuje parent |
| Max 2-3 úrovně | Page → Organism → Molecule | 4+ úrovní drilling |

**Kdy Context:**
- ✅ 3+ komponent potřebuje data
- ✅ Globální: theme, progress, settings
- ❌ 1-2 komponenty → použij props

### 7. Styling (Tailwind)

#### Pořadí tříd
```jsx
className="flex flex-col gap-2 p-4 w-full h-11 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 disabled:opacity-50"
//         └─layout─┘ └space┘ └──size──┘ └────colors────┘ └─shape─┘ └──────states──────┘
```

**Pořadí:** Layout → Spacing → Size → Colors → Shape → States

#### Varianty přes props
```jsx
const variants = {
  primary: 'bg-safe-blue text-white hover:bg-blue-600',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100'
}

function Button({ variant = 'primary', children, ...props }) {
  return (
    <button className={`px-4 py-2 rounded-xl ${variants[variant]}`} {...props}>
      {children}
    </button>
  )
}
```

#### Custom hodnoty v config
```js
// tailwind.config.js - ne inline [hodnoty]
colors: { 'safe-blue': '#3B82F6' }
height: { 'dvh': '100dvh' }
```

### 8. Hooks

#### Umístění

| Kategorie | Umístění | Příklad |
|-----------|----------|---------|
| Shared | `src/hooks/` | `useProgress.js` |
| Component-specific | Vedle komponenty | `ProblemCard/useProblemState.js` |
| Pure utilities | `src/lib/` | `mathParser.js` |

#### Naming

| Typ | Pattern | Příklad |
|-----|---------|---------|
| State hook | `use` + noun | `useProgress` |
| Action hook | `use` + verb | `useNavigate` |
| Utility hook | `use` + adjective | `useMobile` |
| Pure function | no prefix | `formatAnswer` |

#### Return pattern
```jsx
// Complex hooks - object
function useProgress() {
  return { progress, addSession, resetProgress, isLoading }
}
const { progress, addSession } = useProgress()

// Simple hooks - tuple
function useToggle(initial = false) {
  return [value, toggle]
}
const [isOpen, toggleOpen] = useToggle()
```

## Dopady

### Pozitivní
- Jasná struktura pro nové komponenty
- Konzistentní patterns across codebase
- Atoms/Molecules znovupoužitelné (žádné závislosti)
- Debugging jednodušší (unidirectional flow)

### Negativní
- Migrace existujících komponent
- Overhead pro malé změny

## Migrace

Postupná migrace při příležitosti:
1. Nové komponenty → rovnou správně
2. Refactored komponenty → přesunout do správné složky
3. Nepřesouvat jen kvůli struktuře

## Reference

- [Atomic Design - Brad Frost](https://bradfrost.com/blog/post/atomic-web-design/)
- [Presentational and Container Components - Dan Abramov](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
- ADR-018: MathKeyboard Component (příklad molecule extraction)
