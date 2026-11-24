#!/usr/bin/env node
'use strict';
/**
 * Focused real-control conditionals regression. No application lexical calls.
 * NODE_PATH=/tmp/s2-grammar-retry-tests/node_modules node scripts/test-conditionals.cjs
 * Optional arguments: [repository directory] [/tmp/evidence.json].
 * Website sources and the independent fixture are read-only. Only this harness
 * and temporary JSON evidence are written. jsdom verifies DOM/logic, not pixels.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const repo = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const output = path.resolve(process.argv[3] || '/tmp/s2-conditionals-focused.json');
const files = ['index.html', 'data.js', 'mistakes.js', 'app.js', 'style.css'];
const TERM = 'First Term', TOPIC = 'conditionals', STORE_KEY = 'kslo_s2_grammar_mistakes_v1';
const report = { started: new Date().toISOString(), repo, result: 'RUNNING', checks: 0,
  suites: [], failures: [], hashes: {}, finalHashes: {}, attempts: [], snapshots: [],
  coverage: { displayChoices: [], hiddenAlternatives: [], isolatedDOMs: 0, refreshes: 0 },
  limitations: ['jsdom checks actual DOM controls and logic, not visual wrapping or deployment.',
    'Only test-window Date and timer intervals are instrumented; production sources are untouched.',
    'Hidden variants use cloned evaluated input-mode data before mistakes.js, never production select edits.',
    'The approved fixture is an independent expectation, not a new semantic audit.'] };
const plain = v => JSON.parse(JSON.stringify(v));
const hash = v => crypto.createHash('sha256').update(v).digest('hex');
const norm = v => String(v).trim().replace(/\s+/g, ' ').toLowerCase();
const live = new Set();
let source, fixture, JSDOM, VirtualConsole;
function ok(value, message) { report.checks++; assert.ok(value, message); }
function eq(actual, expected, message) { report.checks++; assert.deepEqual(plain(actual), plain(expected), message); }
function suite(name, fn) {
  const before = report.checks;
  console.log('RUN ' + name);
  try { fn(); report.suites.push({ name, status: 'PASS', checks: report.checks - before }); console.log('PASS ' + name); }
  catch (e) { report.suites.push({ name, status: 'FAIL', checks: report.checks - before }); report.failures.push({ suite: name, message: e.message, stack: e.stack }); console.error('FAIL ' + name + ': ' + e.message); }
  finally { for (const dom of [...live]) { dom.window.close(); live.delete(dom); } }
}
function makeDOM({ storage = {}, inputMode = false } = {}) {
  const errors = [], vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(source['index.html'], { url: 'https://example.test/s2-grammar/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
  live.add(dom); report.coverage.isolatedDOMs++;
  const w = dom.window, d = w.document;
  w.addEventListener('error', e => errors.push(String(e.error?.stack || e.message)));
  w.scrollTo = () => {};
  w.alert = message => { throw new Error('Unexpected alert: ' + message); };
  w.confirm = () => true;
  // Deterministic fake Date belongs ONLY to this fresh test window.
  let now = 1800000000000, nextInterval = 1, rng = 417;
  const NativeDate = w.Date;
  class ClockDate extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  w.Date = ClockDate;
  const intervals = new Map();
  w.setInterval = (fn, ms) => { const id = nextInterval++; intervals.set(id, { fn, ms }); return id; };
  w.clearInterval = id => intervals.delete(id);
  w.requestAnimationFrame = fn => { fn(now); return 1; };
  w.cancelAnimationFrame = () => {};
  w.Math.random = () => { rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0; return rng / 4294967296; };
  const clock = { intervals, tick(ms) { now += ms; for (const { fn } of [...intervals.values()]) fn(); } };
  eq(w.localStorage.length, 0, 'New DOM starts with isolated empty localStorage');
  for (const [key, value] of Object.entries(storage)) w.localStorage.setItem(key, value);
  w.eval(source['data.js'] + '\nwindow.__TEST_DATA = GRAMMAR_DATA;');
  if (inputMode) {
    // Clone evaluated data, not the source or fixture. Store sees final settings.
    w.__TEST_DATA = JSON.parse(JSON.stringify(w.__TEST_DATA));
    w.__TEST_DATA[TERM][TOPIC].blankType = 'input';
  }
  w.GRAMMAR_DATA = w.__TEST_DATA;
  w.TERM_KEYS = Object.fromEntries(Object.entries(w.__TEST_DATA).map(([term, topics]) => [term, Object.keys(topics)]));
  const beforeData = JSON.stringify(w.__TEST_DATA);
  w.eval(source['mistakes.js']);
  ok(w.KSLOMistakes && typeof w.KSLOMistakes.list === 'function', 'Public store loaded before app');
  w.eval(source['app.js']);
  eq(errors, [], 'No application initialization errors');
  function el(selector) { const e = d.querySelector(selector); ok(e, 'Control exists: ' + selector); return e; }
  function visible(e) { return !!e && !!e.closest('.screen.active') && !e.closest('.hidden, [hidden]') && ![e, ...ancestors(e)].some(n => n.style?.display === 'none'); }
  function ancestors(e) { const out = []; for (let p = e.parentElement; p; p = p.parentElement) out.push(p); return out; }
  function click(target) { const e = typeof target === 'string' ? el(target) : target; ok(e && visible(e) && !e.disabled, 'Clicked real visible enabled control: ' + (e?.id || e?.className)); e.click(); eq(errors, [], 'No runtime error after click'); }
  function change(i, value) {
    const e = el('#passage-body .blank-select[data-index="' + i + '"]');
    ok(visible(e) && !e.disabled, 'Select visible/enabled');
    ok([...e.options].some(o => !o.disabled && o.value === value), 'Value exists as actual display choice: ' + value);
    e.value = value; e.dispatchEvent(new w.Event('change', { bubbles: true }));
    eq(errors, [], 'No runtime errors after real select change');
  }
  function input(i, value) { const e = el('#passage-body .blank-input[data-index="' + i + '"]'); ok(visible(e) && !e.disabled, 'Actual input-mode control visible'); e.value = value; e.dispatchEvent(new w.Event('input', { bubbles: true })); eq(errors, [], 'No runtime error after input'); }
  function active(name) { eq(d.querySelectorAll('.screen.active').length, 1, 'Exactly one active screen'); ok(el('#screen-' + name).classList.contains('active'), 'Active screen: ' + name); }
  function select(term = TERM, topic = TOPIC, count = null) {
    active('home'); click([...d.querySelectorAll('#term-group > button')].find(e => e.dataset.term === term));
    click([...d.querySelectorAll('#topic-grid > .topic-card')].find(e => e.dataset.topic === topic));
    if (count !== null) click('#qcount-group > button[data-q="' + count + '"]');
    else { ok(el('#qcount-section').classList.contains('hidden'), 'Passage count selector hidden'); eq(d.querySelectorAll('#qcount-group button').length, 0, 'No passage question-count controls'); }
  }
  function start() { select(); click('#btn-start'); active('passage'); }
  function home(button = '#btn-again-bottom') { click(button); active('home'); eq(intervals.size, 0, 'Lower Home/Quit stops timer'); const timers = timerText(); clock.tick(850); eq(timerText(), timers, 'Home timer stays stopped'); }
  function timerText() { return ['hud-timer', 'passage-timer', 'builder-timer', 'rs-timer'].map(id => el('#' + id).textContent); }
  function selection() { return { term: d.querySelector('#term-group .selected')?.dataset.term, topic: d.querySelector('#topic-grid .selected')?.dataset.topic, count: d.querySelector('#qcount-group .selected')?.dataset.q, hidden: el('#qcount-section').classList.contains('hidden'), disabled: el('#btn-start').disabled }; }
  function storageSnapshot() { return Object.fromEntries(Array.from({ length: w.localStorage.length }, (_, i) => { const k = w.localStorage.key(i); return [k, w.localStorage.getItem(k)]; })); }
  function records() { return plain(w.KSLOMistakes.list()); }
  function close() { eq(errors, [], 'No application errors in completed DOM'); eq(JSON.stringify(w.__TEST_DATA), beforeData, 'Application does not mutate evaluated data'); dom.window.close(); live.delete(dom); }
  return { dom, w, d, el, visible, click, change, input, active, start, select, home, timerText, selection, storageSnapshot, records, clock, close, inputMode };
}
function passageState(c) {
  const body = c.el('#passage-body').cloneNode(true);
  body.querySelectorAll('.blank-wrap').forEach(e => e.replaceWith('{blank}'));
  return { id: fixture.id, title: c.el('#passage-title').textContent, instructions: c.el('#passage-instructions').textContent,
    text: body.textContent, options: [...c.d.querySelectorAll('#passage-body select')].map(e => [...e.options].filter(o => !o.disabled).map(o => o.value).sort()) };
}
function fresh(c) {
  c.active('passage'); eq(c.clock.intervals.size, 1, 'Exactly one running timer interval');
  eq(c.timerText(), Array(4).fill('00:00.00'), 'All timer displays immediately zero');
  const controls = [...c.d.querySelectorAll('#passage-body ' + (c.inputMode ? '.blank-input' : '.blank-select'))];
  eq(controls.length, 12, 'Exactly 12 scored controls');
  ok(controls.every(e => e.value === '' && !e.disabled && !e.classList.contains('filled')), 'All answers empty, enabled, unmarked');
  eq(c.el('#passage-filled').textContent, '0 / 12', 'Immediate zero answered count');
  eq(c.el('#passage-progress-fill').style.width, '0%', 'Immediate zero progress');
  ok(!c.visible(c.el('#btn-submit-passage')), 'Empty attempt cannot submit');
  eq(c.d.querySelectorAll('#passage-body .correct, #passage-body .wrong, #passage-body .rev-info').length, 0, 'No stale answer feedback');
  c.clock.tick(1230); eq(c.timerText(), Array(4).fill('00:01.23'), 'Single timer advances deterministically');
}
function structure(c) {
  const topic = c.w.__TEST_DATA[TERM][TOPIC], item = topic.exercises[0];
  eq(topic.type, 'passage', 'Conditionals is whole-passage engine'); eq(topic.exercises.length, 1, 'Only the approved first exercise');
  eq(item.id, fixture.id, 'Exact stable exercise ID'); eq(c.el('#passage-title').textContent, fixture.title, 'Exact fixture title');
  eq(c.el('#passage-instructions').textContent, fixture.instructions, 'Exact independent instructions');
  const blanks = item.segments.filter(s => typeof s === 'object'); eq(blanks.length, fixture.marks, 'Example is not scored');
  const labels = [...c.d.querySelectorAll('#passage-body .dialogue-speaker')];
  eq(labels.length, fixture.chatTurns, 'Exactly 13 speaker turns'); eq(labels.filter(e => e.textContent === 'Kelly').length, 7, 'Seven Kelly turns'); eq(labels.filter(e => e.textContent === 'Jason').length, 6, 'Six Jason turns');
  eq(labels.map(e => e.textContent), Array.from({ length: 13 }, (_, i) => i % 2 ? 'Jason' : 'Kelly'), 'Alternating speaker turns');
  const first = c.el('#passage-body').cloneNode(true); first.querySelectorAll('.blank-wrap').forEach(e => e.remove());
  ok(first.textContent.startsWith(fixture.example), 'First completed hoists example remains plain unscored text');
  eq((first.textContent.match(/e\.g\. hoists \(hoist\)/g) || []).length, 1, 'One plain-text example only');
  eq([...c.d.querySelectorAll('#passage-body .blank-prompt')].map(e => e.textContent), fixture.blanks.map(b => b.prompt), 'All 12 bracket cues exact and in written order');
  const complete = c.el('#passage-body').cloneNode(true);
  complete.querySelectorAll('.blank-wrap').forEach((e, i) => e.replaceWith(fixture.blanks[i].answer));
  ok(complete.textContent.includes('So what will you do if school is closed?'), 'Complete split question follows So what');
  ok(!/\byou\s+you\b/i.test(complete.textContent), 'No duplicated fixed you');
  blanks.forEach((b, i) => {
    const f = fixture.blanks[i];
    for (const field of ['answer', 'prompt', 'distractors', 'alternatives', 'explanation']) eq(b[field], f[field], 'Fixture blank ' + (i + 1) + ' exact ' + field);
    eq(b.displayAlternatives, [], 'Accepted variants explicitly hidden'); ok(b.showPrompt, 'Bracket cue enabled');
    if (!c.inputMode) {
      const e = c.el('#passage-body .blank-select[data-index="' + i + '"]');
      const values = [...e.options].filter(o => !o.disabled).map(o => o.value);
      eq(values.length, 4, 'Four actual choices'); eq(new Set(values).size, 4, 'Four unique actual choices');
      eq(values.slice().sort(), [f.answer, ...f.distractors].sort(), 'Exact independent visible choice set');
      eq([...e.options].filter(o => !o.disabled).map(o => o.textContent).sort(), values.slice().sort(), 'Visible labels equal selectable values');
      eq(values.filter(v => [f.answer, ...f.alternatives].some(a => norm(a) === norm(v))), [f.answer], 'Exactly one accepted visible answer');
      for (const alt of f.alternatives) ok(!values.includes(alt), 'Valid hidden alternative absent: ' + alt);
    }
  });
  if (c.inputMode) eq(c.d.querySelectorAll('#passage-body select').length, 0, 'Input fixture has actual inputs, no synthetic select choices');
  else { eq(c.d.querySelectorAll('#passage-body select').length, 12, 'Exactly 12 actual select controls'); eq(c.d.querySelectorAll('#passage-body input').length, 0, 'Production select mode unchanged'); }
}
function finish(c, values, earned, label) {
  eq(values.length, 12, 'Every submitted attempt fills whole exercise');
  values.forEach((value, i) => { c.inputMode ? c.input(i, value) : c.change(i, value); eq(c.el('#passage-filled').textContent, `${i + 1} / 12`, 'Real control updates answered count'); if (i < 11) ok(!c.visible(c.el('#btn-submit-passage')), 'Submission gated until all 12 filled'); });
  eq(c.el('#passage-progress-fill').style.width, '100%', 'Whole exercise filled');
  c.clock.tick(100); c.click('#btn-submit-passage'); c.active('results');
  eq(c.clock.intervals.size, 0, 'Summary stops timer');
  eq(c.el('#res-score').textContent, `${earned}/12 (${Math.round(earned / 12 * 100)}%)`, 'Independent exact score and denominator');
  eq(c.d.querySelectorAll('#review-list .rev-blank').length, 12, 'Exactly 12 reviewed scored blanks');
  eq(c.d.querySelectorAll('#review-list .rev-blank.correct').length, earned, 'Correct review badges match score');
  eq(c.d.querySelectorAll('#review-list .rev-blank.wrong').length, 12 - earned, 'Wrong review badges match score');
  const reviewed = [...c.d.querySelectorAll('#review-list .rev-blank')];
  reviewed.forEach((e, i) => { eq(e.querySelector('.rev-ans').textContent, values[i], 'Review preserves actual answer'); if (e.classList.contains('wrong')) eq(e.querySelector('.rev-correct').textContent, fixture.blanks[i].answer, 'Wrong review reveals fixture key'); });
  const info = [...c.d.querySelectorAll('#review-list .rev-info')]; eq(info.length, 12, 'Each scored blank has feedback');
  eq(info.map(e => e.dataset.exp), fixture.blanks.map(b => b.explanation), 'Feedback data-exp exactly equals independent fixture');
  for (let i = 0; i < info.length; i++) { c.click(info[i]); eq(c.el('#review-list .rev-popover').textContent, fixture.blanks[i].explanation, 'Actual info button opens correct feedback'); eq(c.d.querySelectorAll('.rev-popover').length, 1, 'Only one feedback popover'); }
  const bottom = c.el('.results-actions-bottom'), panel = c.el('#review-panel');
  ok(c.visible(bottom), 'Lower summary actions visible'); ok(!panel.contains(bottom), 'Lower actions not nested inside review');
  ok(panel.compareDocumentPosition(bottom) & c.w.Node.DOCUMENT_POSITION_FOLLOWING, 'Lower actions appear after review');
  for (const [upper, lower] of [['btn-retry-same', 'btn-retry-same-bottom'], ['btn-retry-incorrect', 'btn-retry-incorrect-bottom'], ['btn-again', 'btn-again-bottom']]) {
    eq(c.el('#' + lower).textContent, c.el('#' + upper).textContent, 'Upper/lower action labels mirror'); eq(c.visible(c.el('#' + lower)), c.visible(c.el('#' + upper)), 'Action applicability mirrors'); eq(c.el('#' + lower).disabled, c.el('#' + upper).disabled, 'Action enabled state mirrors');
  }
  ok(c.visible(c.el('#btn-retry-same-bottom')), 'Lower same exercise retry available'); ok(c.visible(c.el('#btn-again-bottom')), 'Lower Home available'); ok(!c.visible(c.el('#btn-retry-incorrect-bottom')), 'Passage has no blank-only incorrect retry');
  report.attempts.push({ label, mode: c.inputMode ? 'isolated-input' : 'production-select', earned, max: 12, values });
}
function keys() { return fixture.blanks.map(b => b.answer); }
function pending(c, earned) {
  const records = c.records().filter(r => r.term === TERM && r.topic === TOPIC);
  if (earned === 12) { eq(records, [], 'Full marks leave no conditionals record'); return; }
  eq(records.length, 1, 'One whole-passage mistake reference, never 12 blank records');
  eq([records[0].term, records[0].topic, records[0].type, records[0].id, records[0].earned, records[0].max], [TERM, TOPIC, 'passage', fixture.id, earned, 12], 'Exact whole-passage identity and earned/max');
  ok(!Object.hasOwn(records[0], 'segments') && !Object.hasOwn(records[0], 'studentAnswer'), 'Storage contains references, not passage/answer copies');
  eq(c.w.KSLOMistakes.resolve(records[0]).item.id, fixture.id, 'Public reference resolves exact ID');
}
function main() {
  ok(output.startsWith('/tmp/') && output.endsWith('.json'), 'Evidence writes restricted to temporary JSON');
  ({ JSDOM, VirtualConsole } = require('jsdom'));
  report.runtime = { node: process.version, jsdom: require('jsdom/package.json').version };
  source = Object.fromEntries(files.map(f => [f, fs.readFileSync(path.join(repo, f), 'utf8')]));
  report.hashes = Object.fromEntries(files.map(f => [f, hash(source[f])]));
  const fixturePath = path.join(repo, 'scripts/fixtures/conditionals-exercise-1.json');
  const fixtureText = fs.readFileSync(fixturePath, 'utf8'); fixture = JSON.parse(fixtureText); report.fixtureHash = hash(fixtureText);
  eq(fixture.blanks.length, 12, 'Independent fixture has 12 blanks'); eq(fixture.marks, 12, 'Independent maximum 12');
  suite('Approved modal-question error regression guards', () => {
    eq(fixture.blanks[2].answer, 'will you do', 'Teacher question key unchanged');
    eq(fixture.blanks[2].distractors, ['you do', 'are you do', 'will you doing'], 'Missing modal, be + base and modal + ing are screened wrong');
    eq(fixture.blanks[2].ruletags, [[14], [15], [8]], 'Each question distractor uses an approved formation');
    ok(fixture.rules.some(r => r.rule === 14 && /omit the starting modal/.test(r.form)), 'Omitted question modal rule retained');
    ok(fixture.rules.some(r => r.rule === 15 && /subject-appropriate/.test(r.form)), 'Be substitution preserves subject agreement');
    ok(!fixture.blanks[2].distractors.includes('are you doing'), 'Valid continuous question never offered as wrong');
    eq(fixture.blanks[4].distractors, ['been', 'will being', 'would be'], 'General current supermarket pattern rejects the screened would be');
    eq(fixture.blanks[7].distractors, ['been', 'being', 'will be'], 'Imaginary Chief Executive identity rejects screened will be');
    eq(fixture.blanks[4].ruletags[2], [2, 16], 'Would + base candidate is tagged for the if-clause');
    eq(fixture.blanks[7].ruletags[2], [1, 16], 'Will + base candidate is tagged for the if-clause');
    ok(fixture.rules.some(r => r.rule === 16 && /unambiguously wrong/.test(r.form)), 'If-clause rule retains full-context screening requirement');
    ok(!fixture.blanks[4].distractors.includes('will be'), 'Defensible predictive supermarket will be stays excluded');
  });
  suite('Approved negative-formation semantic regression guards', () => {
    eq(fixture.blanks[5].distractors, ['not finished', 'not finishing', 'am not finish'], 'Blank 6 uses approved main-verb be-negative formation error');
    eq(fixture.blanks[11].distractors, ['is not raise', 'will not raising', 'would not raised'], 'Blank 12 uses approved main-verb be-negative formation error');
    ok(fixture.rules.some(r => r.rule === 13 && /main-verb negative/.test(r.form)), 'Teacher main-verb negative rule retained');
    ok(!fixture.blanks[11].distractors.includes('is not raising'), 'Grammatical is not raising is NOT an incorrect distractor');
    ok(!fixture.blanks[5].distractors.includes('am not finishing'), 'Grammatical am not finishing is NOT an incorrect distractor');
    ok(!/is not raising|am not finishing/i.test(fixture.blanks[5].explanation + fixture.blanks[11].explanation), 'Key-focused explanations do not call grammatical continuous alternatives wrong');
    report.semanticRegression = { blank6: 'am not finish', blank12: 'is not raise', grammaticalNotDistractors: ['am not finishing', 'is not raising'] };
  });
  suite('48 independent actual display-choice attempts (12 keys + 36 distractors)', () => {
    fixture.blanks.forEach((b, i) => [b.answer, ...b.distractors].forEach((value, choice) => {
      const c = makeDOM(); c.start(); fresh(c); structure(c);
      const values = keys(); values[i] = value; const earned = choice === 0 ? 12 : 11;
      finish(c, values, earned, `blank-${i + 1}/choice-${choice + 1}`); pending(c, earned);
      report.coverage.displayChoices.push({ blank: i + 1, choice: choice + 1, value, earned }); c.close();
      if (choice === 3) console.log('  covered blank ' + (i + 1) + '/12');
    }));
    eq(report.coverage.displayChoices.length, 48, 'All 48 actual display choices submitted');
    eq(report.coverage.displayChoices.filter(r => r.earned === 12).length, 12, 'Every visible key gets 12/12'); eq(report.coverage.displayChoices.filter(r => r.earned === 11).length, 36, 'Every visible distractor gets 11/12');
  });
  suite('Mixed and all-wrong whole-passage scores', () => {
    for (const mode of ['mixed', 'all-wrong']) {
      const c = makeDOM(); c.start(); fresh(c); structure(c);
      const values = fixture.blanks.map((b, i) => mode === 'mixed' && i % 2 === 0 ? b.answer : b.distractors[0]);
      finish(c, values, mode === 'mixed' ? 6 : 0, mode); pending(c, mode === 'mixed' ? 6 : 0); c.close();
    }
  });
  suite('Lower retry / lower Home / refresh / Home Mistake Practice whole-passage removal', () => {
    let c = makeDOM(); c.start(); fresh(c); structure(c); const initial = passageState(c);
    const values = keys(); values[5] = fixture.blanks[5].distractors[2];
    finish(c, values, 11, 'lifecycle initial wrong'); pending(c, 11);
    report.snapshots.push({ label: 'wrong summary', html: c.el('#screen-results').outerHTML, records: c.records() });
    c.click('#btn-retry-same-bottom'); fresh(c); structure(c); eq(passageState(c), initial, 'Lower retry preserves ID/title/prose/cues/choice wording');
    eq(c.el('#review-list').childElementCount, 0, 'Retry clears prior answer review and popovers');
    finish(c, values, 11, 'lifecycle same retry wrong'); pending(c, 11); c.home();
    // Public store API is used ONLY to seed an unrelated legitimate neighbour.
    const other = c.w.__TEST_DATA['Second Term']['relative-clauses'].questions[0];
    c.w.KSLOMistakes.record('Second Term', 'relative-clauses', other, 0, 3);
    const untouched = c.records().find(r => r.id === other.id); ok(untouched, 'Unrelated neighbour seeded through documented public API');
    const storage = c.storageSnapshot(); ok(storage[STORE_KEY], 'Actual browser mistake namespace persisted'); c.close();
    c = makeDOM({ storage }); report.coverage.refreshes++; c.active('home'); eq(c.clock.intervals.size, 0, 'Refresh Home has no timer'); pending(c, 11);
    c.select('Second Term', 'relative-clauses', 20); const homeSelection = c.selection(); eq(homeSelection.count, '20', 'Read selected count through Home control'); ok(!homeSelection.hidden, 'Question Home count controls visible');
    const buttons = [...c.d.querySelectorAll('#mistake-list .mistake-start')].filter(e => e.dataset.term === TERM && e.dataset.topic === TOPIC && e.dataset.mistakeId === fixture.id);
    eq(buttons.length, 1, 'One exact conditionals Home practice control'); const row = buttons[0].closest('.mistake-row');
    ok(row.textContent.includes(fixture.title) && row.textContent.includes('Last score: 11/12'), 'Refreshed Home shows exact title and saved marks');
    report.snapshots.push({ label: 'refreshed Home', html: c.el('#mistake-practice').outerHTML, records: c.records(), selection: homeSelection });
    c.click(buttons[0]); fresh(c); structure(c); eq(passageState(c), initial, 'Actual Home practice retries the whole unchanged passage');
    ok(c.visible(c.el('#screen-passage .practice-banner')) && /whole exercise/.test(c.el('#screen-passage .practice-banner').textContent), 'Visible whole-exercise practice banner');
    finish(c, keys(), 12, 'refreshed whole-passage practice correct'); pending(c, 12); eq(c.records(), [untouched], 'Full marks remove just exact conditionals record and preserve neighbour byte-for-byte');
    c.home(); eq(c.selection(), homeSelection, 'Practice return restores Home term/topic/count controls');
    eq(c.d.querySelectorAll('#mistake-list .mistake-start[data-topic="conditionals"]').length, 0, 'Completed conditionals Home practice action gone'); c.close();
  });
  suite('Hidden accepted forms through three isolated actual input-mode fixtures', () => {
    for (const [i, alt] of [[5, "don't finish"], [7, 'was'], [11, "doesn't raise"]]) {
      eq(fixture.blanks[i].alternatives, [alt], 'Independent hidden accepted form exact');
      // A separate production select DOM proves absence, without forcing a select value.
      let c = makeDOM(); c.start(); fresh(c); structure(c); ok(![...c.el('#passage-body .blank-select[data-index="' + i + '"]').options].some(o => o.value === alt), 'Hidden form absent from production selects'); c.home('#passage-quit'); c.close();
      c = makeDOM({ inputMode: true }); c.start(); fresh(c); structure(c); const values = keys(); values[i] = alt;
      finish(c, values, 12, 'hidden blank-' + (i + 1) + ': ' + alt); pending(c, 12); report.coverage.hiddenAlternatives.push({ blank: i + 1, value: alt, earned: 12 }); c.close();
    }
    eq(report.coverage.hiddenAlternatives.length, 3, 'All three hidden variants tested using real input events');
  });
  suite('Fixture unchanged', () => eq(hash(fs.readFileSync(fixturePath)), report.fixtureHash, 'Independent fixture preserved'));
}
try { main(); }
catch (e) { report.failures.push({ suite: 'setup', message: e.message, stack: e.stack }); console.error('FAIL setup: ' + e.message); }
finally {
  for (const dom of live) dom.window.close();
  if (source) for (const file of files) {
    try { report.finalHashes[file] = hash(fs.readFileSync(path.join(repo, file))); eq(report.finalHashes[file], report.hashes[file], 'Source hash unchanged: ' + file); }
    catch (e) { report.failures.push({ suite: 'source-integrity', file, message: e.message }); }
  }
  report.sourceHashesUnchanged = source ? files.every(f => report.hashes[f] === report.finalHashes[f]) : false;
  report.finished = new Date().toISOString(); report.result = report.failures.length ? 'FAIL' : 'PASS';
  if (output.startsWith('/tmp/') && output.endsWith('.json')) {
    try { fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n'); }
    catch (e) { report.failures.push({ suite: 'evidence', message: e.message }); report.result = 'FAIL'; console.error('FAIL evidence: ' + e.message); }
  } else { report.failures.push({ suite: 'evidence', message: 'Evidence must be a /tmp/*.json file' }); report.result = 'FAIL'; }
  console.log(`${report.result}: ${report.attempts.length} completed attempts, ${report.checks} assertions, ${report.failures.length} failures. Evidence: ${output}`);
  process.exitCode = report.failures.length ? 1 : 0;
}
