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
  const streakCount = $('streak-count');

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
    const attempts = localStorage.getItem('kslo_grammar_attempts') || '0';
    const best = localStorage.getItem('kslo_grammar_best_score') || '\u2014';
    const time = localStorage.getItem('kslo_grammar_best_time') || '\u2014';
    $('stat-attempts').textContent = attempts;
    $('stat-best').textContent = best;
    $('stat-time').textContent = time;
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
    Object.keys(topics).forEach((key, i) => {
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
    if (topicData.type === 'mc') {
      showQCountSection();
    } else {
      // Passage type — no count selection; ready to start straight away
      hideQCountSection();
      selectedCount = 'passage';
    }
    updateStartBtn();
  }

  function showQCountSection() {
    qcountSection.classList.remove('hidden');
    renderQCountButtons();
  }

  function hideQCountSection() {
    qcountSection.classList.add('hidden');
    // Clear selection
    if (qcountGroup) qcountGroup.innerHTML = '';
  }

  function renderQCountButtons() {
    const counts = [10, 20, 30, 40, 50, 100];
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
      btnStartText.textContent = 'Start Exercise \u2192';
    } else if (selectedTopic && selectedCount) {
      btnStart.disabled = false;
      btnStartText.textContent = 'Start Challenge \u2192';
    } else if (selectedTopic && topicData && topicData.type === 'mc' && !selectedCount) {
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
      btnNext.textContent = currentIndex === currentQuestions.length - 1 ? 'Finish \u{1F3C1}' : 'Next Question \u2192';
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
    [screenHome, screenExercise, screenPassage, screenResults].forEach(s => s.classList.remove('active'));
    const map = {
      home: screenHome,
      exercise: screenExercise,
      passage: screenPassage,
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

  // --- EVENTS ---
  function bindEvents() {
    themeBtn.addEventListener('click', toggleTheme);
    btnStart.addEventListener('click', startExercise);
    btnNext.addEventListener('click', nextQuestion);
    hudQuit.addEventListener('click', quitToHome);
    btnAgain.addEventListener('click', playAgain);
    btnSubmitPassage.addEventListener('click', submitPassage);
    passageQuit.addEventListener('click', quitPassageToHome);
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
