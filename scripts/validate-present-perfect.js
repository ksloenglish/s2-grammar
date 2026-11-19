#!/usr/bin/env node
/**
 * Validates First Term / The Present Perfect: teacher-supplied keys,
 * accepted alternatives, independently screened six-rule distractors and
 * teacher-approved contextual wording. Each exercise is worth 12 marks.
 * Formation-only exceptions: Jason blank 12; Natalie blanks 9 and 10.
 * Preserve the protected alternate forms; never turn them into distractors.
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
// 1 base; 2 wrong simple past/perfect; 3 has/have + base; 4 was/were + base;
// 5 has/have + past, only if different from participle; 6 was/were + past.
const expectedExercises = [
  {
    title: 'Exercise 1: Jason, a Nervous Swimmer',
    blanks: [
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
      { prompt: '(just / finish)', answer: 'has just finished', alternatives: [], noTenseContrast: true, wrong: [['has just finish', 3], ['was just finish', 4], ['just finish', 1]] }
    ],
    cues: [
      'a strong swimmer in his life so far.',
      'for years, until last September.',
      'Things changed last September, when his best friend Ryan [joined] the school swimming team and [asked] Jason to try out too.',
      'Since then, Jason [has practised]',
      'a single training session so far.',
      'a lot since the start of this term.',
      '[Have you ever swum] in a real competition since joining our team?',
      'Since Jason joined the team, his parents [have already bought]',
      'Last night, his younger sister [made]'
    ],
    questionPhrases: ['Have you ever swum']
  },
  {
    title: 'Exercise 2: Meet the Milk Tea Master of Sham Shui Po!',
    instructions: 'Read this interview from a school newspaper. Fill in the blanks with the correct form of the verbs in brackets. Decide carefully whether to use the present perfect tense or the simple past tense. (12 marks)',
    blanks: [
      { prompt: '(visit)', answer: 'visited', alternatives: [], wrong: [['has visit', 3], ['was visited', 6], ['has visited', 2]] },
      { prompt: '(run)', answer: 'has run', alternatives: ['has been running'], past: 'ran', participle: 'run', wrong: [['has ran', 5], ['ran', 2]] },
      { prompt: '(open)', answer: 'opened', alternatives: [], wrong: [['open', 1], ['has opened', 2], ['was opened', 6]] },
      { prompt: '(begin)', answer: 'began', alternatives: [], past: 'began', participle: 'begun', wrong: [['was began', 6], ['have begun', 2], ['have began', 5]] },
      { prompt: '(change)', answer: 'Has the café changed', alternatives: [], initial: true, wrong: [['Has the café change', 3], ['Did the café change', 2], ['Was the café change', 4]] },
      { prompt: '(not change)', answer: 'have not changed', alternatives: ["haven't changed"], wrong: [['were not changed', 6], ['did not change', 2]] },
      { prompt: '(already / sell)', answer: 'have already sold', alternatives: [], wrong: [['already sell', 1], ['have already sell', 3], ['already sold', 2]] },
      { prompt: '(write)', answer: 'wrote', alternatives: [], past: 'wrote', participle: 'written', wrong: [['has wrote', 5], ['was wrote', 6], ['has written', 2]] },
      { prompt: '(come)', answer: 'have come', alternatives: [], past: 'came', participle: 'come', wrong: [['came', 2], ['were came', 6], ['have came', 5]] },
      { prompt: '(think)', answer: 'Have you ever thought', alternatives: [], initial: true, wrong: [['Were you ever thought', 6], ['Have you ever think', 3], ['Did you ever think', 2]] },
      { prompt: '(not decide)', answer: 'has not decided', alternatives: ["hasn't decided"], wrong: [['did not decide', 2], ['has not decide', 3]] },
      { prompt: '(give)', answer: 'gave', alternatives: [], past: 'gave', participle: 'given', wrong: [['was gave', 6], ['has given', 2], ['has gave', 5]] }
    ],
    cues: [
      'Last Monday, our Form 2 reporter, Chloe Wong, [visited]',
      '[has run] the café since 1998.',
      'My father [opened] it in 1975.',
      'I [began] helping him in the kitchen when I was only fifteen.',
      'Chloe: [Has the café changed] much since then?',
      'We [have not changed] our milk tea recipe in almost fifty years.',
      'We [have already sold] over two hundred so far today,',
      'Two months ago, a famous food blogger [wrote]',
      'Lots of tourists [have come] here since then.',
      'Chloe: [Have you ever thought] about retiring since 1998?',
      'my daughter [has not decided] yet',
      'Before Chloe left, Mr Chan [gave]'
    ],
    questionPhrases: ['Has the café changed', 'Have you ever thought']
  },
  {
    title: 'Exercise 3: My New Friends at the Elderly Centre!',
    instructions: 'Read this email from Natalie to her cousin Kelly. Fill in the blanks with the correct form of the verbs in brackets. Decide carefully whether to use the present perfect tense or the simple past tense. (12 marks)',
    blanks: [
      { prompt: '(not reply)', answer: 'have not replied', alternatives: ["haven't replied"], wrong: [['was not replied', 6], ['did not reply', 2]] },
      { prompt: '(be)', answer: 'have been', alternatives: [], past: 'was', participle: 'been', wrong: [['was', 2], ['have was', 5], ['was be', 4]] },
      { prompt: '(take)', answer: 'took', alternatives: [], past: 'took', participle: 'taken', wrong: [['has took', 5], ['has taken', 2], ['was took', 6]] },
      { prompt: '(feel)', answer: 'felt', alternatives: [], wrong: [['have felt', 2], ['was feel', 4], ['have feel', 3]] },
      { prompt: '(not know)', answer: 'did not know', alternatives: ["didn't know"], wrong: [['was not knew', 6], ['have not known', 2]] },
      { prompt: '(make)', answer: 'have made', alternatives: [], wrong: [['have make', 3], ['made', 2], ['was make', 4]] },
      { prompt: '(live)', answer: 'has lived', alternatives: ['has been living'], wrong: [['lived', 2], ['has live', 3]] },
      { prompt: '(teach)', answer: 'taught', alternatives: [], wrong: [['teach', 1], ['was taught', 6], ['has taught', 2]] },
      { prompt: '(lose)', answer: 'have lost', alternatives: [], noTenseContrast: true, forbiddenDistractors: ['lost'], wrong: [['have lose', 3], ['lose', 1], ['was lose', 4]] },
      { prompt: '(just / start)', answer: 'have just started', alternatives: [], noTenseContrast: true, forbiddenDistractors: ['just started', 'has just started'], wrong: [['were just start', 4], ['have just start', 3], ['just start', 1]] },
      { prompt: '(do)', answer: 'Have you ever done', alternatives: [], initial: true, past: 'did', participle: 'done', wrong: [['Have you ever did', 5], ['Were you ever did', 6], ['Did you ever do', 2]] },
      { prompt: '(offer)', answer: 'offered', alternatives: [], wrong: [['has offered', 2], ['has offer', 3], ['was offer', 4]] }
    ],
    cues: [
      'To: kelly.cheung@mailbox.com\nSubject: My new friends at the elderly centre!\n\nDear Kelly,',
      'Sorry I [have not replied] to your email yet.',
      'I [have been] really busy since our first visit to the centre,',
      'Three weeks ago, our class teacher, Mr Ho, [took]',
      'On our first visit, I [felt] very shy. I [did not know]',
      'I [have made] some wonderful new friends at the centre since our first visit.',
      'she [has lived] in Wong Tai Sin since she was born,',
      'Last Saturday, Granny Leung [taught]',
      'I [have lost] every game so far,',
      'our class [have just started] planning a Mid-Autumn Festival party',
      '[Have you ever done] any volunteer work since the start of this school year?',
      'When I told Mum about the party yesterday, she [offered]',
      'Write back soon,\n\nNatalie'
    ],
    questionPhrases: ['Have you ever done']
  }
];
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
if (!topic) fail('Missing First Term / present-perfect topic.');
if (topic && (topic.type !== 'passage' || topic.blankType !== 'select')) fail('Topic must use select-based passage mode.');
if (topic?.label !== 'The Present Perfect') fail('Topic label must be The Present Perfect.');
if (topic?.exercises?.length !== expectedExercises.length) fail(`Expected ${expectedExercises.length} Present Perfect exercises.`);
let totalBlanks = 0;
expectedExercises.forEach((wantExercise, exerciseIndex) => {
  const exercise = topic?.exercises?.[exerciseIndex], prefix = `Exercise ${exerciseIndex + 1}`;
  if (!exercise) return;
  if (exercise.title !== wantExercise.title) fail(`${prefix}: title changed.`);
  if (wantExercise.instructions && exercise.instructions !== wantExercise.instructions) fail(`${prefix}: exercise-specific instructions missing or changed.`);
  const blanks = (exercise.segments || []).filter(s => typeof s === 'object');
  totalBlanks += blanks.length;
  if (blanks.length !== 12) fail(`${prefix}: must have 12 marked blanks; found ${blanks.length}.`);
  wantExercise.blanks.forEach((want, i) => {
    const b = blanks[i], label = `${prefix}, blank ${i + 1}`;
    if (!b) return;
    if (b.prompt !== want.prompt || b.showPrompt !== true) fail(`${label}: bracketed cue missing or changed.`);
    if (b.answer !== want.answer) fail(`${label}: teacher-supplied key changed.`);
    if (!same(b.alternatives || [], want.alternatives)) fail(`${label}: supplied accepted alternatives changed.`);
    if (!same(b.distractors || [], want.wrong.map(([text]) => text))) fail(`${label}: screened distractor set changed.`);
    if (Boolean(b.sentenceInitial) !== Boolean(want.initial)) fail(`${label}: sentence-position metadata changed.`);
    const choices = [b.answer, ...(b.alternatives || []), ...(b.distractors || [])];
    if (choices.length !== 4 || new Set(choices.map(s => s.toLowerCase())).size !== 4) fail(`${label}: needs exactly four unique choices.`);
    if ((b.distractors || []).some(s => /['’]/.test(s))) fail(`${label}: distractors must use whole words.`);
    if (!want.noTenseContrast && !want.wrong.some(([, rule]) => rule === 2)) fail(`${label}: missing the safe tense contrast.`);
    for (const [, rule] of want.wrong) {
      if (!Number.isInteger(rule) || rule < 1 || rule > 6) fail(`${label}: unapproved rule tag.`);
      if (rule === 5 && (!want.past || !want.participle || want.past === want.participle)) fail(`${label}: rule 5 requires a different past form and participle.`);
    }
    if (want.noTenseContrast && (b.distractors || []).includes('just finished')) fail(`${label}: never mark just finished wrong.`);
    for (const forbidden of want.forbiddenDistractors || []) {
      if ((b.distractors || []).includes(forbidden)) fail(`${label}: approved exception forbids ${forbidden} as a distractor.`);
    }
    if (!b.explanation || b.explanation.length > 240) fail(`${label}: missing or overlong explanation.`);
    for (const answer of [b.answer, ...(b.alternatives || [])]) {
      if (!b.explanation?.includes(answer)) fail(`${label}: explanation must name ${answer}.`);
    }
  });
  const text = exercise.segments.map(s => typeof s === 'string' ? s : `[${s.answer}]`).join('');
  for (const cue of wantExercise.cues) if (!text.includes(cue)) fail(`${prefix}: essential time context missing: ${cue}`);
  for (const phrase of wantExercise.questionPhrases) {
    if (text.split(phrase).length !== 2) fail(`${prefix}: complete question phrase must appear exactly once: ${phrase}`);
  }
  if (/\[(?:Have you ever swum|Have you ever thought|Have you ever done)\] you ever|\[Has the café changed\] the café/.test(text)) fail(`${prefix}: duplicated preprinted words after a question dropdown.`);
});
console.log(`Audited ${totalBlanks} Present Perfect blanks across ${expectedExercises.length} exercises against the six permitted distractor forms.`);
if (problems.length) {
  console.error(`Present Perfect validation violations: ${problems.length}`);
  problems.forEach(p => console.error(p));
  process.exit(1);
}
console.log('Present Perfect validation violations: 0');
