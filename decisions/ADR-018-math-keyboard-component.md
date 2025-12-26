# ADR-018: Extrakce MathKeyboard komponenty

## Status
Navrženo (2025-12-26)

## Kontext
Virtuální matematická klávesnice je momentálně definována inline v `ProblemCard.jsx` (řádky 441-514). Toto řešení má několik problémů:

1. **Není znovupoužitelná** - jiné komponenty nemohou klávesnici sdílet
2. **Chybí klávesy** - `=` pro rovnice, `^` pro mocniny
3. **5 sloupců je těsných** - nelze přidat nové klávesy bez odebrání existujících

## Rozhodnutí

### 1. Extrakce do samostatné komponenty

**Nový soubor:** `app/src/components/MathKeyboard.jsx`

**Rozhraní:**
```jsx
<MathKeyboard
  value={string}           // Aktuální hodnota
  onChange={fn}            // Callback při změně
  unit={string|null}       // Volitelná jednotka (Kč, cm, ...)
/>
```

### 2. Nový layout - 6 sloupců

```
┌────┬────┬────┬────┬────┬────┐
│ 7  │ 8  │ 9  │ ÷  │ √  │ ^  │
├────┼────┼────┼────┼────┼────┤
│ 4  │ 5  │ 6  │ ×  │ x  │ =  │
├────┼────┼────┼────┼────┼────┤
│ 1  │ 2  │ 3  │ −  │ (  │ )  │
├────┼────┼────┼────┼────┼────┤
│ 0  │ ,  │ ⌫  │ +  │    │unit│
└────┴────┴────┴────┴────┴────┘
```

**Nové klávesy:**
- `=` pro zápis rovnic (`x = 20`)
- `^` pro mocniny (`x^2`)

**Zachované klávesy:**
- `√` pro odmocniny (Pythagoras)
- `x` pro proměnnou
- `(` a `)` separátně (ne jako `()`)

### 3. Velikost tlačítek

| Layout | Šířka tlačítka | Min touch target |
|--------|----------------|------------------|
| 5 sloupců | ~20% (64px na 320px) | ✅ 44px |
| 6 sloupců | ~16.6% (53px na 320px) | ✅ 44px |

Na nejmenších zařízeních (iPhone SE, 320px) je 53px stále nad minimem 44px.

### 4. Podmíněné zobrazení unit tlačítka

```jsx
// Poslední tlačítko v posledním řádku
{unit ? (
  <button onClick={() => onChange(prev => prev + unit)}>
    {unit}
  </button>
) : (
  <div /> // prázdná buňka
)}
```

### 5. Barevné kódování

| Typ | Barva | Příklad |
|-----|-------|---------|
| Čísla | `bg-slate-100` | 0-9 |
| Operátory | `bg-purple-100` | + − × ÷ = ^ |
| Speciální | `bg-purple-100` | x √ ( ) |
| Mazání | `bg-red-50` | ⌫ |
| Jednotka | `bg-purple-100` | Kč, cm, ... |

## Dopady

### Soubory k úpravě

| Soubor | Akce |
|--------|------|
| `app/src/components/MathKeyboard.jsx` | **Nový** |
| `app/src/components/ProblemCard.jsx` | Nahradit inline kód importem |

### Budoucí využití

Komponenta bude použitelná v:
- `ProblemCard.jsx` - hlavní procvičování
- `LightningRound` - pokud přidáme open-answer mód
- Jakýkoliv další mód vyžadující matematický vstup

## Alternativy

### A. Přidat `=` místo `√`
- ❌ Odmítnuto - √ potřeba pro Pythagorovy úlohy

### B. Přidat `=` místo `)`
- ❌ Odmítnuto - ) potřeba pro závorky ve výrazech

### D. Sloučit `()` do jednoho tlačítka
- ❌ Odmítnuto - složitější logika, méně intuitivní

## Reference

- ADR-017: Math Input Language (definuje mapování symbolů)
- ADR-004: Compact Mobile Keyboard (definuje h-11, gap-1)
