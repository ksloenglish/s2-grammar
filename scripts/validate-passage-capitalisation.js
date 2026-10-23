#!/usr/bin/env node
/**
 * Enforces visible option casing for select-based passage blanks.
 * Run: node scripts/validate-passage-capitalisation.js
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '..', 'data.js');
let source = fs.readFileSync(dataPath, 'utf8').replace('const GRAMMAR_DATA', 'globalThis.GRAMMAR_DATA');
eval(source);

const startsUppercase = value => /^\p{Lu}/u.test(String(value));
const problems = [];
let selectBlankCount = 0;
let sentenceInitialCount = 0;

for (const [term, topics] of Object.entries(GRAMMAR_DATA)) {
  for (const [topicKey, topic] of Object.entries(topics)) {
    if (topic.type !== 'passage' || !Array.isArray(topic.exercises)) continue;

    for (const exercise of topic.exercises) {
      let blankNumber = 0;
      for (const segment of exercise.segments || []) {
        if (typeof segment !== 'object' || !Array.isArray(segment.distractors)) continue;
        blankNumber += 1;
        selectBlankCount += 1;

        const label = `${term} / ${topicKey} / ${exercise.title}, blank ${blankNumber}`;
        const choices = [segment.answer, ...(segment.alternatives || []), ...segment.distractors];

        if (segment.sentenceInitial !== undefined && segment.sentenceInitial !== true) {
          problems.push(`${label}: sentenceInitial must be true when provided.`);
        }

        if (segment.sentenceInitial === true) {
          sentenceInitialCount += 1;
          const lowercaseChoices = choices.filter(choice => !startsUppercase(choice));
          if (lowercaseChoices.length) {
            problems.push(`${label}: every visible option at the start of a sentence must begin with an uppercase letter; found ${lowercaseChoices.join(', ')}.`);
          }
        } else if (segment.answer !== 'X' && startsUppercase(segment.answer)) {
          problems.push(`${label}: a capitalised answer must be marked sentenceInitial: true, or changed to normal in-sentence case.`);
        }
      }
    }
  }
}

console.log(`Audited ${selectBlankCount} select-based passage blanks and ${sentenceInitialCount} sentence-initial blanks.`);
if (problems.length) {
  console.error(`Passage capitalisation violations: ${problems.length}`);
  problems.forEach(problem => console.error(problem));
  process.exit(1);
}
console.log('Passage capitalisation violations: 0');
