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
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/conditionals-exercise-1.json'), 'utf8'));
const topic = data['First Term'].conditionals;
assert.equal(topic.label, 'Conditional Sentences (Types 0, 1 and 2)');
assert.equal(topic.type, 'passage'); assert.equal(topic.blankType, 'select');
assert.ok(termKeys['First Term'].includes('conditionals'));
assert.equal(topic.exercises.length, 1);
const exercise = topic.exercises[0];
assert.equal(exercise.id, fixture.id); assert.equal(exercise.title, fixture.title);
assert.equal(exercise.instructions, fixture.instructions);
assert.equal(topic.instructions, fixture.instructions);
assert.equal(fixture.rules.length, 16);
const blanks = exercise.segments.filter(segment => typeof segment === 'object');
assert.equal(blanks.length, 12); assert.equal(blanks.length, fixture.marks);
assert.equal(blanks.length, fixture.blanks.length);
const forms = [
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
];
const norm = value => value.trim().replace(/\s+/g, ' ').toLowerCase();
const usedRules = new Set();
let hidden = 0;
blanks.forEach((blank, index) => {
  const expected = fixture.blanks[index];
  for (const field of ['answer', 'prompt', 'distractors', 'alternatives', 'explanation']) {
    assert.deepEqual(blank[field] || (field === 'alternatives' ? [] : blank[field]), expected[field], `Blank ${index + 1}: ${field} changed from screened set`);
  }
  assert.deepEqual(blank.displayAlternatives, [], 'Valid secondary answers must stay outside display');
  assert.equal(Boolean(blank.sentenceInitial), false); assert.equal(blank.showPrompt, true);
  assert.ok(blank.explanation.length <= 240);
  const visible = [blank.answer, ...blank.displayAlternatives, ...blank.distractors];
  const accepted = [blank.answer, ...(blank.alternatives || [])].map(norm);
  assert.equal(visible.length, 4); assert.equal(new Set(visible.map(norm)).size, 4);
  assert.equal(visible.filter(value => accepted.includes(norm(value))).length, 1);
  assert.ok(visible.every(value => value[0] === value[0].toLowerCase()));
  hidden += blank.alternatives.length;
  const [base, present, past, participle, ing] = forms[index];
  const negative = [5, 11].includes(index);
  const phrase = (verb, modal = '') => index === 2
    ? `${modal ? modal + ' ' : ''}you ${verb}`
    : `${modal ? modal + ' ' : ''}${negative ? 'not ' : ''}${verb}`;
  const candidates = {
    1: phrase(base, 'will'), 2: phrase(base, 'would'),
    3: [0, 8, 10].includes(index) ? base : null,
    4: present, 5: past, 6: phrase(participle), 7: phrase(ing),
    8: phrase(ing, 'will'), 9: phrase(ing, 'would'),
    10: phrase(negative ? forms[index][3] : past, 'will'),
    11: phrase(negative ? forms[index][3] : past, 'would')
  };
  const swaps = index === 5 ? ['am not finish', 'was not finish']
    : index === 11 ? ['is not raise', 'was not raise'] : [];
  assert.equal(expected.ruletags.length, 3);
  blank.distractors.forEach((value, j) => {
    assert.ok(!accepted.includes(norm(value)), 'Never label an accepted form wrong');
    assert.ok(!/['’]/.test(value), 'Wrong choices use expanded whole-word forms');
    const tags = expected.ruletags[j]; assert.ok(tags.length > 0);
    tags.forEach(rule => {
      assert.ok(Number.isInteger(rule) && rule >= 1 && rule <= 16);
      usedRules.add(rule);
      if (rule === 12 || rule === 13) assert.ok(swaps.includes(value), 'Negative auxiliary swaps require the correct subject and base verb');
      else if (rule === 14 || rule === 15) {
        assert.equal(index, 2, 'Question error rules apply only to the modal question');
        assert.equal(value, rule === 14 ? phrase(base) : phrase(base, 'are'), 'Question errors preserve subject and lexical base verb');
      } else if (rule === 16) {
        assert.ok([3, 4, 5, 6, 7, 11].includes(index), 'If-clause modal rule cannot change a result clause');
        assert.ok([phrase(base, 'will'), phrase(base, 'would')].includes(value), 'If-clause candidates preserve base verb and negative cues');
      }
      else assert.equal(value, candidates[rule], `Blank ${index + 1}: distractor does not match tagged formation ${rule}`);
    });
  });
});
// Rule 16: every if-clause blank shows at least one definitely wrong distractor beginning with will/would.
[3, 4, 5, 6, 7, 11].forEach(index => assert.ok(blanks[index].distractors.some(d => /^(will|would) /i.test(d)), `If-clause blank ${index + 1} needs a will/would distractor`));
assert.ok(!['will not finish', 'would not finish'].some(d => blanks[5].distractors.includes(d)), 'Defensible refusal readings stay excluded at blank 6');
assert.equal(hidden, 3);
assert.deepEqual(blanks[5].alternatives, ["don't finish"]);
assert.deepEqual(blanks[7].alternatives, ['was']);
assert.deepEqual(blanks[11].alternatives, ["doesn't raise"]);
assert.ok(blanks[5].distractors.includes('am not finish'));
assert.ok(blanks[11].distractors.includes('is not raise'));
assert.ok(!blanks[11].distractors.includes('is not raising'));
let n = 0;
const skeleton = exercise.segments.map(segment => typeof segment === 'string' ? segment : `(${++n}) __________ ${segment.prompt}`).join('');
assert.ok(skeleton.startsWith(fixture.example));
assert.equal((skeleton.match(/e\.g\. hoists \(hoist\)/g) || []).length, 1);
assert.equal((skeleton.match(/(?:^|\n\n)(?:Kelly|Jason):/g) || []).length, fixture.chatTurns);
assert.equal(crypto.createHash('sha256').update(skeleton).digest('hex'), fixture.skeleton_sha256, 'Conversation/cues must match the screened source');
assert.equal(blanks[2].answer, 'will you do');
assert.deepEqual(blanks[2].distractors, ['you do', 'are you do', 'will you doing']);
assert.ok(!blanks[2].distractors.includes('are you doing'), 'A grammatical progressive question must not be marked wrong');
assert.ok(skeleton.includes('So what (3) __________ (you / do) if school is closed?'));
console.log(`PASS: ${blanks.length} conditional blanks, four unique choices and one stored accepted answer visible each; ${hidden} valid alternatives hidden; 13 speaker turns; unscored example preserved.`);
console.log('Selected formation rules: ' + [...usedRules].sort((a, b) => a - b).join(', ') + '. Full-context screening remains the grammar-quality evidence.');
