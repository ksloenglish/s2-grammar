#!/usr/bin/env node
'use strict';
// Exact screened sets plus mechanical formation checks; not a substitute for context review.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
const data = JSON.parse(JSON.stringify(vm.runInNewContext(source + '\nGRAMMAR_DATA;')));
const termKeys = vm.runInNewContext(source + '\nTERM_KEYS;');
const topic = data['First Term'].conditionals;
assert.equal(topic.label, 'Conditional Sentences (Types 0, 1 and 2)');
assert.equal(topic.type, 'passage'); assert.equal(topic.blankType, 'select');
assert.ok(termKeys['First Term'].includes('conditionals'));
assert.deepEqual(topic.exercises.map(e => e.id), ['conditionals-p-001', 'conditionals-p-002'], 'Stable Conditional inventory and order');

// Mechanical formation config per exercise: [base, present, past, participle, ing] for each blank.
// `question` maps a blank index to the fixed words after the modal and the subject-appropriate be.
const CONFIGS = [
  {
    fixture: 'conditionals-exercise-1.json',
    forms: [
      ['lower', 'lowers', 'lowered', 'lowered', 'lowering'],
      ['have', 'have', 'had', 'had', 'having'],
      ['do', 'do', 'did', 'done', 'doing'],
      ['go', 'go', 'went', 'gone', 'going'],
      ['be', 'are', 'were', 'been', 'being'],
      ['finish', 'do not finish', 'did not finish', 'finished', 'finishing'],
      ['start', 'start', 'started', 'started', 'starting'],
      ['be', 'am', 'were', 'been', 'being'],
      ['want', 'wants', 'wanted', 'wanted', 'wanting'],
      ['feel', 'feels', 'felt', 'felt', 'feeling'],
      ['get', 'gets', 'got', 'got', 'getting'],
      ['raise', 'does not raise', 'did not raise', 'raised', 'raising']
    ],
    negative: [5, 11], rule3: [0, 8, 10],
    question: { 2: { subject: verb => `you ${verb}`, be: 'are' } },
    swaps: { 5: ['am not finish', 'was not finish'], 11: ['is not raise', 'was not raise'] },
    ifClauses: [3, 4, 5, 6, 7, 11],
    alternatives: { 5: ["don't finish"], 7: ['was'], 11: ["doesn't raise"] },
    example: /e\.g\. hoists \(hoist\)/g,
    excluded: { 2: ['are you doing'], 4: ['will be'], 5: ['will not finish', 'would not finish', 'am not finishing'], 11: ['is not raising'] },
    skeletonIncludes: ['So what (3) __________ (you / do) if school is closed?'],
    exact: { 2: ['you do', 'are you do', 'will you doing'] }
  },
  {
    fixture: 'conditionals-exercise-2.json',
    forms: [
      ['be', 'am', 'were', 'been', 'being'],
      ['try', 'do not try', 'did not try', 'tried', 'trying'],
      ['train', 'train', 'trained', 'trained', 'training'],
      ['happen', 'happens', 'happened', 'happened', 'happening'],
      ['practise', 'practise', 'practised', 'practised', 'practising'],
      ['get', 'get', 'got', 'got', 'getting'],
      ['have', 'have', 'had', 'had', 'having'],
      ['issue', 'issues', 'issued', 'issued', 'issuing'],
      ['become', 'becomes', 'became', 'become', 'becoming'],
      ['have', 'does not have', 'did not have', 'had', 'having'],
      ['worry', 'do not worry', 'did not worry', 'worried', 'worrying'],
      ['do', 'do', 'did', 'done', 'doing']
    ],
    negative: [1, 9, 10], rule3: [7, 8],
    question: { 3: { subject: verb => verb, be: 'is' }, 6: { subject: verb => `we still ${verb}`, be: 'are' } },
    swaps: { 1: ['are not try', 'were not try'], 9: ['was not have', 'were not have'] },
    ifClauses: [0, 1, 2, 4, 7, 9, 11],
    alternatives: { 0: ['was'], 1: ["don't try"], 9: ["didn't have"], 10: ["wouldn't worry"] },
    example: /e\.g\. want \(want\)/g,
    // Screened as defensible in this conversation (willingness/refusal/request, Type 1 general result,
    // declarative question, past-real or mixed readings): never display these as wrong answers.
    excluded: {
      0: ['will be', 'was'], 1: ['will not try', 'would not try', 'did not try'],
      2: ['will train', 'would train', 'trained'], 4: ['will practise', 'would practise', 'practised'],
      5: ['will get', 'would get'], 6: ['we still have', 'do we still have', 'would we still have'],
      7: ['issue', 'will issue', 'would issue', 'issued'], 8: ['will become', 'would become'],
      9: ['will not have', 'had not'], 10: ['will not worry'], 11: ['will do', 'would do', 'did']
    },
    // Teacher decision (2026-11-28): one reviewer rated these defensible, the other definitely wrong;
    // the teacher chose to display them as the rule 2/16 if-clause modal errors.
    teacherApproved: { 0: 'would be', 9: 'would not have' },
    skeletonIncludes: ['But what (4) __________ (happen) if I dropped the baton in the final?',
      'Mr Chan, (7) __________ (we / still have) Sports Day if it rains heavily that day?'],
    exact: { 0: ['been', 'being', 'would be'], 9: ['was not have', 'not having', 'would not have'] }
  }
];

const norm = value => value.trim().replace(/\s+/g, ' ').toLowerCase();
const rulesCatalog = JSON.stringify(JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', CONFIGS[0].fixture), 'utf8')).rules);
const usedRules = new Set();
let totalBlanks = 0, totalHidden = 0;
CONFIGS.forEach((cfg, exIndex) => {
  const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', cfg.fixture), 'utf8'));
  const exercise = topic.exercises[exIndex];
  const label = `Exercise ${exIndex + 1}`;
  assert.equal(exercise.id, fixture.id); assert.equal(exercise.title, fixture.title);
  assert.equal(exercise.instructions, fixture.instructions);
  assert.equal(fixture.rules.length, 16); assert.equal(JSON.stringify(fixture.rules), rulesCatalog, 'One shared 16-rule Conditional catalog');
  const blanks = exercise.segments.filter(segment => typeof segment === 'object');
  assert.equal(blanks.length, 12); assert.equal(blanks.length, fixture.marks);
  assert.equal(blanks.length, fixture.blanks.length); assert.equal(cfg.forms.length, 12);
  let hidden = 0;
  blanks.forEach((blank, index) => {
    const where = `${label} blank ${index + 1}`;
    const expected = fixture.blanks[index];
    for (const field of ['answer', 'prompt', 'distractors', 'alternatives', 'explanation']) {
      assert.deepEqual(blank[field] || (field === 'alternatives' ? [] : blank[field]), expected[field], `${where}: ${field} changed from screened set`);
    }
    assert.deepEqual(blank.alternatives, cfg.alternatives[index] || [], `${where}: accepted alternatives`);
    assert.deepEqual(blank.displayAlternatives, [], 'Valid secondary answers must stay outside display');
    assert.equal(Boolean(blank.sentenceInitial), false); assert.equal(blank.showPrompt, true);
    assert.ok(blank.explanation.length <= 240);
    const visible = [blank.answer, ...blank.displayAlternatives, ...blank.distractors];
    const accepted = [blank.answer, ...(blank.alternatives || [])].map(norm);
    assert.equal(visible.length, 4); assert.equal(new Set(visible.map(norm)).size, 4);
    assert.equal(visible.filter(value => accepted.includes(norm(value))).length, 1);
    assert.ok(visible.every(value => value[0] === value[0].toLowerCase()));
    for (const bad of cfg.excluded[index] || []) assert.ok(!blank.distractors.includes(bad), `${where}: defensible '${bad}' must not be displayed as wrong`);
    if (cfg.exact[index]) assert.deepEqual(blank.distractors, cfg.exact[index]);
    if (cfg.teacherApproved?.[index]) assert.ok(blank.distractors.includes(cfg.teacherApproved[index]), `${where}: teacher-approved '${cfg.teacherApproved[index]}' must stay displayed`);
    hidden += blank.alternatives.length;
    const [base, present, past, participle, ing] = cfg.forms[index];
    const negative = cfg.negative.includes(index);
    const q = cfg.question[index];
    const phrase = (verb, modal = '') => q
      ? `${modal ? modal + ' ' : ''}${q.subject(verb)}`
      : `${modal ? modal + ' ' : ''}${negative ? 'not ' : ''}${verb}`;
    const candidates = {
      1: phrase(base, 'will'), 2: phrase(base, 'would'),
      3: cfg.rule3.includes(index) ? base : null,
      4: present, 5: past, 6: phrase(participle), 7: phrase(ing),
      8: phrase(ing, 'will'), 9: phrase(ing, 'would'),
      10: phrase(negative ? participle : past, 'will'),
      11: phrase(negative ? participle : past, 'would')
    };
    const swaps = cfg.swaps[index] || [];
    assert.equal(expected.ruletags.length, 3);
    blank.distractors.forEach((value, j) => {
      assert.ok(!accepted.includes(norm(value)), 'Never label an accepted form wrong');
      assert.ok(!/['’]/.test(value), 'Wrong choices use expanded whole-word forms');
      const tags = expected.ruletags[j]; assert.ok(tags.length > 0);
      tags.forEach(rule => {
        assert.ok(Number.isInteger(rule) && rule >= 1 && rule <= 16);
        usedRules.add(rule);
        if (rule === 12 || rule === 13) assert.ok(swaps.includes(value), `${where}: negative auxiliary swaps require the correct subject and base verb`);
        else if (rule === 14 || rule === 15) {
          assert.ok(q, `${where}: question error rules apply only to a will/would question`);
          assert.equal(value, rule === 14 ? q.subject(base) : `${q.be} ${q.subject(base)}`, `${where}: question errors preserve subject and lexical base verb`);
        } else if (rule === 16) {
          assert.ok(cfg.ifClauses.includes(index), `${where}: if-clause modal rule cannot change a result clause`);
          assert.ok([phrase(base, 'will'), phrase(base, 'would')].includes(value), 'If-clause candidates preserve base verb and negative cues');
        }
        else assert.equal(value, candidates[rule], `${where}: distractor does not match tagged formation ${rule}`);
      });
    });
  });
  // Rule 16: every if-clause blank shows at least one definitely wrong distractor beginning with will/would.
  cfg.ifClauses.forEach(index => assert.ok(blanks[index].distractors.some(d => /^(will|would) /i.test(d)), `${label} if-clause blank ${index + 1} needs a will/would distractor`));
  assert.equal(hidden, Object.values(cfg.alternatives).flat().length);
  let n = 0;
  const skeleton = exercise.segments.map(segment => typeof segment === 'string' ? segment : `(${++n}) __________ ${segment.prompt}`).join('');
  assert.ok(skeleton.startsWith(fixture.example));
  assert.equal((skeleton.match(cfg.example) || []).length, 1, `${label}: one unscored example`);
  const speakerRe = /(?:^|\n\n)((?:(?:Mr|Mrs|Ms|Miss)\s+)?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?):/g;
  const speakers = [...skeleton.matchAll(speakerRe)].map(m => m[1]);
  assert.equal(speakers.length, fixture.chatTurns, `${label}: speaker turns`);
  if (fixture.speakers) assert.deepEqual(speakers, fixture.speakers, `${label}: exact speaker order`);
  assert.equal(crypto.createHash('sha256').update(skeleton).digest('hex'), fixture.skeleton_sha256, `${label}: conversation/cues must match the screened source`);
  cfg.skeletonIncludes.forEach(text => assert.ok(skeleton.includes(text), `${label}: ${text}`));
  totalBlanks += blanks.length; totalHidden += hidden;
  console.log(`PASS ${label}: 12 conditional blanks, four unique choices and one accepted answer visible each; ${hidden} valid alternatives hidden; ${fixture.chatTurns} speaker turns; unscored example preserved; every if-clause has a will/would distractor.`);
});
// Exercise 1 topic-level instruction is part of every saved Conditional fingerprint; keep it unchanged.
assert.equal(topic.instructions, JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', CONFIGS[0].fixture), 'utf8')).instructions);
console.log(`PASS: ${CONFIGS.length} Conditional exercises, ${totalBlanks} blanks, ${totalHidden} hidden accepted forms.`);
console.log('Selected formation rules: ' + [...usedRules].sort((a, b) => a - b).join(', ') + '. Full-context screening remains the grammar-quality evidence.');
