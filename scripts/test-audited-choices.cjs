#!/usr/bin/env node
'use strict';
// Isolated jsdom fixtures exercise real controls; they never edit production data.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const {JSDOM,VirtualConsole} = require('jsdom');
const root = path.resolve(__dirname,'..');
const src = Object.fromEntries(['index.html','data.js','mistakes.js','app.js'].map(f=>[f,fs.readFileSync(path.join(root,f),'utf8')]));
const data = JSON.parse(JSON.stringify(vm.runInNewContext(src['data.js']+'\nGRAMMAR_DATA;')));
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/unique-answer-safe-repairs.json')));
let attempts=0,variants=0,selectors=0;
function dom(patch='') {
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const d=new JSDOM(src['index.html'],{url:'https://test.invalid/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  const w=d.window;w.scrollTo=()=>{};w.setInterval=()=>1;w.clearInterval=()=>{};
  w.eval(src['data.js']+'\nwindow.GRAMMAR_DATA=GRAMMAR_DATA;window.TERM_KEYS=TERM_KEYS;\n'+patch);w.eval(src['mistakes.js']);w.eval(src['app.js']);
  const el=s=>{const x=w.document.querySelector(s);assert.ok(x,s);return x;};
  const click=s=>{const x=typeof s==='string'?el(s):s;assert.ok(x&&!x.disabled,'Enabled actual control');x.click();assert.deepEqual(errors,[]);};
  const pick=(s,field,v)=>click([...w.document.querySelectorAll(s)].find(x=>x.dataset[field]===String(v)&&!x.classList.contains('used')));
  return {w,d,el,click,pick,errors};
}
for(const [term,topics] of Object.entries(data))for(const [key,t] of Object.entries(topics)) {
  for(const [index,item] of (t.exercises||[]).entries()) {
    const blanks=item.segments.filter(b=>typeof b==='object');
    const hidden=blanks.flatMap((b,i)=>(b.alternatives||[]).filter(a=>!(b.displayAlternatives??b.alternatives??[]).includes(a)).map(a=>({i,a})));
    for(const variant of hidden) {
      const c=dom(`GRAMMAR_DATA[${JSON.stringify(term)}][${JSON.stringify(key)}].blankType='input';`);
      try {
        c.click(`[data-term=${JSON.stringify(term)}]`);c.click(`[data-topic=${JSON.stringify(key)}]`);
        c.w.Math.random=()=>(index+0.25)/t.exercises.length;c.click('#btn-start');
        assert.equal(c.el('#passage-title').textContent,item.title);
        const inputs=[...c.w.document.querySelectorAll('#passage-body input')];assert.equal(inputs.length,blanks.length);
        inputs.forEach((x,i)=>{x.value=i===variant.i?variant.a:blanks[i].answer;x.dispatchEvent(new c.w.Event('input',{bubbles:true}));});
        c.click('#btn-submit-passage');assert.equal(c.el('#res-score').textContent,`${blanks.length}/${blanks.length} (100%)`);
        assert.equal(c.w.document.querySelectorAll('.rev-blank.correct').length,blanks.length);
        assert.equal(c.w.KSLOMistakes.list().length,0,'Accepted hidden form cannot create a mistake');
        variants++;attempts++;
      } finally {c.d.window.close();}
    }
  }
}
const targets=[...new Set([...fixture.pronounChoices.map(f=>f.id),...fixture.frameChoices.map(f=>f.id),...fixture.fields.filter(f=>['combined','segs'].includes(f.field)).map(f=>f.id)])];
for(const id of targets) {
  const key=id.startsWith('relative-clauses')?'relative-clauses':'reported-speech',t=data['Second Term'][key],item=t.questions.find(q=>q.id===id),rs=t.type==='builder-rs';
  const c=dom();
  try {
    c.click('[data-term="Second Term"]');c.click(`[data-topic="${key}"]`);c.click('[data-q="10"]');
    c.w.GRAMMAR_DATA['Second Term'][key].questions=c.w.GRAMMAR_DATA['Second Term'][key].questions.filter(q=>q.id===id);
    c.click('#btn-start');
    if(rs) {
      assert.deepEqual([...c.w.document.querySelectorAll('#rs-frame-chips button')].map(x=>x.dataset.f).sort(),[item.frameCorrect,...item.frameWrong].sort());
      c.pick('#rs-frame-chips button','f',item.frameCorrect);item.clauseCorrect.forEach(x=>c.pick('#rs-clause-tiles button','tok',Array.isArray(x)?x[0]:x));
      if(item.timeCorrect.length)c.pick('#rs-time-chips button','t',item.timeCorrect[0]);
      c.click('#btn-rs-check');c.click('#btn-rs-next');
    } else {
      assert.deepEqual([...c.w.document.querySelectorAll('#pronoun-chips button')].map(x=>x.dataset.p).sort(),(item.pronounOptions||t.pronouns).slice().sort());
      c.pick('#pronoun-chips button','p',item.pronoun);item.clause.forEach(x=>c.pick('#clause-tiles button','tok',x));c.pick('#place-line button','gap',item.correctGap);
      c.click('#btn-builder-check');c.click('#btn-builder-next');
      assert.ok(c.el('#review-list').textContent.includes(item.combined),'Corrected review model displayed');
    }
    const max=rs&&!item.timeCorrect.length?2:3;assert.equal(c.el('#res-score').textContent,`${max}/${max} (100%)`);
    c.click('#btn-retry-same-bottom');assert.equal(c.el(rs?'#rs-progress':'#builder-progress').textContent,'1 / 1');
    assert.equal(c.el(rs?'#rs-clause-assembled':'#clause-assembled').dataset.empty,'true');
    assert.equal(c.w.KSLOMistakes.list().length,0);selectors++;attempts++;
  } finally {c.d.window.close();}
}
console.log(`PASS: ${attempts} focused attempts; ${variants} hidden grammatical variants accepted via input fixtures; ${selectors} changed builder items retain display, scoring, review and retry.`);
