#!/usr/bin/env node
/**
 * Enforces student-facing explanation standards for passage topics.
 * Run: node scripts/validate-explanations.js
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '..', 'data.js');
let source = fs.readFileSync(dataPath, 'utf8').replace('const GRAMMAR_DATA', 'globalThis.GRAMMAR_DATA');
eval(source);

const bannedTerms = /\b(?:distractor(?:s)?|approved|whitelist|framework(?:s)?|validation|authoring|double[- ]marking|error type(?:s)?)\b/i;
const MAX_CHARACTERS = 240;
const MAX_SENTENCES = 2;

function sentenceCount(text) {
  return (text.match(/[.!?](?:\s|$)/g) || []).length;
}

const problems = [];
let explanationCount = 0;
let requiredCount = 0;

for (const [term, topics] of Object.entries(GRAMMAR_DATA)) {
  for (const [topicKey, topic] of Object.entries(topics)) {
    for (const exercise of topic.exercises || []) {
      (exercise.segments || []).forEach((segment, index) => {
        if (typeof segment !== 'object') return;
        const locator = `${term} / ${topicKey} / ${exercise.title || 'untitled exercise'} / blank ${index + 1}`;
        const hasChoices = Array.isArray(segment.distractors);
        const explanation = segment.explanation || '';
        if (hasChoices) requiredCount += 1;
        if (explanation) explanationCount += 1;
        if (hasChoices && !explanation.trim()) {
          problems.push(`${locator}: missing required student explanation.`);
          return;
        }
        if (!explanation) return;
        if (!explanation.includes(segment.answer)) problems.push(`${locator}: does not name the correct answer.`);
        if (bannedTerms.test(explanation)) problems.push(`${locator}: contains internal authoring language.`);
        if (explanation.length > MAX_CHARACTERS) problems.push(`${locator}: exceeds ${MAX_CHARACTERS} characters.`);
        if (sentenceCount(explanation) > MAX_SENTENCES) problems.push(`${locator}: contains more than ${MAX_SENTENCES} sentences.`);
      });
    }
  }
}

console.log(`Audited ${explanationCount} student-facing explanations.`);
console.log(`Passage blanks requiring explanations: ${requiredCount}.`);
if (problems.length) {
  console.error(`Explanation quality violations: ${problems.length}`);
  problems.forEach(problem => console.error(problem));
  process.exit(1);
}
console.log('Explanation quality violations: 0');
