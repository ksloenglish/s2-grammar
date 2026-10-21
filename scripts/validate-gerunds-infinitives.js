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

const expectedExercises = [
  {
    title: 'My first beach clean-up!',
    instructions: 'Read and complete the email using the correct form of the verbs in brackets.',
    metadata: 'From: Chloe Wong\nTo: Jason Wong\nSubject: My first beach clean-up!',
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
  },
  {
    title: 'Paddling to Success: An Interview with Our Dragon Boat Captain',
    instructions: 'Read and complete the interview using the correct form of the verbs in brackets.',
    byline: 'THE SCHOOL VOICE — Student Reporter Corner',
    blanks: [
      { prompt: '(come)', answer: 'to come', alternatives: [], distractors: ['come', 'coming', 'to coming'] },
      { prompt: '(join)', answer: 'to join', alternatives: [], distractors: ['joining', 'join', 'to joining'] },
      { prompt: '(get)', answer: 'getting', alternatives: [], distractors: ['get', 'to get', 'to getting'] },
      { prompt: '(paddle)', answer: 'Paddling', alternatives: [], distractors: ['paddle', 'to paddling', 'paddled'] },
      { prompt: '(train)', answer: 'training', alternatives: [], distractors: ['train', 'to train', 'trained'] },
      { prompt: '(play)', answer: 'playing', alternatives: [], distractors: ['play', 'to play', 'played'] },
      { prompt: '(stay)', answer: 'staying', alternatives: [], distractors: ['stay', 'to stay', 'to staying'] },
      { prompt: '(hold)', answer: 'to hold', alternatives: [], distractors: ['holding', 'hold', 'held'] },
      { prompt: '(beat)', answer: 'beating', alternatives: [], distractors: ['beat', 'to beat', 'beaten'] },
      { prompt: '(enter)', answer: 'to enter', alternatives: [], distractors: ['entering', 'enter', 'to entering'] },
      { prompt: '(sign)', answer: 'to sign', alternatives: [], distractors: ['sign', 'to signing', 'to signed'] },
      { prompt: '(make)', answer: 'making', alternatives: [], distractors: ['make', 'to make', 'made'] }
    ]
  },
  {
    title: "Mandy's Mid-Autumn Visit",
    instructions: 'Read and complete the diary entry using the correct form of the verbs in brackets.',
    diaryStart: 'Saturday, 14 September\n\nDear Diary,',
    signature: 'Mandy',
    blanks: [
      { prompt: '(talk)', answer: 'to talk', alternatives: [], distractors: ['talking', 'talk', 'to talking'] },
      { prompt: '(do)', answer: 'doing', alternatives: [], distractors: ['do', 'to do', 'to doing'] },
      { prompt: '(perform)', answer: 'to perform', alternatives: [], distractors: ['performing', 'perform', 'to performing'] },
      { prompt: '(sing)', answer: 'singing', alternatives: [], distractors: ['sing', 'to singing', 'sung'] },
      { prompt: '(buy)', answer: 'to buy', alternatives: [], distractors: ['buy', 'to buying', 'bought'] },
      { prompt: '(look)', answer: 'looking', alternatives: [], distractors: ['look', 'to look', 'looked'] },
      { prompt: '(smile)', answer: 'smiling', alternatives: [], distractors: ['smile', 'to smiling', 'smiled'] },
      { prompt: '(play)', answer: 'to play', alternatives: [], distractors: ['play', 'playing', 'to playing'] },
      { prompt: '(think)', answer: 'thinking', alternatives: [], distractors: ['think', 'to think', 'thought'] },
      { prompt: '(spend)', answer: 'Spending', alternatives: [], distractors: ['Spend', 'To spending', 'To spent'] },
      { prompt: '(visit)', answer: 'to visit', alternatives: [], distractors: ['visiting', 'visit', 'to visiting'] },
      { prompt: '(see)', answer: 'to see', alternatives: [], distractors: ['seeing', 'see', 'to seeing'] }
    ]
  },
  {
    title: 'ASK MISS WISE: Your Problems, Our Advice',
    instructions: 'Read and complete the letters using the correct form of the verbs in brackets.',
    letterStart: 'Dear Miss Wise,',
    replyStart: 'Worried in Tsuen Wan\n\nDear Worried,',
    signature: 'Miss Wise',
    blanks: [
      { prompt: '(scroll)', answer: 'scrolling', alternatives: [], distractors: ['scroll', 'to scrolling', 'scrolled'] },
      { prompt: '(revise)', answer: 'to revise', alternatives: [], distractors: ['revise', 'revising', 'to revising'] },
      { prompt: '(do)', answer: 'doing', alternatives: [], distractors: ['do', 'to do', 'done'] },
      { prompt: '(take)', answer: 'to take', alternatives: [], distractors: ['taking', 'take', 'to taking'] },
      { prompt: '(start)', answer: 'to start', alternatives: [], distractors: ['starting', 'start', 'to starting'] },
      { prompt: '(leave)', answer: 'leaving', alternatives: [], distractors: ['leave', 'to leaving', 'left'] },
      { prompt: '(check)', answer: 'checking', alternatives: [], distractors: ['check', 'to checking', 'checked'] },
      { prompt: '(work)', answer: 'Working', alternatives: [], distractors: ['Work', 'To working', 'To worked'] },
      { prompt: '(study)', answer: 'to study', alternatives: [], distractors: ['study', 'to studying', 'studied'] },
      { prompt: '(turn)', answer: 'turning', alternatives: [], distractors: ['turn', 'to turn', 'to turning'] },
      { prompt: '(reward)', answer: 'to reward', alternatives: [], distractors: ['reward', 'to rewarding', 'to rewarded'] },
      { prompt: '(try)', answer: 'trying', alternatives: [], distractors: ['try', 'to try', 'tried'] }
    ]
  },
  {
    title: '💬 3C Class Chat',
    instructions: 'Read and complete the group chat using the correct form of the verbs in brackets.',
    chatSpeakers: ['Jacky', 'Bella', 'Owen', 'Hailey'],
    blanks: [
      { prompt: '(have)', answer: 'having', alternatives: [], distractors: ['have', 'to having', 'to had'] },
      { prompt: '(stay)', answer: 'staying', alternatives: [], distractors: ['stay', 'to stay', 'stayed'] },
      { prompt: '(keep)', answer: 'to keep', alternatives: [], distractors: ['kept', 'to kept', 'to keeping'] },
      { prompt: '(order)', answer: 'to order', alternatives: [], distractors: ['ordering', 'order', 'to ordering'] },
      { prompt: '(write)', answer: 'to write', alternatives: [], distractors: ['write', 'to writing', 'to written'] },
      { prompt: '(collect)', answer: 'Collecting', alternatives: [], distractors: ['Collect', 'To collecting', 'Collected'] },
      { prompt: '(remind)', answer: 'reminding', alternatives: [], distractors: ['remind', 'to remind', 'to reminding'] },
      { prompt: '(say)', answer: 'saying', alternatives: [], distractors: ['say', 'to say', 'said'] },
      { prompt: '(tell)', answer: 'telling', alternatives: [], distractors: ['tell', 'to tell', 'told'] },
      { prompt: '(bring)', answer: 'to bring', alternatives: [], distractors: ['bring', 'bringing', 'to bringing'] },
      { prompt: '(be)', answer: 'to be', alternatives: [], distractors: ['being', 'be', 'to being'] },
      { prompt: '(mention)', answer: 'to mention', alternatives: [], distractors: ['mention', 'mentioning', 'to mentioning'] }
    ]
  }
];

const topic = GRAMMAR_DATA['First Term']?.['gerunds-to-infinitives'];
const problems = [];
const sameList = (actual, wanted) => actual.length === wanted.length && actual.every((value, index) => value === wanted[index]);

if (!topic) problems.push('Missing First Term / gerunds-to-infinitives topic.');
if (topic && (topic.type !== 'passage' || topic.blankType !== 'select')) {
  problems.push('Topic must use select-based passage mode.');
}
if (topic && (!Array.isArray(topic.exercises) || topic.exercises.length !== expectedExercises.length)) {
  problems.push(`Topic must contain exactly ${expectedExercises.length} exercises.`);
}

let auditedBlankCount = 0;
expectedExercises.forEach((expectedExercise, exerciseIndex) => {
  const exercise = topic?.exercises?.[exerciseIndex];
  const labelPrefix = `Exercise ${exerciseIndex + 1}`;
  if (!exercise) return;
  if (exercise.title !== expectedExercise.title) problems.push(`${labelPrefix}: title must be ${expectedExercise.title}.`);
  if (exercise.instructions !== expectedExercise.instructions) problems.push(`${labelPrefix}: instructions must name the correct passage format.`);
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
    if ((blank.distractors || []).some(option => /['’]/.test(option))) problems.push(`${label}: distractors must not use contractions.`);
    if (!blank.explanation || blank.explanation.length > 240) problems.push(`${label}: must have a concise student-facing explanation.`);
  });

  const start = exercise.segments[0] || '';
  if (expectedExercise.metadata && !start.startsWith(expectedExercise.metadata)) {
    problems.push(`${labelPrefix}: email metadata must stay together at the start.`);
  }
  if (expectedExercise.byline && !start.startsWith(expectedExercise.byline)) {
    problems.push(`${labelPrefix}: School Voice byline must appear before the interview.`);
  }
  if (expectedExercise.diaryStart && !start.startsWith(expectedExercise.diaryStart)) {
    problems.push(`${labelPrefix}: diary date and salutation must begin the passage.`);
  }
  if (expectedExercise.letterStart && !start.startsWith(expectedExercise.letterStart)) {
    problems.push(`${labelPrefix}: first letter must begin with its salutation.`);
  }
  if (expectedExercise.replyStart && !exercise.segments.some(segment => typeof segment === 'string' && segment.includes(expectedExercise.replyStart))) {
    problems.push(`${labelPrefix}: sender name and reply salutation must be separate blocks.`);
  }
  if (expectedExercise.chatSpeakers) {
    const text = exercise.segments.filter(segment => typeof segment === 'string').join('');
    expectedExercise.chatSpeakers.forEach(speaker => {
      if (!text.includes(`${speaker}:`)) problems.push(`${labelPrefix}: missing ${speaker} chat label.`);
    });
  }
  const end = exercise.segments[exercise.segments.length - 1] || '';
  if (expectedExercise.signature && !end.endsWith(`\n\n${expectedExercise.signature}`)) {
    problems.push(`${labelPrefix}: signature must be on its own final line.`);
  }
});

console.log(`Audited ${auditedBlankCount} Gerunds & To-Infinitives blanks across ${expectedExercises.length} exercises.`);
if (problems.length) {
  console.error(`Gerunds & To-Infinitives validation violations: ${problems.length}`);
  problems.forEach(problem => console.error(problem));
  process.exit(1);
}
console.log('Gerunds & To-Infinitives validation violations: 0');
