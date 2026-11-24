#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(JSON.stringify(vm.runInNewContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8') + '\nGRAMMAR_DATA;')));
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/unique-answer-safe-repairs.json')));
const index = new Map();
for (const [term, topics] of Object.entries(data)) for (const [key, topic] of Object.entries(topics)) {
  for (const item of topic.exercises || topic.questions || []) index.set(item.id, { term, key, topic, item });
}
const norm = s => String(s).trim().replace(/\s+/g, ' ').toLowerCase();
for (const f of fixture.fields) {
  const { item } = index.get(f.id);
  const value = f.field.split('.').reduce((x, k) => x[k], item);
  assert.deepEqual(value, f.expected, 'Audited field changed: ' + f.id + '/' + f.field);
}
let singleVisiblePassageKeys = 0;
for (const f of fixture.passageChoices) {
  const b = index.get(f.id).item.segments[f.segmentIndex];
  assert.equal(b.answer, f.answer);
  assert.deepEqual(b.alternatives || [], f.acceptedVariants, 'Existing grammatical variants must remain accepted');
  const visible = [b.answer, ...(b.displayAlternatives ?? b.alternatives ?? []), ...b.distractors];
  assert.deepEqual(visible, f.visible, 'Audited visible set changed');
  assert.equal(visible.length, 4); assert.equal(new Set(visible.map(norm)).size, 4);
  const accepted = [b.answer, ...(b.alternatives || [])].map(norm);
  assert.equal(visible.filter(v => accepted.includes(norm(v))).length, 1, 'Multiple accepted choices still visible');
  assert.ok(b.distractors.every(v => !accepted.includes(norm(v))), 'A valid variant is labelled wrong');
  singleVisiblePassageKeys++;
}
for (const f of fixture.pronounChoices) {
  const { topic, item } = index.get(f.id);
  assert.equal(item.pronoun, f.key); assert.deepEqual(item.pronounOptions, f.visible);
  assert.equal(new Set(f.visible).size, f.visible.length);
  assert.ok(f.visible.includes(f.key) && f.visible.every(v => topic.pronouns.includes(v)));
}
for (const f of fixture.frameChoices) {
  const { item } = index.get(f.id);
  assert.equal(item.frameCorrect, f.key); assert.deepEqual([item.frameCorrect, ...item.frameWrong], f.visible);
  assert.equal(new Set(f.visible).size, 4);
}
let total = 0, pendingVisibleVariants = [];
for (const { topic, item } of index.values()) if (topic.type === 'passage') {
  item.segments.forEach((b, i) => {
    if (typeof b !== 'object' || !b.distractors) return;
    total++;
    const visible = [b.answer, ...(b.displayAlternatives ?? b.alternatives ?? []), ...b.distractors];
    assert.equal(visible.length, 4); assert.equal(new Set(visible.map(norm)).size, 4);
    if ((b.displayAlternatives ?? b.alternatives ?? []).length) pendingVisibleVariants.push(item.id + '/segment:' + i);
    if (b.displayAlternatives) assert.ok(b.displayAlternatives.every(v => (b.alternatives || []).includes(v)));
  });
}
console.log(`PASS: ${fixture.fields.length} guarded fields; ${singleVisiblePassageKeys} audited passage blanks; ${fixture.pronounChoices.length} pronoun and ${fixture.frameChoices.length} frame selectors.`);
console.log(`Four-choice structure checked on ${total} verb/adjective dropdowns. ${pendingVisibleVariants.length} displayed accepted-variant sets remain pending teacher decisions.`);
console.log('This exact-set regression supplements the contextual audit; it does not certify unresolved items or possible new grammatical readings.');
