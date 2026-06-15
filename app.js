// ============================================================
// S2 GRAMMAR CHALLENGE – APP v2
// Combined UI + Engine logic
// Conditional question count based on topic type
// ============================================================

(() => {
  'use strict';

  // --- DOM REFS ---
  const $ = id => document.getElementById(id);
  const screenHome = $('screen-home');
  const screenExercise = $('screen-exercise');
  const screenResults = $('screen-results');
  const termGroup = $('term-group');
  const topicGrid = $('topic-grid');
  const qcountSection = $('qcount-section');
  const qcountGroup = $('qcount-group');
  const btnStart = $('btn-start');
  const btnStartText = btnStart.querySelector('.btn-start-text');
  const themeBtn = $('theme-btn');
  const themeIcon = $('theme-icon');
  const heroSub = $('hero-sub');
  const streakCount = $('streak-count') || { textContent: '' }; // badge removed; keep safe no-op

  // Exercise
  const hudProgress = $('hud-progress');
  const hudTimer = $('hud-timer');
  const hudScore = $('hud-score');
  const hudScoreBadge = $('hud-score-badge');
  const progressFill = $('progress-fill');
  const questionCard = $('question-card');
  const btnNext = $('btn-next');
  const hudQuit = $('hud-quit');

  // Passage exercise
  const screenPassage = $('screen-passage');
  const passageFilled = $('passage-filled');
  const passageTimer = $('passage-timer');
  const passageProgressFill = $('passage-progress-fill');
  const passageInstructions = $('passage-instructions');
  const passageTitle = $('passage-title');
  const passageBody = $('passage-body');
  const btnSubmitPassage = $('btn-submit-passage');
  const passageQuit = $('passage-quit');

  // Builder exercise (Relative Clauses)
  const screenBuilder = $('screen-builder');
  const builderProgress = $('builder-progress');
  const builderTimer = $('builder-timer');
  const builderProgressFill = $('builder-progress-fill');
  const builderS1 = $('builder-s1');
  const builderS2 = $('builder-s2');
  const pronounChips = $('pronoun-chips');
  const clauseAssembled = $('clause-assembled');
  const clauseTiles = $('clause-tiles');
  const clauseClear = $('clause-clear');
  const placeLine = $('place-line');
  const builderInstr = $('builder-instr');
  const btnBuilderCheck = $('btn-builder-check');
  const btnBuilderNext = $('btn-builder-next');
  const builderScore = $('builder-score');
  const builderQuit = $('builder-quit');
  const builderFull = $('builder-full');

  // Reported Speech builder
  const screenBuilderRS = $('screen-builder-rs');
  const rsProgress = $('rs-progress');
  const rsTimer = $('rs-timer');
  const rsProgressFill = $('rs-progress-fill');
  const rsQuote = $('rs-quote');
  const rsSpeakerNum = $('rs-speaker-num');
  const rsFrameChips = $('rs-frame-chips');
  const rsClauseAssembled = $('rs-clause-assembled');
  const rsClauseTiles = $('rs-clause-tiles');
  const rsClauseClear = $('rs-clause-clear');
  const rsTimeChips = $('rs-time-chips');
  const rsStep3 = $('rsstep-3');
  const rsInstr = $('rs-instr');
  const btnRSCheck = $('btn-rs-check');
  const btnRSNext = $('btn-rs-next');
  const rsScore = $('rs-score');
  const rsQuit = $('rs-quit');
  const rsFull = $('rs-full');

  // Results
  const resScore = $('res-score');
  const resScoreLbl = $('res-score-lbl');
  const resRemark = $('res-remark');
  const resTime = $('res-time');
  const resStreak = $('res-streak');
  const resStatStreak = $('res-stat-streak');
  const reviewList = $('review-list');
  const reviewHeading = $('review-heading');
  const btnAgain = $('btn-again');

  // --- STATE ---
  let selectedTerm = null;
  let selectedTopic = null;
  let selectedCount = null;
  let currentQuestions = [];
  let currentIndex = 0;
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  let firstAttempt = true;
  let timerInterval = null;
  let startTime = 0;
  let elapsed = 0;

  // Passage state
  let currentPassage = null;   // the chosen exercise object
  let passageBlanks = [];      // [{ answer, alternatives, explanation, inputEl|selectEl, index }]
  let passageBlankType = 'select'; // 'select' (articles) or 'input' (passive voice)

  // Builder state
  let builderTopic = null;          // the relative-clauses topic data
  let builderResults = [];          // per-question results for the summary
  let bPronoun = null;              // chosen pronoun for current question
  let bClause = [];                 // chosen clause tokens (in order) for current question
  let bPlace = null;                // chosen gap index for current question
  let bScore = 0;                   // cumulative marks across the builder exercise
  let bChecked = false;             // whether the current question has been checked (locked)

  // Reported Speech builder state
  let rsTopic = null;               // the reported-speech topic data
  let rsResults = [];               // per-question results for the summary
  let rsFrame = null;               // chosen reporting frame for current question
  let rsClause = [];                // chosen clause tokens (in order): {tok, id}
  let rsTime = null;                // chosen time expression for current question
  let rsScoreVal = 0;               // cumulative marks across the RS exercise
  let rsChecked = false;            // whether the current RS question is checked (locked)
  let rsHasTime = false;            // whether current question uses Step 3

  // --- GREETINGS ---
  const GREETINGS = [
    'Ready for the challenge?',
    'Challenge time!',
    'Ready to begin?',
    "Let\u2019s get started!",
    'Set your challenge!'
  ];

  // --- INIT ---
  function init() {
    $('yr').textContent = new Date().getFullYear();
    heroSub.textContent = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    loadTheme();
    renderTermButtons();
    loadStats();
    bindEvents();
    // Auto-select Second Term if First Term is empty
    if (TERM_KEYS["First Term"].length === 0) {
      selectTerm("Second Term");
    }
  }

  // --- THEME ---
  function loadTheme() {
    const saved = localStorage.getItem('kslo_grammar_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    themeIcon.textContent = saved === 'dark' ? '\u2600\uFE0F' : '\u{1F319}';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('kslo_grammar_theme', next);
    themeIcon.textContent = next === 'dark' ? '\u2600\uFE0F' : '\u{1F319}';
  }

  // --- STATS (localStorage) ---
  function loadStats() {
    // Homepage stats bar removed (scores differ per exercise type).
    // Kept as a no-op so existing call sites remain valid.
  }

  function saveStats(scoreStr, timeStr) {
    const attempts = parseInt(localStorage.getItem('kslo_grammar_attempts') || '0') + 1;
    localStorage.setItem('kslo_grammar_attempts', attempts.toString());

    const prevBest = localStorage.getItem('kslo_grammar_best_score');
    if (!prevBest || parseScorePct(scoreStr) > parseScorePct(prevBest)) {
      localStorage.setItem('kslo_grammar_best_score', scoreStr);
    }

    const prevTime = localStorage.getItem('kslo_grammar_best_time');
    if (!prevTime || elapsed < parseTime(prevTime)) {
      localStorage.setItem('kslo_grammar_best_time', timeStr);
    }
  }

  function parseScorePct(str) {
    const m = str.match(/(\d+)%/);
    return m ? parseInt(m[1]) : 0;
  }

  function parseTime(str) {
    const parts = str.split(':');
    if (parts.length === 2) {
      return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return Infinity;
  }

  // --- RENDER HOME ---
  function renderTermButtons() {
    const terms = ["First Term", "Second Term"];
    termGroup.innerHTML = '';
    terms.forEach(term => {
      const btn = document.createElement('button');
      btn.className = 'opt-btn';
      btn.textContent = term;
      btn.dataset.term = term;
      if (TERM_KEYS[term].length === 0) {
        btn.classList.add('disabled');
      }
      if (term === selectedTerm) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        if (TERM_KEYS[term].length === 0) return;
        selectTerm(term);
      });
      termGroup.appendChild(btn);
    });
  }

  function selectTerm(term) {
    selectedTerm = term;
    selectedTopic = null;
    selectedCount = null;
    hideQCountSection();
    updateStartBtn();
    // Update term button states
    termGroup.querySelectorAll('.opt-btn').forEach(b => {
      b.classList.toggle('selected', b.dataset.term === term);
    });
    renderTopicCards();
  }

  function renderTopicCards() {
    topicGrid.innerHTML = '';
    if (!selectedTerm) return;
    const topics = GRAMMAR_DATA[selectedTerm];
    // Explicit display order for quest cards (falls back to natural key order)
    const DISPLAY_ORDER = {
      "Second Term": ["passive-voice", "relative-clauses", "reported-speech", "articles"]
    };
    const order = DISPLAY_ORDER[selectedTerm] || [];
    const orderedKeys = Object.keys(topics).slice().sort((a, b) => {
      const ia = order.indexOf(a); const ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return 0;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    orderedKeys.forEach((key, i) => {
      const t = topics[key];
      const card = document.createElement('div');
      card.className = 'topic-card';
      card.dataset.topic = key;
      card.innerHTML = `
        <div class="topic-card-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
        <div class="topic-icon ${t.iconClass}">${t.icon}</div>
        <div class="topic-name">${t.label}</div>
        <div class="topic-desc">${t.desc}</div>
        <div class="topic-progress"><div class="topic-progress-fill"></div></div>
      `;
      card.style.animationDelay = `${i * 0.06}s`;
      card.addEventListener('click', () => selectTopic(key, card));
      topicGrid.appendChild(card);
    });
  }

  function selectTopic(key, cardEl) {
    selectedTopic = key;
    selectedCount = null;
    topicGrid.querySelectorAll('.topic-card').forEach(c => c.classList.remove('selected'));
    cardEl.classList.add('selected');

    // Check topic type — show/hide question count
    const topicData = GRAMMAR_DATA[selectedTerm][key];
    if (topicData.type === 'mc' || topicData.type === 'builder' || topicData.type === 'builder-rs') {
      // Builder & MC both let students choose how many questions.
      // Builder draws UNIQUE questions, so cap options at the pool size.
      showQCountSection(topicData);
    } else {
      // Passage type — no count selection; ready to start straight away
      hideQCountSection();
      selectedCount = 'passage';
    }
    updateStartBtn();
  }

  function showQCountSection(topicData) {
    qcountSection.classList.remove('hidden');
    renderQCountButtons(topicData);
  }

  function hideQCountSection() {
    qcountSection.classList.add('hidden');
    // Clear selection
    if (qcountGroup) qcountGroup.innerHTML = '';
  }

  function renderQCountButtons(topicData) {
    let counts = [10, 20, 30, 40, 50];
    // For builder (no repeats), don't offer more than the available pool,
    // but do NOT add the exact pool size as an option.
    if (topicData && (topicData.type === 'builder' || topicData.type === 'builder-rs')) {
      const max = (topicData.questions || []).length;
      counts = counts.filter(n => n <= max);
    }
    qcountGroup.innerHTML = '';
    counts.forEach(n => {
      const btn = document.createElement('button');
      btn.className = 'opt-btn mono';
      btn.textContent = n;
      btn.dataset.q = n;
      if (n === selectedCount) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        selectedCount = n;
        qcountGroup.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        updateStartBtn();
      });
      qcountGroup.appendChild(btn);
    });
  }

  function updateStartBtn() {
    const topicData = selectedTopic ? GRAMMAR_DATA[selectedTerm][selectedTopic] : null;

    if (selectedTopic && topicData && topicData.type === 'passage') {
      btnStart.disabled = false;
      btnStartText.textContent = 'Start Exercise →';
    } else if (selectedTopic && selectedCount) {
      btnStart.disabled = false;
      btnStartText.textContent = 'Start Challenge →';
    } else if (selectedTopic && topicData && (topicData.type === 'mc' || topicData.type === 'builder' || topicData.type === 'builder-rs') && !selectedCount) {
      btnStart.disabled = true;
      btnStartText.textContent = 'Choose Number of Questions';
    } else {
      btnStart.disabled = true;
      btnStartText.textContent = 'Select a Quest to Begin';
    }
  }

  // --- EXERCISE ---
  function startExercise() {
    if (!selectedTerm || !selectedTopic || !selectedCount) return;
    const topicData = GRAMMAR_DATA[selectedTerm][selectedTopic];

    if (topicData.type === 'passage') {
      startPassageExercise(topicData);
      return;
    }

    if (topicData.type === 'builder') {
      startBuilderExercise(topicData);
      return;
    }

    if (topicData.type === 'builder-rs') {
      startRSExercise(topicData);
      return;
    }

    const pool = topicData.questions;
    if (!pool || pool.length === 0) { alert('No questions available for this topic yet.'); return; }

    // Build question set
    currentQuestions = buildQuestionSet(pool, selectedCount);
    currentIndex = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    elapsed = 0;

    showScreen('exercise');
    startTimer();
    renderQuestion();
  }

  function buildQuestionSet(pool, count) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(shuffled[i % shuffled.length]);
    }
    // Shuffle again if we wrapped around
    if (count > pool.length) {
      result.sort(() => Math.random() - 0.5);
    }
    return result;
  }

  function renderQuestion() {
    const q = currentQuestions[currentIndex];
    firstAttempt = true;
    btnNext.classList.add('hidden');

    // Update HUD
    hudProgress.textContent = `${currentIndex + 1} / ${currentQuestions.length}`;
    hudScore.textContent = score;
    progressFill.style.width = `${((currentIndex) / currentQuestions.length) * 100}%`;

    // Shuffle options for display
    const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);

    // Render
    questionCard.innerHTML = `
      <div class="q-stem">${formatStem(q.question)}</div>
      <div class="options-list">
        ${shuffledOpts.map(opt => `<button class="option-btn" data-opt="${escapeAttr(opt)}">${opt}</button>`).join('')}
      </div>
    `;

    // Bind option clicks
    questionCard.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn, q.answer));
    });
  }

  function formatStem(text) {
    return text.replace(/___/g, '<span class="blank">&nbsp;</span>');
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function handleAnswer(btn, correctAnswer) {
    const chosen = btn.dataset.opt;
    // Decode HTML entities for comparison
    const decodedChosen = decodeHtml(chosen);
    if (btn.classList.contains('correct') || btn.classList.contains('wrong')) return;

    if (decodedChosen === correctAnswer) {
      btn.classList.add('correct');
      // Disable all other buttons
      questionCard.querySelectorAll('.option-btn').forEach(b => {
        if (!b.classList.contains('correct')) b.classList.add('revealed');
      });
      if (firstAttempt) {
        score++;
        streak++;
        if (streak > bestStreak) bestStreak = streak;
        hudScore.textContent = score;
        streakCount.textContent = streak;
        // Pulse animation on score badge
        hudScoreBadge.classList.remove('pulse');
        void hudScoreBadge.offsetWidth; // reflow
        hudScoreBadge.classList.add('pulse');
      }
      // Show next button
      btnNext.classList.remove('hidden');
      btnNext.textContent = currentIndex === currentQuestions.length - 1 ? 'Finish' : 'Next Question \u2192';
      // Advance the progress bar now that this question is answered correctly
      progressFill.style.width = `${((currentIndex + 1) / currentQuestions.length) * 100}%`;
    } else {
      btn.classList.add('wrong');
      if (firstAttempt) {
        streak = 0;
        streakCount.textContent = streak;
      }
      firstAttempt = false;
    }
  }

  function decodeHtml(str) {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  }

  function nextQuestion() {
    currentIndex++;
    if (currentIndex >= currentQuestions.length) {
      endExercise();
    } else {
      renderQuestion();
    }
  }

  function endExercise() {
    stopTimer();
    const pct = Math.round((score / currentQuestions.length) * 100);
    const scoreStr = `${score}/${currentQuestions.length} (${pct}%)`;
    const timeStr = formatTime(elapsed);

    // MC results layout
    resScoreLbl.textContent = 'Your Score';
    resStatStreak.style.display = '';
    reviewHeading.innerHTML = '\u{1F4CB} Review';

    resScore.textContent = scoreStr;
    resRemark.textContent = getRemark(pct);
    resTime.textContent = timeStr;
    resStreak.textContent = bestStreak.toString();

    // Review
    reviewList.innerHTML = currentQuestions.map((q, i) => `
      <div class="review-item">
        <div class="review-q">${i + 1}. ${q.question.replace(/___/g, '______')}</div>
        <div class="review-a">\u2705 ${q.answer}</div>
      </div>
    `).join('');

    saveStats(scoreStr, timeStr);
    showScreen('results');
  }

  function getRemark(pct) {
    if (pct === 100) return '\u{1F31F} Perfect score! Outstanding!';
    if (pct >= 90) return '\u{1F389} Excellent work!';
    if (pct >= 75) return '\u{1F44F} Great job! Keep it up!';
    if (pct >= 60) return '\u{1F4AA} Good effort! Room to improve.';
    if (pct >= 40) return '\u{1F4DA} Keep practising!';
    return '\u{1F4A1} Don\u2019t give up! Try again!';
  }

  // --- TIMER ---
  function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
      elapsed = (Date.now() - startTime) / 1000;
      const t = formatTime(elapsed);
      hudTimer.textContent = t;
      passageTimer.textContent = t;
      builderTimer.textContent = t;
      rsTimer.textContent = t;
    }, 50);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
  }

  // --- SCREEN NAVIGATION ---
  function showScreen(name) {
    [screenHome, screenExercise, screenPassage, screenBuilder, screenBuilderRS, screenResults].forEach(s => s.classList.remove('active'));
    const map = {
      home: screenHome,
      exercise: screenExercise,
      passage: screenPassage,
      builder: screenBuilder,
      'builder-rs': screenBuilderRS,
      results: screenResults
    };
    (map[name] || screenHome).classList.add('active');
    window.scrollTo(0, 0);
  }

  function quitToHome() {
    stopTimer();
    streak = 0;
    streakCount.textContent = '0';
    currentPassage = null;
    passageBlanks = [];
    showScreen('home');
  }

  function playAgain() {
    streak = 0;
    streakCount.textContent = '0';
    loadStats();
    heroSub.textContent = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    showScreen('home');
  }

  // ============================================================
  // PASSAGE EXERCISE
  // ============================================================
  function startPassageExercise(topicData) {
    const exercises = topicData.exercises;
    if (!exercises || exercises.length === 0) {
      alert('No exercises available for this topic yet.');
      return;
    }
    // Randomly assign an exercise
    currentPassage = exercises[Math.floor(Math.random() * exercises.length)];
    passageBlanks = [];
    passageBlankType = topicData.blankType === 'input' ? 'input' : 'select';
    elapsed = 0;

    // Instructions
    passageInstructions.textContent = topicData.instructions || '';
    passageTitle.textContent = currentPassage.title || '';

    // Build passage body with dropdowns
    renderPassage();

    btnSubmitPassage.classList.add('hidden');
    btnSubmitPassage.textContent = 'Submit Answers \u2713';
    updatePassageProgress();

    showScreen('passage');
    startTimer();
  }

  const ARTICLE_OPTIONS = ['a', 'an', 'the', 'X'];

  function renderPassage() {
    passageBody.innerHTML = '';
    let blankIndex = 0;

    currentPassage.segments.forEach(seg => {
      if (typeof seg === 'string') {
        // Split on paragraph breaks to render proper paragraphs
        const parts = seg.split('\n\n');
        parts.forEach((part, pIdx) => {
          if (pIdx > 0) {
            passageBody.appendChild(document.createElement('br'));
            passageBody.appendChild(document.createElement('br'));
          }
          passageBody.appendChild(document.createTextNode(part));
        });
      } else {
        const idx = blankIndex++;
        const wrap = document.createElement('span');
        wrap.className = 'blank-wrap';

        const num = document.createElement('span');
        num.className = 'blank-num';
        num.textContent = `(${idx + 1})`;
        wrap.appendChild(num);

        const blankObj = { answer: seg.answer, alternatives: seg.alternatives || [], explanation: seg.explanation || '', index: idx };

        if (passageBlankType === 'input') {
          // Text input blank with the bracketed verb prompt
          const inp = document.createElement('input');
          inp.type = 'text';
          inp.className = 'blank-input';
          inp.dataset.index = idx;
          inp.autocomplete = 'off';
          inp.autocapitalize = 'off';
          inp.spellcheck = false;
          inp.setAttribute('aria-label', `Blank ${idx + 1}`);
          inp.addEventListener('input', () => {
            inp.classList.toggle('filled', inp.value.trim() !== '');
            updatePassageProgress();
          });
          wrap.appendChild(inp);

          if (seg.prompt) {
            const pr = document.createElement('span');
            pr.className = 'blank-prompt';
            pr.textContent = seg.prompt;
            wrap.appendChild(pr);
          }
          blankObj.inputEl = inp;
        } else {
          // Dropdown blank (articles)
          const sel = document.createElement('select');
          sel.className = 'blank-select';
          sel.dataset.index = idx;

          const placeholder = document.createElement('option');
          placeholder.value = '';
          placeholder.textContent = '\u2014';
          placeholder.disabled = true;
          placeholder.selected = true;
          sel.appendChild(placeholder);

          ARTICLE_OPTIONS.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.textContent = opt;
            sel.appendChild(o);
          });

          sel.addEventListener('change', () => {
            sel.classList.add('filled');
            updatePassageProgress();
          });
          wrap.appendChild(sel);
          blankObj.selectEl = sel;
        }

        passageBody.appendChild(wrap);
        passageBlanks.push(blankObj);
      }
    });
  }

  // Normalise an answer for comparison: trim, collapse inner spaces, lowercase
  function normaliseAns(str) {
    return (str || '').trim().replace(/\s+/g, ' ').toLowerCase();
  }

  // Get the current raw value of a blank (input or select)
  function blankValue(b) {
    return b.inputEl ? b.inputEl.value : b.selectEl.value;
  }

  // Is the blank filled in?
  function blankFilled(b) {
    return blankValue(b).trim() !== '';
  }

  // Is the blank's value correct? (case-insensitive, space-normalised, accepts alternatives)
  function blankIsCorrect(b) {
    const val = normaliseAns(blankValue(b));
    if (val === normaliseAns(b.answer)) return true;
    return (b.alternatives || []).some(alt => normaliseAns(alt) === val);
  }

  function updatePassageProgress() {
    const total = passageBlanks.length;
    const filled = passageBlanks.filter(b => blankFilled(b)).length;
    passageFilled.textContent = `${filled} / ${total}`;
    passageProgressFill.style.width = `${(filled / total) * 100}%`;

    if (filled === total) {
      btnSubmitPassage.classList.remove('hidden');
    } else {
      btnSubmitPassage.classList.add('hidden');
    }
  }

  function submitPassage() {
    stopTimer();
    let correct = 0;
    passageBlanks.forEach(b => {
      if (blankIsCorrect(b)) correct++;
    });
    const total = passageBlanks.length;
    const pct = Math.round((correct / total) * 100);
    const scoreStr = `${correct}/${total} (${pct}%)`;
    const timeStr = formatTime(elapsed);

    // Configure results layout for passage (no streak)
    resScoreLbl.textContent = 'Your Marks';
    resStatStreak.style.display = 'none';
    reviewHeading.innerHTML = '\u{1F4D6} Passage with Answers';

    resScore.textContent = scoreStr;
    resRemark.textContent = getRemark(pct);
    resTime.textContent = timeStr;

    // Build annotated passage review
    reviewList.innerHTML = buildPassageReview();
    bindExplainIcons();

    saveStats(scoreStr, timeStr);
    showScreen('results');
  }

  function buildPassageReview() {
    let html = '<div class="passage-review">';
    let blankIndex = 0;

    currentPassage.segments.forEach(seg => {
      if (typeof seg === 'string') {
        html += escapeHtml(seg).replace(/\n\n/g, '<br><br>');
      } else {
        const b = passageBlanks[blankIndex++];
        const chosen = blankValue(b);
        const chosenDisp = chosen.trim() === '' ? '\u2014' : chosen;
        const isCorrect = blankIsCorrect(b);
        const info = b.explanation
          ? `<button class="rev-info" type="button" data-exp="${escapeAttr(b.explanation)}" aria-label="Show explanation">i</button>`
          : '';
        if (isCorrect) {
          html += `<span class="rev-blank correct"><span class="rev-mark">\u2713</span><span class="rev-ans">${escapeHtml(chosenDisp)}</span>${info}</span>`;
        } else {
          html += `<span class="rev-blank wrong"><span class="rev-mark">\u2717</span><span class="rev-ans rev-wrong">${escapeHtml(chosenDisp)}</span><span class="rev-correct">${escapeHtml(b.answer)}</span>${info}</span>`;
        }
      }
    });
    html += '</div>';
    return html;
  }

  // Bind explanation popovers in the review
  function bindExplainIcons() {
    const icons = reviewList.querySelectorAll('.rev-info');
    icons.forEach(icon => {
      icon.addEventListener('click', e => {
        e.stopPropagation();
        const alreadyOpen = icon.classList.contains('open');
        closeAllPopovers();
        if (alreadyOpen) return;
        const pop = document.createElement('span');
        pop.className = 'rev-popover';
        pop.textContent = icon.dataset.exp;
        icon.parentElement.appendChild(pop);
        icon.classList.add('open');
        // Clamp the popover so it never overflows the viewport on narrow screens.
        // After initial paint, measure and nudge left/right as needed, then
        // shift the caret (::after pseudo) to compensate.
        requestAnimationFrame(() => {
          const MARGIN = 8; // px gap from screen edge
          const rect = pop.getBoundingClientRect();
          const vw = window.innerWidth;
          let shift = 0;
          if (rect.left < MARGIN) shift = MARGIN - rect.left;
          else if (rect.right > vw - MARGIN) shift = (vw - MARGIN) - rect.right;
          if (shift !== 0) {
            // Adjust the translateX by `shift` px.
            pop.style.transform = `translateX(calc(-50% + ${shift}px))`;
            // Move the caret in the opposite direction so it still points at the icon.
            pop.style.setProperty('--caret-shift', `calc(50% - ${shift}px)`);
          }
        });
      });
    });
  }

  function closeAllPopovers() {
    reviewList.querySelectorAll('.rev-popover').forEach(p => p.remove());
    reviewList.querySelectorAll('.rev-info.open').forEach(i => i.classList.remove('open'));
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function quitPassageToHome() {
    stopTimer();
    currentPassage = null;
    passageBlanks = [];
    showScreen('home');
  }

  // ============================================================
  // BUILDER EXERCISE (Relative Clauses) — 3-step sentence builder
  // 3 marks per question: pronoun (1) + clause (1) + placement (1)
  // Deferred scoring: no feedback during play.
  // ============================================================
  function startBuilderExercise(topicData) {
    builderTopic = topicData;
    const n = Math.min(selectedCount, topicData.questions.length);
    // Draw UNIQUE, non-repeating questions at random.
    currentQuestions = [...topicData.questions].sort(() => Math.random() - 0.5).slice(0, n);
    currentIndex = 0;
    elapsed = 0;
    bScore = 0;
    builderResults = [];
    builderScore.textContent = '0';
    showScreen('builder');
    startTimer();
    renderBuilderQuestion();
  }

  function renderBuilderQuestion() {
    const q = currentQuestions[currentIndex];
    // reset per-question state
    bPronoun = null;
    bClause = [];
    bPlace = null;
    bChecked = false;
    closeAllPopovers();
    clauseAssembled.classList.remove('fb-ok', 'fb-no');
    builderFull.classList.add('hidden');
    builderFull.innerHTML = '';
    btnBuilderNext.classList.add('hidden');
    btnBuilderCheck.classList.add('hidden');

    // Instructions
    builderInstr.textContent = builderTopic.instructions || '';

    // HUD
    builderProgress.textContent = `${currentIndex + 1} / ${currentQuestions.length}`;
    builderProgressFill.style.width = `${(currentIndex / currentQuestions.length) * 100}%`;

    // Source sentences
    builderS1.textContent = q.s1;
    builderS2.textContent = q.s2;

    // Step 1: pronoun chips (shuffled)
    const prons = [...(builderTopic.pronouns || ['who','which','whose','when','where'])].sort(() => Math.random() - 0.5);
    pronounChips.innerHTML = '';
    prons.forEach(p => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'pronoun-chip';
      chip.textContent = p;
      chip.dataset.p = p;
      chip.addEventListener('click', () => {
        if (bChecked) return;
        bPronoun = p;
        pronounChips.querySelectorAll('.pronoun-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        updateBuilderNext();
      });
      pronounChips.appendChild(chip);
    });

    // Step 2: clause tiles = correct tokens + the distractor, shuffled.
    const tilePool = [...q.clause, q.distractor].sort(() => Math.random() - 0.5);
    renderAssembled();
    clauseTiles.innerHTML = '';
    tilePool.forEach((tok, i) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'word-tile';
      tile.textContent = displayTile(tok);
      tile.dataset.tok = tok;
      tile.dataset.tileid = i;
      tile.addEventListener('click', () => toggleTile(tile, tok, i));
      clauseTiles.appendChild(tile);
    });
    clauseClear.classList.remove('hidden');

    // Step 3: placement gaps (rendered as gaps in sentence 1)
    renderPlaceLine(q);
  }

  function toggleTile(tile, tok, id) {
    if (bChecked) return;
    // Bank tiles are add-only: tapping an already-used tile does nothing.
    // Removal is handled exclusively by tapping the assembled word above.
    if (tile.classList.contains('used')) return;
    bClause.push({ tok, id });
    tile.classList.add('used');
    renderAssembled();
    updateBuilderNext();
  }

  function renderAssembled() {
    if (!bChecked) clauseAssembled.classList.remove('fb-ok', 'fb-no');
    if (bClause.length === 0) {
      clauseAssembled.innerHTML = '<span class="clause-placeholder">Tap the words below in order (tap a chosen word to remove it)…</span>';
      clauseAssembled.dataset.empty = 'true';
      return;
    }
    clauseAssembled.dataset.empty = 'false';
    clauseAssembled.innerHTML = bClause.map(x =>
      `<button type="button" class="assembled-tok" data-id="${x.id}" title="Tap to remove">${escapeHtml(displayTile(x.tok))}</button>`
    ).join(' ');
    if (!bChecked) {
      clauseAssembled.querySelectorAll('.assembled-tok').forEach(btn => {
        btn.addEventListener('click', () => removeAssembledTok(Number(btn.dataset.id)));
      });
    }
  }

  // Remove a single chosen word from the assembled clause and free its tile.
  function removeAssembledTok(id) {
    if (bChecked) return;
    bClause = bClause.filter(x => x.id !== id);
    const tile = clauseTiles.querySelector(`.word-tile[data-tileid="${id}"]`);
    if (tile) tile.classList.remove('used');
    renderAssembled();
    updateBuilderNext();
  }

  // Proper nouns that must keep their capital letter when shown as tiles.
  const PROPER_NOUNS = new Set(['Canada', 'Olympic']);
  // Lowercase the first letter of a token for display, unless it is a proper
  // noun or the standalone pronoun "I". Multi-word tokens (e.g. "The shop")
  // only have their leading word lowercased.
  function displayTile(tok) {
    if (tok === 'I') return tok;
    const firstWord = tok.split(' ')[0];
    if (PROPER_NOUNS.has(firstWord) || PROPER_NOUNS.has(tok)) return tok;
    return tok.charAt(0).toLowerCase() + tok.slice(1);
  }

  function clearClause() {
    if (bChecked) return;
    bClause = [];
    clauseTiles.querySelectorAll('.word-tile.used').forEach(t => t.classList.remove('used'));
    renderAssembled();
    updateBuilderNext();
  }

  function renderPlaceLine(q) {
    placeLine.innerHTML = '';
    const lastIdx = q.segs.length - 1;
    // Detach any sentence-final punctuation (. ! ?) from the last segment so the
    // final insertion gap sits BEFORE the full stop, e.g. "This is the room [+] ."
    let trailingPunct = '';
    const segs = q.segs.map((seg, i) => {
      if (i === lastIdx) {
        const m = seg.match(/([.!?]+)\s*$/);
        if (m) { trailingPunct = m[1]; return seg.slice(0, m.index).replace(/\s+$/, ''); }
      }
      return seg;
    });

    // segs[] are the sentence-1 segments; a gap is offered AFTER each segment.
    // Each segment+gap pair is wrapped in a no-break inline-flex unit so the
    // gap button never orphans onto its own line on narrow (mobile) screens.
    segs.forEach((seg, i) => {
      // Split the segment so the leading words can wrap freely while only the
      // LAST word stays glued to its gap button (prevents an orphaned '+').
      const words = seg.split(' ');
      const lastWord = words.pop();
      const leadWords = words.join(' ');

      if (leadWords) {
        const leadSpan = document.createElement('span');
        leadSpan.className = 'place-seg';
        leadSpan.textContent = leadWords + ' ';
        placeLine.appendChild(leadSpan);
      }

      const unit = document.createElement('span');
      unit.className = 'place-unit';

      const segSpan = document.createElement('span');
      segSpan.className = 'place-seg';
      segSpan.textContent = lastWord;
      unit.appendChild(segSpan);

      const gap = document.createElement('button');
      gap.type = 'button';
      gap.className = 'place-gap';
      gap.dataset.gap = i;
      gap.innerHTML = '<span class="gap-dot">+</span>';
      gap.addEventListener('click', () => {
        if (bChecked) return;
        bPlace = i;
        placeLine.querySelectorAll('.place-gap').forEach(g => {
          g.classList.remove('selected');
          g.innerHTML = '<span class="gap-dot">+</span>';
        });
        gap.classList.add('selected');
        gap.innerHTML = '<span class="gap-dot">▼</span>';
        updateBuilderNext();
      });
      unit.appendChild(gap);

      placeLine.appendChild(unit);
    });

    // Re-attach the full stop after the final gap.
    if (trailingPunct) {
      const punctSpan = document.createElement('span');
      punctSpan.className = 'place-seg place-punct';
      punctSpan.textContent = trailingPunct;
      placeLine.appendChild(punctSpan);
    }
  }

  // Show the Check button once all three steps are answered (before checking).
  function updateBuilderNext() {
    if (bChecked) return;
    const ready = bPronoun !== null && bClause.length > 0 && bPlace !== null;
    btnBuilderCheck.classList.toggle('hidden', !ready);
  }

  // Grade the current question, reveal per-step feedback, update the score badge.
  function builderCheck() {
    if (bChecked) return;
    const q = currentQuestions[currentIndex];
    const chosenClauseToks = bClause.map(x => x.tok);
    const pronounMark = (bPronoun === q.pronoun) ? 1 : 0;
    const clauseMark = arraysEqualCI(chosenClauseToks, q.clause) ? 1 : 0;
    const placeMark = (bPlace === q.correctGap) ? 1 : 0;
    const total = pronounMark + clauseMark + placeMark;

    bChecked = true;
    bScore += total;
    builderScore.textContent = String(bScore);
    builderScoreBadgePulse();

    builderResults.push({
      q,
      chosenPronoun: bPronoun,
      chosenClause: chosenClauseToks,
      chosenPlace: bPlace,
      pronounMark, clauseMark, placeMark,
      total
    });

    revealBuilderFeedback(q, pronounMark, clauseMark, placeMark);

    // Full correct sentence, shown immediately after checking.
    builderFull.innerHTML = `<span class="full-answer-lbl">Full sentence:</span> ${highlightCombined(q)}`;
    builderFull.classList.remove('hidden');

    btnBuilderCheck.classList.add('hidden');
    clauseClear.classList.add('hidden');
    btnBuilderNext.classList.remove('hidden');
    btnBuilderNext.textContent = currentIndex === currentQuestions.length - 1 ? 'Finish' : 'Next Question \u2192';

    // Advance the progress bar now that this question is answered
    builderProgressFill.style.width = `${((currentIndex + 1) / currentQuestions.length) * 100}%`;
  }

  // Mark each step green/red and show the correct answer where wrong.
  function revealBuilderFeedback(q, pronounMark, clauseMark, placeMark) {
    // Step 1: pronoun chips — add a tick beside the correct one
    pronounChips.querySelectorAll('.pronoun-chip').forEach(c => {
      const val = c.dataset.p;
      c.classList.add('locked');
      if (val === q.pronoun) {
        c.classList.add('correct');
        c.innerHTML = `${escapeHtml(val)} <span class="chip-tick">\u2713</span>`;
      } else if (c.classList.contains('selected') && val !== q.pronoun) {
        c.classList.add('wrong');
      }
    });

    // Step 2: clause — colour assembled tokens; mark whole step
    const correctStr = q.clause.map(displayTile).join(' ');
    clauseAssembled.classList.add(clauseMark ? 'fb-ok' : 'fb-no');
    if (clauseMark) {
      clauseAssembled.innerHTML += ` <span class="clause-tick">\u2713</span>`;
    } else {
      clauseAssembled.innerHTML += ` <span class="fb-correct">\u2192 ${escapeHtml(correctStr)}</span>`;
    }
    clauseTiles.querySelectorAll('.word-tile').forEach(t => t.classList.add('locked'));

    // Step 3: placement gaps — highlight chosen (red if wrong) and the correct gap (green)
    placeLine.querySelectorAll('.place-gap').forEach(g => {
      const gi = parseInt(g.dataset.gap, 10);
      g.classList.add('locked');
      if (gi === q.correctGap) {
        g.classList.add('gap-correct');
        g.innerHTML = '<span class="gap-dot">\u2713</span>';
      } else if (gi === bPlace) {
        g.classList.add('gap-wrong');
        g.innerHTML = '<span class="gap-dot">\u2715</span>';
      }
    });
  }

  function builderScoreBadgePulse() {
    const badge = document.getElementById('builder-score-badge');
    if (!badge) return;
    badge.classList.remove('pulse');
    void badge.offsetWidth;
    badge.classList.add('pulse');
  }

  function builderNext() {
    currentIndex++;
    if (currentIndex >= currentQuestions.length) {
      endBuilderExercise();
    } else {
      renderBuilderQuestion();
    }
  }

  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  // Case-insensitive, space-normalised array comparison (for clause marking).
  function arraysEqualCI(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].trim().toLowerCase() !== b[i].trim().toLowerCase()) return false;
    }
    return true;
  }

  function endBuilderExercise() {
    stopTimer();
    const maxMarks = currentQuestions.length * 3;
    const gained = builderResults.reduce((s, r) => s + r.total, 0);
    const pct = Math.round((gained / maxMarks) * 100);
    const scoreStr = `${gained}/${maxMarks} (${pct}%)`;
    const timeStr = formatTime(elapsed);

    // Results layout: hide streak (not used here), set labels
    resScoreLbl.textContent = 'Your Marks';
    resStatStreak.style.display = 'none';
    reviewHeading.innerHTML = '📋 Answer Key';

    resScore.textContent = scoreStr;
    resRemark.textContent = getRemark(pct);
    resTime.textContent = timeStr;

    reviewList.innerHTML = buildBuilderReview();
    bindExplainIcons();

    saveStats(scoreStr, timeStr);
    showScreen('results');
  }

  function buildBuilderReview() {
    return builderResults.map((r, i) => {
      const q = r.q;
      const studentSentence = composeStudentSentence(q, r);
      const stepBadge = (label, mark) =>
        `<span class="bm ${mark ? 'bm-ok' : 'bm-no'}">${mark ? '✓' : '✗'} ${label}</span>`;
      return `
        <div class="review-item builder-review">
          <div class="br-head">
            <span class="br-num">${i + 1}</span>
            <span class="br-marks">${r.total}/3</span>
          </div>
          <div class="br-source">
            <span class="br-s">${escapeHtml(q.s1)}</span>
            <span class="br-s">${escapeHtml(q.s2)}</span>
          </div>
          <div class="br-badges">
            ${stepBadge('Pronoun', r.pronounMark)}
            ${stepBadge('Clause', r.clauseMark)}
            ${stepBadge('Position', r.placeMark)}
          </div>
          ${r.total < 3 ? `<div class="br-yours"><span class="br-lbl">Your answer:</span> ${escapeHtml(studentSentence)}</div>` : ''}
          <div class="br-correct"><span class="br-lbl">Correct:</span> ${highlightCombined(q)}</div>
        </div>`;
    }).join('');
  }

  // Compose the sentence the student actually built (for the 'your answer' line)
  function composeStudentSentence(q, r) {
    const clauseStr = [r.chosenPronoun || '?', ...(r.chosenClause || [])].join(' ');
    const place = (r.chosenPlace === null || r.chosenPlace === undefined) ? q.correctGap : r.chosenPlace;
    const parts = [];
    q.segs.forEach((seg, idx) => {
      parts.push(seg);
      if (idx === place) parts.push('[' + clauseStr + ']');
    });
    return parts.join(' ').replace(/\s+([.,])/g, '$1');
  }

  // Render the correct combined sentence (q.combined, authoritatively
  // punctuated) with the relative clause emphasised. Highlights the pronoun
  // and the clause words wherever they appear, so it works even when the
  // relative clause is split around the main clause (case-insensitive).
  function highlightCombined(q) {
    const fullClause = [q.pronoun, ...q.clause].join(' ');
    const combined = q.combined;

    // 1) Try the whole relative clause as one contiguous run.
    let span = findRun(combined, fullClause);
    if (span) return wrapSpans(combined, [span]);

    // 2) Split case: highlight the pronoun run and the longest clause-word run.
    const spans = [];
    const pronounSpan = findRun(combined, q.pronoun);
    if (pronounSpan) spans.push(pronounSpan);
    const clauseStr = q.clause.join(' ');
    const clauseSpan = findRun(combined, clauseStr, pronounSpan ? pronounSpan.end : 0);
    if (clauseSpan) spans.push(clauseSpan);

    if (spans.length === 0) return escapeHtml(combined); // safe fallback
    return wrapSpans(combined, spans);
  }

  // Find a case-insensitive run of `needle` in `hay` at or after `from`.
  function findRun(hay, needle, from = 0) {
    if (!needle) return null;
    const i = hay.toLowerCase().indexOf(needle.toLowerCase(), from);
    if (i === -1) return null;
    return { start: i, end: i + needle.length };
  }

  // Wrap one or more [start,end) spans of `text` in highlight markup.
  function wrapSpans(text, spans) {
    spans.sort((a, b) => a.start - b.start);
    let out = '';
    let cursor = 0;
    spans.forEach(s => {
      out += escapeHtml(text.slice(cursor, s.start));
      out += `<span class="br-hl">${escapeHtml(text.slice(s.start, s.end))}</span>`;
      cursor = s.end;
    });
    out += escapeHtml(text.slice(cursor));
    return out;
  }

  function quitBuilderToHome() {
    stopTimer();
    builderResults = [];
    builderTopic = null;
    bScore = 0;
    builderScore.textContent = '0';
    showScreen('home');
  }

  // ============================================================
  // REPORTED SPEECH BUILDER — 3-step builder
  //   Step 1 (frame):  choose the reporting frame (3 options, 1 correct).
  //   Step 2 (clause): tap tiles to build the reported clause.
  //                    `clauseCorrect` items are strings (fixed tiles) OR arrays
  //                    of acceptable alternatives (e.g. ["saw","had seen"]); the
  //                    leading `that` tile is optional. Wrong distractors come
  //                    from `clauseWrong`.
  //   Step 3 (time):   choose the time expression (omitted when no time word).
  // Up to 3 marks per question (2 when no Step 3). Immediate per-step feedback.
  // ============================================================
  function startRSExercise(topicData) {
    rsTopic = topicData;
    const n = Math.min(selectedCount, topicData.questions.length);
    currentQuestions = [...topicData.questions].sort(() => Math.random() - 0.5).slice(0, n);
    currentIndex = 0;
    elapsed = 0;
    rsScoreVal = 0;
    rsResults = [];
    rsScore.textContent = '0';
    showScreen('builder-rs');
    startTimer();
    renderRSQuestion();
  }

  // The optional leading connector that may appear in a statement report.
  const RS_OPTIONAL = 'that';

  // Expected clause as a list of accepted-token arrays (each slot = list of
  // acceptable strings). Strings become single-element arrays.
  function rsExpectedSlots(q) {
    return q.clauseCorrect.map(item => Array.isArray(item) ? item : [item]);
  }

  // All distinct tiles to display in the bank: every accepted token (incl.
  // alternatives), every wrong distractor, plus the optional `that` for
  // statement-type questions.
  function rsTileList(q) {
    const tiles = [];
    rsExpectedSlots(q).forEach(slot => slot.forEach(t => tiles.push(t)));
    (q.clauseWrong || []).forEach(t => tiles.push(t));
    if (q.type === 'statement') tiles.push(RS_OPTIONAL);
    return tiles;
  }

  function renderRSQuestion() {
    const q = currentQuestions[currentIndex];
    rsFrame = null;
    rsClause = [];
    rsTime = null;
    rsChecked = false;
    rsHasTime = (q.timeCorrect && q.timeCorrect.length > 0);
    closeAllPopovers();
    rsClauseAssembled.classList.remove('fb-ok', 'fb-no');
    rsFull.classList.add('hidden');
    rsFull.innerHTML = '';
    btnRSNext.classList.add('hidden');
    btnRSCheck.classList.add('hidden');

    rsInstr.textContent = rsTopic.instructions || '';
    rsProgress.textContent = `${currentIndex + 1} / ${currentQuestions.length}`;
    rsProgressFill.style.width = `${(currentIndex / currentQuestions.length) * 100}%`;

    // Direct-speech prompt: the exact original sentence
    rsQuote.textContent = q.prompt || q.s1;

    // Step 1: frame chips (correct + wrong), shuffled.
    const frames = [q.frameCorrect, ...(q.frameWrong || [])].sort(() => Math.random() - 0.5);
    rsFrameChips.innerHTML = '';
    frames.forEach(f => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'pronoun-chip rs-frame-chip';
      chip.textContent = f;
      chip.dataset.f = f;
      chip.addEventListener('click', () => {
        if (rsChecked) return;
        rsFrame = f;
        rsFrameChips.querySelectorAll('.pronoun-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        updateRSNext();
      });
      rsFrameChips.appendChild(chip);
    });

    // Step 2: clause tiles, shuffled.
    const tilePool = rsTileList(q).sort(() => Math.random() - 0.5);
    renderRSAssembled();
    rsClauseTiles.innerHTML = '';
    tilePool.forEach((tok, i) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'word-tile';
      tile.textContent = displayTile(tok);
      tile.dataset.tok = tok;
      tile.dataset.tileid = i;
      tile.addEventListener('click', () => rsToggleTile(tile, tok, i));
      rsClauseTiles.appendChild(tile);
    });
    rsClauseClear.classList.remove('hidden');

    // Step 3: time chips, or hide the step entirely.
    if (rsHasTime) {
      rsStep3.style.display = '';
      const times = [...q.timeCorrect, ...(q.timeWrong || [])].sort(() => Math.random() - 0.5);
      rsTimeChips.innerHTML = '';
      times.forEach(t => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'pronoun-chip rs-time-chip';
        chip.textContent = t;
        chip.dataset.t = t;
        chip.addEventListener('click', () => {
          if (rsChecked) return;
          rsTime = t;
          rsTimeChips.querySelectorAll('.pronoun-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          updateRSNext();
        });
        rsTimeChips.appendChild(chip);
      });
    } else {
      rsStep3.style.display = 'none';
      rsTimeChips.innerHTML = '';
    }
  }

  function rsToggleTile(tile, tok, id) {
    if (rsChecked) return;
    if (tile.classList.contains('used')) return;
    rsClause.push({ tok, id });
    tile.classList.add('used');
    renderRSAssembled();
    updateRSNext();
  }

  function renderRSAssembled() {
    if (!rsChecked) rsClauseAssembled.classList.remove('fb-ok', 'fb-no');
    if (rsClause.length === 0) {
      rsClauseAssembled.innerHTML = '<span class="clause-placeholder">Tap the words below in order (tap a chosen word to remove it)\u2026</span>';
      rsClauseAssembled.dataset.empty = 'true';
      return;
    }
    rsClauseAssembled.dataset.empty = 'false';
    rsClauseAssembled.innerHTML = rsClause.map(x =>
      `<button type="button" class="assembled-tok" data-id="${x.id}" title="Tap to remove">${escapeHtml(displayTile(x.tok))}</button>`
    ).join(' ');
    if (!rsChecked) {
      rsClauseAssembled.querySelectorAll('.assembled-tok').forEach(btn => {
        btn.addEventListener('click', () => rsRemoveTok(Number(btn.dataset.id)));
      });
    }
  }

  function rsRemoveTok(id) {
    if (rsChecked) return;
    rsClause = rsClause.filter(x => x.id !== id);
    const tile = rsClauseTiles.querySelector(`.word-tile[data-tileid="${id}"]`);
    if (tile) tile.classList.remove('used');
    renderRSAssembled();
    updateRSNext();
  }

  function rsClearClause() {
    if (rsChecked) return;
    rsClause = [];
    rsClauseTiles.querySelectorAll('.word-tile.used').forEach(t => t.classList.remove('used'));
    renderRSAssembled();
    updateRSNext();
  }

  // Check the chosen clause against the expected slots. The leading `that` is
  // optional: if present as the first chosen token, it is skipped before
  // matching the remaining tokens to the expected slots (each slot accepts any
  // one of its alternatives). Case-insensitive.
  function rsClauseCorrect(q) {
    let toks = rsClause.map(x => x.tok);
    if (toks.length && toks[0].trim().toLowerCase() === RS_OPTIONAL) {
      toks = toks.slice(1);
    }
    const slots = rsExpectedSlots(q);
    if (toks.length !== slots.length) return false;
    for (let i = 0; i < slots.length; i++) {
      const ok = slots[i].some(opt => opt.trim().toLowerCase() === toks[i].trim().toLowerCase());
      if (!ok) return false;
    }
    return true;
  }

  function updateRSNext() {
    if (rsChecked) return;
    const ready = rsFrame !== null && rsClause.length > 0 && (!rsHasTime || rsTime !== null);
    btnRSCheck.classList.toggle('hidden', !ready);
  }

  function rsCheck() {
    if (rsChecked) return;
    const q = currentQuestions[currentIndex];
    const frameMark = (rsFrame === q.frameCorrect) ? 1 : 0;
    const clauseMark = rsClauseCorrect(q) ? 1 : 0;
    const timeMark = rsHasTime
      ? ((q.timeCorrect || []).some(t => t.trim().toLowerCase() === (rsTime || '').trim().toLowerCase()) ? 1 : 0)
      : null;
    const total = frameMark + clauseMark + (timeMark === null ? 0 : timeMark);

    rsChecked = true;
    rsScoreVal += total;
    rsScore.textContent = String(rsScoreVal);
    rsScoreBadgePulse();

    rsResults.push({
      q,
      chosenFrame: rsFrame,
      chosenClause: rsClause.map(x => x.tok),
      chosenTime: rsTime,
      frameMark, clauseMark, timeMark,
      hasTime: rsHasTime,
      total,
      maxMarks: rsHasTime ? 3 : 2
    });

    revealRSFeedback(q, frameMark, clauseMark, timeMark);

    // Full correct sentence, shown immediately after checking.
    rsFull.innerHTML = `<span class="full-answer-lbl">Full sentence:</span> ${rsHighlightCombined(q)}`;
    rsFull.classList.remove('hidden');

    btnRSCheck.classList.add('hidden');
    rsClauseClear.classList.add('hidden');
    btnRSNext.classList.remove('hidden');
    btnRSNext.textContent = currentIndex === currentQuestions.length - 1 ? 'Finish' : 'Next Question \u2192';
    rsProgressFill.style.width = `${((currentIndex + 1) / currentQuestions.length) * 100}%`;
  }

  function revealRSFeedback(q, frameMark, clauseMark, timeMark) {
    // Step 1: frame chips — tick the correct one, red the wrong chosen one.
    rsFrameChips.querySelectorAll('.pronoun-chip').forEach(c => {
      const val = c.dataset.f;
      c.classList.add('locked');
      if (val === q.frameCorrect) {
        c.classList.add('correct');
        c.innerHTML = `${escapeHtml(val)} <span class="chip-tick">\u2713</span>`;
      } else if (c.classList.contains('selected')) {
        c.classList.add('wrong');
      }
    });

    // Step 2: clause — mark whole step; show an accepted version when wrong.
    rsClauseAssembled.classList.add(clauseMark ? 'fb-ok' : 'fb-no');
    if (clauseMark) {
      rsClauseAssembled.innerHTML += ` <span class="clause-tick">\u2713</span>`;
    } else {
      rsClauseAssembled.innerHTML += ` <span class="fb-correct">\u2192 ${escapeHtml(rsAcceptedClauseStr(q))}</span>`;
    }
    rsClauseTiles.querySelectorAll('.word-tile').forEach(t => t.classList.add('locked'));

    // Step 3: time chips — tick the accepted one(s), red the wrong chosen one.
    if (rsHasTime) {
      rsTimeChips.querySelectorAll('.pronoun-chip').forEach(c => {
        const val = c.dataset.t;
        c.classList.add('locked');
        const accepted = (q.timeCorrect || []).some(t => t.trim().toLowerCase() === val.trim().toLowerCase());
        if (accepted) {
          c.classList.add('correct');
          c.innerHTML = `${escapeHtml(val)} <span class="chip-tick">\u2713</span>`;
        } else if (c.classList.contains('selected')) {
          c.classList.add('wrong');
        }
      });
    }
  }

  // A single accepted clause string (uses the first alternative of each slot),
  // including the optional `that` for statement reports.
  function rsAcceptedClauseStr(q) {
    const parts = rsExpectedSlots(q).map(slot => slot[0]);
    const lead = q.type === 'statement' ? (RS_OPTIONAL + ' ') : '';
    return (lead + parts.map(displayTile).join(' '));
  }

  function rsScoreBadgePulse() {
    const badge = document.getElementById('rs-score-badge');
    if (!badge) return;
    badge.classList.remove('pulse');
    void badge.offsetWidth;
    badge.classList.add('pulse');
  }

  function rsNext() {
    currentIndex++;
    if (currentIndex >= currentQuestions.length) {
      endRSExercise();
    } else {
      renderRSQuestion();
    }
  }

  function endRSExercise() {
    stopTimer();
    const maxMarks = rsResults.reduce((s, r) => s + r.maxMarks, 0);
    const gained = rsResults.reduce((s, r) => s + r.total, 0);
    const pct = maxMarks ? Math.round((gained / maxMarks) * 100) : 0;
    const scoreStr = `${gained}/${maxMarks} (${pct}%)`;
    const timeStr = formatTime(elapsed);

    resScoreLbl.textContent = 'Your Marks';
    resStatStreak.style.display = 'none';
    reviewHeading.innerHTML = '\u{1F4CB} Answer Key';

    resScore.textContent = scoreStr;
    resRemark.textContent = getRemark(pct);
    resTime.textContent = timeStr;

    reviewList.innerHTML = buildRSReview();
    bindExplainIcons();

    saveStats(scoreStr, timeStr);
    showScreen('results');
  }

  function buildRSReview() {
    return rsResults.map((r, i) => {
      const q = r.q;
      const studentSentence = rsComposeStudentSentence(q, r);
      const stepBadge = (label, mark) =>
        `<span class="bm ${mark ? 'bm-ok' : 'bm-no'}">${mark ? '\u2713' : '\u2717'} ${label}</span>`;
      const badges = [
        stepBadge('Frame', r.frameMark),
        stepBadge('Clause', r.clauseMark)
      ];
      if (r.hasTime) badges.push(stepBadge('Time', r.timeMark));
      return `
        <div class="review-item builder-review">
          <div class="br-head">
            <span class="br-num">${i + 1}</span>
            <span class="br-marks">${r.total}/${r.maxMarks}</span>
          </div>
          <div class="br-source">
            <span class="br-s">${escapeHtml(q.prompt || q.s1)}</span>
          </div>
          <div class="br-badges">
            ${badges.join('')}
          </div>
          ${r.total < r.maxMarks ? `<div class="br-yours"><span class="br-lbl">Your answer:</span> ${escapeHtml(studentSentence)}</div>` : ''}
          <div class="br-correct"><span class="br-lbl">Correct:</span> ${rsHighlightCombined(q)}</div>
        </div>`;
    }).join('');
  }

  // The sentence the student actually built (frame + chosen clause + chosen time).
  function rsComposeStudentSentence(q, r) {
    const clause = (r.chosenClause || []).join(' ');
    let s = `${r.chosenFrame || '?'} ${clause}`;
    if (r.hasTime) s += ` ${r.chosenTime || '?'}`;
    return s.replace(/\s+([.,])/g, '$1') + '.';
  }

  // Render q.combined with the reported clause (everything after the frame)
  // emphasised. The frame is q.frameCorrect; we highlight the remainder.
  function rsHighlightCombined(q) {
    const combined = q.combined;
    const frame = q.frameCorrect;
    const idx = combined.toLowerCase().indexOf(frame.toLowerCase());
    if (idx === -1) return escapeHtml(combined);
    const frameEnd = idx + frame.length;
    let hlStart = frameEnd;
    while (hlStart < combined.length && combined[hlStart] === ' ') hlStart++;
    let hlEnd = combined.length;
    if (/[.!?]/.test(combined[hlEnd - 1])) hlEnd -= 1;
    return wrapSpans(combined, [{ start: hlStart, end: hlEnd }]);
  }

  function quitRSToHome() {
    stopTimer();
    rsResults = [];
    rsTopic = null;
    rsScoreVal = 0;
    rsScore.textContent = '0';
    showScreen('home');
  }

  // --- EVENTS ---
  function bindEvents() {
    themeBtn.addEventListener('click', toggleTheme);
    btnStart.addEventListener('click', startExercise);
    btnNext.addEventListener('click', nextQuestion);
    hudQuit.addEventListener('click', quitToHome);
    btnAgain.addEventListener('click', playAgain);
    btnSubmitPassage.addEventListener('click', submitPassage);
    passageQuit.addEventListener('click', quitPassageToHome);
    btnBuilderCheck.addEventListener('click', builderCheck);
    btnBuilderNext.addEventListener('click', builderNext);
    builderQuit.addEventListener('click', quitBuilderToHome);
    clauseClear.addEventListener('click', clearClause);
    btnRSCheck.addEventListener('click', rsCheck);
    btnRSNext.addEventListener('click', rsNext);
    rsQuit.addEventListener('click', quitRSToHome);
    rsClauseClear.addEventListener('click', rsClearClause);
    // Close explanation popovers when clicking elsewhere
    document.addEventListener('click', e => {
      if (!e.target.closest('.rev-info') && !e.target.closest('.rev-popover')) {
        closeAllPopovers();
      }
    });
  }

  // --- GO ---
  init();
})();
