#!/usr/bin/env node
'use strict';
/**
 * Real-control regression tests for browser-local Mistake Practice.
 * Run after implementation is ready:
 * NODE_PATH=/tmp/s2-grammar-retry-tests/node_modules node scripts/test-mistake-practice.cjs
 * Optional arguments: [repository directory] [/tmp/evidence.json].
 * No browser/network/Git/dependency installation or application lexical calls.
 * Only the explicitly test-only MC fixture and VM-only content-update fixtures
 * change evaluated data; website source files are never written. Fixture seeding
 * uses the documented public KSLOMistakes.record API, never internal app state.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const repo = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const output = path.resolve(process.argv[3] || '/tmp/s2-grammar-mistake-practice-results.json');
const STORE_KEY = 'kslo_s2_grammar_mistakes_v1';
const files = ['index.html', 'data.js', 'mistakes.js', 'app.js', 'style.css'];
const report = {
  started: new Date().toISOString(), repo, checks: 0, suites: [], failures: [],
  hashes: {}, snapshots: [], sessions: [], coverage: {
    passageTopics: [], passageExercises: [], passageAlternatives: 0,
    twoMarkRS: 0, threeMarkRS: 0, questionTopics: [], batchOver20: [],
    refreshes: 0, storageFailureDOMs: [], vmPruning: [], mcFirstAttempt: false
  }, limitations: ['jsdom checks DOM/logic, not visual layout, keyboard defaults or deployment.',
    'Date.now and timer intervals are deterministic instrumentation.',
    'Future MC and content-update fixtures exist only in isolated evaluated test contexts.']
};
let source, inventory, JSDOM, VirtualConsole;
const liveDOMs = new Set();
const plain = value => JSON.parse(JSON.stringify(value));
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
const norm = s => String(s).trim().replace(/\s+/g, ' ').toLowerCase();
function ok(value, message) { report.checks++; assert.ok(value, message); }
function eq(actual, expected, message) { report.checks++; assert.deepEqual(plain(actual), plain(expected), message); }
function ids(records) { return Array.from(records, r => r.id); }
function qmax(topic, item) { return topic.type === 'builder' ? 3 : topic.type === 'builder-rs' ? (item.timeCorrect?.length ? 3 : 2) : topic.type === 'passage' ? item.segments.filter(x => typeof x === 'object').length : 1; }
function suite(name, fn) {
  console.log('\nRUN ' + name);
  const started = report.checks;
  try { fn(); report.suites.push({ name, status: 'PASS', checks: report.checks - started }); console.log('PASS ' + name); }
  catch (e) { report.failures.push({ suite: name, message: e.message, stack: e.stack }); report.suites.push({ name, status: 'FAIL' }); console.error('FAIL ' + name + '\n' + e.stack); }
  finally { for (const dom of [...liveDOMs]) { dom.window.close(); liveDOMs.delete(dom); } }
}
const MC_FIXTURE = `
GRAMMAR_DATA['First Term']['test-only-mc'] = {
  label:'Test-only MC', icon:'T', iconClass:'', desc:'Isolated regression fixture', type:'mc',
  questions:Array.from({length:12},(_,i)=>({id:'test-only-mc-q-'+String(i+1).padStart(3,'0'),
    question:'Fixture '+(i+1)+' has ___ answer.',answer:'key '+(i+1),
    options:['key '+(i+1),'wrong a '+(i+1),'wrong b '+(i+1),'wrong c '+(i+1)]}))
};
TERM_KEYS['First Term'].push('test-only-mc');
`;
function makeDOM({ seed = 417, storage = {}, storageMode = 'normal', fixture = false, dataPatch = '' } = {}) {
  const errors = [], vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(String(e.message)));
  const dom = new JSDOM(source['index.html'], { url: 'https://example.test/s2-grammar/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
  liveDOMs.add(dom);
  const w = dom.window, d = w.document;
  w.addEventListener('error', e => errors.push(String(e.error?.stack || e.message)));
  w.scrollTo = () => {};
  w.alert = message => { throw new Error('Unexpected alert: ' + message); };
  let confirmAnswer = true;
  const confirmations = [];
  w.confirm = message => { confirmations.push(message); return confirmAnswer; };
  let rng = seed >>> 0, draw = null;
  w.Math.random = () => { if (draw !== null) return draw; rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0; return rng / 4294967296; };
  let now = 1800000000000, nextInterval = 1;
  const intervals = new Map();
  w.Date.now = () => now;
  w.setInterval = (fn, ms) => { const id = nextInterval++; intervals.set(id, { fn, ms }); return id; };
  w.clearInterval = id => intervals.delete(id);
  const clock = { intervals, tick(ms = 100) { now += ms; for (const { fn } of [...intervals.values()]) fn(); } };
  for (const [key, value] of Object.entries(storage)) w.localStorage.setItem(key, value);
  if (storageMode !== 'normal') {
    const memory = new Map(Object.entries(storage));
    const unavailable = () => { throw new w.DOMException('Storage denied by test', 'SecurityError'); };
    if (storageMode === 'getter-throws') Object.defineProperty(w, 'localStorage', { configurable: true, get: unavailable });
    else Object.defineProperty(w, 'localStorage', { configurable: true, value: {
      getItem: storageMode === 'all-throws' ? unavailable : key => memory.get(key) ?? null,
      setItem: unavailable, removeItem: unavailable, clear: unavailable,
      key: i => [...memory.keys()][i] ?? null, get length() { return memory.size; }
    } });
  }
  // Keep the three scripts separate: mistakes.js must see data before app init.
  w.eval(source['data.js'] + '\nwindow.__TEST_DATA = GRAMMAR_DATA;\n' + (fixture ? MC_FIXTURE : '') + dataPatch);
  // jsdom window.eval isolates top-level const declarations between calls.
  // Export only read-only bank references, not engine functions or app state.
  w.GRAMMAR_DATA = w.__TEST_DATA;
  w.TERM_KEYS = Object.fromEntries(Object.entries(w.__TEST_DATA).map(([term, topics]) => [term, Object.keys(topics)]));
  const beforeData = JSON.stringify(w.__TEST_DATA);
  w.eval(source['mistakes.js']);
  ok(w.KSLOMistakes, 'Public store exists before app.js initialization');
  for (const method of ['list', 'resolve', 'record', 'clear', 'status', 'subscribe']) ok(typeof w.KSLOMistakes[method] === 'function', 'Store method ' + method);
  w.eval(source['app.js']);
  eq(errors, [], 'App initialization survives storage/data configuration');
  const store = w.KSLOMistakes;
  function el(selector) { const e = d.querySelector(selector); ok(e, 'Missing DOM control ' + selector); return e; }
  function visible(e) { return !!e && !!e.closest('.screen.active') && !e.closest('.hidden, [hidden]') && e.style.display !== 'none'; }
  function click(target) {
    const e = typeof target === 'string' ? el(target) : target;
    ok(e, 'Clicked control exists'); ok(!e.disabled, 'Clicked control enabled: ' + e.id); ok(visible(e) || e.id === 'theme-btn', 'Clicked control visible/active: ' + (e.id || e.className));
    e.click(); eq(errors, [], 'No runtime errors after DOM click');
  }
  function choose(selector, value) {
    const e = el(selector); ok(visible(e) && !e.disabled, 'Select is visible and enabled');
    ok([...e.options].some(o => !o.disabled && o.value === value), 'Real selectable option: ' + value);
    e.value = value; e.dispatchEvent(new w.Event('change', { bubbles: true })); eq(errors, [], 'No runtime errors after change');
  }
  function active(name) { eq(d.querySelectorAll('.screen.active').length, 1, 'One active screen'); ok(el('#screen-' + name).classList.contains('active'), 'Expected active ' + name); }
  function select(term, topic, count = 10) {
    active('home');
    click([...d.querySelectorAll('#term-group > button[data-term]')].find(e => e.dataset.term === term));
    click([...d.querySelectorAll('#topic-grid > .topic-card[data-topic]')].find(e => e.dataset.topic === topic));
    const t = w.__TEST_DATA[term][topic];
    if (t.type !== 'passage') click(`#qcount-group > button[data-q="${count}"]`);
    else ok(el('#qcount-section').classList.contains('hidden'), 'Passage count controls hidden');
    return t;
  }
  function start(term, topic, count = 10, passageIndex = null) {
    const t = select(term, topic, count);
    // Reset harness RNG only; adapter startup must not affect mixed-ten fixtures.
    rng = seed >>> 0;
    w.Math.random();
    // Deterministic random draw through the real Start button, never a supplied-target call.
    if (passageIndex !== null) draw = (passageIndex + 0.25) / t.exercises.length;
    try { click('#btn-start'); } finally { draw = null; }
    return t;
  }
  function selection() { return { term: d.querySelector('#term-group > .selected')?.dataset.term ?? null, topic: d.querySelector('#topic-grid > .selected')?.dataset.topic ?? null, count: d.querySelector('#qcount-group > .selected')?.dataset.q ?? null, countHidden: el('#qcount-section').classList.contains('hidden'), startDisabled: el('#btn-start').disabled }; }
  function saved(term, topic, itemId = null) {
    active('home');
    const buttons = [...d.querySelectorAll('#mistake-list button.mistake-start')].filter(e => e.dataset.term === term && e.dataset.topic === topic && (!itemId || e.dataset.mistakeId === itemId));
    eq(buttons.length, 1, 'Exactly one scoped saved-work action');
    click(buttons[0]);
  }
  function records() { return plain(store.list()); }
  function storageSnapshot() {
    const out = {};
    for (let i = 0; i < w.localStorage.length; i++) { const key = w.localStorage.key(i); out[key] = w.localStorage.getItem(key); }
    return out;
  }
  function snapshot(label) {
    report.snapshots.push({ label, active: d.querySelector('.screen.active')?.id, html: d.querySelector('.screen.active')?.outerHTML, home: el('#mistake-practice').outerHTML, records: records() });
  }
  function fresh(type, count = null) {
    const screen = { passage: 'passage', builder: 'builder', 'builder-rs': 'builder-rs', mc: 'exercise' }[type]; active(screen);
    eq(intervals.size, 1, 'Exactly one running timer after a fresh start');
    for (const id of ['hud-timer', 'passage-timer', 'builder-timer', 'rs-timer']) eq(el('#' + id).textContent, '00:00.00', 'Timer immediately zero: ' + id);
    if (type === 'passage') {
      const controls = [...d.querySelectorAll('#passage-body .blank-select')];
      ok(controls.length, 'Real passage has dropdown blanks');
      ok(controls.every(e => e.value === '' && !e.disabled && !e.classList.contains('filled')), 'Every blank re-empty, enabled and unmarked');
      eq(el('#passage-filled').textContent, `0 / ${controls.length}`, 'Filled count resets');
      eq(el('#passage-progress-fill').style.width, '0%', 'Passage progress resets');
      ok(el('#btn-submit-passage').classList.contains('hidden'), 'Cannot submit empty saved passage');
    } else {
      const prefix = { builder: 'builder', 'builder-rs': 'rs', mc: 'hud' }[type];
      eq(el('#' + prefix + '-progress').textContent, `1 / ${count}`, 'Exact supplied-set count without padding');
      eq(el('#' + prefix + '-score').textContent, '0', 'Score zero');
      eq(el('#' + ({ builder: 'builder-progress-fill', 'builder-rs': 'rs-progress-fill', mc: 'progress-fill' }[type])).style.width, '0%', 'Progress zero');
      eq(d.querySelectorAll(`#screen-${screen} .selected, #screen-${screen} .locked, #screen-${screen} .used, #screen-${screen} .correct, #screen-${screen} .wrong, #screen-${screen} .revealed, #screen-${screen} .fb-ok, #screen-${screen} .fb-no`).length, 0, 'No stale selections, locks or feedback');
      if (type === 'mc') ok(el('#btn-next').classList.contains('hidden'), 'MC Next gated');
      else {
        const p = type === 'builder' ? '' : 'rs-';
        eq(el('#' + p + 'clause-assembled').dataset.empty, 'true', 'Assembly clear');
        for (const suffix of ['check', 'next']) ok(el('#btn-' + (type === 'builder' ? 'builder' : 'rs') + '-' + suffix).classList.contains('hidden'), 'Builder action gated ' + suffix);
        ok(el('#' + (type === 'builder' ? 'builder' : 'rs') + '-full').classList.contains('hidden'), 'Old model feedback hidden');
      }
    }
    clock.tick(1230);
    for (const id of ['hud-timer', 'passage-timer', 'builder-timer', 'rs-timer']) eq(el('#' + id).textContent, '00:01.23', 'Timer advances from reset: ' + id);
  }
  function home(button = '#btn-again') { click(button); active('home'); eq(intervals.size, 0, 'Home/Quit stops timer'); }
  function close() { eq(errors, [], 'No application errors'); eq(JSON.stringify(w.__TEST_DATA), beforeData, 'Application does not mutate source grammar data'); dom.window.close(); liveDOMs.delete(dom); }
  return { dom, w, d, el, click, choose, active, select, start, selection, saved, store, records, storageSnapshot, snapshot, fresh, home, close, clock,
    confirm(value) { confirmAnswer = value; }, confirmations };
}
function assertRecords(c, expected, message = 'Exact saved item references and last marks') {
  const tuples = rs => rs.map(r => [r.term, r.topic, r.id, r.earned, r.max]).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  eq(tuples(c.records()), tuples(expected), message);
  for (const record of c.records()) {
    const target = c.store.resolve(record);
    ok(target?.item && target?.topicData, 'Saved reference resolves');
    eq(target.item.id, record.id, 'Saved ID resolves to permanent metadata');
    ok(!Object.hasOwn(record, 'segments') && !Object.hasOwn(record, 'studentAnswer') && !Object.hasOwn(record, 'chosenClause') && !Object.hasOwn(record, 'question'), 'No full content or student response copied into record');
  }
}
function ref(term, topic, item, earned, max) { return { term, topic, id: item.id, earned, max }; }
function passageState(c) {
  const body = c.el('#passage-body').cloneNode(true);
  body.querySelectorAll('.blank-wrap').forEach(e => e.replaceWith('{blank}'));
  return { title: c.el('#passage-title').textContent, text: body.textContent,
    options: [...c.d.querySelectorAll('#passage-body .blank-select')].map(e => [...e.options].filter(o => !o.disabled).map(o => o.value).sort()) };
}
function passageFinish(c, topic, mode) {
  const matches = topic.exercises.filter(e => (e.title || '') === c.el('#passage-title').textContent);
  eq(matches.length, 1, 'Passage identity resolves from displayed title');
  const item = matches[0], blanks = item.segments.filter(x => typeof x === 'object'), controls = [...c.d.querySelectorAll('#passage-body .blank-select')];
  eq(controls.length, blanks.length, 'Every whole-exercise blank displayed');
  let earned = 0;
  blanks.forEach((blank, i) => {
    const values = [...controls[i].options].filter(o => !o.disabled).map(o => o.value);
    eq(values.length, 4, 'Exactly four visible choices'); eq(new Set(values).size, 4, 'Unique choices');
    const accepted = [blank.answer, ...(blank.alternatives || [])];
    for (const key of accepted) ok(values.includes(key), 'Approved key/alternative retained');
    let value = blank.answer;
    if (mode === 'wrong' || (mode === 'partial' && i === 0)) value = values.find(v => !accepted.some(a => norm(a) === norm(v)));
    if (mode === 'alternatives' && blank.alternatives?.length) { value = blank.alternatives.at(-1); report.coverage.passageAlternatives++; }
    if (accepted.some(a => norm(a) === norm(value))) earned++;
    c.choose(`#passage-body .blank-select[data-index="${i}"]`, value);
    eq(c.el('#passage-filled').textContent, `${i + 1} / ${blanks.length}`, 'Actual DOM selection updates fill count');
  });
  c.clock.tick(100); c.click('#btn-submit-passage'); result(c, earned, blanks.length, blanks.length, 'passage');
  eq(c.d.querySelectorAll('#review-list .rev-blank.correct').length, earned, 'Passage review earned count');
  eq(c.d.querySelectorAll('#review-list .rev-blank.wrong').length, blanks.length - earned, 'Passage review wrong count');
  ok(c.el('#btn-retry-incorrect').classList.contains('hidden'), 'Passage never offers blank-only shortcut');
  return { item, earned, max: blanks.length };
}
function result(c, earned, max, count, type) {
  c.active('results'); eq(c.clock.intervals.size, 0, 'Results stop timer');
  eq(c.el('#res-score').textContent, `${earned}/${max} (${Math.round(earned / max * 100)}%)`, 'Independent exact denominator and total score');
  if (type !== 'passage') eq(c.d.querySelectorAll('#review-list .review-item').length, count, 'Only active question set in review');
  ok(!c.el('#btn-retry-same').disabled && !c.el('#btn-retry-same').classList.contains('hidden'), 'Same-set retry retained');
  ok(/Back to Home/i.test(c.el('#btn-again').textContent), 'Distinct Home action retained');
  const bottom = c.el('.results-actions-bottom');
  ok(c.el('#review-panel').compareDocumentPosition(bottom) & c.w.Node.DOCUMENT_POSITION_FOLLOWING, 'Lower actions appear after answer review');
  eq(c.el('#btn-retry-same-bottom').textContent, c.el('#btn-retry-same').textContent, 'Both same-retry labels match topic type');
  eq(c.el('#btn-retry-incorrect-bottom').textContent, c.el('#btn-retry-incorrect').textContent, 'Both incorrect-retry labels match');
  eq(c.el('#btn-retry-incorrect-bottom').classList.contains('hidden'), c.el('#btn-retry-incorrect').classList.contains('hidden'), 'Both incorrect-retry visibility states match');
  ok(/Back to Home/i.test(c.el('#btn-again-bottom').textContent), 'Home available after review');
  report.sessions.push({ type, earned, max, count });
}
function displayed(c, topic) {
  let matches;
  if (topic.type === 'builder') matches = topic.questions.filter(q => q.s1 === c.el('#builder-s1').textContent && q.s2 === c.el('#builder-s2').textContent);
  else if (topic.type === 'builder-rs') matches = topic.questions.filter(q => (q.prompt || q.s1) === c.el('#rs-quote').textContent);
  else {
    const stem = norm(c.el('#question-card .q-stem').textContent.replace(/\u00a0/g, ''));
    matches = topic.questions.filter(q => norm(q.question.replace(/___/g, '')) === stem);
  }
  eq(matches.length, 1, 'Displayed item uniquely identifies actual permanent ID'); return matches[0];
}
function buttonValue(c, selector, field, value) {
  const e = [...c.d.querySelectorAll(selector)].find(e => e.dataset[field] === value && !e.classList.contains('used'));
  ok(e, `Visible ${field} option exists: ${value}`); c.click(e);
}
function questionCheck(c, topic, mode = 'correct') {
  const q = displayed(c, topic), max = qmax(topic, q); let earned;
  if (topic.type === 'builder') {
    const pronoun = mode === 'frame' || mode === 'wrong' ? topic.pronouns.find(p => p !== q.pronoun) : q.pronoun;
    const tokens = mode === 'clause' || mode === 'wrong' ? [q.distractor] : q.clause;
    const gap = mode === 'wrong' ? (q.correctGap === 0 ? 1 : 0) : q.correctGap;
    buttonValue(c, '#pronoun-chips button', 'p', pronoun);
    for (const token of tokens) buttonValue(c, '#clause-tiles button', 'tok', token);
    buttonValue(c, '#place-line button', 'gap', String(gap));
    earned = Number(pronoun === q.pronoun) + Number(tokens.length === q.clause.length && tokens.every((t, i) => norm(t) === norm(q.clause[i]))) + Number(gap === q.correctGap);
    c.click('#btn-builder-check');
  } else if (topic.type === 'builder-rs') {
    report.coverage[max === 2 ? 'twoMarkRS' : 'threeMarkRS']++;
    eq(c.el('#rsstep-3').style.display === 'none', max === 2, 'RS time step reflects per-item maximum');
    const frame = mode === 'frame' || mode === 'wrong' ? q.frameWrong[0] : q.frameCorrect;
    const slots = q.clauseCorrect.map(s => Array.isArray(s) ? s : [s]);
    let tokens = slots.map(s => mode === 'alternatives' ? s.at(-1) : s[0]);
    if (mode === 'clause' || mode === 'wrong') {
      // One visibly available wrong tile is enough to fail exact clause length.
      const bad = (q.clauseWrong || []).find(t => !slots[0].some(a => norm(a) === norm(t)));
      ok(bad, 'Real rejected clause tile available'); tokens = [bad];
      if (slots.length === 1) tokens.push(slots[0][0]);
    } else if (mode === 'alternatives' && q.type === 'statement') tokens.unshift('that');
    const time = max === 3 ? (mode === 'wrong' ? q.timeWrong[0] : mode === 'alternatives' ? q.timeCorrect.at(-1) : q.timeCorrect[0]) : null;
    buttonValue(c, '#rs-frame-chips button', 'f', frame);
    for (const token of tokens) buttonValue(c, '#rs-clause-tiles button', 'tok', token);
    if (max === 3) buttonValue(c, '#rs-time-chips button', 't', time);
    const scored = norm(tokens[0]) === 'that' ? tokens.slice(1) : tokens;
    earned = Number(frame === q.frameCorrect) + Number(scored.length === slots.length && scored.every((t, i) => slots[i].some(a => norm(a) === norm(t)))) + (max === 3 ? Number(q.timeCorrect.some(a => norm(a) === norm(time))) : 0);
    c.click('#btn-rs-check');
  } else {
    if (mode !== 'correct') {
      const wrong = [...c.d.querySelectorAll('#question-card .option-btn')].find(e => e.dataset.opt !== q.answer);
      c.click(wrong); ok(c.el('#btn-next').classList.contains('hidden'), 'First-wrong MC cannot advance');
      const pending = c.records().find(r => r.id === q.id); ok(pending && pending.earned === 0 && pending.max === 1, 'First wrong MC saved immediately');
    }
    buttonValue(c, '#question-card .option-btn', 'opt', q.answer); earned = mode === 'correct' ? 1 : 0;
    const scoreBefore = c.el('#hud-score').textContent;
    const recordsBefore = c.records();
    const revealed = [...c.d.querySelectorAll('#question-card .option-btn')].find(e => e.classList.contains('revealed') && !e.classList.contains('wrong'));
    if (revealed) c.click(revealed);
    eq(c.el('#hud-score').textContent, scoreBefore, 'Completed MC later clicks cannot change marks');
    eq(c.records(), recordsBefore, 'Completed MC later clicks cannot invent mistakes');
  }
  const pending = c.records().find(r => r.id === q.id);
  if (earned === max) ok(!pending, 'Full marks remove precisely this checked item');
  else { ok(pending, 'Below-max checked item remains pending'); eq([pending.earned, pending.max], [earned, max], 'Saved 2/3/1-mark outcome exact'); }
  return { q, earned, max };
}
function nextControl(type) { return { builder: '#btn-builder-next', 'builder-rs': '#btn-rs-next', mc: '#btn-next' }[type]; }
function quitControl(type) { return { builder: '#builder-quit', 'builder-rs': '#rs-quit', mc: '#hud-quit' }[type]; }
function runSet(c, topic, modes, expectedIds = null) {
  const prefix = { builder: 'builder', 'builder-rs': 'rs', mc: 'hud' }[topic.type];
  const count = Number(c.el('#' + prefix + '-progress').textContent.split('/')[1]);
  const rows = []; let earned = 0, max = 0;
  for (let i = 0; i < count; i++) {
    eq(c.el('#' + prefix + '-progress').textContent, `${i + 1} / ${count}`, 'Exact current progress denominator');
    const q = displayed(c, topic);
    if (expectedIds) eq(q.id, expectedIds[i], 'Supplied subset identity/order stable despite queue changes');
    const row = questionCheck(c, topic, typeof modes === 'function' ? modes(i, q) : modes);
    rows.push(row); earned += row.earned; max += row.max;
    eq(c.el('#' + prefix + '-score').textContent, String(earned), 'Immediate cumulative per-step marks');
    eq(c.el(nextControl(topic.type)).textContent, i === count - 1 ? 'Finish' : 'Next Question →', 'Next/Finish based on subset, not normal count');
    c.clock.tick(150); c.click(nextControl(topic.type));
  }
  eq(new Set(rows.map(r => r.q.id)).size, count, 'No duplicate or padded items');
  result(c, earned, max, count, topic.type);
  if (topic.type !== 'mc') [...c.d.querySelectorAll('#review-list .br-marks')].forEach((e, i) => eq(e.textContent, `${rows[i].earned}/${rows[i].max}`, 'Review keeps exact individual maximum'));
  const wrong = rows.filter(r => r.earned < r.max);
  eq(c.el('#btn-retry-incorrect').classList.contains('hidden'), wrong.length === 0, 'Shortcut visibility only current below-max outcomes');
  if (wrong.length) ok(c.el('#btn-retry-incorrect').textContent.includes(`(${wrong.length})`), 'Shortcut current wrong count');
  return rows;
}
function passageSuite(term, key, exerciseIndex) {
  let c = makeDOM(), topic = c.start(term, key, 10, exerciseIndex);
  c.fresh('passage'); const initial = passageState(c), attempt = passageFinish(c, topic, 'partial');
  eq(attempt.item.id, inventory[term][key].exercises[exerciseIndex].id, 'Normal UI drew intended real exercise');
  let expected = [ref(term, key, attempt.item, attempt.earned, attempt.max)];
  assertRecords(c, expected); c.snapshot(`${key}/${attempt.item.id}: normal partial`);
  c.click('#btn-retry-same-bottom'); c.fresh('passage'); eq(passageState(c), initial, 'Same passage/options retained through lower retry');
  const repeated = passageFinish(c, topic, 'wrong'); expected = [ref(term, key, repeated.item, repeated.earned, repeated.max)];
  assertRecords(c, expected, 'Whole exercise deduped on repeated errors; latest marks update');
  c.home('#btn-again-bottom');
  c.select('Second Term', 'relative-clauses', 20); const originalHome = c.selection();
  const untouched = c.records(); c.saved(term, key, attempt.item.id); c.fresh('passage');
  eq(passageState(c), initial, 'Home saved start retains exact whole passage and approved choices');
  c.choose('#passage-body .blank-select', attempt.item.segments.find(x => typeof x === 'object').answer);
  c.home('#passage-quit'); eq(c.records(), untouched, 'Quit partially filled but unsubmitted passage leaves stored outcome untouched');
  eq(c.selection(), originalHome, 'Return from saved passage restores original Home term/topic/count');
  const loaded = c.storageSnapshot(); c.close(); c = makeDOM({ storage: loaded }); report.coverage.refreshes++;
  assertRecords(c, expected, 'Refresh loads real saved whole-exercise reference');
  ok(c.el('#mistake-list').textContent.includes(attempt.item.title), 'Refresh renders stored exercise title');
  ok(c.el('#mistake-list').textContent.includes(`Last score: 0/${attempt.max}`), 'Refresh renders latest marks');
  c.snapshot(`${key}/${attempt.item.id}: refreshed Home`);
  c.select('Second Term', 'reported-speech', 20); const restored = c.selection();
  c.saved(term, key, attempt.item.id); c.fresh('passage'); eq(passageState(c), initial, 'Refresh retry retains content identity');
  topic = c.w.__TEST_DATA[term][key]; passageFinish(c, topic, 'correct'); assertRecords(c, [], 'Whole-exercise full keys clear pending reference');
  c.home(); eq(c.selection(), restored, 'Results Home restores preceding unrelated selection');
  if (attempt.item.segments.some(x => typeof x === 'object' && x.alternatives?.length)) {
    c.start(term, key, 10, exerciseIndex); c.fresh('passage'); passageFinish(c, topic, 'partial');
    c.home(); c.saved(term, key, attempt.item.id); c.fresh('passage'); passageFinish(c, topic, 'alternatives');
    assertRecords(c, [], 'Approved alternatives also earn full marks and clear whole exercise'); c.home();
  }
  // Normal same-exercise full marks must clear, not only mistake-mode full marks.
  if (exerciseIndex === 0) {
    c.start(term, key, 10, exerciseIndex); c.fresh('passage'); passageFinish(c, topic, 'partial');
    c.click('#btn-retry-same'); c.fresh('passage'); passageFinish(c, topic, 'correct');
    assertRecords(c, [], 'Full-mark normal attempt also clears existing saved exercise'); c.home();
  }
  ok(c.el('#mistake-list .mistake-empty'), 'Honest empty state after all saved passages clear');
  ok(c.el('#btn-clear-mistakes').disabled, 'Empty collection clear disabled');
  report.coverage.passageExercises.push(`${term}|${key}|${attempt.item.id}`); c.close();
}
function questionSuite(term, key, seed) {
  let c = makeDOM({ seed }), topic = c.start(term, key, 10); c.fresh(topic.type, 10);
  const rows = runSet(c, topic, i => ['frame', 'clause', 'correct', 'wrong'][i % 4]);
  let expected = rows.filter(r => r.earned < r.max).map(r => ref(term, key, r.q, r.earned, r.max));
  assertRecords(c, expected, 'Normal ten-question mixed attempt saves exact below-max IDs');
  if (topic.type === 'builder-rs') { ok(rows.some(r => r.max === 2) && rows.some(r => r.max === 3), 'Normal ten-question RS attempt covers mixed two/three-mark maxima'); }
  const unused = topic.questions.find(q => !rows.some(r => r.q.id === q.id)); ok(unused, 'Legitimate unrelated saved same-topic item available');
  c.clock.tick(100); c.store.record(term, key, unused, 0, qmax(topic, unused)); expected.push(ref(term, key, unused, 0, qmax(topic, unused)));
  const otherKey = key === 'relative-clauses' ? 'reported-speech' : 'relative-clauses', otherTopic = c.w.__TEST_DATA['Second Term'][otherKey], other = otherTopic.questions[0];
  c.clock.tick(100); c.store.record('Second Term', otherKey, other, 0, qmax(otherTopic, other)); expected.push(ref('Second Term', otherKey, other, 0, qmax(otherTopic, other)));
  const wrongIds = rows.filter(r => r.earned < r.max).map(r => r.q.id);
  c.snapshot(`${key}: normal results with unrelated saved work`);
  c.click('#btn-retry-incorrect-bottom'); c.fresh(topic.type, wrongIds.length);
  const subset = runSet(c, topic, i => i === 0 ? 'correct' : 'frame', wrongIds);
  expected = expected.filter(r => r.id !== wrongIds[0]).map(r => {
    const outcome = subset.find(s => s.q.id === r.id); return outcome ? ref(term, key, outcome.q, outcome.earned, outcome.max) : r;
  });
  assertRecords(c, expected, 'Partial subset success removes only full-mark item, never unrelated saved work');
  c.click('#btn-retry-same'); c.fresh(topic.type, wrongIds.length);
  const retried = runSet(c, topic, 'frame', wrongIds); // Includes the item removed in preceding attempt.
  expected = expected.filter(r => !wrongIds.includes(r.id)).concat(retried.map(r => ref(term, key, r.q, r.earned, r.max)));
  assertRecords(c, expected, 'Same-set snapshot survives successful removal and repeated errors');
  c.home(); c.select('Second Term', otherKey, 20); const original = c.selection();
  let pendingOrder = c.records().filter(r => r.term === term && r.topic === key).map(r => r.id).slice(0, 20);
  c.saved(term, key); c.fresh(topic.type, pendingOrder.length);
  const preQuit = c.records();
  eq(displayed(c, topic).id, pendingOrder[0], 'Home batch starts oldest pending item');
  const success = questionCheck(c, topic, 'correct'); c.click(nextControl(topic.type));
  eq(displayed(c, topic).id, pendingOrder[1], 'Second oldest pending item');
  const failure = questionCheck(c, topic, 'frame'); c.click(nextControl(topic.type));
  eq(displayed(c, topic).id, pendingOrder[2], 'Unattempted third item still in snapshotted set');
  c.home(quitControl(topic.type));
  expected = preQuit.filter(r => r.id !== success.q.id).map(r => r.id === failure.q.id ? ref(term, key, failure.q, failure.earned, failure.max) : r);
  assertRecords(c, expected, 'Quit persists checked success/failure and retains every unattempted item');
  eq(c.selection(), original, 'Partially graded Quit restores original Home count/topic/term');
  c.snapshot(`${key}: partially graded Quit`);
  const loaded = c.storageSnapshot(); c.close(); c = makeDOM({ seed, storage: loaded }); report.coverage.refreshes++;
  topic = c.w.__TEST_DATA[term][key]; assertRecords(c, expected, 'Refresh retains partial-Quit outcomes');
  c.select('Second Term', otherKey, 20); const originalAfterRefresh = c.selection();
  pendingOrder = c.records().filter(r => r.term === term && r.topic === key).map(r => r.id).slice(0, 20);
  c.saved(term, key); c.fresh(topic.type, pendingOrder.length); runSet(c, topic, 'alternatives', pendingOrder);
  expected = expected.filter(r => !pendingOrder.includes(r.id)); assertRecords(c, expected, 'Home full success clears only exact attempted topic subset');
  c.click('#btn-retry-same'); c.fresh(topic.type, pendingOrder.length); runSet(c, topic, 'correct', pendingOrder);
  assertRecords(c, expected, 'Same set still available after queue is empty for this topic');
  c.home(); eq(c.selection(), originalAfterRefresh, 'Full result/retry return restores original Home controls');
  // Untouched saved question opening and Quit must not clear or update it.
  c.saved('Second Term', otherKey); c.fresh(otherTopic.type, 1); const untouched = c.records();
  c.home(quitControl(otherTopic.type)); eq(c.records(), untouched, 'Untouched saved question Quit leaves outcome/timestamps unchanged');
  report.coverage.questionTopics.push(`${term}|${key}`); c.close();
}
function batchSuite(key) {
  const c = makeDOM(), term = 'Second Term', topic = c.w.__TEST_DATA[term][key];
  ok(topic.questions.length > 20, 'Real ID inventory supports over-20 fixture');
  const seeded = topic.questions.slice(0, Math.min(25, topic.questions.length));
  for (const q of seeded) { c.clock.tick(10); c.store.record(term, key, q, 0, qmax(topic, q)); }
  eq(ids(c.records()), seeded.map(q => q.id), 'Public store preserves independent oldest-first seeded IDs');
  c.clock.tick(100); c.store.record(term, key, seeded[0], 1, qmax(topic, seeded[0]));
  eq(ids(c.records()), seeded.map(q => q.id), 'Repeated error dedupes without promoting oldest record to newest');
  ok(c.el('#mistake-list').textContent.includes('20 saved questions'), 'Home honestly advertises capped batch');
  c.select('First Term', 'present-perfect'); const original = c.selection();
  c.saved(term, key); c.fresh(topic.type, 20); c.snapshot(`${key}: over-20 supplied batch`);
  // Public API models a collection change while playing; active targets must remain snapshotted.
  c.store.record(term, key, seeded[19], qmax(topic, seeded[19]), qmax(topic, seeded[19]));
  runSet(c, topic, 'correct', seeded.slice(0, 20).map(q => q.id));
  assertRecords(c, seeded.slice(20).map(q => ref(term, key, q, 0, qmax(topic, q))), 'Batch finishes only first 20; later pending items remain');
  c.home(); eq(c.selection(), original, 'Capped-batch return restores passage selection/count visibility');
  c.saved(term, key); c.fresh(topic.type, seeded.length - 20); runSet(c, topic, 'correct', seeded.slice(20).map(q => q.id));
  assertRecords(c, [], 'Final short batch is unpadded and clears exact remaining items'); c.home();
  report.coverage.batchOver20.push(key); c.close();
}
function clearSuite() {
  let c = makeDOM(), t = c.start('First Term', 'present-perfect', 10, 0); c.fresh('passage'); passageFinish(c, t, 'partial'); c.home();
  ok(/this browser only/i.test(c.el('#mistake-status').textContent) && /does not sync|do not sync/i.test(c.el('#mistake-status').textContent), 'Honest browser-only/no-sync notice');
  const before = c.records(); c.confirm(false); c.click('#btn-clear-mistakes'); eq(c.confirmations.length, 1, 'Clear requests native confirmation'); eq(c.records(), before, 'Cancelled confirmation keeps every record');
  c.confirm(true); c.click('#btn-clear-mistakes'); eq(c.confirmations.length, 2, 'Accepted clear still requires confirmation');
  assertRecords(c, []); ok(c.el('#mistake-list .mistake-empty'), 'Accepted clear renders honest empty state'); ok(c.el('#btn-clear-mistakes').disabled, 'Clear disabled after emptying'); c.snapshot('clear confirmation accepted');
  const loaded = c.storageSnapshot(); c.close(); c = makeDOM({ storage: loaded }); report.coverage.refreshes++;
  assertRecords(c, [], 'Accepted clear persists across refresh'); c.close();
}
function mcSuite() {
  let c = makeDOM({ fixture: true }), topic = c.start('First Term', 'test-only-mc', 10); c.fresh('mc', 10);
  const first = displayed(c, topic), wrong = [...c.d.querySelectorAll('#question-card .option-btn')].find(e => e.dataset.opt !== first.answer);
  c.click(wrong); assertRecords(c, [ref('First Term', 'test-only-mc', first, 0, 1)], 'Future MC first wrong saved before correction');
  buttonValue(c, '#question-card .option-btn', 'opt', first.answer);
  assertRecords(c, [ref('First Term', 'test-only-mc', first, 0, 1)], 'First-wrong-then-right remains pending'); eq(c.el('#hud-score').textContent, '0', 'Later correct MC choice earns no mark');
  c.home('#hud-quit');
  c.select('Second Term', 'relative-clauses', 20); const original = c.selection();
  c.saved('First Term', 'test-only-mc'); c.fresh('mc', 1); runSet(c, topic, 'correct', [first.id]); assertRecords(c, [], 'New first-right attempt removes MC mistake');
  c.click('#btn-retry-same'); c.fresh('mc', 1); runSet(c, topic, 'frame', [first.id]);
  assertRecords(c, [ref('First Term', 'test-only-mc', first, 0, 1)], 'Same-set new first-wrong correction remains pending');
  c.click('#btn-retry-incorrect'); c.fresh('mc', 1); runSet(c, topic, 'correct', [first.id]); assertRecords(c, [], 'MC shortcut new first-right clears');
  c.home(); eq(c.selection(), original, 'MC nested retries restore original Home count');
  c.store.record('First Term', 'test-only-mc', first, 0, 1);
  const loaded = c.storageSnapshot(); c.close(); c = makeDOM({ fixture: true, storage: loaded }); report.coverage.refreshes++;
  topic = c.w.__TEST_DATA['First Term']['test-only-mc']; c.saved('First Term', 'test-only-mc'); c.fresh('mc', 1); runSet(c, topic, 'correct', [first.id]); assertRecords(c, [], 'MC fixture metadata resolves after refresh');
  report.coverage.mcFirstAttempt = true; c.close();
}
// Adapter-only tests use separate VMs, not the app's lexical engine or live public bank.
function makeVM({ storage = {}, patch = '', mode = 'normal' } = {}) {
  const memory = new Map(Object.entries(storage)); let now = 1800000000000;
  const forbidden = () => { throw new Error('Unavailable storage fixture'); };
  const localStorage = { getItem: mode === 'normal' ? key => memory.get(key) ?? null : forbidden,
    setItem: mode === 'normal' ? (key, value) => memory.set(key, String(value)) : forbidden,
    removeItem: mode === 'normal' ? key => memory.delete(key) : forbidden };
  class ClockDate extends Date { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } }
  const context = vm.createContext({ console, Date: ClockDate, localStorage, crypto: crypto.webcrypto, TextEncoder,
    setTimeout: () => 1, clearTimeout: () => {}, addEventListener: () => {}, removeEventListener: () => {} });
  context.window = context;
  if (mode === 'getter-throws') Object.defineProperty(context, 'localStorage', { get: forbidden });
  vm.runInContext(source['data.js'] + '\nwindow.__TEST_DATA = GRAMMAR_DATA;\n' + patch, context);
  vm.runInContext(source['mistakes.js'], context);
  return { w: context, store: context.KSLOMistakes, snapshot: () => Object.fromEntries(memory), tick(ms = 10) { now += ms; } };
}
function recordArray(envelope, sampleId) {
  if (Array.isArray(envelope) && envelope.some(r => r && r.id === sampleId)) return envelope;
  if (envelope && typeof envelope === 'object') for (const child of Object.values(envelope)) { const found = recordArray(child, sampleId); if (found) return found; }
  return null;
}
function pruningSuite() {
  const base = makeVM(), term = 'Second Term', key = 'relative-clauses', topic = base.w.__TEST_DATA[term][key], a = topic.questions[0], b = topic.questions[1];
  let notified = 0; base.store.subscribe(() => { notified++; });
  base.store.record(term, key, a, 1, 3); base.tick(); base.store.record(term, key, b, 2, 3);
  eq(ids(base.store.list()), [a.id, b.id], 'VM public records sorted oldest-first'); ok(notified > 0, 'Public subscribers notified of changed collection');
  const storage = base.snapshot(); ok(typeof storage[STORE_KEY] === 'string', 'Documented localStorage key is written');
  const envelope = JSON.parse(storage[STORE_KEY]), array = recordArray(envelope, a.id);
  ok(array, 'Discover actual persisted reference array without inventing envelope schema');
  report.storageEnvelopeKeys = Object.keys(envelope); report.storageRecordKeys = Object.keys(array[0]);
  const malformed = plain(envelope), malformedArray = recordArray(malformed, a.id);
  malformedArray.push(null, {}, { ...plain(array[0]), id: 'nonexistent-permanent-id' }, { ...plain(array[0]), earned: -4 });
  const invalidStorage = { ...storage, [STORE_KEY]: JSON.stringify(malformed) }, invalid = makeVM({ storage: invalidStorage });
  eq(ids(invalid.store.list()), [a.id, b.id], 'Invalid individual records prune without deleting valid neighbours'); report.coverage.vmPruning.push('invalid-records');
  const edited = makeVM({ storage, patch: `GRAMMAR_DATA[${JSON.stringify(term)}][${JSON.stringify(key)}].questions.find(q=>q.id===${JSON.stringify(a.id)}).s1 += ' Edited fixture.';` });
  eq(ids(edited.store.list()), [b.id], 'Edited canonical content prunes only the changed ID'); report.coverage.vmPruning.push('edited');
  const deleted = makeVM({ storage, patch: `GRAMMAR_DATA[${JSON.stringify(term)}][${JSON.stringify(key)}].questions=GRAMMAR_DATA[${JSON.stringify(term)}][${JSON.stringify(key)}].questions.filter(q=>q.id!==${JSON.stringify(a.id)});` });
  eq(ids(deleted.store.list()), [b.id], 'Deleted content prunes only deleted ID'); report.coverage.vmPruning.push('deleted');
  const reordered = makeVM({ storage, patch: `GRAMMAR_DATA[${JSON.stringify(term)}][${JSON.stringify(key)}].questions.reverse();\n${MC_FIXTURE}` });
  eq(ids(reordered.store.list()), [a.id, b.id], 'Reordering/additions preserve unchanged canonical references'); report.coverage.vmPruning.push('reordered-added');
  for (const corrupt of ['{not json', 'null', '[]', '"not an envelope"']) {
    const test = makeVM({ storage: { [STORE_KEY]: corrupt } }); eq(test.store.list(), [], 'Corrupt top-level storage safely initializes empty');
  }
  for (const mode of ['all-throws', 'getter-throws']) {
    const test = makeVM({ mode }), q = test.w.__TEST_DATA[term][key].questions[0];
    test.store.record(term, key, q, 1, 3); eq(ids(test.store.list()), [q.id], 'VM storage failure retains in-memory outcome');
    eq(test.store.status().persistent, false, 'VM storage failure honestly reports fallback'); test.store.clear(); eq(test.store.list(), [], 'VM fallback clear is safe');
  }
  // Invalid/edit/delete handling must also survive real app initialization and render.
  const patchEdited = `GRAMMAR_DATA[${JSON.stringify(term)}][${JSON.stringify(key)}].questions.find(q=>q.id===${JSON.stringify(a.id)}).s1 += ' Edited fixture.';`;
  const patchDeleted = `GRAMMAR_DATA[${JSON.stringify(term)}][${JSON.stringify(key)}].questions=GRAMMAR_DATA[${JSON.stringify(term)}][${JSON.stringify(key)}].questions.filter(q=>q.id!==${JSON.stringify(a.id)});`;
  for (const [label, loaded, dataPatch, expected] of [
    ['invalid', invalidStorage, '', [a.id, b.id]], ['edited', storage, patchEdited, [b.id]], ['deleted', storage, patchDeleted, [b.id]], ['corrupt', { [STORE_KEY]: '{bad' }, '', []]
  ]) {
    const c = makeDOM({ storage: loaded, dataPatch }); c.active('home'); eq(ids(c.records()), expected, 'DOM initialization prunes ' + label + ' safely');
    if (expected.length) { c.saved(term, key); c.fresh('builder', expected.length); eq(displayed(c, c.w.__TEST_DATA[term][key]).id, expected[0], 'Pruned DOM start uses remaining real item'); c.home('#builder-quit'); }
    else ok(c.el('#mistake-list .mistake-empty'), 'Corrupt DOM storage renders empty state');
    c.snapshot('pruned DOM: ' + label); c.close(); report.coverage.refreshes++;
  }
}
function throwingDOMSuite(mode) {
  const c = makeDOM({ storageMode: mode }); c.active('home');
  const theme = c.w.document.documentElement.getAttribute('data-theme'); c.click('#theme-btn');
  ok(c.w.document.documentElement.getAttribute('data-theme') !== theme, 'Theme still toggles with unavailable storage');
  const topic = c.start('First Term', 'present-perfect', 10, 0); c.fresh('passage');
  const attempt = passageFinish(c, topic, 'partial'); // Exercises existing theme/stat storage as well as queue writes.
  assertRecords(c, [ref('First Term', 'present-perfect', attempt.item, attempt.earned, attempt.max)]);
  eq(c.store.status().persistent, false, 'DOM storage failure announces in-memory fallback');
  c.home(); ok(/unavailable|while this page|page stays open/i.test(c.el('#mistake-status').textContent), 'Visible honest storage failure notice');
  c.saved('First Term', 'present-perfect', attempt.item.id); c.fresh('passage'); passageFinish(c, topic, 'correct'); assertRecords(c, [], 'Fallback grading and stats writes never block completion'); c.home();
  c.snapshot('storage failure DOM: ' + mode); report.coverage.storageFailureDOMs.push(mode); c.close();
}
function main() {
  ok(!output.startsWith(repo + path.sep), 'Evidence must stay outside public website repository');
  source = Object.fromEntries(files.map(f => [f, fs.readFileSync(path.join(repo, f), 'utf8')]));
  report.hashes = Object.fromEntries(Object.entries(source).map(([f, s]) => [f, hash(s)]));
  ({ JSDOM, VirtualConsole } = require('jsdom'));
  inventory = vm.runInNewContext(source['data.js'] + '\nGRAMMAR_DATA;', {});
  const scripts = [...source['index.html'].matchAll(/<script\b[^>]*src=["']([^"']+)/g)].map(m => m[1].split('?')[0]);
  ok(scripts.indexOf('data.js') >= 0 && scripts.indexOf('data.js') < scripts.indexOf('mistakes.js') && scripts.indexOf('mistakes.js') < scripts.indexOf('app.js'), 'Actual index loads data, adapter and app in order');
  const passageTopics = Object.entries(inventory).flatMap(([term, topics]) => Object.entries(topics).filter(([, t]) => t.type === 'passage').map(([key]) => [term, key]));
  for (const [term, key] of passageTopics) {
    report.coverage.passageTopics.push(`${term}|${key}`);
    inventory[term][key].exercises.forEach((item, i) => suite(`passage ${term}/${key}/${item.id || i}`, () => passageSuite(term, key, i)));
  }
  suite('Relative Clauses normal ten / targeted subsets / partial Quit / refresh', () => questionSuite('Second Term', 'relative-clauses', 936));
  suite('Reported Speech normal ten / mixed 2-3 marks / targeted subsets / partial Quit / refresh', () => questionSuite('Second Term', 'reported-speech', 417));
  for (const key of ['relative-clauses', 'reported-speech']) suite(key + ' oldest-first over-20 batch and short remainder', () => batchSuite(key));
  suite('Clear cancelled/accepted and persisted empty state', clearSuite);
  suite('Future MC permanent-ID fixture and first-attempt rule', mcSuite);
  suite('VM storage envelope/pruning plus refreshed real DOM', pruningSuite);
  for (const mode of ['getter-throws', 'all-throws', 'write-throws']) suite('Real DOM initialization/theme/stats/fallback: ' + mode, () => throwingDOMSuite(mode));
  suite('Coverage and unchanged website sources', () => {
    eq(report.coverage.passageTopics.slice().sort(), passageTopics.map(([term, key]) => `${term}|${key}`).sort(), 'All current real passage topics discovered');
    eq(report.coverage.passageExercises.slice().sort(), passageTopics.flatMap(([term, key]) => inventory[term][key].exercises.map(e => `${term}|${key}|${e.id}`)).sort(), 'Every real whole passage exercised successfully');
    if (passageTopics.some(([term, key]) => inventory[term][key].exercises.some(e => e.segments.some(x => typeof x === 'object' && x.alternatives?.length)))) ok(report.coverage.passageAlternatives > 0, 'Accepted passage alternatives covered');
    ok(report.coverage.twoMarkRS > 0 && report.coverage.threeMarkRS > 0, 'Two and three mark RS paths covered');
    eq(report.coverage.questionTopics.slice().sort(), ['Second Term|relative-clauses', 'Second Term|reported-speech'], 'Both real question engines completed');
    eq(report.coverage.batchOver20.slice().sort(), ['relative-clauses', 'reported-speech'], 'Both real engines enforce cap without padding');
    ok(report.coverage.mcFirstAttempt, 'Future MC fixture completed');
    eq(report.coverage.storageFailureDOMs.slice().sort(), ['all-throws', 'getter-throws', 'write-throws'], 'DOM init/storage failure variants completed');
    ok(report.snapshots.length > 0, 'DOM snapshots captured as evidence');
  });
}
try { main(); }
catch (e) { report.failures.push({ suite: 'setup', message: e.message, stack: e.stack }); console.error('FAIL setup: ' + e.stack + '\nRun only when mistakes.js, metadata and app integration are ready; use external jsdom NODE_PATH.'); }
finally {
  for (const dom of liveDOMs) dom.window.close();
  if (source) for (const [f, initial] of Object.entries(report.hashes)) {
    try { eq(hash(fs.readFileSync(path.join(repo, f), 'utf8')), initial, 'Source file unchanged throughout regression: ' + f); }
    catch (e) { report.failures.push({ suite: 'source-integrity', message: e.message }); }
  }
  report.finished = new Date().toISOString(); report.result = report.failures.length ? 'FAIL' : 'PASS';
  try {
    if (output.startsWith(repo + path.sep)) throw new Error('Refusing evidence write inside public repository');
    fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  } catch (e) { report.failures.push({ suite: 'evidence', message: e.message }); report.result = 'FAIL'; console.error('FAIL evidence: ' + e.message); }
  console.log(`\n${report.result}: ${report.sessions.length} completed attempts, ${report.checks} assertions, ${report.failures.length} failures. Evidence: ${output}`);
  process.exitCode = report.failures.length ? 1 : 0;
}
