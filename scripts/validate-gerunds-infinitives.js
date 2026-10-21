#!/usr/bin/env node
/**
 * Locks the teacher-approved answer and distractor patterns for
 * First Term / Gerunds & To-Infinitives.
 * Run: node scripts/validate-gerunds-infinitives.js
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '..', 'data.js');
let source = fs.readFileSync(dataPath, 'utf8').replace('const GRAMMAR_DATA', 'globalThis.GRAMMAR_DATA');
eval(source);

const expectedExercise = {
  title: 'My first beach clean-up!',
  blanks: [
    { prompt: '(take)', answer: 'to take', alternatives: [], distractors: ['taking', 'take', 'to taking'] },
    { prompt: '(miss)', answer: 'to miss', alternatives: [], distractors: ['missing', 'miss', 'to missing'] },
    { prompt: '(put)', answer: 'to put', alternatives: [], distractors: ['putting', 'put', 'to putting'] },
    { prompt: '(pick)', answer: 'picking', alternatives: [], distractors: ['pick', 'to picking', 'picked'] },
    { prompt: '(complain)', answer: 'complaining', alternatives: [], distractors: ['complain', 'to complain', 'complained'] },
    { prompt: '(leave)', answer: 'to leave', alternatives: [], distractors: ['leaving', 'leave', 'to leaving'] },
    { prompt: '(reduce)', answer: 'Reducing', alternatives: [], distractors: ['Reduce', 'To reducing', 'Reduced'] },
    { prompt: '(collect)', answer: 'collecting', alternatives: [], distractors: ['collect', 'to collect', 'collected'] },
    { prompt: '(bring)', answer: 'to bring', alternatives: [], distractors: ['bringing', 'bring', 'brought'] },
    { prompt: '(use)', answer: 'to use', alternatives: [], distractors: ['use', 'using', 'to used'] },
    { prompt: '(start)', answer: 'starting', alternatives: [], distractors: ['start', 'to start', 'started'] },
    { prompt: '(show)', answer: 'showing', alternatives: [], distractors: ['show', 'to show', 'shown'] }
  ]
};

const topic = GRAMMAR_DATA['First Term']?.['gerunds-to-infinitives'];
const problems = [];
const sameList = (actual, wanted) => actual.length === wanted.length && actual.every((value, index) => value === wanted[index]);

if (!topic) problems.push('Missing First Term / gerunds-to-infinitives topic.');
if (topic && (topic.type !== 'passage' || topic.blankType !== 'select')) {
  problems.push('Topic must use select-based passage mode.');
}
if (topic && (!Array.isArray(topic.exercises) || topic.exercises.length !== 1)) {
  problems.push('Topic must contain exactly one exercise.');
}

const exercise = topic?.exercises?.[0];
if (exercise) {
  if (exercise.title !== expectedExercise.title) problems.push(`Exercise title must be ${expectedExercise.title}.`);
  const blanks = exercise.segments.filter(segment => typeof segment === 'object');
  if (blanks.length !== expectedExercise.blanks.length) {
    problems.push(`Expected ${expectedExercise.blanks.length} blanks; found ${blanks.length}.`);
  }
  expectedExercise.blanks.forEach((want, index) => {
    const blank = blanks[index];
    const label = `Blank ${index + 1}`;
    if (!blank) return;
    if (blank.prompt !== want.prompt) problems.push(`${label}: prompt must be ${want.prompt}.`);
    if (blank.showPrompt !== true) problems.push(`${label}: must display its bracketed verb cue.`);
    if (blank.answer !== want.answer) problems.push(`${label}: answer must be ${want.answer}.`);
    if (!sameList(blank.alternatives || [], want.alternatives)) problems.push(`${label}: accepted alternatives do not match the teacher-approved list.`);
    if (!sameList(blank.distractors || [], want.distractors)) problems.push(`${label}: distractors do not match the teacher-approved set.`);
    const options = [blank.answer, ...(blank.alternatives || []), ...(blank.distractors || [])];
    if (options.length !== 4 || new Set(options).size !== 4) problems.push(`${label}: must offer exactly four unique choices.`);
    if ((blank.distractors || []).some(option => /['’]/.test(option))) problems.push(`${label}: distractors must not use contractions.`);
    if (!blank.explanation || blank.explanation.length > 240) problems.push(`${label}: must have a concise student-facing explanation.`);
  });

  const emailStart = exercise.segments[0] || '';
  if (!emailStart.startsWith('From: Chloe Wong\nTo: Jason Wong\nSubject: My first beach clean-up!')) {
    problems.push('The email metadata must keep the From, To, and Subject lines together.');
  }
}

console.log(`Audited ${expectedExercise.blanks.length} Gerunds & To-Infinitives blanks.`);
if (problems.length) {
  console.error(`Gerunds & To-Infinitives validation violations: ${problems.length}`);
  problems.forEach(problem => console.error(problem));
  process.exit(1);
}
console.log('Gerunds & To-Infinitives validation violations: 0');
