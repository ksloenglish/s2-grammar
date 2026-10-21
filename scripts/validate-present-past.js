#!/usr/bin/env node
/**
 * Locks the teacher-approved answer and distractor patterns for
 * First Term / The Present & the Past.
 * Run: node scripts/validate-present-past.js
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '..', 'data.js');
let source = fs.readFileSync(dataPath, 'utf8').replace('const GRAMMAR_DATA', 'globalThis.GRAMMAR_DATA');
eval(source);

const expectedExercises = [
  {
    title: "Mandy and Kelvin's Octopus Card",
    blanks: [
      { prompt: '(have)', answer: 'had', alternatives: [], distractors: ['have', 'am having', 'was have'] },
      { prompt: '(get)', answer: 'got', alternatives: [], distractors: ['get', 'am getting', 'was get'] },
      { prompt: '(use)', answer: 'Did you use', alternatives: [], distractors: ['Did you used', 'Do you used', 'Are you use'] },
      { prompt: '(not buy)', answer: "didn't buy", alternatives: ['did not buy'], distractors: ["don't buy", "didn't bought"] },
      { prompt: '(pack)', answer: 'packs', alternatives: [], distractors: ['pack', 'packed', 'is pack'] },
      { prompt: '(do)', answer: 'were you doing', alternatives: [], distractors: ['Was you doing', 'Were you do', 'Did you doing'] },
      { prompt: '(play)', answer: 'was playing', alternatives: [], distractors: ['am playing', 'were playing', 'was play'] },
      { prompt: '(not notice)', answer: "didn't notice", alternatives: ['did not notice'], distractors: ["don't notice", "didn't noticed"] },
      { prompt: '(fall)', answer: 'fell', alternatives: [], distractors: ['fall', 'was fall', 'was fell'] },
      { prompt: '(search)', answer: 'am searching', alternatives: ["'m searching"], distractors: ['search', 'is searching'] },
      { prompt: '(keep)', answer: 'keep', alternatives: [], distractors: ['kept', 'were keeping', 'keeping'] },
      { prompt: '(ring)', answer: 'is ringing', alternatives: ["'s ringing"], distractors: ['is ring', 'are ringing'] }
    ]
  },
  {
    title: "Kitty's Typhoon Day",
    blanks: [
      { prompt: '(raise)', answer: 'raised', alternatives: [], distractors: ['raises', 'is raising', 'raise'] },
      { prompt: '(sleep)', answer: 'was sleeping', alternatives: [], distractors: ['were sleeping', 'was sleep', 'am sleeping'] },
      { prompt: '(not believe)', answer: "didn't believe", alternatives: ['did not believe'], distractors: ["don't believe", "didn't believed"] },
      { prompt: '(smile)', answer: 'are you smiling', alternatives: [], distractors: ['is you smiling', 'are you smile', 'do you smiling'] },
      { prompt: '(stay)', answer: 'stay', alternatives: [], distractors: ['stayed', 'was staying', 'does stays'] },
      { prompt: '(not be)', answer: "isn't", alternatives: ['is not'], distractors: ["aren't", "doesn't be"] },
      { prompt: '(cook)', answer: 'was cooking', alternatives: [], distractors: ['cooks', 'is cooking', 'were cooking'] },
      { prompt: '(go)', answer: 'went', alternatives: [], distractors: ['gone', 'going', 'goes'] },
      { prompt: '(begin)', answer: 'began', alternatives: [], distractors: ['begins', 'begin', 'begun'] },
      { prompt: '(watch)', answer: 'is watching', alternatives: ["'s watching"], distractors: ['are watching', 'is watch'] },
      { prompt: '(draw)', answer: 'is drawing', alternatives: ["'s drawing"], distractors: ['are drawing', 'is draw'] },
      { prompt: '(want)', answer: 'want', alternatives: [], distractors: ['wants', 'wanting', 'am want'] }
    ]
  }
];

const topic = GRAMMAR_DATA['First Term']?.['present-past'];
const problems = [];
if (!topic) problems.push('Missing First Term / present-past topic.');
if (topic && (topic.type !== 'passage' || topic.blankType !== 'select')) problems.push('Topic must use select-based passage mode.');
if (topic && (!Array.isArray(topic.exercises) || topic.exercises.length !== expectedExercises.length)) {
  problems.push(`Topic must contain exactly ${expectedExercises.length} exercises.`);
}

const sameList = (actual, wanted) => actual.length === wanted.length && actual.every((value, index) => value === wanted[index]);
let auditedBlankCount = 0;
expectedExercises.forEach((expectedExercise, exerciseIndex) => {
  const exercise = topic?.exercises?.[exerciseIndex];
  const labelPrefix = `Exercise ${exerciseIndex + 1}`;
  if (!exercise) return;
  if (exercise.title !== expectedExercise.title) problems.push(`${labelPrefix}: title must be ${expectedExercise.title}.`);
  const blanks = exercise.segments.filter(segment => typeof segment === 'object');
  auditedBlankCount += blanks.length;
  if (blanks.length !== expectedExercise.blanks.length) {
    problems.push(`${labelPrefix}: expected ${expectedExercise.blanks.length} blanks; found ${blanks.length}.`);
  }
  expectedExercise.blanks.forEach((want, blankIndex) => {
    const blank = blanks[blankIndex];
    const label = `${labelPrefix}, blank ${blankIndex + 1}`;
    if (!blank) return;
    if (blank.prompt !== want.prompt) problems.push(`${label}: prompt must be ${want.prompt}.`);
    if (blank.showPrompt !== true) problems.push(`${label}: must display its bracketed verb cue.`);
    if (blank.answer !== want.answer) problems.push(`${label}: answer must be ${want.answer}.`);
    if (!sameList(blank.alternatives || [], want.alternatives)) problems.push(`${label}: accepted alternatives do not match the teacher-approved list.`);
    if (!sameList(blank.distractors || [], want.distractors)) problems.push(`${label}: distractors do not match the teacher-approved set.`);
    const options = [blank.answer, ...(blank.alternatives || []), ...(blank.distractors || [])];
    if (options.length !== 4 || new Set(options).size !== 4) problems.push(`${label}: must offer exactly four unique choices.`);
    if (!blank.explanation || blank.explanation.length > 240) problems.push(`${label}: must have a concise student-facing explanation.`);
  });
});

console.log(`Audited ${auditedBlankCount} The Present & the Past blanks across ${expectedExercises.length} exercises.`);
if (problems.length) {
  console.error(`Present/past validation violations: ${problems.length}`);
  problems.forEach(problem => console.error(problem));
  process.exit(1);
}
console.log('Present/past validation violations: 0');
