# ADR-020: Evaluatable Expected Values

## Status
Schváleno (2025-12-26)

## Kontext

Zlomkové odpovědi byly v datech uloženy jako zaokrouhlená desetinná čísla:

```json
"answer": {
  "correct": "1/6",
  "numeric": 0.167  // ← zaokrouhleno
}
```

Generator používal `numeric` pro `answer.value`, což vedlo k chybám:

| User input | Evaluace | Expected | Výsledek |
|------------|----------|----------|----------|
| `2/12` | `0.16666...` | `0.167` | ❌ FAIL |

Rozdíl `0.00033` > tolerance `1e-10`.

## Rozhodnutí

### 1. Parser evaluuje string expected values

```js
// mathParser.js
const expectedNumeric = typeof expectedValue === 'string'
  ? safeEval(toJSExpression(normalize(expectedValue)))
  : expectedValue
```

Parser nyní akceptuje:
- Čísla: `400`, `0.5`
- Zlomky jako string: `"1/6"`, `"3/4"`
- Výrazy jako string: `"2/3"`, `"11/12"`

### 2. Generator vždy používá `correct`

```js
// generate-formats.js
// Před: answerValue = hasNumericAnswer ? q.answer.numeric : q.answer.correct
// Po:
const answerValue = q.answer.correct;
```

Pole `numeric` je nyní pouze metadata, nepoužívá se pro porovnání.

### 3. Porovnání je numerické

```
User: "2/12" → eval → 0.16666...
Expected: "1/6" → eval → 0.16666...
Comparison: numbersEqual(0.16666..., 0.16666...) → ✓
```

## Akceptované varianty odpovědí

| Expected | Akceptuje |
|----------|-----------|
| `"1/6"` | `1/6`, `2/12`, `0.1666...`, `0,16666` |
| `"3/4"` | `3/4`, `6/8`, `0.75`, `0,75`, `75/100` |
| `"2/3"` | `2/3`, `4/6`, `0.666...`, `0,6666` |
| `400` | `400`, `200+200`, `800/2` |

## Dopady

### Pozitivní
- Zlomky fungují korektně
- Data jsou čitelnější (`"1/6"` místo `0.167`)
- Žádná ztráta přesnosti zaokrouhlením
- Uživatel může odpovědět jakýmkoliv ekvivalentním tvarem

### Negativní
- Mírně pomalejší (eval expected value)
- Chyba v datech (neplatný výraz) → runtime error

### Ochrana proti chybám

```js
if (expectedNumeric === null) {
  console.error('Invalid expected value in data:', expectedValue)
  return { isCorrect: false, hint: 'Chyba v datech', normalized }
}
```

## Testy

Přidány 3 nové testy do `mathParser.test.js`:

```js
test('numeric: string expected value "1/6" accepts 2/12')
test('numeric: string expected value "3/4" accepts 0,75')
test('numeric: string expected value "2/3" accepts 4/6')
```

Celkem: 57 testů ✓

## Reference

- ADR-017: Math Input Language
- ADR-016: Unified Answer Field
- `lib/mathParser.js:230-242`
- `scripts/generate-formats.js:41-44`
