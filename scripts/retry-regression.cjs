#!/usr/bin/env node
'use strict';
/**
 * External DOM regression harness: no project writes, network, browser, Git or app-function calls.
 * Every application action is a click/change on an actual UI control. Real answer data is
 * evaluated alongside data.js in jsdom. A fake clock instruments only Date.now/setInterval;
 * it provides deterministic immediate-zero and single-running-interval assertions.
 * Run: NODE_PATH=<external-node_modules> node retry-regression.cjs [repo-dir] [evidence.json]
 * Requires jsdom 31.0.1 and a compatible Node runtime; never install dependencies here.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { runInNewContext } = require('node:vm');
const { JSDOM, VirtualConsole } = require('jsdom');
const repo = path.resolve(process.argv[2] || '/home/ubuntu/kslo-grammar-exercise');
const output = path.resolve(process.argv[3] || '/tmp/s2-grammar-retry-results.json');
const source = Object.fromEntries(['index.html','data.js','app.js','style.css'].map(f => [f, fs.readFileSync(path.join(repo,f),'utf8')]));
const inventory = runInNewContext(source['data.js'] + '\nGRAMMAR_DATA;', {});
const realTopics = Object.entries(inventory).flatMap(([term,topics]) => Object.keys(topics).map(key => `${term}|${key}`));
const hashes = Object.fromEntries(Object.entries(source).map(([f,s]) => [f, crypto.createHash('sha256').update(s).digest('hex')]));
const report = { timestamp: new Date().toISOString(), repo, hashes, checks: 0, sessions: [], suites: [], failures: [], coverage: { dropdowns:0, passageAlternatives:0, rsAlternativeSlots:0, rsAlternateTimes:0, rsWithThat:0, rsWithoutThat:0, rsTwoMarkQuestions:0, rsThreeMarkQuestions:0, lockedChecks:0, navigationRestarts:0, mockMC:true }, limitations:['jsdom is not a visual/layout or live-deployment test.','Timers are tested with a deterministic fake clock, not real wall-clock waiting.','Mock MC topic exists only in each test DOM, never in public data or the repository.'] };
function ok(v,msg) { report.checks++; assert.ok(v,msg); }
function eq(actual,expected,msg) { report.checks++; assert.deepEqual(actual,expected,msg); }
function norm(s) { return String(s).trim().replace(/\s+/g,' ').toLowerCase(); }
function visibleAlternatives(b) { return b.displayAlternatives ?? b.alternatives ?? []; }
function makeDOM(seed=936, mock=false) {
  const errors=[];
  const vc = new VirtualConsole();
  vc.on('jsdomError',e=>errors.push(String(e.message)));
  const dom = new JSDOM(source['index.html'], { url:'https://example.test/s2-grammar/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc });
  const w=dom.window,d=w.document;
  w.scrollTo=()=>{};
  w.alert=msg=>{throw new Error('Unexpected application alert: '+msg);};
  let rng=seed>>>0;
  w.Math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
  let now=1700000000000, next=1;
  const intervals=new Map();
  w.Date.now=()=>now;
  w.setInterval=(fn,ms)=>{const id=next++;intervals.set(id,{fn,ms});return id;};
  w.clearInterval=id=>intervals.delete(id);
  const clock={intervals,tick(ms){now+=ms;for(const {fn} of [...intervals.values()])fn();}};
  const fixture = mock ? `GRAMMAR_DATA['First Term']['test-mc']={label:'Test-only MC',icon:'T',iconClass:'',desc:'External fixture',type:'mc',questions:Array.from({length:12},(_,i)=>({question:'Fixture '+(i+1)+' has ___ answer.',answer:'key '+(i+1),options:['key '+(i+1),'wrong a '+(i+1),'wrong b '+(i+1),'wrong c '+(i+1)]}))}; TERM_KEYS['First Term'].push('test-mc');` : '';
  w.eval(source['data.js']+'\nwindow.__TEST_DATA = GRAMMAR_DATA;\n'+fixture+'\n'+source['app.js']);
  function el(sel){const e=d.querySelector(sel);ok(e,'Missing control '+sel);return e;}
  function visible(e){return !e.classList.contains('hidden') && e.style.display!=='none' && !!e.closest('.screen.active');}
  function click(target){const e=typeof target==='string'?el(target):target;ok(e,'Missing clicked control');ok(!e.disabled,'Disabled clicked control');ok(visible(e),'Hidden/inactive clicked control '+(e.id||e.className));e.click();eq(errors,[],'No application jsdom errors');}
  function choose(sel,value){const e=el(sel);ok(visible(e),'Visible select');ok(!e.disabled,'Enabled select');ok([...e.options].some(o=>o.value===value && !o.disabled),'Choice exists: '+value);e.value=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));eq(errors,[],'No application errors after change');}
  function active(name){eq(d.querySelectorAll('.screen.active').length,1,'Exactly one active screen');ok(el('#screen-'+name).classList.contains('active'),'Expected screen '+name);}
  function start(term,key,count=10){active('home');click(`[data-term="${term}"]`);click(`[data-topic="${key}"]`);const t=w.__TEST_DATA[term][key];if(t.type!=='passage')click(`[data-q="${count}"]`);else ok(el('#qcount-section').classList.contains('hidden'),'Passage count selection hidden');click('#btn-start');return t;}
  function fresh(type,count) {
    const screen={passage:'passage',builder:'builder','builder-rs':'builder-rs',mc:'exercise'}[type];active(screen);
    eq(intervals.size,1,'Exactly one running timer interval');
    for(const id of ['hud-timer','passage-timer','builder-timer','rs-timer'])eq(el('#'+id).textContent,'00:00.00','Timer resets immediately: '+id);
    const prefix={builder:'builder','builder-rs':'rs',mc:'hud'}[type];
    if(prefix){eq(el('#'+prefix+'-score').textContent,'0','Attempt score starts at zero');eq(el('#'+prefix+'-progress').textContent,`1 / ${count}`,'Starts on first question');eq(el('#'+({mc:'progress-fill',builder:'builder-progress-fill','builder-rs':'rs-progress-fill'}[type])).style.width,'0%','Progress starts at zero');}
    if(type==='passage'){const ss=[...d.querySelectorAll('#passage-body .blank-select')];eq(el('#passage-filled').textContent,`0 / ${ss.length}`,'Passage filled progress cleared');eq(el('#passage-progress-fill').style.width,'0%','Passage progress cleared');ok(ss.every(s=>s.value===''&&!s.disabled&&!s.classList.contains('filled')),'All passage responses clear and enabled');ok(el('#btn-submit-passage').classList.contains('hidden'),'Submission gated after retry');}
    if(type==='builder'||type==='builder-rs') {const p=type==='builder'?'':'rs-';ok(el('#'+p+'clause-assembled').dataset.empty==='true','Clause assembly cleared');eq(d.querySelectorAll(`#screen-${screen} .selected, #screen-${screen} .locked, #screen-${screen} .used, #screen-${screen} .correct, #screen-${screen} .wrong`).length,0,'Selections/check locks/feedback cleared');ok(el('#btn-'+(type==='builder'?'builder':'rs')+'-check').classList.contains('hidden'),'Check hidden before selections');ok(el('#btn-'+(type==='builder'?'builder':'rs')+'-next').classList.contains('hidden'),'Next hidden before check');ok(el('#'+(type==='builder'?'builder':'rs')+'-full').classList.contains('hidden'),'Previous full answer hidden');}
    if(type==='mc'){ok(el('#btn-next').classList.contains('hidden'),'MC Next initially gated');eq(d.querySelectorAll('#question-card .correct,#question-card .wrong,#question-card .revealed').length,0,'MC answer classes clear');}
    clock.tick(1230);for(const id of ['hud-timer','passage-timer','builder-timer','rs-timer'])eq(el('#'+id).textContent,'00:01.23','Timer advances from zero '+id);
  }
  return {dom,w,d,clock,el,click,choose,active,start,fresh,errors};
}
function dropdowns(c,exercise) {
  const blanks=exercise.segments.filter(s=>typeof s==='object');
  const selects=[...c.d.querySelectorAll('#passage-body .blank-select')];
  eq(selects.length,blanks.length,'Displayed passage blanks match real data');
  selects.forEach((s,i)=>{const choices=[...s.options].filter(o=>!o.disabled).map(o=>o.value);eq(choices.length,4,'Exactly four displayed answer choices');eq(new Set(choices).size,4,'Four unique answer choices');ok(choices.includes(blanks[i].answer),'Real key displayed at matched blank');for(const alt of visibleAlternatives(blanks[i]))ok(choices.includes(alt),'Visible accepted passage variant displayed');report.coverage.dropdowns++;});
  return {blanks,selects};
}
function passageFingerprint(c) {const body=c.el('#passage-body').cloneNode(true);body.querySelectorAll('.blank-wrap').forEach(e=>e.replaceWith('{blank}'));return {title:c.el('#passage-title').textContent,text:body.textContent};}
function finish(c,term,key,t,mode,phase,expectedOrder=null) {
  let gained=0,max=0,order=[],perQuestion=[];
  if(t.type==='passage') {
    const matches=t.exercises.filter(e=>(e.title||'')===c.el('#passage-title').textContent);eq(matches.length,1,'Displayed passage matches unique real key');
    const exercise=matches[0], fp=passageFingerprint(c);order=[fp];
    const {blanks,selects}=dropdowns(c,exercise);max=blanks.length;
    blanks.forEach((b,i)=>{const accepted=[b.answer,...(b.alternatives||[])];const wrong=[...selects[i].options].find(o=>!o.disabled&&!accepted.some(a=>norm(a)===norm(o.value))).value;let value=(mode==='allWrong'||(mode==='partial'&&i===0))?wrong:b.answer;if(mode==='alternatives'&&visibleAlternatives(b).length){value=visibleAlternatives(b).at(-1);report.coverage.passageAlternatives++;}if(accepted.some(a=>norm(a)===norm(value)))gained++;c.choose(`#passage-body .blank-select[data-index="${i}"]`,value);eq(c.el('#passage-filled').textContent,`${i+1} / ${max}`,'Filled progress updates immediately');c.clock.tick(100);});
    eq(c.el('#passage-progress-fill').style.width,'100%','Complete passage progress');c.click('#btn-submit-passage');eq(c.d.querySelectorAll('#review-list .rev-blank.correct').length,gained,'Passage review correct count');eq(c.d.querySelectorAll('#review-list .rev-blank.wrong').length,max-gained,'Passage review wrong count');
  } else {
    const count=Number(c.el('#'+({builder:'builder', 'builder-rs':'rs',mc:'hud'}[t.type])+'-progress').textContent.split('/')[1]);
    for(let i=0;i<count;i++) {
      let q,marks,qmax,signature;
      if(t.type==='builder') {
        const matches=t.questions.filter(q=>q.s1===c.el('#builder-s1').textContent&&q.s2===c.el('#builder-s2').textContent);eq(matches.length,1,'Displayed RC source matches unique real key');q=matches[0];signature=[q.s1,q.s2];qmax=3;
        const wrongAll=mode==='allWrong';const wrongStep=mode==='partial'?i%4:-1;
        const pron=(wrongAll||wrongStep===0)?(q.pronounOptions || t.pronouns).find(p=>p!==q.pronoun):q.pronoun;
        const tokens=(wrongAll||wrongStep===1)?[q.distractor]:q.clause;
        const gap=(wrongAll||wrongStep===2)?(q.correctGap===0?1:0):q.correctGap;
        c.click([...c.d.querySelectorAll('#pronoun-chips button')].find(e=>e.dataset.p===pron));
        for(const tok of tokens)c.click([...c.d.querySelectorAll('#clause-tiles button')].find(e=>e.dataset.tok===tok&&!e.classList.contains('used')));
        c.click(`#place-line [data-gap="${gap}"]`);
        marks=Number(pron===q.pronoun)+Number(tokens.length===q.clause.length&&tokens.every((v,j)=>norm(v)===norm(q.clause[j])))+Number(gap===q.correctGap);
        gained+=marks;max+=qmax;c.click('#btn-builder-check');eq(c.el('#builder-score').textContent,String(gained),'RC immediate per-step cumulative marks');
        const assembled=c.el('#clause-assembled').innerHTML;
        c.click([...c.d.querySelectorAll('#pronoun-chips button')].find(e=>e.dataset.p!==pron));c.click(c.el('#clause-tiles button'));eq(c.el('#clause-assembled').innerHTML,assembled,'RC checked clause locked');eq(c.el('#builder-score').textContent,String(gained),'RC locked clicks cannot change marks');report.coverage.lockedChecks++;
        eq(c.el('#btn-builder-next').textContent,i===count-1?'Finish':'Next Question →','RC Next/Finish');c.clock.tick(150);c.click('#btn-builder-next');
      } else if(t.type==='builder-rs') {
        const matches=t.questions.filter(q=>(q.prompt||q.s1)===c.el('#rs-quote').textContent);eq(matches.length,1,'Displayed RS prompt matches unique real key');q=matches[0];signature=q.prompt||q.s1;
        const hasTime=!!q.timeCorrect?.length;qmax=hasTime?3:2;report.coverage[hasTime?'rsThreeMarkQuestions':'rsTwoMarkQuestions']++;
        eq(c.el('#rsstep-3').style.display==='none',!hasTime,'RS 2/3 mark step visibility');
        const wrongAll=mode==='allWrong', wrongStep=mode==='partial'?i%4:-1;
        const frame=(wrongAll||wrongStep===0)?q.frameWrong[0]:q.frameCorrect;
        const slots=q.clauseCorrect.map(s=>Array.isArray(s)?s:[s]);
        let tokens=slots.map(s=>mode==='alternatives'?s.at(-1):s[0]);
        if(mode==='alternatives')report.coverage.rsAlternativeSlots+=slots.filter(s=>s.length>1).length;
        if(wrongAll||wrongStep===1){const rejected=(q.clauseWrong||[]).find(tok=>!slots[0].some(a=>norm(a)===norm(tok)));tokens=[rejected||tokens[0],...tokens];}
        else if(q.type==='statement'&&mode==='alternatives'){tokens.unshift('that');report.coverage.rsWithThat++;}
        else if(q.type==='statement')report.coverage.rsWithoutThat++;
        const time=hasTime?((wrongAll||wrongStep===2)?q.timeWrong[0]:(mode==='alternatives'?q.timeCorrect.at(-1):q.timeCorrect[0])):null;
        if(hasTime&&mode==='alternatives'&&q.timeCorrect.length>1)report.coverage.rsAlternateTimes++;
        c.click([...c.d.querySelectorAll('#rs-frame-chips button')].find(e=>e.dataset.f===frame));
        for(const tok of tokens)c.click([...c.d.querySelectorAll('#rs-clause-tiles button')].find(e=>e.dataset.tok===tok&&!e.classList.contains('used')));
        if(hasTime)c.click([...c.d.querySelectorAll('#rs-time-chips button')].find(e=>e.dataset.t===time));
        const scoredTokens=tokens[0]&&norm(tokens[0])==='that'?tokens.slice(1):tokens;
        marks=Number(frame===q.frameCorrect)+Number(scoredTokens.length===slots.length&&scoredTokens.every((tok,j)=>slots[j].some(a=>norm(a)===norm(tok))))+(hasTime?Number(q.timeCorrect.some(a=>norm(a)===norm(time))):0);
        gained+=marks;max+=qmax;c.click('#btn-rs-check');eq(c.el('#rs-score').textContent,String(gained),'RS immediate mixed 2/3-mark scoring');
        const assembled=c.el('#rs-clause-assembled').innerHTML;
        c.click([...c.d.querySelectorAll('#rs-frame-chips button')].find(e=>e.dataset.f!==frame));c.click(c.el('#rs-clause-tiles button'));eq(c.el('#rs-clause-assembled').innerHTML,assembled,'RS checked clause locked');eq(c.el('#rs-score').textContent,String(gained),'RS locked clicks cannot change marks');report.coverage.lockedChecks++;
        eq(c.el('#btn-rs-next').textContent,i===count-1?'Finish':'Next Question →','RS Next/Finish');c.clock.tick(150);c.click('#btn-rs-next');
      } else {
        const displayed=c.el('#question-card .q-stem').textContent.replace(/\u00a0/g,'').replace(/\s+/g,' ').trim();
        const matches=t.questions.filter(q=>q.question.replace(/___/g,'').replace(/\s+/g,' ').trim()===displayed);eq(matches.length,1,'Displayed MC stem matches real fixture key');q=matches[0];signature=q.question;qmax=1;
        const opts=[...c.d.querySelectorAll('#question-card .option-btn')];eq(opts.length,4,'Four MC options');eq(new Set(opts.map(e=>e.dataset.opt)).size,4,'Unique MC options');
        const lose=mode==='allWrong'||(mode==='partial'&&i===0);
        if(lose){c.click(opts.find(e=>e.dataset.opt!==q.answer));eq(c.el('#hud-score').textContent,String(gained),'MC wrong first attempt awards no mark');ok(c.el('#btn-next').classList.contains('hidden'),'MC wrong answer does not unlock Next');}
        c.click(opts.find(e=>e.dataset.opt===q.answer));marks=lose?0:1;gained+=marks;max++;eq(c.el('#hud-score').textContent,String(gained),'MC first-attempt score');eq(c.el('#btn-next').textContent,i===count-1?'Finish':'Next Question →','MC Next/Finish');c.clock.tick(150);c.click('#btn-next');
      }
      order.push(signature);perQuestion.push({marks,max:qmax});
    }
    eq(new Set(order.map(v=>JSON.stringify(v))).size,order.length,'No repeated questions in the session');
    const rows=[...c.d.querySelectorAll('#review-list .review-item')];eq(rows.length,order.length,'Exactly one review row per question');
    rows.forEach((r,i)=>{if(t.type==='builder'){eq([...r.querySelectorAll('.br-s')].map(e=>e.textContent),order[i],'RC review matches question order');eq(r.querySelector('.br-marks').textContent,`${perQuestion[i].marks}/3`,'RC per-question review score');}else if(t.type==='builder-rs'){eq(r.querySelector('.br-s').textContent,order[i],'RS review matches question order');eq(r.querySelector('.br-marks').textContent,`${perQuestion[i].marks}/${perQuestion[i].max}`,'RS mixed review denominator');}});
  }
  c.active('results');eq(c.clock.intervals.size,0,'Results stop all timer intervals');
  const result=`${gained}/${max} (${Math.round(gained/max*100)}%)`;eq(c.el('#res-score').textContent,result,'Final marks independently match selected real answers');
  ok(c.el('#res-time').textContent!=='00:00.00','Completed attempt has nonzero elapsed time');
  ok(/Back to Home/i.test(c.el('#btn-again').textContent),'Back to Home retained');
  ok(c.el('#btn-retry-same')&&!c.el('#btn-retry-same').disabled&&!c.el('#btn-retry-same').classList.contains('hidden'),'Same-exercise retry available on results');
  if(expectedOrder)eq(order,expectedOrder,'Retry preserves exact passage/question set and order');
  report.sessions.push({term,key,type:t.type,phase,mode,questionCount:t.type==='passage'?max:order.length,score:result,time:c.el('#res-time').textContent,order,perQuestion});
  console.log(`PASS session ${report.sessions.length}: ${key} ${phase} ${mode} ${result}`);
  return order;
}
function exerciseNavigation(c,term,key,t,count) {
  c.click('#btn-again');c.active('home');eq(c.clock.intervals.size,0,'Back Home leaves no timer');
  // New start is always invoked through current Home controls, not a retained engine callback.
  c.start(term,key,count);c.fresh(t.type,count);report.coverage.navigationRestarts++;
  // Create a partial response/check lock before Quit, then change topic through Home.
  if(t.type==='passage'){const s=c.el('#passage-body .blank-select');c.choose('#passage-body .blank-select', [...s.options].find(o=>!o.disabled).value);c.click('#passage-quit');}
  else if(t.type==='builder'){c.click(c.el('#pronoun-chips button'));c.click(c.el('#clause-tiles button'));c.click(c.el('#place-line button'));c.click('#btn-builder-check');c.click('#builder-quit');}
  else if(t.type==='builder-rs'){c.click(c.el('#rs-frame-chips button'));c.click(c.el('#rs-clause-tiles button'));if(c.el('#rsstep-3').style.display!=='none')c.click(c.el('#rs-time-chips button'));c.click('#btn-rs-check');c.click('#rs-quit');}
  else{c.click(c.el('#question-card .option-btn'));c.click('#hud-quit');}
  c.active('home');eq(c.clock.intervals.size,0,'Quit removes timer');
  const nextTerm=term==='First Term'?'Second Term':'First Term';
  const nextKey=term==='First Term'?'articles':'gerunds-to-infinitives';
  const next=c.start(nextTerm,nextKey);c.fresh(next.type,10);
  const newOrder=finish(c,nextTerm,nextKey,next,'alternatives','after-quit-new-topic');
  c.click('#btn-retry-same');c.fresh(next.type,10);finish(c,nextTerm,nextKey,next,'partial','after-quit-new-topic-retry',newOrder);
  c.click('#btn-again');c.active('home');eq(c.clock.intervals.size,0,'Final Home has no interval');
}
function suite(term,key,retries,count=10,seed=936,mock=false,targetTitle=null) {
  const c=makeDOM(seed,mock), before=report.sessions.length;
  try {
    const t=c.start(term,key,count);
    // If an alternatives topic randomly opens a passage without alternatives, use Quit/Home
    // to choose another actual passage, not app-state mutation or a direct start function.
    if(t.type==='passage'&&t.exercises.some(e=>e.segments.some(s=>typeof s==='object'&&visibleAlternatives(s).length))) {
      for(let tries=0;tries<20;tries++) {
        const e=t.exercises.find(e=>e.title===c.el('#passage-title').textContent);
        if(e.segments.some(s=>typeof s==='object'&&visibleAlternatives(s).length))break;
        c.click('#passage-quit');c.start(term,key,count);
        if(tries===19)throw new Error('Could not draw alternatives passage through Home after 20 attempts');
      }
    }
    if(targetTitle) {
      for(let tries=0;c.el('#passage-title').textContent!==targetTitle;tries++) {
        if(tries>=Math.max(40,t.exercises.length*10))throw new Error('Could not draw target passage through Home: '+targetTitle);
        c.click('#passage-quit');c.start(term,key,count);
      }
      eq(c.el('#passage-title').textContent,targetTitle,'Requested real passage selected through UI');
    }
    c.fresh(t.type,count);
    const order=finish(c,term,key,t,'partial','initial');
    const modes=['alternatives','allWrong','correct'];
    for(let i=0;i<retries;i++){c.click('#btn-retry-same');c.fresh(t.type,count);finish(c,term,key,t,modes[i%3],`same-retry-${i+1}`,order);}
    exerciseNavigation(c,term,key,t,count);
    eq(c.errors,[],'Suite has no application runtime errors');
    report.suites.push({term,key,status:'passed',completedSessions:report.sessions.length-before});
  } catch(e) {report.failures.push({term,key,message:e.message,stack:e.stack});report.suites.push({term,key,status:'failed',completedSessions:report.sessions.length-before});console.error(`FAIL ${key}: ${e.stack}`);}
  finally {c.dom.window.close();}
}
if(!source['index.html'].includes('id="btn-retry-same"')) {
  report.failures.push({message:'Retry button #btn-retry-same is not yet present in index.html; implementation is not ready.'});
  fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.error(report.failures[0].message);process.exit(2);
}
suite('First Term','comparatives-superlatives',3);
suite('First Term','present-past',1,10,417);
suite('First Term','gerunds-to-infinitives',1);
inventory['First Term']['present-perfect'].exercises.forEach((exercise,i) =>
  suite('First Term','present-perfect',3,10,[936,417,221,519][i] ?? (936+i*37),false,exercise.title));
suite('Second Term','passive-voice',1);
suite('Second Term','articles',1);
suite('Second Term','relative-clauses',3,10);
suite('Second Term','reported-speech',3,50);
suite('First Term','test-mc',3,10,936,true);
try {
  ok(report.sessions.length>=10,'At least 10 completed sessions');
  eq([...new Set(report.sessions.filter(s=>s.key!=='test-mc').map(s=>`${s.term}|${s.key}`))].sort(),realTopics.sort(),'Every current real topic completed');
  for(const key of ['comparatives-superlatives','relative-clauses','reported-speech'])ok(report.sessions.filter(s=>s.key===key&&s.phase.startsWith('same-retry')).length>=3,'Representative engine repeated retry at least three times: '+key);
  const hasVisiblePassageAlternatives=Object.values(inventory).some(topics=>Object.values(topics).some(t=>t.type==='passage'&&t.exercises.some(e=>e.segments.some(b=>typeof b==='object'&&visibleAlternatives(b).length))));
  if(hasVisiblePassageAlternatives)ok(report.coverage.passageAlternatives>0,'Every available visible-alternative path has coverage');
  else eq(report.coverage.passageAlternatives,0,'No hidden accepted form is mistaken for a displayed alternative');
  // Hidden forms are exercised independently through actual input controls in
  // test-audited-choices.cjs; this harness never invents a visible correct option.
  for(const field of ['rsAlternativeSlots','rsAlternateTimes','rsWithThat','rsWithoutThat','rsTwoMarkQuestions','rsThreeMarkQuestions'])ok(report.coverage[field]>0,'Acceptance/scoring coverage '+field);
  for(const [f,hash] of Object.entries(hashes))eq(crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,f),'utf8')).digest('hex'),hash,'Source unchanged throughout test: '+f);
} catch(e) {report.failures.push({message:e.message,stack:e.stack});}
report.completedSessions=report.sessions.length;
report.realSessions=report.sessions.filter(s=>s.key!=='test-mc').length;
report.mockSessions=report.sessions.filter(s=>s.key==='test-mc').length;
report.result=report.failures.length?'FAIL':'PASS';
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(`\n${report.result}: ${report.completedSessions} sessions (${report.realSessions} real, ${report.mockSessions} mock), ${report.checks} assertions, ${report.failures.length} failures. Evidence: ${output}`);
console.log(JSON.stringify(report.coverage,null,2));
process.exitCode=report.failures.length?1:0;
