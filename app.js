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

  // Results
  const resScore = $('res-score');
  const resRemark = $('res-remark');
  const resTime = $('res-time');
  const resStreak = $('res-streak');
  const reviewList = $('review-list');
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
      // Passage type — preset count (all questions)
      hideQCountSection();
      selectedCount = topicData.questions.length;
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

    if (selectedTopic && selectedCount) {
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
    const pool = GRAMMAR_DATA[selectedTerm][selectedTopic].questions;
    if (pool.length === 0) { alert('No questions available for this topic yet.'); return; }

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
      hudTimer.textContent = formatTime(elapsed);
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
    [screenHome, screenExercise, screenResults].forEach(s => s.classList.remove('active'));
    const target = name === 'home' ? screenHome : name === 'exercise' ? screenExercise : screenResults;
    target.classList.add('active');
    window.scrollTo(0, 0);
  }

  function quitToHome() {
    stopTimer();
    streak = 0;
    streakCount.textContent = '0';
    showScreen('home');
  }

  function playAgain() {
    streak = 0;
    streakCount.textContent = '0';
    loadStats();
    heroSub.textContent = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    showScreen('home');
  }

  // --- EVENTS ---
  function bindEvents() {
    themeBtn.addEventListener('click', toggleTheme);
    btnStart.addEventListener('click', startExercise);
    btnNext.addEventListener('click', nextQuestion);
    hudQuit.addEventListener('click', quitToHome);
    btnAgain.addEventListener('click', playAgain);
  }

  // --- GO ---
  init();
})();
