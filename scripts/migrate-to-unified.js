#!/usr/bin/env node
/**
 * Migration script: Convert all data sources to unified format
 * Run: node scripts/migrate-to-unified.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'data/source/content');

// Ensure output directory exists
if (!fs.existsSync(SOURCE_DIR)) {
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
}

// Load source files
const problemBank = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'data/problems/problem_bank.json'), 'utf8'
));

const lightningQuestions = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'data/drills/lightning_questions.json'), 'utf8'
));

// Convert problem_bank format to unified format
function convertProblemBankItem(item) {
  const isMultipleChoice = item.type === 'multiple_choice';

  return {
    id: item.id,
    topic: item.topic,
    tags: [item.topic],
    difficulty: item.difficulty,

    question: {
      stem: extractStem(item),
      context: item.problem_cs,
      image: null
    },

    answer: {
      correct: isMultipleChoice ? item.options.find(o => o.id === item.answer).text : String(item.answer),
      numeric: typeof item.answer === 'number' ? item.answer : (item.answer_decimal || null),
      unit: item.answer_unit || null,
      variants: []
    },

    distractors: generateDistractors(item),

    hints: (item.hints || []).map((text, i) => ({
      level: i + 1,
      text: text
    })),

    solution: {
      steps: item.solution_steps || [],
      strategy: extractStrategy(item)
    },

    meta: {
      type_id: mapTopicToTypeId(item.topic),
      type_label: mapTopicToLabel(item.topic),
      source: 'problem_bank',
      migrated: new Date().toISOString().split('T')[0]
    }
  };
}

// Convert lightning format to unified format
function convertLightningItem(item, category) {
  return {
    id: item.id,
    topic: mapCategoryToTopic(category),
    tags: [mapCategoryToTopic(category), item.type || 'calculation'],
    difficulty: 1,

    question: {
      stem: item.question,
      context: null,
      image: null
    },

    answer: {
      correct: item.correct,
      numeric: parseFloat(item.correct) || null,
      unit: null,
      variants: []
    },

    distractors: (item.distractors || []).map(d => ({
      value: d,
      error_type: 'common_error',
      explanation: null
    })),

    hints: item.hint ? [{
      level: 1,
      text: item.hint.rule || item.hint.explanation || ''
    }] : [],

    solution: {
      steps: item.hint?.explanation ? [item.hint.explanation] : [],
      strategy: item.hint?.rule || null
    },

    meta: {
      type_id: mapCategoryToTypeId(category, item.type),
      type_label: mapCategoryToLabel(category),
      source: 'lightning_questions',
      original_type: item.type || 'calculation',
      migrated: new Date().toISOString().split('T')[0]
    }
  };
}

// Helper functions
function extractStem(item) {
  // Extract short form from problem text
  const text = item.problem_cs;
  if (text.includes(':')) {
    return text.split(':')[1]?.trim() || text;
  }
  return text.length > 50 ? text.substring(0, 50) + '...' : text;
}

function extractStrategy(item) {
  if (item.topic === 'o_x_vice') {
    if (item.problem_cs.includes('více')) return '× (1 + zlomek)';
    if (item.problem_cs.includes('méně')) return '× (1 - zlomek)';
  }
  if (item.topic === 'equations') return 'Izoluj x';
  if (item.topic === 'fractions') return 'Společný jmenovatel';
  return null;
}

function generateDistractors(item) {
  const distractors = [];

  if (item.common_mistake) {
    distractors.push({
      value: String(item.common_mistake.wrong_answer),
      error_type: 'common_mistake',
      explanation: item.common_mistake.explanation
    });
  }

  if (item.options) {
    item.options
      .filter(o => o.id !== item.answer)
      .forEach(o => {
        distractors.push({
          value: o.text,
          error_type: 'option',
          explanation: null
        });
      });
  }

  return distractors;
}

function mapTopicToTypeId(topic) {
  const map = {
    'equations': 'ALG-EQ',
    'fractions': 'NUM-ZLOM',
    'o_x_vice': 'WORD-OXVICE',
    'pythagorean': 'GEOM-PYTH'
  };
  return map[topic] || topic.toUpperCase();
}

function mapTopicToLabel(topic) {
  const map = {
    'equations': 'Lineární rovnice',
    'fractions': 'Zlomky',
    'o_x_vice': 'o X více/méně',
    'pythagorean': 'Pythagorova věta'
  };
  return map[topic] || topic;
}

function mapCategoryToTopic(category) {
  const map = {
    'OXV': 'o_x_vice',
    'PYTH': 'pythagorean'
  };
  return map[category] || category.toLowerCase();
}

function mapCategoryToTypeId(category, type) {
  if (type === 'type_recognition') return category + '-TYPE';
  if (type === 'problem_type') return category + '-PTYPE';
  return category + '-CALC';
}

function mapCategoryToLabel(category) {
  const map = {
    'OXV': 'o X více/méně',
    'PYTH': 'Pythagorova věta'
  };
  return map[category] || category;
}

// Main migration
console.log('Starting migration to unified format...\n');

// 1. Migrate problem_bank by topic
const topicGroups = {};
problemBank.problems.forEach(item => {
  if (!topicGroups[item.topic]) {
    topicGroups[item.topic] = [];
  }
  topicGroups[item.topic].push(convertProblemBankItem(item));
});

// 2. Migrate lightning questions by category
Object.entries(lightningQuestions.categories).forEach(([categoryId, category]) => {
  const topic = mapCategoryToTopic(categoryId);
  if (!topicGroups[topic]) {
    topicGroups[topic] = [];
  }

  category.questions.forEach(item => {
    // Check for duplicates by checking if stem already exists
    const converted = convertLightningItem(item, categoryId);
    const exists = topicGroups[topic].some(
      existing => existing.question.stem === converted.question.stem
    );
    if (!exists) {
      topicGroups[topic].push(converted);
    }
  });
});

// 3. Write output files
Object.entries(topicGroups).forEach(([topic, questions]) => {
  const filename = path.join(SOURCE_DIR, `${topic}.json`);
  const output = {
    topic: topic,
    name: mapTopicToLabel(topic),
    version: '1.0',
    migrated: new Date().toISOString().split('T')[0],
    questions: questions
  };

  fs.writeFileSync(filename, JSON.stringify(output, null, 2));
  console.log(`✓ ${topic}.json - ${questions.length} questions`);
});

console.log('\nMigration complete!');
console.log(`Output: ${SOURCE_DIR}`);
