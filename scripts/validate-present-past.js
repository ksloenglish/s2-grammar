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
      { prompt: '(not buy)', answer: "didn't buy", alternatives: ['did not buy'], distractors: ['does not buy', 'did not bought'] },
      { prompt: '(pack)', answer: 'packs', alternatives: [], distractors: ['pack', 'packed', 'is pack'] },
      { prompt: '(do)', answer: 'were you doing', alternatives: [], distractors: ['Was you doing', 'Were you do', 'Did you doing'] },
      { prompt: '(play)', answer: 'was playing', alternatives: [], distractors: ['am playing', 'were playing', 'was play'] },
      { prompt: '(not notice)', answer: "didn't notice", alternatives: ['did not notice'], distractors: ['does not notice', 'did not noticed'] },
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
      { prompt: '(not believe)', answer: "didn't believe", alternatives: ['did not believe'], distractors: ['does not believe', 'did not believed'] },
      { prompt: '(smile)', answer: 'are you smiling', alternatives: [], distractors: ['is you smiling', 'are you smile', 'do you smiling'] },
      { prompt: '(stay)', answer: 'stay', alternatives: [], distractors: ['stayed', 'was staying', 'does stays'] },
      { prompt: '(not be)', answer: "isn't", alternatives: ['is not'], distractors: ['are not', 'does not be'] },
      { prompt: '(cook)', answer: 'was cooking', alternatives: [], distractors: ['cooks', 'is cooking', 'were cooking'] },
      { prompt: '(go)', answer: 'went', alternatives: [], distractors: ['gone', 'going', 'goes'] },
      { prompt: '(begin)', answer: 'began', alternatives: [], distractors: ['begins', 'begin', 'begun'] },
      { prompt: '(watch)', answer: 'is watching', alternatives: ["'s watching"], distractors: ['are watching', 'is watch'] },
      { prompt: '(draw)', answer: 'is drawing', alternatives: ["'s drawing"], distractors: ['are drawing', 'is draw'] },
      { prompt: '(want)', answer: 'want', alternatives: [], distractors: ['wants', 'wanting', 'am want'] }
    ]
  },
  {
    title: 'Greetings from a dim sum restaurant!',
    blanks: [
      { prompt: '(not reply)', answer: "didn't reply", alternatives: ['did not reply'], distractors: ['does not reply', 'did not replied'] },
      { prompt: '(prepare)', answer: 'was preparing', alternatives: [], distractors: ['am preparing', 'were preparing', 'was prepare'] },
      { prompt: '(sit)', answer: 'am sitting', alternatives: ["'m sitting"], distractors: ['is sitting', 'am sit'] },
      { prompt: '(have)', answer: 'have', alternatives: [], distractors: ['has', 'had', 'having'] },
      { prompt: '(pour)', answer: 'is pouring', alternatives: ["'s pouring"], distractors: ['are pouring', 'is pour'] },
      { prompt: '(argue)', answer: 'are arguing', alternatives: [], distractors: ['is arguing', 'are argue', 'were arguing'] },
      { prompt: '(know)', answer: 'Do you know', alternatives: [], distractors: ['Does you know', 'Do you knows', 'Do you knowing'] },
      { prompt: '(look)', answer: 'was looking', alternatives: [], distractors: ['were looking', 'was look', 'is look'] },
      { prompt: '(bump)', answer: 'bumped', alternatives: [], distractors: ['bumps', 'bump', 'was bump'] },
      { prompt: '(fall)', answer: 'fell', alternatives: [], distractors: ['falls', 'were falling', 'falling'] },
      { prompt: '(give)', answer: 'gave', alternatives: [], distractors: ['gives', 'give', 'giving'] },
      { prompt: '(not like)', answer: "doesn't like", alternatives: ['does not like'], distractors: ['do not like', 'does not likes'] }
    ]
  },
  {
    title: 'Live from Sports Day!',
    blanks: [
      { prompt: '(type)', answer: 'am typing', alternatives: [], distractors: ['type', 'typed', 'is typing'] },
      { prompt: '(not start)', answer: 'does not start', alternatives: [], distractors: ['do not start', 'did not start', 'does not starts'] },
      { prompt: '(run)', answer: 'are running', alternatives: [], distractors: ['is running', 'are run', 'are ran'] },
      { prompt: '(come)', answer: 'comes', alternatives: [], distractors: ['come', 'coming', 'does comes'] },
      { prompt: '(not join)', answer: 'Did you not join', alternatives: [], distractors: ['Did you not joined', 'Was you not joining', 'Did you not joining'] },
      { prompt: '(hurt)', answer: 'hurt', alternatives: [], distractors: ['was hurt', 'were hurt', 'am hurt'] },
      { prompt: '(practise)', answer: 'was practising', alternatives: [], distractors: ['practise', 'am practising', 'were practising'] },
      { prompt: '(trip)', answer: 'tripped', alternatives: [], distractors: ['trip', 'am tripping', 'tripping'] },
      { prompt: '(stretch)', answer: 'were stretching', alternatives: [], distractors: ['was stretching', 'is stretching', 'were stretch'] },
      { prompt: '(announce)', answer: 'announced', alternatives: [], distractors: ['announce', 'did announced', 'was announce'] },
      { prompt: '(not want)', answer: 'do not want', alternatives: [], distractors: ['does not want', 'do not wanted', 'am not want'] },
      { prompt: '(call)', answer: 'is calling', alternatives: [], distractors: ['are calling', 'call', 'is call'] }
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
    if ((blank.distractors || []).some(option => /['’]/.test(option))) problems.push(`${label}: distractors must use whole words, not contractions.`);
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
