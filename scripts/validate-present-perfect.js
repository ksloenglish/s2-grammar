#!/usr/bin/env node
/**
 * Validates First Term / The Present Perfect.
 * Teacher approved contextual time edits on 20 November 2026.
 * Four unique choices per blank; supplied alternatives remain correct.
 * Exception: blank 12 uses formation errors only because just finished is
 * also defensible. Never introduce it as a wrong-tense distractor.
 * Run: node scripts/validate-present-perfect.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.resolve(__dirname, '..', 'data.js'), 'utf8') + '\nthis.data = GRAMMAR_DATA;', context);
const topic = context.data['First Term']?.['present-perfect'];
const problems = [];
const fail = message => problems.push(message);
// Rule numbers: 1 base form; 2 opposite simple past/present perfect;
// 3 has/have + base form; 4 was/were + base form.
const expected = [
  { prompt: '(never / be)', answer: 'has never been', alternatives: [], wrong: [['never be', 1], ['never was', 2], ['has never be', 3]] },
  { prompt: '(fall)', answer: 'fell', alternatives: [], wrong: [['has fall', 3], ['fall', 1], ['has fallen', 2]] },
  { prompt: '(not want)', answer: 'did not want', alternatives: ["didn't want"], wrong: [['has not wanted', 2], ['was not want', 4]] },
  { prompt: '(join)', answer: 'joined', alternatives: [], wrong: [['join', 1], ['was join', 4], ['has joined', 2]] },
  { prompt: '(ask)', answer: 'asked', alternatives: [], wrong: [['has asked', 2], ['ask', 1], ['has ask', 3]] },
  { prompt: '(practise)', answer: 'has practised', alternatives: ['has been practising'], wrong: [['has practise', 3], ['practised', 2]] },
  { prompt: '(not miss)', answer: 'has not missed', alternatives: ["hasn't missed"], wrong: [['did not miss', 2], ['was not miss', 4]] },
  { prompt: '(improve)', answer: 'have improved', alternatives: [], wrong: [['were improve', 4], ['improved', 2], ['have improve', 3]] },
  { prompt: '(swim)', answer: 'Have you ever swum', alternatives: [], initial: true, wrong: [['Have you ever swim', 3], ['Were you ever swim', 4], ['Did you ever swim', 2]] },
  { prompt: '(already / buy)', answer: 'have already bought', alternatives: [], wrong: [['were already buy', 4], ['have already buy', 3], ['already bought', 2]] },
  { prompt: '(make)', answer: 'made', alternatives: [], wrong: [['make', 1], ['has made', 2], ['was make', 4]] },
  { prompt: '(just / finish)', answer: 'has just finished', alternatives: [], wrong: [['has just finish', 3], ['was just finish', 4], ['just finish', 1]] }
];
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
if (!topic) fail('Missing First Term / present-perfect topic.');
if (topic && (topic.type !== 'passage' || topic.blankType !== 'select')) fail('Topic must use select-based passage mode.');
if (topic?.label !== 'The Present Perfect') fail('Topic label must be The Present Perfect.');
const exercise = topic?.exercises?.[0];
if (!exercise) fail('Missing Jason exercise.');
if (exercise && exercise.title !== 'Exercise 1: Jason, a Nervous Swimmer') fail('Jason exercise title changed.');
const blanks = (exercise?.segments || []).filter(s => typeof s === 'object');
if (blanks.length !== expected.length) fail(`Jason exercise must have 12 marked blanks; found ${blanks.length}.`);
expected.forEach((want, i) => {
  const b = blanks[i], label = `Jason blank ${i + 1}`;
  if (!b) return;
  if (b.prompt !== want.prompt || b.showPrompt !== true) fail(`${label}: bracketed cue missing or changed.`);
  if (b.answer !== want.answer) fail(`${label}: teacher-supplied key changed.`);
  if (!same(b.alternatives || [], want.alternatives)) fail(`${label}: supplied accepted alternatives changed.`);
  if (!same(b.distractors || [], want.wrong.map(([text]) => text))) fail(`${label}: approved distractor forms changed.`);
  if (Boolean(b.sentenceInitial) !== Boolean(want.initial)) fail(`${label}: sentence-position metadata changed.`);
  const choices = [b.answer, ...(b.alternatives || []), ...(b.distractors || [])];
  if (choices.length !== 4 || new Set(choices.map(s => s.toLowerCase())).size !== 4) fail(`${label}: needs exactly four unique choices.`);
  if ((b.distractors || []).some(s => /['’]/.test(s))) fail(`${label}: distractors must use whole words.`);
  if (i !== 11 && !want.wrong.some(([, rule]) => rule === 2)) fail(`${label}: missing the safe tense contrast.`);
  if (i === 11 && (b.distractors || []).includes('just finished')) fail(`${label}: the approved exception forbids marking just finished wrong.`);
  if (!b.explanation || b.explanation.length > 240) fail(`${label}: missing or overlong explanation.`);
  for (const answer of [b.answer, ...(b.alternatives || [])]) {
    if (!b.explanation?.includes(answer)) fail(`${label}: explanation must name ${answer}.`);
  }
});
// These contextual cues are essential to the independently reviewed tense contrasts.
const text = (exercise?.segments || []).map(s => typeof s === 'string' ? s : `[${s.answer}]`).join('');
for (const cue of [
  'a strong swimmer in his life so far.',
  'for years, until last September.',
  'Things changed last September, when his best friend Ryan [joined] the school swimming team and [asked] Jason to try out too.',
  'Since then, Jason [has practised]',
  'a single training session so far.',
  'a lot since the start of this term.',
  '[Have you ever swum] in a real competition since joining our team?',
  'Since Jason joined the team, his parents [have already bought]',
  'Last night, his younger sister [made]'
]) {
  if (!text.includes(cue)) fail(`Essential approved time context missing: ${cue}`);
}
if ((text.match(/Have you ever swum/g) || []).length !== 1 || /\] you ever/.test(text)) fail('Question 9 must be one complete phrase, without duplicated you ever.');
console.log(`Audited ${blanks.length} Present Perfect blanks, their accepted alternatives and four allowed distractor forms.`);
if (problems.length) {
  console.error(`Present Perfect validation violations: ${problems.length}`);
  problems.forEach(p => console.error(p));
  process.exit(1);
}
console.log('Present Perfect validation violations: 0');
