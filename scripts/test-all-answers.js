#!/usr/bin/env node
/**
 * Test All Answers Script
 * Tests that all questions in the data can have their expected values evaluated
 * and that correct answers are accepted by the parser.
 *
 * Run: node scripts/test-all-answers.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { evaluateAnswer, normalize, toJSExpression, safeEval } from '../lib/mathParser.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const QUESTIONS_PATH = path.join(__dirname, '../app/src/data/questions.json')

// Load questions
const data = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf-8'))
const questions = data.questions

console.log('Testing all answers against parser (ADR-020)...\n')

let passed = 0
let failed = 0
let skipped = 0
const failures = []

for (const q of questions) {
  const expectedValue = q.answer?.value
  const expectedUnit = q.answer?.unit

  // Skip if no answer value
  if (expectedValue === undefined || expectedValue === null) {
    skipped++
    continue
  }

  const expectedStr = String(expectedValue).toLowerCase()

  // Skip text-based answers (not evaluatable)
  // - Contains Czech words
  // - Contains multiple variables (a, b, c but not just x)
  // - Is a formula description
  const isTextAnswer =
    /[áčďéěíňóřšťúůýž]/.test(expectedStr) ||  // Czech characters
    /[abcn]²/.test(expectedStr) ||             // Algebraic with a,b,c,n
    /√\([abcn]/.test(expectedStr) ||           // Formulas with variables
    expectedStr.includes('věta') ||
    expectedStr.includes('stran')

  if (isTextAnswer) {
    skipped++
    continue
  }

  // Determine if symbolic (contains x for o_x_vice type problems)
  const isSymbolic = expectedStr.includes('x')

  // Build problem object for parser
  const problem = {
    question: {},
    answer: {
      type: isSymbolic ? 'symbolic' : 'numeric',
      value: expectedValue,
      unit: expectedUnit || null
    }
  }

  // Test that expected value can be evaluated (for numeric)
  if (!isSymbolic && typeof expectedValue === 'string') {
    const normalized = normalize(expectedValue)
    const jsExpr = toJSExpression(normalized)
    const evalResult = safeEval(jsExpr)

    if (evalResult === null) {
      failed++
      failures.push({
        id: q.id,
        topic: q.topic,
        error: `Cannot evaluate expected value: "${expectedValue}"`,
        type: 'eval_error'
      })
      continue
    }
  }

  // Test that the correct answer is accepted
  // Include unit if required
  const userInput = expectedUnit
    ? `${expectedValue} ${expectedUnit}`
    : String(expectedValue)

  const result = evaluateAnswer(userInput, problem)

  if (result.isCorrect) {
    passed++
  } else {
    failed++
    failures.push({
      id: q.id,
      topic: q.topic,
      expected: expectedValue,
      input: userInput,
      hint: result.hint,
      type: 'not_accepted'
    })
  }
}

// Report results
console.log('='.repeat(50))
console.log(`Passed:  ${passed}`)
console.log(`Failed:  ${failed}`)
console.log(`Skipped: ${skipped}`)
console.log('='.repeat(50))

if (failures.length > 0) {
  console.log('\nFailures:')
  for (const f of failures) {
    console.log(`  [${f.topic}] ${f.id}: ${f.error || f.type}`)
    if (f.expected) console.log(`    Expected: ${f.expected}`)
    if (f.hint) console.log(`    Hint: ${f.hint}`)
  }
  process.exit(1)
} else {
  console.log('\n✓ All answers can be evaluated and are accepted!')
  process.exit(0)
}
