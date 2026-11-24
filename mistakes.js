// Browser-local references only. Load after data.js and before app.js.
(function () {
  'use strict';

  const KEY = 'kslo_s2_grammar_mistakes_v1';
  const VERSION = 1;
  const TTL = 90 * 24 * 60 * 60 * 1000; // Expire 90 days after the latest error.
  const MAX_BYTES = 128 * 1024;
  // Bump only when scoring/interaction compatibility changes, never for a release token.
  const ENGINES = new Map([
    ['passage', 'passage-v1'], ['builder', 'builder-3step-v1'],
    ['builder-rs', 'builder-rs-slots-v1'], ['mc', 'mc-first-attempt-v1']
  ]);
  const FIELDS = ['term', 'topic', 'type', 'id', 'revision', 'engineVersion',
    'earned', 'max', 'firstSeen', 'updatedAt'];
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const name = value => typeof value === 'string' && value.length > 0 && value.length <= 100
    && !/[\u0000-\u001f\u007f]/.test(value)
    && !['__proto__', 'constructor', 'prototype'].includes(value);
  const idString = value => name(value) && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value);
  const keyOf = value => JSON.stringify([value.term, value.topic, value.id]);
  const catalog = new Map();
  const usedIDs = new Set();
  const duplicateIDs = new Set();

  // Stable key ordering, but meaningful array/word/segment ordering is retained.
  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (object(value)) return '{' + Object.keys(value).sort()
      .filter(key => value[key] !== undefined)
      .map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
    return JSON.stringify(value);
  }

  function fingerprint(topicData, item) {
    const content = Object.create(null);
    const settings = Object.create(null);
    Object.keys(item).forEach(key => { if (key !== 'id') content[key] = item[key]; });
    // Exclude collection membership and decorative Home metadata. Include every
    // instruction, engine setting and option pool, including future topic settings.
    Object.keys(topicData).forEach(key => {
      if (!['id', 'questions', 'exercises', 'label', 'icon', 'iconClass', 'desc'].includes(key)) {
        settings[key] = topicData[key];
      }
    });
    const text = canonical({ content, settings });
    // Two independently seeded FNV-1a lanes: synchronous change detection, not a
    // security hash. Prefix versions the canonicalisation/hash algorithm itself.
    let a = 0x811c9dc5;
    let b = 0x9e3779b9;
    for (let i = 0; i < text.length; i++) {
      a = Math.imul(a ^ text.charCodeAt(i), 0x01000193);
      b = Math.imul(b ^ text.charCodeAt(i), 0x01000193);
    }
    return 'c1-' + (a >>> 0).toString(16).padStart(8, '0')
      + (b >>> 0).toString(16).padStart(8, '0');
  }

  // data.js is a static release catalog. Cache fingerprints once per page load;
  // reloading after a content update validates each reference against that release.
  const data = typeof GRAMMAR_DATA !== 'undefined' ? GRAMMAR_DATA : {};
  Object.keys(data).forEach(term => {
    if (!name(term) || !object(data[term])) return;
    const topics = new Map();
    catalog.set(term, topics);
    Object.keys(data[term]).forEach(topic => {
      const topicData = data[term][topic];
      if (!name(topic) || !object(topicData) || !ENGINES.has(topicData.type)) return;
      const items = topicData.type === 'passage' ? topicData.exercises : topicData.questions;
      if (!Array.isArray(items)) return;
      const entries = new Map();
      topics.set(topic, entries);
      items.forEach(item => {
        if (!object(item) || !own(item, 'id') || !idString(item.id)) return;
        if (usedIDs.has(item.id)) duplicateIDs.add(item.id);
        usedIDs.add(item.id);
        const entry = { topicData, item, revision: fingerprint(topicData, item),
          engineVersion: ENGINES.get(topicData.type) };
        entry.max = maximum(entry);
        entries.set(item.id, entry);
      });
    });
  });

  function lookup(term, topic, id) {
    if (!name(term) || !name(topic) || !idString(id) || duplicateIDs.has(id)) return null;
    const topics = catalog.get(term);
    const entries = topics && topics.get(topic);
    const entry = entries && entries.get(id);
    if (!entry || entry.item.id !== id || !ENGINES.has(entry.topicData.type)) return null;
    return entry;
  }

  function maximum(entry) {
    const { topicData, item } = entry;
    switch (topicData.type) {
      case 'passage': return Array.isArray(item.segments)
        ? item.segments.filter(segment => object(segment) && typeof segment.answer === 'string').length : 0;
      case 'builder': return 3;
      case 'builder-rs': return 2 + (Array.isArray(item.timeCorrect) && item.timeCorrect.length ? 1 : 0);
      case 'mc': return 1;
      default: return 0;
    }
  }

  function valid(value, now) {
    try {
      if (!object(value) || Object.keys(value).length !== FIELDS.length
          || !FIELDS.every(field => own(value, field))) return null;
      const entry = lookup(value.term, value.topic, value.id);
      if (!entry || value.type !== entry.topicData.type
          || value.engineVersion !== entry.engineVersion
          || value.revision !== entry.revision) return null;
      if (!Number.isSafeInteger(value.max) || value.max <= 0 || value.max !== entry.max
          || !Number.isSafeInteger(value.earned) || value.earned < 0 || value.earned >= value.max) return null;
      if (!Number.isSafeInteger(value.firstSeen) || !Number.isSafeInteger(value.updatedAt)
          || value.firstSeen <= 0 || value.updatedAt < value.firstSeen
          || value.updatedAt > now + 5 * 60 * 1000 || now - value.updatedAt >= TTL) return null;
      // Copy only the exact schema; never keep a student answer or content payload.
      return Object.fromEntries(FIELDS.map(field => [field, value[field]]));
    } catch (_) { return null; }
  }

  const encode = records => JSON.stringify({ version: VERSION, records });
  // Conservatively cover both UTF-16 localStorage usage and UTF-8 JSON bytes.
  function bytes(text) {
    let utf8 = 0;
    for (const char of text) {
      const code = char.codePointAt(0);
      utf8 += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
    }
    return Math.max(text.length * 2, utf8);
  }
  const compare = (a, b) => a.firstSeen - b.firstSeen
    || (keyOf(a) < keyOf(b) ? -1 : keyOf(a) > keyOf(b) ? 1 : 0);

  function prune(values) {
    const now = Date.now();
    const unique = new Map();
    values.forEach(value => {
      const record = valid(value, now);
      if (!record) return;
      const key = keyOf(record);
      const previous = unique.get(key);
      if (previous) {
        const firstSeen = Math.min(previous.firstSeen, record.firstSeen);
        const latest = record.updatedAt >= previous.updatedAt ? record : previous;
        unique.set(key, { ...latest, firstSeen });
      } else unique.set(key, record);
    });
    // Remove invalid/expired first, then evict the oldest within each category.
    const records = [...unique.values()].sort(compare);
    let passages = records.filter(record => record.type === 'passage').length;
    let questions = records.length - passages;
    const bounded = records.filter(record => {
      if (record.type === 'passage' && passages > 100) { passages--; return false; }
      if (record.type !== 'passage' && questions > 200) { questions--; return false; }
      return true;
    });
    while (bounded.length && bytes(encode(bounded)) > MAX_BYTES) bounded.shift();
    return bounded;
  }

  let memory = [];
  let persistent = false;
  let writeFailed = false;
  // Unsaved local operations overlay fresh disk state. Tombstones prevent a failed
  // full-mark deletion/clear being resurrected by a later successful read/event.
  const pending = new Map();
  let pendingClear = false;
  const listeners = new Set();

  function readLatest() {
    try {
      const storage = window.localStorage;
      if (!storage) throw new Error('Storage unavailable');
      const text = storage.getItem(KEY);
      persistent = !writeFailed;
      if (text === null) return [];
      if (typeof text !== 'string' || bytes(text) > 1024 * 1024) return [];
      try {
        const envelope = JSON.parse(text);
        if (!object(envelope) || Object.keys(envelope).length !== 2
            || !own(envelope, 'version') || envelope.version !== VERSION
            || !own(envelope, 'records') || !Array.isArray(envelope.records)) return [];
        return prune(envelope.records);
      } catch (_) { return []; }
    } catch (_) {
      persistent = false;
      return null; // Distinct from an empty/corrupt readable namespace.
    }
  }

  function refresh() {
    const latest = readLatest();
    const merged = new Map((pendingClear ? [] : latest === null ? memory : latest)
      .map(record => [keyOf(record), record]));
    pending.forEach((value, key) => {
      if (value === null) merged.delete(key);
      else {
        const remote = merged.get(key);
        merged.set(key, remote ? { ...value, firstSeen: Math.min(remote.firstSeen, value.firstSeen) } : value);
      }
    });
    memory = prune([...merged.values()]);
    return latest !== null;
  }

  function persist() {
    // Refresh immediately before a synchronous write: sequential tab writes merge.
    const readable = refresh();
    try {
      if (!readable) throw new Error('Storage unavailable');
      window.localStorage.setItem(KEY, encode(memory));
      pending.clear();
      pendingClear = false;
      writeFailed = false;
      persistent = true;
    } catch (_) {
      writeFailed = true;
      persistent = false;
    }
    // The pending overlay itself is bounded, even during prolonged storage failure.
    const retained = new Set(memory.map(keyOf));
    pending.forEach((value, key) => { if (value !== null && !retained.has(key)) pending.delete(key); });
    if (pending.size > 300) {
      // Memory is now a complete bounded snapshot, including all local removals.
      pendingClear = true;
      pending.clear();
      memory.forEach(record => pending.set(keyOf(record), record));
    }
  }

  function notify() {
    [...listeners].forEach(callback => { try { callback(); } catch (_) { /* Isolate UI subscribers. */ } });
  }

  window.KSLOMistakes = Object.freeze({
    list() {
      refresh();
      return memory.map(record => ({ ...record }));
    },
    resolve(record) {
      const checked = valid(record, Date.now());
      if (!checked) return null;
      const entry = lookup(checked.term, checked.topic, checked.id);
      return entry ? { topicData: entry.topicData, item: entry.item } : null;
    },
    record(term, topic, item, earned, max) {
      const entry = object(item) && own(item, 'id') ? lookup(term, topic, item.id) : null;
      if (!entry || !Number.isSafeInteger(max) || max <= 0 || max !== entry.max
          || !Number.isSafeInteger(earned) || earned < 0 || earned > max) return;
      refresh();
      const reference = { term, topic, id: item.id };
      const key = keyOf(reference);
      if (earned === max) pending.set(key, null);
      else {
        const previous = memory.find(value => keyOf(value) === key);
        const now = Date.now();
        pending.set(key, {
          term, topic, type: entry.topicData.type, id: item.id,
          revision: entry.revision,
          engineVersion: entry.engineVersion, earned, max,
          firstSeen: previous ? previous.firstSeen : now,
          updatedAt: previous ? Math.max(now, previous.firstSeen) : now
        });
      }
      persist();
      notify();
    },
    clear() {
      pending.clear();
      pendingClear = true;
      memory = [];
      persist();
      notify();
    },
    status() { return { persistent }; },
    subscribe(callback) {
      if (typeof callback !== 'function') return () => {};
      listeners.add(callback);
      return () => listeners.delete(callback);
    }
  });

  refresh();
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('storage', event => {
      if (event.key !== KEY && event.key !== null) return;
      try {
        if (event.storageArea && event.storageArea !== window.localStorage) return;
      } catch (_) { /* Still refresh in fallback mode. */ }
      refresh(); // Read current storage, not an obsolete event.newValue snapshot.
      notify();
    });
  }
})();
