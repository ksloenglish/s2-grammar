#!/usr/bin/env node
/**
 * Enforces the Comparatives & Superlatives distractor whitelist.
 * Run: node scripts/validate-comparisons.js
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '..', 'data.js');
let source = fs.readFileSync(dataPath, 'utf8').replace('const GRAMMAR_DATA', 'globalThis.GRAMMAR_DATA');
eval(source);

const rules = {
  bannedWords: /\b(?:then|dangerouser|convenienter|gooder|busyier|busyest|tireder|fewerer|fewerest|suitabler|betterest|niceest|worstest|easilier|easilest|sadest|amazingest|seriouslyer|crowdeder|usefulest|colourfulest|patientest|longerest|popularer|popularest|populars|cheaperest|expensiver|reliablely|reliablest)\b/i,
  stackedSuffix: /\b[a-z]+(?:erest|estest)\b/i,
  mixedDegree: /\b(?:most\s+more|more\s+most|most\s+\w+er|more\s+\w+est|least\s+\w+er|less\s+\w+est)\b/i,
  equalityDegree: /\bas\s+(?:more|less|most|least|better|worse|fewer|\w+(?:er|est))\s+as\b/i,
  equalityComparative: /\bas\b[\s\w-]{0,40}\bthan\b|\bthan\b[\s\w-]{0,40}\bas\b/i,
  degreeWithAs: /\b(?:more|less|most|least|better|worse|fewer|\w+(?:er|est))\b(?:\s+\w+){0,2}\s+as\b/i,
};

const exercises = GRAMMAR_DATA['First Term']?.['comparatives-superlatives']?.exercises;
if (!Array.isArray(exercises)) throw new Error('Comparatives & Superlatives exercises are missing.');

let blankCount = 0;
const problems = [];
for (const exercise of exercises) {
  exercise.segments.forEach((segment, index, segments) => {
    if (typeof segment !== 'object') return;
    blankCount += 1;
    const choices = [segment.answer, ...(segment.alternatives || []), ...segment.distractors];
    const before = typeof segments[index - 1] === 'string' ? segments[index - 1] : '';
    const after = typeof segments[index + 1] === 'string' ? segments[index + 1] : '';
    const issues = [];

    if (choices.length !== 4 || new Set(choices).size !== 4) issues.push(`requires exactly four unique choices; found ${choices.length}`);
    if (segment.distractors.some(d => /^(?:a|an)\b/i.test(d))) issues.push('prohibited a/an superlative distractor');
    if (segment.distractors.every(d => /\bthan\s*$/i.test(d))) issues.push('all distractors end in than');
    if (segment.distractors.some(d => /\bthan\s+than\b/i.test(`${before}${d}${after}`))) issues.push('creates than than in the completed sentence');
    if (segment.distractors.some(d => rules.bannedWords.test(d))) issues.push('contains prohibited typo, nonword, or arbitrary suffix');
    if (segment.distractors.some(d => rules.stackedSuffix.test(d))) issues.push('contains stacked suffix');
    if (segment.distractors.some(d => rules.mixedDegree.test(d))) issues.push('mixes comparative and superlative degree marking');
    if (segment.distractors.some(d => rules.equalityDegree.test(d))) issues.push('mixes equality and degree marking');
    if (segment.distractors.some(d => rules.equalityComparative.test(d))) issues.push('mixes equality and comparative connectors');
    if (segment.distractors.some(d => rules.degreeWithAs.test(d))) issues.push('uses equality connector after degree marking');
    if (segment.distractors.includes(segment.answer) || (segment.alternatives || []).some(answer => segment.distractors.includes(answer))) issues.push('uses an accepted answer as a distractor');

    if (issues.length) problems.push({ set: exercise.title, prompt: segment.prompt, issues });
  });
}

console.log(`Audited ${exercises.length} comparison sets and ${blankCount} blanks.`);
if (problems.length) {
  console.error(`Whitelist violations: ${problems.length}`);
  for (const problem of problems) console.error(`${problem.set} ${problem.prompt}: ${problem.issues.join('; ')}`);
  process.exit(1);
}
console.log('Whitelist violations: 0');
