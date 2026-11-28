#!/usr/bin/env node
'use strict';
// No browser, real student storage, third-party packages, or production-data mutation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
const adapter = fs.readFileSync(path.join(root, 'mistakes.js'), 'utf8');
const KEY = 'kslo_s2_grammar_mistakes_v1';
const TTL = 90 * 24 * 60 * 60 * 1000;
const LIMIT = 128 * 1024;
const NOW = Date.UTC(2026, 10, 24);
const clone = value => JSON.parse(JSON.stringify(value));
const load = text => clone(vm.runInNewContext(text + '\nGRAMMAR_DATA;'));
const production = load(source);
const tests = [];
const test = (label, run) => tests.push({ label, run });
const keys = records => records.map(record => record.id);
const schemaFields = ['term', 'topic', 'type', 'id', 'revision', 'engineVersion', 'earned', 'max', 'firstSeen', 'updatedAt'].sort();

function storage() {
  return {
    values: new Map(), readError: false, writeError: false, writes: 0,
    getItem(key) {
      if (this.readError) throw new Error('SecurityError');
      return this.values.has(key) ? this.values.get(key) : null;
    },
    setItem(key, value) {
      this.writes++;
      if (this.writeError) throw new Error('QuotaExceededError');
      this.values.set(key, String(value));
    },
    removeItem(key) { this.values.delete(key); }
  };
}

function harness(data = production, disk = storage(), options = {}) {
  let time = NOW;
  const listeners = new Map();
  const window = {
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(callback);
    }
  };
  Object.defineProperty(window, 'localStorage', { get() {
    if (options.unavailable) throw new Error('Storage denied');
    return options.missing ? undefined : disk;
  } });
  class FakeDate extends Date { static now() { return time; } }
  const context = vm.createContext({ window, Date: FakeDate });
  vm.runInContext('const GRAMMAR_DATA = ' + JSON.stringify(data) + ';', context);
  vm.runInContext(adapter, context, { filename: 'mistakes.js' });
  const api = window.KSLOMistakes;
  return {
    api, disk, data, context,
    tick(ms = 1000) { time += ms; },
    now() { return time; },
    list() { return clone(api.list()); },
    status() { return clone(api.status()); },
    event(key = KEY, extra = {}) {
      (listeners.get('storage') || []).forEach(callback => callback({ key, storageArea: disk, ...extra }));
    }
  };
}

function fixture(pCount = 3, qCount = 3) {
  return { 'Fixture Term': {
    passages: { type: 'passage', instructions: 'Choose.', blankType: 'select', exercises:
      Array.from({ length: pCount }, (_, i) => ({ id: 'fixture-p-' + i, title: 'Passage ' + i,
        segments: ['Text ', { answer: 'yes', distractors: ['no'] }, ' end.'] })) },
    builder: { type: 'builder', instructions: 'Combine.', pronouns: ['who', 'which'], questions:
      Array.from({ length: qCount }, (_, i) => ({ id: 'fixture-q-' + i, s1: 'Sentence ' + i,
        s2: 'Another.', pronoun: 'who', clause: ['is', 'kind'] })) },
    rs: { type: 'builder-rs', instructions: 'Report.', questions: [
      { id: 'fixture-rs-2', prompt: 'Command.', clauseCorrect: ['to go'], timeCorrect: [], timeWrong: [] },
      { id: 'fixture-rs-3', prompt: 'Statement.', clauseCorrect: ['he', 'went'], timeCorrect: ['then'], timeWrong: ['now'] }
    ] },
    mc: { type: 'mc', instructions: 'Pick.', questions: [
      { id: 'fixture-mc-1', question: 'Choose?', options: ['a', 'b'], answer: 'a' }
    ] }
  } };
}

function attempt(h, topic = 'builder', index = 0, earned = 0, max = 3, term = 'Fixture Term') {
  const topicData = h.data[term][topic];
  const item = (topicData.type === 'passage' ? topicData.exercises : topicData.questions)[index];
  h.api.record(term, topic, item, earned, max);
  return item;
}
const put = (h, records, version = 1) => h.disk.values.set(KEY, JSON.stringify({ version, records }));
const snapshot = h => h.disk.values.get(KEY);
const restore = (data, text, options) => {
  const disk = storage();
  if (text !== undefined) disk.values.set(KEY, text);
  return harness(data, disk, options);
};

function stripIDs(data) {
  const result = clone(data);
  for (const topics of Object.values(result)) {
    for (const topic of Object.values(topics)) {
      for (const collection of ['exercises', 'questions']) {
        (topic[collection] || []).forEach(item => { delete item.id; });
      }
    }
  }
  return result;
}
const stripSourceIDs = text => text
  .replace(/^ {10}id: "[^"\n]+",\n/gm, '')
  .replace(/\{"id":"[^"\n]+",/g, '{');
let inventory;

test('Permanent literal IDs are globally unique and existing keys/accepted forms retain their identities', () => {
  const baselineSource = execFileSync('git', ['show', 'HEAD:data.js'], { cwd: root, encoding: 'utf8' });
  const baseline = load(baselineSource);
  const ids = new Set();
  const rows = [];
  let passages = 0, questions = 0;
  for (const [term, topics] of Object.entries(production)) {
    for (const [topicKey, topic] of Object.entries(topics)) {
      for (const collection of ['exercises', 'questions']) {
        const items = topic[collection] || [];
        items.forEach((item, index) => {
          assert.equal(Object.hasOwn(item, 'id'), true, `${topicKey} missing ID`);
          assert.match(item.id, /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/);
          assert.equal(ids.has(item.id), false, 'Duplicate ID: ' + item.id);
          ids.add(item.id);
          const prior = (baseline[term]?.[topicKey]?.[collection] || []).find(old => old.id === item.id);
          if (prior) {
            assert.equal(item.id, prior.id, 'Existing permanent ID changed');
            for (const field of ['answer', 'pronoun', 'correctGap', 'frameCorrect', 'clauseCorrect', 'timeCorrect']) {
              if (Object.hasOwn(prior, field)) assert.deepEqual(item[field], prior[field], 'Existing teacher key changed: ' + item.id + '/' + field);
            }
            if (prior.segments) prior.segments.forEach((blank, i) => {
              if (typeof blank !== 'object') return;
              assert.equal(item.segments[i].answer, blank.answer, 'Passage key changed');
              assert.deepEqual(item.segments[i].alternatives || [], blank.alternatives || [], 'Accepted variant changed');
            });
          }
          const escaped = item.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          assert.match(source, new RegExp('(?:\\bid|"id")\\s*:\\s*"' + escaped + '"'), 'ID must be a literal');
        });
        if (items.length) rows.push({ term, topic: topicKey, type: topic.type, count: items.length });
        if (collection === 'exercises') passages += items.length;
        else questions += items.length;
      }
    }
  }
  for (const topics of Object.values(baseline)) for (const topic of Object.values(topics)) {
    for (const prior of topic.exercises || topic.questions || []) {
      if (Object.hasOwn(prior, 'id')) assert.ok(ids.has(prior.id), 'Existing permanent ID removed: ' + prior.id);
    }
  }
  const literals = source.match(/(?:\bid|"id")\s*:\s*"[a-zA-Z0-9][a-zA-Z0-9._-]*"/g) || [];
  assert.equal(literals.length, ids.size, 'Every ID must be stored exactly once as metadata');
  inventory = { passages, questions, total: ids.size, topics: rows };
});

test('API is exact, empty readable storage is persistent, and reads do not write or notify', () => {
  const h = harness(fixture());
  assert.deepEqual(Object.keys(h.api).sort(), ['list', 'resolve', 'record', 'clear', 'status', 'subscribe'].sort());
  assert.deepEqual(h.list(), []);
  assert.deepEqual(h.status(), { persistent: true });
  let calls = 0;
  h.api.subscribe(() => { calls++; h.api.list(); h.api.status(); });
  h.api.list(); h.api.status(); h.api.resolve(null);
  assert.equal(calls, 0); assert.equal(h.disk.writes, 0);
});

test('Add, deduplicate, keep firstSeen, update last marks, and return defensive copies', () => {
  const h = harness(fixture());
  const item = attempt(h);
  const original = h.list()[0];
  assert.deepEqual(Object.keys(original).sort(), schemaFields);
  assert.equal(h.api.resolve(original).item.id, item.id);
  assert.equal(h.api.resolve(original).topicData.type, 'builder');
  h.tick(); attempt(h, 'builder', 0, 2);
  const repeated = h.list();
  assert.equal(repeated.length, 1);
  assert.equal(repeated[0].firstSeen, original.firstSeen);
  assert.equal(repeated[0].updatedAt, h.now()); assert.equal(repeated[0].earned, 2);
  const copies = h.api.list(); copies[0].earned = 99; copies.push(original);
  assert.equal(h.list().length, 1); assert.equal(h.list()[0].earned, 2);
  assert.deepEqual(restore(fixture(), snapshot(h)).list(), repeated);
});

test('Full marks remove only that exact saved item; untouched items are retained', () => {
  const h = harness(fixture());
  attempt(h); attempt(h, 'builder', 1); attempt(h, 'passages', 0, 0, 1);
  attempt(h, 'builder', 0, 3);
  assert.deepEqual(new Set(keys(h.list())), new Set(['fixture-q-1', 'fixture-p-0']));
  attempt(h, 'passages', 0, 1, 1);
  assert.deepEqual(keys(h.list()), ['fixture-q-1']);
  attempt(h, 'builder', 2, 3);
  assert.deepEqual(keys(h.list()), ['fixture-q-1']);
});

test('Oldest-first order survives repeated errors and deterministic timestamp ties', () => {
  const h = harness(fixture());
  attempt(h, 'builder', 2); h.tick(); attempt(h, 'builder', 0); h.tick(); attempt(h, 'builder', 1);
  h.tick(); attempt(h, 'builder', 2, 2);
  assert.deepEqual(keys(h.list()), ['fixture-q-2', 'fixture-q-0', 'fixture-q-1']);
  const tie = harness(fixture()); attempt(tie, 'builder', 2); attempt(tie, 'builder', 0);
  assert.deepEqual(keys(tie.list()), ['fixture-q-0', 'fixture-q-2']);
});

test('All real catalog items resolve with their exact passage/2-step/3-step maxima', () => {
  const h = harness();
  let count = 0, twoStep = 0, threeStep = 0;
  for (const [term, topics] of Object.entries(production)) {
    for (const [topicKey, topic] of Object.entries(topics)) {
      for (const item of topic.exercises || topic.questions || []) {
        const max = topic.type === 'passage' ? item.segments.filter(segment => typeof segment === 'object').length
          : topic.type === 'builder-rs' ? 2 + (item.timeCorrect.length ? 1 : 0) : 3;
        h.api.record(term, topicKey, item, max - 1, max);
        const record = h.list().find(value => value.id === item.id);
        assert.ok(record, item.id); assert.equal(record.max, max);
        const resolved = h.api.resolve(record);
        assert.ok(resolved); assert.equal(resolved.item.id, item.id);
        if (topic.type === 'builder-rs') { if (max === 2) twoStep++; else threeStep++; }
        count++;
      }
    }
  }
  assert.equal(h.list().length, count);
  inventory.reportedSpeechMaxima = { twoMarks: twoStep, threeMarks: threeStep };
});

test('Future MC fixture uses immutable ID and first-attempt 0/1 marks', () => {
  const h = harness(fixture()); attempt(h, 'mc', 0, 0, 1);
  assert.equal(h.list()[0].type, 'mc'); assert.equal(h.list()[0].max, 1);
  assert.equal(h.api.resolve(h.list()[0]).item.id, 'fixture-mc-1');
  attempt(h, 'mc', 0, 1, 1); assert.deepEqual(h.list(), []);
});

test('Invalid marks, mismatched max, missing IDs and untrusted lookups are rejected', () => {
  const h = harness(fixture());
  for (const [earned, max] of [[-1, 3], [4, 3], [1.5, 3], [NaN, 3], [0, 0], [0, 2], [0, Infinity], ['0', 3]]) {
    attempt(h, 'builder', 0, earned, max);
  }
  h.api.record('Fixture Term', 'builder', {}, 0, 3);
  for (const bad of ['__proto__', 'constructor', 'prototype', 'missing', {}, null, '\u0000']) {
    h.api.record(bad, 'builder', { id: 'fixture-q-0' }, 0, 3);
    h.api.record('Fixture Term', bad, { id: 'fixture-q-0' }, 0, 3);
    h.api.record('Fixture Term', 'builder', { id: bad }, 0, 3);
  }
  assert.deepEqual(h.list(), []);
  attempt(h); attempt(h, 'builder', 0, 2, 2);
  assert.equal(h.list().length, 1, 'Invalid full-mark maximum must not clear a record');
});

test('Both Reported Speech maxima are enforced independently', () => {
  const h = harness(fixture());
  attempt(h, 'rs', 0, 1, 2); attempt(h, 'rs', 1, 2, 3);
  assert.deepEqual(h.list().map(record => record.max), [2, 3]);
  attempt(h, 'rs', 0, 2, 3); assert.equal(h.list().length, 2);
  attempt(h, 'rs', 0, 2, 2); attempt(h, 'rs', 1, 3, 3);
  assert.deepEqual(h.list(), []);
});

test('Reordering and unrelated additions retain revisions and saved identity', () => {
  const data = fixture(); const h = harness(data); attempt(h); attempt(h, 'passages', 1, 0, 1);
  const saved = h.list();
  const next = clone(data);
  next['Fixture Term'].builder.questions.reverse();
  next['Fixture Term'].passages.exercises.reverse();
  next['Fixture Term'].builder.questions.unshift({ ...next['Fixture Term'].builder.questions[0], id: 'new-item' });
  assert.deepEqual(restore(next, snapshot(h)).list(), saved);
  const loaded = restore(next, snapshot(h));
  assert.equal(loaded.api.resolve(saved[0]).item.id, saved[0].id);
});

test('An edited item is removed individually, not its unchanged topic neighbours', () => {
  const data = fixture(); const h = harness(data); attempt(h); attempt(h, 'builder', 1);
  const saved = h.list(); const next = clone(data);
  next['Fixture Term'].builder.questions[0].s1 = 'Edited content.';
  const loaded = restore(next, snapshot(h));
  assert.deepEqual(keys(loaded.list()), ['fixture-q-1']);
  assert.equal(loaded.api.resolve(saved[0]), null);
  attempt(loaded); assert.equal(loaded.list().length, 2);
  assert.notEqual(loaded.list().find(record => record.id === saved[0].id).revision, saved[0].revision);
});

test('Passage answer/distractor edits invalidate only that exercise on catalog reload', () => {
  const data = fixture(); const h = harness(data);
  attempt(h, 'passages', 0, 0, 1); attempt(h, 'passages', 1, 0, 1);
  const original = h.list()[0];
  const next = clone(data); next['Fixture Term'].passages.exercises[0].segments[1].distractors.push('changed');
  const loaded = restore(next, snapshot(h));
  assert.deepEqual(keys(loaded.list()), ['fixture-p-1']); assert.equal(loaded.api.resolve(original), null);
  attempt(loaded, 'passages', 0, 0, 1);
  assert.notEqual(loaded.list().find(record => record.id === original.id).revision, original.revision);
});

test('Topic instructions and option pools affect revisions; decorative labels do not', () => {
  const data = fixture(); const h = harness(data); attempt(h); attempt(h, 'passages', 0, 0, 1);
  const text = snapshot(h);
  for (const field of ['instructions', 'pronouns', 'futureOptions']) {
    const next = clone(data); next['Fixture Term'].builder[field] = ['changed'];
    assert.deepEqual(keys(restore(next, text).list()), ['fixture-p-0']);
  }
  const next = clone(data);
  Object.assign(next['Fixture Term'].builder, { label: 'New title', icon: 'x', iconClass: 'new', desc: 'New card' });
  assert.deepEqual(restore(next, text).list(), h.list());
});

test('Canonical object-key ordering is stable, but meaningful option order changes revision', () => {
  const data = fixture(); const h = harness(data); attempt(h);
  const next = clone(data);
  next['Fixture Term'].builder.questions[0] = Object.fromEntries(Object.entries(next['Fixture Term'].builder.questions[0]).reverse());
  next['Fixture Term'].builder = Object.fromEntries(Object.entries(next['Fixture Term'].builder).reverse());
  assert.deepEqual(restore(next, snapshot(h)).list(), h.list());
  next['Fixture Term'].builder.pronouns.reverse();
  assert.deepEqual(restore(next, snapshot(h)).list(), []);
});

test('Deleted IDs, renamed IDs, removed topics and engine changes are invalidated individually', () => {
  const data = fixture(); const h = harness(data); attempt(h); attempt(h, 'passages', 0, 0, 1);
  const mutations = [
    next => next['Fixture Term'].builder.questions.shift(),
    next => { next['Fixture Term'].builder.questions[0].id = 'renamed'; },
    next => { delete next['Fixture Term'].builder; },
    next => { next['Fixture Term'].builder.type = 'mc'; }
  ];
  for (const mutate of mutations) {
    const next = clone(data); mutate(next);
    assert.deepEqual(keys(restore(next, snapshot(h)).list()), ['fixture-p-0']);
  }
});

test('Duplicate or absent catalog IDs never resolve via an index or random fallback', () => {
  const data = fixture(); const h = harness(data); attempt(h); attempt(h, 'builder', 1);
  const duplicate = clone(data);
  duplicate['Fixture Term'].passages.exercises[0].id = 'fixture-q-0';
  assert.deepEqual(keys(restore(duplicate, snapshot(h)).list()), ['fixture-q-1']);
  const missing = clone(data); delete missing['Fixture Term'].builder.questions[0].id;
  assert.deepEqual(keys(restore(missing, snapshot(h)).list()), ['fixture-q-1']);
});

test('Corrupt JSON, wrong schemas and extra envelope keys are harmless and repair on a write', () => {
  for (const text of ['{', 'null', '[]', '{}', '{"version":2,"records":[]}',
    '{"version":1,"records":{}}', '{"version":1,"records":[],"answer":"private"}']) {
    const h = restore(fixture(), text);
    assert.deepEqual(h.list(), []); assert.equal(h.status().persistent, true);
    attempt(h); assert.equal(h.list().length, 1);
    assert.equal(JSON.parse(snapshot(h)).version, 1);
  }
});

test('Malformed/incompatible individual records cannot contaminate valid neighbours', () => {
  const h = harness(fixture()); attempt(h); const valid = h.list()[0];
  const bad = [null, [], {}, { ...valid, id: '__proto__' }, { ...valid, topic: 'constructor' },
    { ...valid, revision: 'wrong' }, { ...valid, engineVersion: 'future' }, { ...valid, type: 'mc' },
    { ...valid, max: 2 }, { ...valid, earned: 3 }, { ...valid, earned: -1 },
    { ...valid, firstSeen: 'now' }, { ...valid, updatedAt: valid.firstSeen - 1 },
    { ...valid, updatedAt: NOW + 300001 }, { ...valid, studentAnswer: 'private' },
    { ...valid, copiedQuestion: 'private' }];
  put(h, [...bad, valid]); assert.deepEqual(h.list(), [valid]);
  for (const record of bad) assert.equal(h.api.resolve(record), null);
  const inherited = Object.create(valid); assert.equal(h.api.resolve(inherited), null);
  const hostile = { get term() { throw Error('hostile getter'); } }; assert.equal(h.api.resolve(hostile), null);
});

test('Prototype-pollution payloads and unrelated namespaces remain untouched', () => {
  const h = harness(fixture()); attempt(h); const record = h.list()[0];
  const poison = JSON.parse(JSON.stringify(record).slice(0, -1) + ',"__proto__":{"polluted":true}}');
  put(h, [poison, record]); assert.deepEqual(h.list(), [record]);
  h.disk.values.set('theme', 'dark'); h.disk.values.set('stats', '{"best":10}');
  h.api.clear(); assert.equal(h.disk.values.get('theme'), 'dark'); assert.equal(h.disk.values.get('stats'), '{"best":10}');
  assert.equal({}.polluted, undefined);
});

test('Corrupt duplicate stored references retain oldest firstSeen and latest result', () => {
  const h = harness(fixture()); attempt(h); const first = h.list()[0];
  h.tick(); const later = { ...first, earned: 2, firstSeen: h.now(), updatedAt: h.now() };
  put(h, [later, first]); const loaded = h.list();
  assert.equal(loaded.length, 1); assert.equal(loaded[0].earned, 2);
  assert.equal(loaded[0].firstSeen, first.firstSeen); assert.equal(loaded[0].updatedAt, later.updatedAt);
});

test('Independent bounds retain newest 100 passages and 200 questions', () => {
  const h = harness(fixture(102, 203));
  for (let i = 0; i < 102; i++) { attempt(h, 'passages', i, 0, 1); h.tick(); }
  for (let i = 0; i < 203; i++) { attempt(h, 'builder', i); h.tick(); }
  const list = h.list();
  assert.equal(list.filter(record => record.type === 'passage').length, 100);
  assert.equal(list.filter(record => record.type !== 'passage').length, 200);
  assert.equal(list.length, 300);
  assert.equal(keys(list).includes('fixture-p-0'), false); assert.equal(keys(list).includes('fixture-p-1'), false);
  assert.equal(keys(list).includes('fixture-q-2'), false); assert.equal(keys(list).includes('fixture-q-3'), true);
  assert.ok(Math.max(Buffer.byteLength(snapshot(h), 'utf8'), snapshot(h).length * 2) <= LIMIT);
});

test('128 KiB ceiling also prunes long Unicode references oldest-first', () => {
  const data = fixture(100, 200);
  const old = data['Fixture Term']; delete data['Fixture Term'];
  const term = '\u6f22'.repeat(100); const topic = '\u6587'.repeat(100);
  data[term] = { [topic]: old.builder, passages: old.passages };
  old.builder.questions.forEach((item, i) => { item.id = 'long-' + String(i).padStart(3, '0') + '-'.repeat(90); });
  const h = harness(data);
  for (let i = 0; i < 100; i++) { attempt(h, 'passages', i, 0, 1, term); h.tick(); }
  for (let i = 0; i < 200; i++) { attempt(h, topic, i, 0, 3, term); h.tick(); }
  assert.ok(h.list().length < 300);
  assert.ok(Math.max(Buffer.byteLength(snapshot(h), 'utf8'), snapshot(h).length * 2) <= LIMIT);
  assert.equal(h.list()[h.list().length - 1].id, old.builder.questions[199].id);
});

test('Expired/invalid entries are dropped before bounds evict an oldest valid item', () => {
  const h = harness(fixture(0, 202));
  for (let i = 0; i < 200; i++) { attempt(h, 'builder', i); h.tick(); }
  const valid = h.list();
  const bad = { ...valid[0], id: 'fixture-q-200', revision: 'wrong' };
  const expired = { ...valid[0], id: 'fixture-q-201', updatedAt: NOW - TTL, firstSeen: NOW - TTL };
  put(h, [bad, expired, ...valid]);
  assert.deepEqual(h.list(), valid);
});

test('Expiry is exactly 90 days after updatedAt and renewed errors preserve firstSeen', () => {
  const h = harness(fixture()); attempt(h); const firstSeen = h.list()[0].firstSeen;
  h.tick(TTL - 1); assert.equal(h.list().length, 1);
  attempt(h, 'builder', 0, 2); assert.equal(h.list()[0].firstSeen, firstSeen);
  h.tick(TTL - 1); assert.equal(h.list().length, 1);
  h.tick(1); assert.deepEqual(h.list(), []);
});

test('Unavailable getter/missing storage keep in-memory additions, deletions and clear', () => {
  for (const options of [{ unavailable: true }, { missing: true }]) {
    const h = harness(fixture(), storage(), options);
    assert.equal(h.status().persistent, false);
    attempt(h); attempt(h, 'builder', 1); assert.equal(h.list().length, 2);
    attempt(h, 'builder', 0, 3); assert.deepEqual(keys(h.list()), ['fixture-q-1']);
    h.event(); assert.deepEqual(keys(h.list()), ['fixture-q-1']);
    h.api.clear(); assert.deepEqual(h.list(), []); assert.equal(h.status().persistent, false);
  }
});

test('Read failures preserve existing memory, report fallback, then recover without outcome loss', () => {
  const h = harness(fixture()); attempt(h); h.disk.readError = true;
  assert.equal(h.list().length, 1); assert.equal(h.status().persistent, false);
  attempt(h, 'builder', 1); assert.equal(h.list().length, 2);
  attempt(h, 'builder', 0, 3); assert.deepEqual(keys(h.list()), ['fixture-q-1']);
  h.disk.readError = false; h.event(); assert.deepEqual(keys(h.list()), ['fixture-q-1']);
  assert.equal(h.status().persistent, false, 'Unsaved operations still need a successful write');
  attempt(h, 'builder', 2); assert.equal(h.status().persistent, true);
  assert.deepEqual(keys(restore(fixture(), snapshot(h)).list()), ['fixture-q-1', 'fixture-q-2']);
});

test('Quota failures survive successful reads/events, deduplicate and persist after recovery', () => {
  const h = harness(fixture()); attempt(h); h.disk.writeError = true;
  h.tick(); attempt(h, 'builder', 1); h.tick(); attempt(h, 'builder', 1, 2);
  assert.equal(h.list().length, 2); assert.equal(h.status().persistent, false);
  const saved = h.list(); h.event(); assert.deepEqual(h.list(), saved);
  assert.equal(h.status().persistent, false);
  h.disk.writeError = false; attempt(h, 'builder', 2);
  assert.equal(h.status().persistent, true);
  assert.equal(restore(fixture(), snapshot(h)).list().length, 3);
});

test('Failed full-mark removal and clear cannot be resurrected by readable old disk state', () => {
  const h = harness(fixture()); attempt(h); attempt(h, 'builder', 1);
  h.disk.writeError = true; attempt(h, 'builder', 0, 3);
  assert.deepEqual(keys(h.list()), ['fixture-q-1']); h.event(); assert.deepEqual(keys(h.list()), ['fixture-q-1']);
  h.api.clear(); assert.deepEqual(h.list(), []); h.event(); assert.deepEqual(h.list(), []);
  attempt(h, 'builder', 2); assert.deepEqual(keys(h.list()), ['fixture-q-2']);
  h.disk.writeError = false; attempt(h, 'builder', 2, 1);
  assert.deepEqual(keys(restore(fixture(), snapshot(h)).list()), ['fixture-q-2']);
});

test('Fallback mode remains bounded during hundreds of additions and full-mark tombstones', () => {
  const h = harness(fixture(0, 610), storage(), { unavailable: true });
  for (let i = 0; i < 610; i++) { attempt(h, 'builder', i); h.tick(); }
  assert.equal(h.list().length, 200);
  assert.equal(h.list()[0].id, 'fixture-q-410');
  for (let i = 0; i < 610; i++) attempt(h, 'builder', i, 3);
  assert.deepEqual(h.list(), []);
});

test('Sequential multi-tab writes merge latest disk before writing, without requiring events', () => {
  const disk = storage(); const a = harness(fixture(), disk); const b = harness(fixture(), disk);
  attempt(a); b.tick(); attempt(b, 'builder', 1); a.tick(2000); attempt(a, 'builder', 2);
  assert.deepEqual(keys(a.list()), ['fixture-q-0', 'fixture-q-1', 'fixture-q-2']);
  assert.deepEqual(b.list(), a.list());
  attempt(b, 'builder', 0, 3); a.event(); assert.deepEqual(keys(a.list()), ['fixture-q-1', 'fixture-q-2']);
  a.api.clear(); b.event(); assert.deepEqual(b.list(), []);
});

test('Storage event merges pending local errors with remote additions and preserves firstSeen', () => {
  const disk = storage(); const a = harness(fixture(), disk); const b = harness(fixture(), disk);
  attempt(a); disk.writeError = true; a.tick(); attempt(a, 'builder', 1);
  const firstSeen = a.list().find(record => record.id === 'fixture-q-1').firstSeen;
  disk.writeError = false; b.tick(2000); attempt(b, 'builder', 2); b.tick(); attempt(b, 'builder', 1, 1);
  a.event(KEY, { newValue: '{obsolete event payload}' });
  assert.deepEqual(keys(a.list()), ['fixture-q-0', 'fixture-q-1', 'fixture-q-2']);
  assert.equal(a.list().find(record => record.id === 'fixture-q-1').firstSeen, firstSeen);
  assert.equal(a.list().find(record => record.id === 'fixture-q-1').earned, 0, 'Unsaved local outcome wins overlay');
  attempt(a, 'builder', 0, 2); assert.equal(a.status().persistent, true);
  b.event(); assert.deepEqual(b.list(), a.list());
});

test('Subscriptions notify on writes/relevant storage events only and can safely unsubscribe', () => {
  const h = harness(fixture()); let calls = 0;
  h.api.subscribe(() => { throw Error('UI callback failed'); });
  const unsubscribe = h.api.subscribe(() => { calls++; h.api.list(); h.api.status(); });
  attempt(h); assert.equal(calls, 1);
  h.event('theme'); assert.equal(calls, 1);
  h.event(KEY, { storageArea: storage() }); assert.equal(calls, 1);
  h.event(); assert.equal(calls, 2); h.event(null); assert.equal(calls, 3);
  h.api.clear(); assert.equal(calls, 4); unsubscribe(); attempt(h); assert.equal(calls, 4);
  assert.equal(typeof h.api.subscribe(null), 'function');
});

test('Persistence contains references/marks only, never item content or student answers', () => {
  const h = harness(fixture());
  const item = { ...h.data['Fixture Term'].builder.questions[0], studentAnswer: 'DO NOT STORE ME' };
  h.api.record('Fixture Term', 'builder', item, 0, 3);
  const text = snapshot(h);
  assert.equal(text.includes('DO NOT STORE ME'), false); assert.equal(text.includes('Sentence 0'), false);
  const envelope = JSON.parse(text);
  assert.deepEqual(Object.keys(envelope).sort(), ['records', 'version']);
  assert.deepEqual(Object.keys(envelope.records[0]).sort(), schemaFields);
  assert.match(envelope.records[0].revision, /^c1-[0-9a-f]{16}$/);
  assert.equal(adapter.includes('deploymentToken'), false);
});

test('Audited content release prunes only edited saved items and retains all unchanged work', () => {
  const before = load(execFileSync('git', ['show', 'ef92cbb5b96e8bbcea36fa2de80612f314ba7e1a:data.js'], { cwd: root, encoding: 'utf8' }));
  const old = harness(before), expected = [];
  for (const [term, topics] of Object.entries(before)) for (const [topicKey, topic] of Object.entries(topics)) {
    for (const item of topic.exercises || topic.questions || []) {
      const max = topic.type === 'passage' ? item.segments.filter(b => typeof b === 'object').length : topic.type === 'builder' ? 3 : item.timeCorrect?.length ? 3 : 2;
      old.api.record(term, topicKey, item, 0, max);
      const current = (production[term][topicKey].exercises || production[term][topicKey].questions).find(x => x.id === item.id);
      assert.ok(current, 'Stable item removed without explicit retirement');
      if (JSON.stringify(current) === JSON.stringify(item)) expected.push(item.id);
    }
  }
  const previousCount = Object.values(before).flatMap(topics => Object.values(topics)).reduce((sum, topic) => sum + (topic.exercises || topic.questions || []).length, 0);
  assert.equal(old.list().length, previousCount, 'Every pre-release item was seeded once');
  const next = restore(production, snapshot(old));
  assert.deepEqual(keys(next.list()).sort(), expected.sort(), 'Unchanged saved work survives; edited work is individually pruned');
  for (const record of old.list()) assert.equal(Boolean(next.api.resolve(record)), expected.includes(record.id), 'Revision lookup safety: ' + record.id);
});

test('Approved Perfect release prunes precisely five passages and retains other saved work', () => {
  const before = load(execFileSync('git', ['show', '95bdf6ff9d2b4a2bafbf931cf7960bdaaf2e785e:data.js'], { cwd: root, encoding: 'utf8' }));
  const old = harness(before), changed = [], unchanged = [];
  for (const [term, topics] of Object.entries(before)) for (const [topicKey, topic] of Object.entries(topics)) {
    for (const item of topic.exercises || topic.questions || []) {
      const max = topic.type === 'passage' ? item.segments.filter(b => typeof b === 'object').length : topic.type === 'builder' ? 3 : item.timeCorrect?.length ? 3 : 2;
      old.api.record(term, topicKey, item, 0, max);
      const current = (production[term][topicKey].exercises || production[term][topicKey].questions).find(x => x.id === item.id);
      assert.ok(current, 'A stable item must not disappear');
      (JSON.stringify(item) === JSON.stringify(current) ? unchanged : changed).push(item.id);
    }
  }
  assert.deepEqual(changed.sort(), [1, 2, 3, 4, 5].map(n => 'present-perfect-p-00' + n));
  assert.equal(old.list().length, changed.length + unchanged.length);
  const next = restore(production, snapshot(old));
  assert.deepEqual(keys(next.list()).sort(), unchanged.sort());
  assert.equal(next.list().length, unchanged.length);
});

test('Adding Conditional Sentences preserves all previous saved references and records one whole new passage', () => {
  const before = load(execFileSync('git', ['show', '5064ffcd7c7a5c560d3be7b8fb6d2911e0cb3ab1:data.js'], { cwd: root, encoding: 'utf8' }));
  const old = harness(before);
  for (const [term, topics] of Object.entries(before)) for (const [topicKey, topic] of Object.entries(topics)) {
    assert.deepEqual(production[term][topicKey], topic, 'Conditional addition must not revise existing topic: ' + topicKey);
    for (const item of topic.exercises || topic.questions || []) {
      const max = topic.type === 'passage' ? item.segments.filter(b => typeof b === 'object').length : topic.type === 'builder' ? 3 : item.timeCorrect?.length ? 3 : 2;
      old.api.record(term, topicKey, item, 0, max);
    }
  }
  const next = restore(production, snapshot(old));
  assert.deepEqual(next.list(), old.list(), 'Every prior reference and revision survives the additive topic');
  const topic = production['First Term'].conditionals;
  const item = topic.exercises[0];
  assert.equal(item.id, 'conditionals-p-001');
  next.api.record('First Term', 'conditionals', item, 11, 12);
  assert.equal(next.list().length, old.list().length + 1);
  const saved = next.list().find(record => record.id === item.id);
  assert.equal(saved.type, 'passage'); assert.equal(saved.earned, 11); assert.equal(saved.max, 12);
  assert.equal(next.api.resolve(saved).item.id, item.id);
  next.api.record('First Term', 'conditionals', item, 12, 12);
  assert.deepEqual(next.list(), old.list(), 'Full marks remove only the new passage');
});

test('Conditional distractor update invalidates only its edited passage and retains every other saved reference', () => {
  const before = load(execFileSync('git', ['show', '822ff9dcff53a55f34b656dc519fbdd9ba27e109:data.js'], { cwd: root, encoding: 'utf8' }));
  const old = harness(before), changed = [], unchanged = [];
  for (const [term, topics] of Object.entries(before)) for (const [topicKey, topic] of Object.entries(topics)) {
    for (const item of topic.exercises || topic.questions || []) {
      const max = topic.type === 'passage' ? item.segments.filter(b => typeof b === 'object').length : topic.type === 'builder' ? 3 : item.timeCorrect?.length ? 3 : 2;
      old.api.record(term, topicKey, item, 0, max);
      const current = (production[term][topicKey].exercises || production[term][topicKey].questions).find(x => x.id === item.id);
      assert.ok(current, 'No stable item may disappear during a distractor update');
      (JSON.stringify(item) === JSON.stringify(current) ? unchanged : changed).push(item.id);
    }
  }
  assert.deepEqual(changed, ['conditionals-p-001'], 'Only the Conditional passage changed');
  const expected = old.list().filter(record => record.id !== changed[0]);
  assert.equal(expected.length, unchanged.length);
  const next = restore(production, snapshot(old));
  assert.deepEqual(next.list(), expected, 'All unchanged references and marks survive byte-for-byte');
  assert.equal(next.api.resolve(old.list().find(record => record.id === changed[0])), null, 'Old Conditional revision cannot retry stale options');
  const item = production['First Term'].conditionals.exercises[0];
  next.api.record('First Term', 'conditionals', item, 11, 12);
  const saved = next.list().find(record => record.id === item.id);
  assert.equal(next.api.resolve(saved).item.id, item.id, 'New Conditional revision resolves for whole-passage practice');
  assert.notEqual(saved.revision, old.list().find(record => record.id === item.id).revision);
  next.api.record('First Term', 'conditionals', item, 12, 12);
  assert.deepEqual(next.list(), expected, 'Full marks remove only the current Conditional reference');
});

test('Adding Conditional Exercise 2 keeps every saved reference and records the new passage on its own', () => {
  const before = load(execFileSync('git', ['show', 'cfc7d93:data.js'], { cwd: root, encoding: 'utf8' }));
  const old = harness(before);
  for (const [term, topics] of Object.entries(before)) for (const [topicKey, topic] of Object.entries(topics)) {
    for (const item of topic.exercises || topic.questions || []) {
      const max = topic.type === 'passage' ? item.segments.filter(b => typeof b === 'object').length : topic.type === 'builder' ? 3 : item.timeCorrect?.length ? 3 : 2;
      old.api.record(term, topicKey, item, 0, max);
      const current = (production[term][topicKey].exercises || production[term][topicKey].questions).find(x => x.id === item.id);
      assert.ok(current, 'No stable item may disappear when an exercise is added');
      assert.equal(JSON.stringify(current), JSON.stringify(item), 'Existing item unchanged: ' + item.id);
    }
  }
  assert.deepEqual(before['First Term'].conditionals.exercises.map(e => e.id), ['conditionals-p-001']);
  assert.deepEqual(production['First Term'].conditionals.exercises.map(e => e.id), ['conditionals-p-001', 'conditionals-p-002']);
  const next = restore(production, snapshot(old));
  assert.deepEqual(next.list(), old.list(), 'Every saved reference survives, including Conditional Exercise 1');
  for (const record of next.list()) assert.ok(next.api.resolve(record), 'Saved reference still resolves: ' + record.id);
  const item = production['First Term'].conditionals.exercises[1];
  next.api.record('First Term', 'conditionals', item, 10, 12);
  const saved = next.list().find(record => record.id === item.id);
  assert.equal(saved.type, 'passage'); assert.equal(saved.earned, 10); assert.equal(saved.max, 12);
  assert.equal(next.api.resolve(saved).item.id, item.id, 'Exercise 2 resolves for whole-passage practice');
  next.api.record('First Term', 'conditionals', item, 12, 12);
  assert.deepEqual(next.list(), old.list(), 'Full marks remove only Exercise 2');
});
let passed = 0;
const start = Date.now();
for (const { label, run } of tests) {
  try { run(); passed++; console.log('PASS ' + label); }
  catch (error) { console.error('FAIL ' + label); console.error(error.stack); process.exitCode = 1; }
}
console.log(JSON.stringify({ passed, total: tests.length, durationMs: Date.now() - start, inventory }, null, 2));
if (passed !== tests.length) process.exitCode = 1;
