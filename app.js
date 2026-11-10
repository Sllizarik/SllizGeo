// ================= ПРОФИЛЬ ИГРОКА И ЭКОНОМИКА =================
const userProfile = {
  coins: parseInt(localStorage.getItem('sg_coins') || '1015', 10),
  stars: parseInt(localStorage.getItem('sg_stars') || '950', 10),
  gamesPlayed: parseInt(localStorage.getItem('sg_games') || '0', 10),
  boosters: {
    // Классические викторины (Флаги, Столицы, Кухни, Карты, Лидеры)
    fifty: parseInt(localStorage.getItem('sg_b_fifty') || '1', 10),
    skip: parseInt(localStorage.getItem('sg_b_skip') || '1', 10),
    // Режим «Больше / Меньше»
    hlRange: parseInt(localStorage.getItem('sg_b_hlRange') || '0', 10),
    hlSkip: parseInt(localStorage.getItem('sg_b_hlSkip') || '0', 10),
    // Режим «Правда / Ложь»
    fdFact: parseInt(localStorage.getItem('sg_b_fdFact') || '0', 10),
    fdVisual: parseInt(localStorage.getItem('sg_b_fdVisual') || '0', 10),
    fdSolve: parseInt(localStorage.getItem('sg_b_fdSolve') || '0', 10)
  },
  save() {
    localStorage.setItem('sg_coins', this.coins);
    localStorage.setItem('sg_stars', this.stars);
    localStorage.setItem('sg_games', this.gamesPlayed);
    localStorage.setItem('sg_b_fifty', this.boosters.fifty);
    localStorage.setItem('sg_b_skip', this.boosters.skip);
    localStorage.setItem('sg_b_hlRange', this.boosters.hlRange);
    localStorage.setItem('sg_b_hlSkip', this.boosters.hlSkip);
    localStorage.setItem('sg_b_fdFact', this.boosters.fdFact);
    localStorage.setItem('sg_b_fdVisual', this.boosters.fdVisual);
    localStorage.setItem('sg_b_fdSolve', this.boosters.fdSolve);
    updateShopAndProfileUI();
  }
};

// ================= КАТАЛОГ БОНУСОВ ПО РЕЖИМАМ =================
const BOOSTER_CATALOG = {
  fifty: {
    key: 'fifty',
    price: 50,
    title: '🌓 50/50 — убрать 2 неверных',
    desc: 'Скрывает два ложных варианта ответа в текущем вопросе'
  },
  skip: {
    key: 'skip',
    price: 100,
    title: '🎯 Точный ответ',
    desc: 'Мгновенно выбирает правильный вариант ответа'
  },
  hlRange: {
    key: 'hlRange',
    price: 60,
    title: '📏 Показать разницу / коридор',
    desc: 'Показывает числовой коридор параметра второй страны'
  },
  hlSkip: {
    key: 'hlSkip',
    price: 100,
    title: '⚡ Авто-выбор ответа',
    desc: 'Автоматически выбирает правильную кнопку (Больше или Меньше)'
  },
  fdFact: {
    key: 'fdFact',
    price: 50,
    title: '📋 Открыть 1 точный факт загаданной страны',
    desc: 'Раскрывает один случайный ещё закрытый факт секретной страны'
  },
  fdVisual: {
    key: 'fdVisual',
    price: 75,
    title: '🖼️ Открыть 1 фото-подсказку или блюдо досрочно',
    desc: 'Снимает замок со случайной закрытой визуальной подсказки или блюда'
  },
  fdSolve: {
    key: 'fdSolve',
    price: 120,
    title: '🏆 Сразу разгадать страну',
    desc: 'Мгновенно завершает раунд победой и открывает досье страны'
  }
};

function buyBoosterByKey(key) {
  const item = BOOSTER_CATALOG[key];
  if (!item) return false;
  if (userProfile.coins >= item.price) {
    userProfile.coins -= item.price;
    userProfile.boosters[key] = (userProfile.boosters[key] || 0) + 1;
    userProfile.save();
    return true;
  } else {
    alert("Недостаточно монет! Играйте раунды, чтобы заработать 🪙");
    return false;
  }
}

// ================= ГЛОБАЛЬНЫЕ НАСТРОЙКИ =================
const gameSettings = {
  theme: localStorage.getItem('sg_theme') || 'theme-dark',
  difficulty: localStorage.getItem('sg_diff') || 'normal',
  questionDirection: localStorage.getItem('sg_direction') || 'normal',
  questionsCount: 20,
  onlyUN: false,
  onlyMainland: false,
  continents: [
    "Европа", "Азия", "Африка", 
    "Северная Америка", "Южная Америка", "Австралия и Океания"
  ]
};

// Обновление цифр в Магазине, Профиле и подсказок в игре
function updateShopAndProfileUI() {
  const shopCoins = document.getElementById('shop-coins-display');
  const shopFifty = document.getElementById('shop-fifty-count');
  const shopSkip = document.getElementById('shop-skip-count');
  const shopHlRange = document.getElementById('shop-hlRange-count');
  const shopHlSkip = document.getElementById('shop-hlSkip-count');
  const shopFdFact = document.getElementById('shop-fdFact-count');
  const shopFdVisual = document.getElementById('shop-fdVisual-count');
  const shopFdSolve = document.getElementById('shop-fdSolve-count');

  const profileStars = document.getElementById('profile-stars');
  const profileGames = document.getElementById('profile-games');

  const inGameFifty = document.getElementById('ingame-fifty-count');
  const inGameSkip = document.getElementById('ingame-skip-count');
  const inGameHintsCoins = document.getElementById('ingame-hints-coins');

  if (shopCoins) shopCoins.textContent = userProfile.coins;
  if (shopFifty) shopFifty.textContent = userProfile.boosters.fifty;
  if (shopSkip) shopSkip.textContent = userProfile.boosters.skip;
  if (shopHlRange) shopHlRange.textContent = userProfile.boosters.hlRange;
  if (shopHlSkip) shopHlSkip.textContent = userProfile.boosters.hlSkip;
  if (shopFdFact) shopFdFact.textContent = userProfile.boosters.fdFact;
  if (shopFdVisual) shopFdVisual.textContent = userProfile.boosters.fdVisual;
  if (shopFdSolve) shopFdSolve.textContent = userProfile.boosters.fdSolve;

  if (profileStars) profileStars.textContent = userProfile.stars;
  if (profileGames) profileGames.textContent = userProfile.gamesPlayed;

  if (inGameFifty) inGameFifty.textContent = userProfile.boosters.fifty;
  if (inGameSkip) inGameSkip.textContent = userProfile.boosters.skip;
  if (inGameHintsCoins) inGameHintsCoins.textContent = userProfile.coins;

  // Кнопка «💡 Подсказки» видна во всех режимах и открывает компактное окно «Пока недоступно»
  const openHintsBtn = document.getElementById('open-ingame-hints-btn');
  if (openHintsBtn) {
    openHintsBtn.style.display = '';
    openHintsBtn.innerHTML = '💡 Подсказки';
  }
}

// Фильтрация стран на основе настроек
function getFilteredCountries() {
  if (typeof DB === 'undefined' || !Array.isArray(DB)) return [];
  return DB.filter(country => {
    if (!gameSettings.continents.includes(country.continent)) return false;
    if (gameSettings.onlyUN && !country.isUN) return false;
    if (gameSettings.onlyMainland && !country.isMainland) return false;
    return true;
  });
}

// ================= РЕЖИМ «БОЛЬШЕ / МЕНЬШЕ» (HigherLowerGame) =================
const HigherLowerGame = {
  type: 'area', // 'area' (Территория км²) или 'population' (Население млн)
  pairs: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  isAnswering: false,

  getParamValue(country) {
    return this.type === 'area' ? (country.area || 0) : (country.population || 0);
  },

  formatParamValue(country) {
    if (this.type === 'area') {
      return country.areaFormatted || `${country.area || 0} км²`;
    }
    return `${country.population} млн чел.`;
  },

  formatRawNumber(val) {
    if (this.type === 'area') {
      if (val < 10 && !Number.isInteger(val)) return `${val} км²`;
      return `${Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} км²`;
    }
    return `${Number(val.toFixed(2))} млн чел.`;
  },

  buildQuestionPairs(pool, count, difficulty) {
    const pairs = [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    // Для сложного уровня сортируем страны по параметру, чтобы подбирать близких соседей
    const sortedByVal = [...pool].sort((a, b) => this.getParamValue(a) - this.getParamValue(b));

    for (let i = 0; i < count; i++) {
      const base = shuffled[i % shuffled.length];
      let target = null;

      if (difficulty === 'hard' && sortedByVal.length >= 4) {
        const idx = sortedByVal.findIndex(c => c.code === base.code);
        // Берём соседей по рейтингу (±1..4 позиции), чтобы числа были максимально близкими
        const neighborOffsets = [-4, -3, -2, -1, 1, 2, 3, 4]
          .map(off => idx + off)
          .filter(pos => pos >= 0 && pos < sortedByVal.length && sortedByVal[pos].code !== base.code);
        if (neighborOffsets.length > 0) {
          const chosenPos = neighborOffsets[Math.floor(Math.random() * neighborOffsets.length)];
          target = sortedByVal[chosenPos];
        }
      }

      if (!target) {
        const candidates = pool.filter(c => c.code !== base.code);
        target = candidates[Math.floor(Math.random() * candidates.length)];
      }

      pairs.push({ base, target });
    }
    return pairs;
  },

  start(type = 'area') {
    this.type = type === 'population' ? 'population' : 'area';
    const pool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
    if (pool.length < 4) {
      alert("Недостаточно стран для игры! Выберите больше регионов в настройках.");
      return;
    }

    window.lastActiveGame = HigherLowerGame;

    const currentDiff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const count = Math.min((typeof gameSettings !== 'undefined' ? gameSettings.questionsCount : 20), pool.length);
    this.pairs = this.buildQuestionPairs(pool, count, currentDiff);

    if (typeof preloadModeImages === 'function') {
      const allInvolved = [];
      this.pairs.forEach(p => {
        allInvolved.push(p.base, p.target);
      });
      preloadModeImages('flags', allInvolved);
    }

    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.isAnswering = false;

    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) gameScreen.classList.remove('search-keyboard-active');

    document.querySelector('.main-screen').style.display = 'none';
    document.querySelector('.top-bar').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('results-modal').style.display = 'none';

    this.bindBoosters();
    this.loadQuestion();
  },

  bindBoosters() {
    const fiftyBtn = document.getElementById('use-fifty-btn');
    const skipBtn = document.getElementById('use-skip-btn');
    if (!fiftyBtn || !skipBtn) return;

    const newFifty = fiftyBtn.cloneNode(true);
    const newSkip = skipBtn.cloneNode(true);
    fiftyBtn.parentNode.replaceChild(newFifty, fiftyBtn);
    skipBtn.parentNode.replaceChild(newSkip, skipBtn);

    newFifty.addEventListener('click', () => {
      this.useRangeBooster();
    });

    newSkip.addEventListener('click', () => {
      this.useSkipBooster();
    });
  },

  useRangeBooster() {
    if (this.isAnswering) return false;
    const hintSlot = document.getElementById('hl-range-hint-slot');
    if (hintSlot && hintSlot.innerHTML.trim() !== '') {
      alert("Коридор значений уже показан для этой пары!");
      return false;
    }
    if (userProfile.boosters.hlRange > 0) {
      userProfile.boosters.hlRange -= 1;
      userProfile.save();
      this.applyRangeHint();
      return true;
    } else {
      alert("У вас нет подсказок «Показать разницу / коридор»! Купите их за монеты 🪙");
      return false;
    }
  },

  useSkipBooster() {
    if (this.isAnswering) return false;
    if (userProfile.boosters.hlSkip > 0) {
      userProfile.boosters.hlSkip -= 1;
      userProfile.save();
      this.applyAutoCorrect();
      return true;
    } else {
      alert("У вас нет подсказок «Авто-выбор ответа»! Купите их за монеты 🪙");
      return false;
    }
  },

  applyRangeHint() {
    const pair = this.pairs[this.currentIndex];
    if (!pair) return;
    const val = this.getParamValue(pair.target);
    const low = Math.max(0, val * 0.72);
    const high = val * 1.28;
    const hintSlot = document.getElementById('hl-range-hint-slot');
    if (hintSlot) {
      hintSlot.innerHTML = `<div class="hl-hint-banner">💡 Коридор: ${this.formatRawNumber(low)} — ${this.formatRawNumber(high)}</div>`;
    }
  },

  applyAutoCorrect() {
    const pair = this.pairs[this.currentIndex];
    if (!pair) return;
    const baseVal = this.getParamValue(pair.base);
    const targetVal = this.getParamValue(pair.target);
    const choice = targetVal >= baseVal ? 'higher' : 'lower';
    const btn = document.querySelector(`.hl-answer-btn[data-choice="${choice}"]`);
    if (btn) {
      this.handleAnswer(choice, btn);
    }
  },

  loadQuestion() {
    this.isAnswering = false;
    const pair = this.pairs[this.currentIndex];
    if (!pair) return;

    const progressEl = document.getElementById('game-progress');
    const scoreEl = document.getElementById('game-score');
    if (progressEl) progressEl.textContent = `${this.currentIndex + 1} / ${this.pairs.length}`;
    if (scoreEl) scoreEl.textContent = this.score;

    if (typeof updateShopAndProfileUI === 'function') {
      updateShopAndProfileUI();
    }

    const { base, target } = pair;
    const isArea = this.type === 'area';
    const badgeLabel = isArea ? '📐 Сравнение территории (км²)' : '👥 Сравнение населения (млн)';
    const paramIcon = isArea ? '🗺️ Площадь:' : '👥 Население:';

    const questionBox = document.getElementById('question-box');
    questionBox.innerHTML = `
      <div class="hl-question-wrapper">
        <div class="hl-mode-badge">${badgeLabel}</div>
        <div class="hl-compare-container">
          <!-- Первая (известная) страна -->
          <div class="hl-country-card" id="hl-base-card">
            <div class="hl-flag-wrap">
              <img src="${getFlagUrl(base.code)}" alt="${base.name}" draggable="false">
            </div>
            <div class="hl-country-meta">
              <div class="hl-country-continent">${base.continent} • Столица: ${base.capital}</div>
              <div class="hl-country-name">${base.name}</div>
              <div class="hl-stat-box">
                <span>${paramIcon}</span>
                <strong>${this.formatParamValue(base)}</strong>
              </div>
            </div>
          </div>

          <div class="hl-vs-divider">
            <span class="hl-vs-badge">VS</span>
          </div>

          <!-- Вторая (загаданная) страна -->
          <div class="hl-country-card" id="hl-target-card">
            <div class="hl-flag-wrap">
              <img src="${getFlagUrl(target.code)}" alt="${target.name}" draggable="false">
            </div>
            <div class="hl-country-meta">
              <div class="hl-country-continent">${target.continent} • Столица: ${target.capital}</div>
              <div class="hl-country-name">${target.name}</div>
              <div class="hl-stat-box mystery" id="hl-target-stat">
                <span>${paramIcon}</span>
                <strong>❓</strong>
              </div>
              <div id="hl-range-hint-slot"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const answersGrid = document.getElementById('answers-grid');
    answersGrid.className = 'answers-grid hl-answers-grid';
    answersGrid.innerHTML = `
      <button type="button" class="answer-btn hl-answer-btn" data-choice="higher">
        <span>🔼 Больше</span>
        <small>(или равно)</small>
      </button>
      <button type="button" class="answer-btn hl-answer-btn" data-choice="lower">
        <span>🔽 Меньше</span>
        <small>(или равно)</small>
      </button>
    `;

    answersGrid.querySelectorAll('.hl-answer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleAnswer(btn.dataset.choice, btn);
      });
    });
  },

  handleAnswer(choice, clickedBtn) {
    if (this.isAnswering) return;
    this.isAnswering = true;

    const pair = this.pairs[this.currentIndex];
    const baseVal = this.getParamValue(pair.base);
    const targetVal = this.getParamValue(pair.target);

    const isCorrect =
      (choice === 'higher' && targetVal >= baseVal) ||
      (choice === 'lower' && targetVal <= baseVal);

    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const pointsMap = { easy: 5, normal: 10, hard: 15 };
    const points = pointsMap[diff] || 10;

    const paramIcon = this.type === 'area' ? '🗺️ Площадь:' : '👥 Население:';
    const targetStatEl = document.getElementById('hl-target-stat');
    const targetCardEl = document.getElementById('hl-target-card');

    if (targetStatEl) {
      targetStatEl.classList.remove('mystery');
      targetStatEl.classList.add(isCorrect ? 'revealed-correct' : 'revealed-wrong');
      targetStatEl.innerHTML = `<span>${paramIcon}</span><strong>${this.formatParamValue(pair.target)}</strong>`;
    }

    if (targetCardEl) {
      targetCardEl.classList.add(isCorrect ? 'revealed-correct' : 'revealed-wrong');
    }

    const allBtns = document.querySelectorAll('.hl-answer-btn');
    if (isCorrect) {
      clickedBtn.classList.add('correct');
      this.score += points;
      this.correctCount++;
      const scoreEl = document.getElementById('game-score');
      if (scoreEl) scoreEl.textContent = this.score;
    } else {
      clickedBtn.classList.add('wrong');
      allBtns.forEach(btn => {
        if (btn !== clickedBtn) btn.classList.add('correct');
      });
    }

    setTimeout(() => {
      this.currentIndex++;
      if (this.currentIndex < this.pairs.length) {
        this.loadQuestion();
      } else {
        this.endGame();
      }
    }, 1250);
  },

  endGame() {
    const earnedCoins = this.score;
    const earnedStars = Math.floor(this.correctCount * 2.5);

    if (typeof userProfile !== 'undefined') {
      userProfile.coins += earnedCoins;
      userProfile.stars += earnedStars;
      userProfile.gamesPlayed += 1;
      userProfile.save();
    }

    document.getElementById('final-score').textContent = `${this.score} очков (${this.correctCount}/${this.pairs.length})`;
    document.getElementById('final-coins').textContent = `+${earnedCoins} 🪙`;
    document.getElementById('final-stars').textContent = `+${earnedStars} ⭐`;
    document.getElementById('results-modal').style.display = 'flex';
  },

  exit() {
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
      gameScreen.classList.remove('search-keyboard-active');
      gameScreen.style.display = 'none';
    }
    document.getElementById('results-modal').style.display = 'none';
    document.querySelector('.main-screen').style.display = 'block';
    document.querySelector('.top-bar').style.display = 'flex';
  }
};

// ================= РЕЖИМ «ПО ФАКТАМ» (FactsDeductionGame) =================
const ALL_FACT_KEYS = [
  'continent',
  'isUN',
  'isMainland',
  'neighborsCount',
  'temp2025',
  'regionsCount',
  'millionCitiesCount',
  'population',
  'area'
];

const FactsDeductionGame = {
  usedCountryCodes: [],
  targetCountry: null,
  hardDish: null,
  maxAttempts: 10,
  wrongAttempts: 0,
  attemptsHistory: [], // массив объектов { country, attemptNum } в хронологическом порядке (1..N)
  viewedAttemptIndex: -1,
  guessedCodes: [],
  searchQuery: '',
  revealedFactKeys: [], // открытые бустером fdFact точные факты загаданной страны
  forceUnlockedVisuals: [], // досрочно открытые бустером fdVisual подсказки: 'cuisine', 'leader', 'food', 'map'
  keyboardBlurTimer: null,
  isRoundOver: false,

  getScoringConfig() {
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    if (diff === 'easy') return { start: 50, penalty: 4, min: 10 };
    if (diff === 'hard') return { start: 150, penalty: 14, min: 20 };
    return { start: 100, penalty: 9, min: 15 };
  },

  getCurrentPotentialPoints() {
    const cfg = this.getScoringConfig();
    return Math.max(cfg.min, cfg.start - this.wrongAttempts * cfg.penalty);
  },

  isVisualSlotUnlocked(slot) {
    if (this.isRoundOver) return true;
    if (this.forceUnlockedVisuals.includes(slot)) return true;
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    if (diff === 'easy') return this.wrongAttempts >= 7;
    if (diff === 'normal') return this.wrongAttempts >= 9;
    return false; // На сложном по умолчанию закрыты
  },

  isCuisineFullyUnlocked() {
    if (this.isRoundOver) return true;
    if (this.forceUnlockedVisuals.includes('cuisine')) return true;
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    if (diff === 'easy') return this.wrongAttempts >= 9;
    return this.wrongAttempts >= 7;
  },

  start() {
    const pool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
    if (!pool || pool.length < 2) {
      alert("Недостаточно стран для игры! Выберите больше регионов в настройках.");
      return;
    }

    window.lastActiveGame = FactsDeductionGame;

    // Защита от повторов стран в рамках серии раундов «🔄 Ещё»
    let available = pool.filter(c => !this.usedCountryCodes.includes(c.code));
    if (available.length === 0) {
      this.usedCountryCodes = [];
      available = [...pool];
    }

    this.targetCountry = available[Math.floor(Math.random() * available.length)];
    this.usedCountryCodes.push(this.targetCountry.code);

    // Выбираем редкое блюдо для сложного уровня
    const allFoods = (this.targetCountry.foods && this.targetCountry.foods.length > 0)
      ? this.targetCountry.foods
      : [this.targetCountry.food];
    const rarePool = allFoods.filter(f => !f.isMain);
    this.hardDish = rarePool.length > 0
      ? rarePool[Math.floor(Math.random() * rarePool.length)]
      : this.targetCountry.food;

    this.wrongAttempts = 0;
    this.attemptsHistory = [];
    this.viewedAttemptIndex = -1;
    this.guessedCodes = [];
    this.searchQuery = '';
    this.revealedFactKeys = [];
    this.forceUnlockedVisuals = [];
    this.isRoundOver = false;

    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) gameScreen.classList.remove('search-keyboard-active');

    // Предзагрузка визуальных материалов загаданной страны и флагов пула
    if (typeof preloadSingleUrl === 'function') {
      preloadSingleUrl(getFlagUrl(this.targetCountry.code), true);
      if (typeof getLeaderImage === 'function') preloadSingleUrl(getLeaderImage(this.targetCountry.code), true);
      if (typeof getFoodImage === 'function') preloadSingleUrl(getFoodImage(this.targetCountry.code), true);
    }
    if (typeof preloadModeImages === 'function') {
      preloadModeImages('flags', pool.slice(0, 40));
    }

    document.querySelector('.main-screen').style.display = 'none';
    document.querySelector('.top-bar').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('results-modal').style.display = 'none';

    this.bindBoosters();
    this.renderRoundUI();
  },

  bindBoosters() {
    const fiftyBtn = document.getElementById('use-fifty-btn');
    const skipBtn = document.getElementById('use-skip-btn');
    if (!fiftyBtn || !skipBtn) return;

    const newFifty = fiftyBtn.cloneNode(true);
    const newSkip = skipBtn.cloneNode(true);
    fiftyBtn.parentNode.replaceChild(newFifty, fiftyBtn);
    skipBtn.parentNode.replaceChild(newSkip, skipBtn);

    newFifty.addEventListener('click', () => {
      this.useFactBooster();
    });

    newSkip.addEventListener('click', () => {
      this.useSolveBooster();
    });
  },

  // Бустер 1: Открыть 1 случайный ещё закрытый точный факт загаданной страны
  useFactBooster() {
    if (this.isRoundOver) return false;
    const unrevealed = ALL_FACT_KEYS.filter(k => !this.revealedFactKeys.includes(k));
    if (unrevealed.length === 0) {
      alert("Все точные факты загаданной страны уже открыты!");
      return false;
    }
    if (userProfile.boosters.fdFact <= 0) {
      alert("У вас нет подсказок «Открыть 1 точный факт»! Купите их за монеты 🪙");
      return false;
    }
    userProfile.boosters.fdFact -= 1;
    userProfile.save();

    const randomKey = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    this.revealedFactKeys.push(randomKey);
    this.renderQuestionDossier();
    return true;
  },

  // Бустер 2: Открыть 1 случайную закрытую фото-подсказку (Глава, Блюдо, Карта) или блюдо кухни досрочно
  useVisualBooster() {
    if (this.isRoundOver) return false;
    const candidates = [];
    if (!this.isCuisineFullyUnlocked()) candidates.push('cuisine');
    if (!this.isVisualSlotUnlocked('leader')) candidates.push('leader');
    if (!this.isVisualSlotUnlocked('food')) candidates.push('food');
    if (!this.isVisualSlotUnlocked('map')) candidates.push('map');

    if (candidates.length === 0) {
      alert("Все визуальные подсказки и кухня уже открыты!");
      return false;
    }
    if (userProfile.boosters.fdVisual <= 0) {
      alert("У вас нет подсказок «Открыть 1 фото-подсказку или блюдо»! Купите их за монеты 🪙");
      return false;
    }
    userProfile.boosters.fdVisual -= 1;
    userProfile.save();

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    if (!this.forceUnlockedVisuals.includes(chosen)) {
      this.forceUnlockedVisuals.push(chosen);
    }
    this.renderAnswersList();
    return true;
  },

  // Бустер 3: Сразу разгадать страну
  useSolveBooster() {
    if (this.isRoundOver) return false;
    if (userProfile.boosters.fdSolve <= 0) {
      alert("У вас нет подсказок «Сразу разгадать страну»! Купите их за монеты 🪙");
      return false;
    }
    userProfile.boosters.fdSolve -= 1;
    userProfile.save();
    this.handleGuess(this.targetCountry.code);
    return true;
  },

  updateHeaderStats() {
    const progressEl = document.getElementById('game-progress');
    const scoreEl = document.getElementById('game-score');
    if (progressEl) {
      const shownAttempt = Math.min(this.wrongAttempts + 1, this.maxAttempts);
      progressEl.textContent = `Попытка: ${shownAttempt} / ${this.maxAttempts}`;
    }
    if (scoreEl) {
      scoreEl.textContent = this.isRoundOver ? this.lastAwardedScore || 0 : this.getCurrentPotentialPoints();
    }
    if (typeof updateShopAndProfileUI === 'function') {
      updateShopAndProfileUI();
    }
  },

  // ЯРУС 1: Верхняя панель навигации со стрелочками по прошлым попыткам
  renderAttemptNavHTML() {
    const total = this.attemptsHistory.length;
    if (total === 0) {
      return `
        <div class="fd-attempt-nav">
          <button type="button" class="fd-nav-arrow" id="fd-prev-attempt" disabled aria-label="Предыдущая попытка">◀</button>
          <div class="fd-nav-status empty">Выберите первую страну в поиске ниже</div>
          <button type="button" class="fd-nav-arrow" id="fd-next-attempt" disabled aria-label="Следующая попытка">▶</button>
        </div>
      `;
    }

    const idx = Math.max(0, Math.min(this.viewedAttemptIndex, total - 1));
    this.viewedAttemptIndex = idx;
    const entry = this.attemptsHistory[idx];
    const c = entry.country;
    const hasPrev = idx > 0;
    const hasNext = idx < total - 1;

    return `
      <div class="fd-attempt-nav">
        <button type="button" class="fd-nav-arrow" id="fd-prev-attempt" ${hasPrev ? '' : 'disabled'} aria-label="Предыдущая попытка">◀</button>
        <div class="fd-nav-status">
          <span class="fd-nav-counter">Попытка ${entry.attemptNum} из ${total}:</span>
          <img src="${getFlagUrl(c.code)}" alt="" class="fd-nav-flag">
          <strong class="fd-nav-country">${c.name}</strong>
        </div>
        <button type="button" class="fd-nav-arrow" id="fd-next-attempt" ${hasNext ? '' : 'disabled'} aria-label="Следующая попытка">▶</button>
      </div>
    `;
  },

  getTargetSecretText(factKey) {
    const t = this.targetCountry;
    if (!t) return '';
    switch (factKey) {
      case 'continent': return t.continent;
      case 'isUN': return t.isUN ? 'Член ООН' : 'Не в ООН';
      case 'isMainland': return t.isMainland ? 'Материк' : 'Остров';
      case 'neighborsCount': return `${t.neighborsCount || 0} стр.`;
      case 'temp2025': return t.temp2025Formatted || `${t.temp2025} °C`;
      case 'regionsCount': return `${t.regionsCount} ед.`;
      case 'millionCitiesCount': return `${t.millionCitiesCount}`;
      case 'population': return `${t.population} млн`;
      case 'area': return t.areaFormatted || `${t.area} км²`;
      default: return '';
    }
  },

  // ЯРУС 2: Отдельные ультра-компактные строки фактов (БЕЗ «Кухни» сверху!)
  renderFactsRowsHTML() {
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const regTol = diff === 'easy' ? 5 : (diff === 'normal' ? 3 : 1);
    const cityTol = diff === 'easy' ? 3 : (diff === 'normal' ? 1 : 0);
    const popTol = diff === 'easy' ? 5 : (diff === 'normal' ? 2 : 1);
    const areaTol = diff === 'easy' ? 7000 : (diff === 'normal' ? 5000 : 2000);
    const nbTol = diff === 'easy' ? 1 : 0;
    const tempTol = diff === 'easy' ? 3.0 : (diff === 'normal' ? 2.0 : 1.0);

    const hasAttempt = this.attemptsHistory.length > 0;
    const idx = hasAttempt ? Math.max(0, Math.min(this.viewedAttemptIndex, this.attemptsHistory.length - 1)) : -1;
    const guessed = hasAttempt ? this.attemptsHistory[idx].country : null;
    const target = this.targetCountry;

    const buildRow = (factKey, labelHTML, isMatch, guessedValHTML) => {
      const isRevealedByBooster = this.revealedFactKeys.includes(factKey);
      const secretBadge = isRevealedByBooster
        ? `<span class="fd-fact-secret-badge" title="Точный факт загаданной страны">💡 ${this.getTargetSecretText(factKey)}</span>`
        : '';

      if (!hasAttempt) {
        return `
          <div class="fd-fact-row ${isRevealedByBooster ? 'fact-true' : 'fd-fact-neutral'}">
            <span class="fd-fact-name">${labelHTML}</span>
            <div class="fd-fact-right">
              ${secretBadge || '<span class="fd-fact-val">—</span>'}
            </div>
          </div>
        `;
      }

      return `
        <div class="fd-fact-row ${isMatch ? 'fact-true' : 'fact-false'}">
          <span class="fd-fact-name">${labelHTML}</span>
          <div class="fd-fact-right">
            ${secretBadge}
            <strong class="fd-fact-val">${guessedValHTML}</strong>
            <span class="fd-fact-pill">${isMatch ? '✓ Правда' : '✕ Ложь'}</span>
          </div>
        </div>
      `;
    };

    if (!hasAttempt) {
      return `
        <div class="fd-facts-stack" id="facts-rows-container">
          ${buildRow('continent', '🌍 Континент', false, '')}
          ${buildRow('isUN', '🇺🇳 Статус ООН', false, '')}
          ${buildRow('isMainland', '🏝️ География (Материк / Остров)', false, '')}
          ${buildRow('neighborsCount', `🤝 Соседи (${nbTol === 0 ? 'точно' : `±${nbTol}`})`, false, '')}
          ${buildRow('temp2025', `🌡️ Температура (±${tempTol.toFixed(1)} °C)`, false, '')}
          ${buildRow('regionsCount', `🗺️ Регионы / штаты (±${regTol})`, false, '')}
          ${buildRow('millionCitiesCount', `🏙️ Миллионники (${cityTol === 0 ? 'точно' : `±${cityTol}`})`, false, '')}
          ${buildRow('population', `👥 Население (±${popTol} млн)`, false, '')}
          ${buildRow('area', `📐 Площадь (±${areaTol.toLocaleString('ru-RU')} км²)`, false, '')}
        </div>
      `;
    }

    // 1. 🌍 Континент
    const contMatch = guessed.continent === target.continent;

    // 2. 🇺🇳 Статус ООН
    const unMatch = guessed.isUN === target.isUN;
    const unText = guessed.isUN ? 'Член ООН' : 'Не в ООН';

    // 3. 🏝️ География (Материк / Остров)
    const geoMatch = guessed.isMainland === target.isMainland;
    const geoText = guessed.isMainland ? 'Материк' : 'Остров';

    // 4. 🤝 Сухопутные соседи
    const gNb = Number(guessed.neighborsCount || 0);
    const tNb = Number(target.neighborsCount || 0);
    const nbMatch = Math.abs(gNb - tNb) <= nbTol;
    let nbArrow = '';
    if (diff === 'easy' && gNb !== tNb) {
      nbArrow = tNb > gNb
        ? `<span class="fd-dir-arrow" title="У загаданной страны соседей больше">🔼</span>`
        : `<span class="fd-dir-arrow" title="У загаданной страны соседей меньше">🔽</span>`;
    }

    // 5. 🌡️ Температура 2025
    const gTemp = Number(guessed.temp2025 || 0);
    const tTemp = Number(target.temp2025 || 0);
    const tempMatch = Math.abs(gTemp - tTemp) <= tempTol + 1e-6;
    let tempArrow = '';
    if (diff === 'easy' && Math.abs(gTemp - tTemp) > 0.05) {
      tempArrow = tTemp > gTemp
        ? `<span class="fd-dir-arrow" title="У загаданной страны теплее">🔼</span>`
        : `<span class="fd-dir-arrow" title="У загаданной страны холоднее">🔽</span>`;
    }

    // 6. 🗺️ Регионы / штаты (regionsCount)
    const gReg = Number(guessed.regionsCount || 0);
    const tReg = Number(target.regionsCount || 0);
    const regMatch = Math.abs(gReg - tReg) <= regTol;
    let regArrow = '';
    if (diff === 'easy' && gReg !== tReg) {
      regArrow = tReg > gReg
        ? `<span class="fd-dir-arrow" title="У загаданной страны регионов больше">🔼</span>`
        : `<span class="fd-dir-arrow" title="У загаданной страны регионов меньше">🔽</span>`;
    }

    // 7. 🏙️ Города-миллионники (millionCitiesCount)
    const gCity = Number(guessed.millionCitiesCount || 0);
    const tCity = Number(target.millionCitiesCount || 0);
    const cityMatch = Math.abs(gCity - tCity) <= cityTol;
    let cityArrow = '';
    if (diff === 'easy' && gCity !== tCity) {
      cityArrow = tCity > gCity
        ? `<span class="fd-dir-arrow" title="У загаданной страны городов-миллионников больше">🔼</span>`
        : `<span class="fd-dir-arrow" title="У загаданной страны городов-миллионников меньше">🔽</span>`;
    }

    // 8. 👥 Население (population)
    const gPop = Number(guessed.population || 0);
    const tPop = Number(target.population || 0);
    const popMatch = Math.abs(gPop - tPop) <= popTol;
    let popArrow = '';
    if (diff === 'easy' && gPop !== tPop) {
      popArrow = tPop > gPop
        ? `<span class="fd-dir-arrow" title="У загаданной страны население больше">🔼</span>`
        : `<span class="fd-dir-arrow" title="У загаданной страны население меньше">🔽</span>`;
    }

    // 9. 📐 Площадь (area)
    const gArea = Number(guessed.area || 0);
    const tArea = Number(target.area || 0);
    const areaMatch = Math.abs(gArea - tArea) <= areaTol;
    let areaArrow = '';
    if (diff === 'easy' && gArea !== tArea) {
      areaArrow = tArea > gArea
        ? `<span class="fd-dir-arrow" title="У загаданной страны площадь больше">🔼</span>`
        : `<span class="fd-dir-arrow" title="У загаданной страны площадь меньше">🔽</span>`;
    }

    return `
      <div class="fd-facts-stack" id="facts-rows-container">
        ${buildRow('continent', '🌍 Континент', contMatch, guessed.continent)}
        ${buildRow('isUN', '🇺🇳 Статус ООН', unMatch, unText)}
        ${buildRow('isMainland', '🏝️ География', geoMatch, geoText)}
        ${buildRow('neighborsCount', `🤝 Соседи (${nbTol === 0 ? 'точно' : `±${nbTol}`})`, nbMatch, `${gNb} стр. ${nbArrow}`)}
        ${buildRow('temp2025', `🌡️ Темп. (±${tempTol.toFixed(1)} °C)`, tempMatch, `${guessed.temp2025Formatted || `${gTemp} °C`} ${tempArrow}`)}
        ${buildRow('regionsCount', `🗺️ Регионы (±${regTol})`, regMatch, `${gReg} ед. ${regArrow}`)}
        ${buildRow('millionCitiesCount', `🏙️ Миллионники (${cityTol === 0 ? 'точно' : `±${cityTol}`})`, cityMatch, `${gCity} ${cityArrow}`)}
        ${buildRow('population', `👥 Население (±${popTol} млн)`, popMatch, `${gPop} млн ${popArrow}`)}
        ${buildRow('area', `📐 Площадь (±${areaTol.toLocaleString('ru-RU')} км²)`, areaMatch, `${guessed.areaFormatted || `${gArea} км²`} ${areaArrow}`)}
      </div>
    `;
  },

  // Нижний блок кухни загаданной страны (открывается по попыткам или бустером fdVisual)
  renderBottomCuisineHTML() {
    const c = this.targetCountry;
    if (!c) return '';
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const allFoods = (c.foods && c.foods.length > 0) ? c.foods : [c.food];
    const forceCuisine = this.forceUnlockedVisuals.includes('cuisine') || this.isRoundOver;

    if (diff === 'easy') {
      // На easy: до 5 ошибок скрыто под замком 🔒.
      // После 5-й ошибки — 1 блюдо, 6-й — 2, 7-й — 3, 8-й — 4, 9-й — все 5 блюд + описание главного.
      let unlockedCount = 0;
      if (forceCuisine || this.wrongAttempts >= 9) {
        unlockedCount = allFoods.length;
      } else if (this.wrongAttempts >= 5) {
        unlockedCount = Math.min(allFoods.length, this.wrongAttempts - 4);
      }

      if (unlockedCount === 0) {
        return `
          <div class="fd-cuisine-row locked">
            <div class="fd-cuisine-head">
              <span class="fd-cuisine-label">🔒 🍲 Кухня загаданной страны</span>
              <span class="fd-cuisine-lock-text">Откроется с 5-й ошибки (${this.wrongAttempts}/5)</span>
            </div>
          </div>
        `;
      }

      const chipsHTML = allFoods.map((dish, i) => {
        if (i < unlockedCount) {
          return `<span class="fd-dish-chip">${dish.name}</span>`;
        }
        return `<span class="fd-dish-chip locked-chip">🔒 Блюдо ${i + 1}</span>`;
      }).join('');

      const fullDescHTML = (unlockedCount >= allFoods.length && c.food.desc)
        ? `<div class="fd-cuisine-desc">Главное блюдо: <strong>${c.food.name}</strong> — ${c.food.desc}</div>`
        : '';

      return `
        <div class="fd-cuisine-row">
          <div class="fd-cuisine-head">
            <span class="fd-cuisine-label">🍲 Кухня страны (${unlockedCount}/${allFoods.length}):</span>
          </div>
          <div class="fd-cuisine-chips">${chipsHTML}</div>
          ${fullDescHTML}
        </div>
      `;
    }

    // На normal и hard: открывается после 7-й неверной попытки (wrongAttempts >= 7) или досрочно бустером
    const isUnlocked = forceCuisine || this.wrongAttempts >= 7;
    if (!isUnlocked) {
      return `
        <div class="fd-cuisine-row locked">
          <div class="fd-cuisine-head">
            <span class="fd-cuisine-label">🔒 🍲 Кухня загаданной страны</span>
            <span class="fd-cuisine-lock-text">Откроется после 7 ошибок (${this.wrongAttempts}/7)</span>
          </div>
        </div>
      `;
    }

    if (diff === 'normal') {
      return `
        <div class="fd-cuisine-row">
          <div class="fd-cuisine-head">
            <span class="fd-cuisine-label">🍲 Главное блюдо:</span>
            <strong class="fd-cuisine-main">${c.food.name}</strong>
          </div>
          ${c.food.desc ? `<div class="fd-cuisine-desc">${c.food.desc}</div>` : ''}
        </div>
      `;
    } else {
      const dish = this.hardDish || c.food;
      return `
        <div class="fd-cuisine-row">
          <div class="fd-cuisine-head">
            <span class="fd-cuisine-label">🔥 Редкое блюдо:</span>
            <strong class="fd-cuisine-main">${dish.name}</strong>
          </div>
          ${dish.desc ? `<div class="fd-cuisine-desc">${dish.desc}</div>` : ''}
        </div>
      `;
    }
  },

  // Нижний ряд: строго 3 визуальные подсказки в 1 ряд БЕЗ ФЛАГА (Глава, Блюдо, Карта)
  renderVisualCluesHTML() {
    const c = this.targetCountry;
    if (!c) return '';
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';

    let lockCounter = 'Скрыто';
    if (diff === 'easy') lockCounter = `${this.wrongAttempts}/7`;
    if (diff === 'normal') lockCounter = `${this.wrongAttempts}/9`;

    const leaderUnlocked = this.isVisualSlotUnlocked('leader');
    const foodUnlocked = this.isVisualSlotUnlocked('food');
    const mapUnlocked = this.isVisualSlotUnlocked('map');

    const leaderImg = (typeof getLeaderImage === 'function') ? getLeaderImage(c.code) : null;
    const foodImg = (typeof getFoodImage === 'function') ? getFoodImage(c.code) : null;
    const mapDiffMode = diff === 'easy' ? 'normal' : 'hard';
    const mapSVG = (mapUnlocked && typeof MapsGame !== 'undefined' && typeof MapsGame.renderMapSVG === 'function')
      ? MapsGame.renderMapSVG(c, mapDiffMode)
      : '';

    const leaderCardHTML = leaderUnlocked
      ? `
        <button type="button" class="fd-visual-card unlocked" data-zoom-slot="leader" title="Нажмите, чтобы увеличить фото главы">
          ${leaderImg ? `<img src="${leaderImg}" alt="Глава">` : `<span class="fd-vis-fallback">👤</span>`}
          <span class="fd-vis-title">🔍 Глава</span>
        </button>
      `
      : `
        <div class="fd-visual-card locked">
          <span class="fd-lock-ico">🔒</span>
          <span class="fd-vis-title">Глава</span>
          <span class="fd-vis-sub">${lockCounter}</span>
        </div>
      `;

    const foodCardHTML = foodUnlocked
      ? `
        <button type="button" class="fd-visual-card unlocked" data-zoom-slot="food" title="Нажмите, чтобы увеличить фото блюда">
          ${foodImg ? `<img src="${foodImg}" alt="Блюдо">` : `<span class="fd-vis-fallback">🍲</span>`}
          <span class="fd-vis-title">🔍 Блюдо</span>
        </button>
      `
      : `
        <div class="fd-visual-card locked">
          <span class="fd-lock-ico">🔒</span>
          <span class="fd-vis-title">Блюдо</span>
          <span class="fd-vis-sub">${lockCounter}</span>
        </div>
      `;

    const mapCardHTML = mapUnlocked
      ? `
        <button type="button" class="fd-visual-card unlocked" data-zoom-slot="map" title="Нажмите, чтобы увеличить карту">
          <div class="fd-vis-map-thumb">${mapSVG}</div>
          <span class="fd-vis-title">🔍 Карта</span>
        </button>
      `
      : `
        <div class="fd-visual-card locked">
          <span class="fd-lock-ico">🔒</span>
          <span class="fd-vis-title">Карта</span>
          <span class="fd-vis-sub">${lockCounter}</span>
        </div>
      `;

    return `
      <div class="fd-bottom-clues-wrap" id="fd-bottom-clues-wrap">
        ${this.renderBottomCuisineHTML()}
        <div class="fd-visuals-row-3" id="fd-visuals-row">
          ${leaderCardHTML}
          ${foodCardHTML}
          ${mapCardHTML}
        </div>
      </div>
    `;
  },

  bindVisualZoomEvents(container) {
    if (!container) return;
    container.querySelectorAll('.fd-visual-card.unlocked[data-zoom-slot]').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = btn.getAttribute('data-zoom-slot');
        if (slot) this.openVisualZoom(slot);
      });
    });
  },

  openVisualZoom(slotType) {
    const c = this.targetCountry;
    if (!c) return;
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const revealName = this.isRoundOver ? c.name : 'Секретная страна';

    let titleText = '';
    let subtitleText = '';
    let bodyHTML = '';

    if (slotType === 'leader') {
      const leaderImg = (typeof getLeaderImage === 'function') ? getLeaderImage(c.code) : null;
      titleText = `👤 Глава государства (${revealName})`;
      subtitleText = this.isRoundOver ? c.leader : 'Действующий лидер государства';
      bodyHTML = leaderImg
        ? `<img src="${leaderImg}" alt="Глава государства" class="fd-zoom-img">`
        : `<div class="fd-zoom-empty">👤 Портрет недоступен</div>`;
    } else if (slotType === 'food') {
      const foodImg = (typeof getFoodImage === 'function') ? getFoodImage(c.code) : null;
      titleText = `🍲 Национальное блюдо (${revealName})`;
      subtitleText = `${c.food.name}${c.food.desc ? ` — ${c.food.desc}` : ''}`;
      bodyHTML = foodImg
        ? `<img src="${foodImg}" alt="${c.food.name}" class="fd-zoom-img">`
        : `<div class="fd-zoom-empty">🍲 Фото блюда недоступно</div>`;
    } else if (slotType === 'map') {
      const mapDiffMode = diff === 'easy' ? 'normal' : 'hard';
      const mapSVG = (typeof MapsGame !== 'undefined' && typeof MapsGame.renderMapSVG === 'function')
        ? MapsGame.renderMapSVG(c, this.isRoundOver ? 'normal' : mapDiffMode)
        : '';
      titleText = `🗺️ Контур территории (${revealName})`;
      subtitleText = (!this.isRoundOver && diff !== 'easy') ? 'Географические оси и опорные точки' : 'Силуэт границ территории';
      bodyHTML = `<div class="fd-zoom-map-wrap">${mapSVG}</div>`;
    }

    const existing = document.getElementById('fd-zoom-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'fd-zoom-modal';
    modal.className = 'fd-zoom-modal';
    modal.innerHTML = `
      <div class="fd-zoom-dialog">
        <div class="fd-zoom-header">
          <div class="fd-zoom-titles">
            <h4>${titleText}</h4>
            <p>${subtitleText}</p>
          </div>
          <button type="button" class="fd-zoom-close" id="fd-zoom-close-btn" aria-label="Закрыть">✕</button>
        </div>
        <div class="fd-zoom-body">
          ${bodyHTML}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    const closeBtn = document.getElementById('fd-zoom-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  },

  renderQuestionDossier() {
    const questionBox = document.getElementById('question-box');
    if (!questionBox) return;

    questionBox.innerHTML = `
      <div class="facts-dossier-wrapper">
        ${this.renderAttemptNavHTML()}
        ${this.renderFactsRowsHTML()}
      </div>
    `;

    const prevBtn = document.getElementById('fd-prev-attempt');
    const nextBtn = document.getElementById('fd-next-attempt');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.viewedAttemptIndex > 0) {
          this.viewedAttemptIndex -= 1;
          this.renderQuestionDossier();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.viewedAttemptIndex < this.attemptsHistory.length - 1) {
          this.viewedAttemptIndex += 1;
          this.renderQuestionDossier();
        }
      });
    }
  },

  // ЯРУС 3 (Поиск + открытый список стран с подъёмом над клавиатурой) и ЯРУС 4 (Кухня + 3 карточки снизу)
  renderAnswersList() {
    const answersGrid = document.getElementById('answers-grid');
    if (!answersGrid) return;

    answersGrid.className = 'answers-grid facts-answers-panel';

    const pool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
    const sorted = [...pool].sort((a, b) => a.name.localeCompare(b.name, 'ru'));

    answersGrid.innerHTML = `
      <div class="fd-search-section" id="fd-search-section">
        <input type="text" class="facts-search-input" id="facts-country-search" placeholder="🔍 Быстрый поиск страны или столицы..." value="${this.searchQuery}" autocomplete="off">
        <div class="facts-countries-scroll" id="facts-countries-scroll"></div>
      </div>
      ${this.renderVisualCluesHTML()}
    `;

    const gameScreen = document.getElementById('game-screen');
    const searchSection = document.getElementById('fd-search-section');
    const searchInput = document.getElementById('facts-country-search');
    const scrollContainer = document.getElementById('facts-countries-scroll');
    const visualsRow = document.getElementById('fd-visuals-row');

    this.bindVisualZoomEvents(visualsRow);

    const updateButtons = (queryText) => {
      const q = queryText.trim().toLowerCase();
      const filtered = sorted.filter(c => {
        if (!q) return true;
        return c.name.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q);
      });

      if (filtered.length === 0) {
        scrollContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:8px; color:var(--text-muted); font-size:12px;">Страны не найдены 🔍</div>`;
        return;
      }

      scrollContainer.innerHTML = filtered.map(c => {
        const attemptIdx = this.guessedCodes.indexOf(c.code);
        const isUsed = attemptIdx !== -1;
        const badgeHTML = isUsed ? `<span class="fd-checked-badge">#${attemptIdx + 1}</span>` : '';
        return `
          <button type="button" class="facts-country-btn ${isUsed ? 'is-checked' : ''}" data-code="${c.code}" ${isUsed ? 'disabled' : ''}>
            <img src="${getFlagUrl(c.code)}" alt="" loading="lazy">
            <span class="fd-country-btn-name">${c.name}</span>
            ${badgeHTML}
          </button>
        `;
      }).join('');
    };

    updateButtons(this.searchQuery);

    if (searchInput) {
      searchInput.addEventListener('focus', () => {
        if (this.keyboardBlurTimer) {
          clearTimeout(this.keyboardBlurTimer);
          this.keyboardBlurTimer = null;
        }
        if (gameScreen) {
          gameScreen.classList.add('search-keyboard-active');
        }
        if (searchSection && typeof searchSection.scrollIntoView === 'function') {
          setTimeout(() => {
            searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 60);
        }
      });

      searchInput.addEventListener('blur', () => {
        this.keyboardBlurTimer = setTimeout(() => {
          if (gameScreen) {
            gameScreen.classList.remove('search-keyboard-active');
          }
        }, 180);
      });

      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        updateButtons(this.searchQuery);
      });
    }

    if (scrollContainer) {
      scrollContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.facts-country-btn');
        if (btn && !btn.disabled && btn.dataset.code) {
          if (this.keyboardBlurTimer) {
            clearTimeout(this.keyboardBlurTimer);
            this.keyboardBlurTimer = null;
          }
          if (gameScreen) {
            gameScreen.classList.remove('search-keyboard-active');
          }
          this.searchQuery = '';
          this.handleGuess(btn.dataset.code);
        }
      });
    }
  },

  renderRoundUI() {
    this.updateHeaderStats();
    this.renderQuestionDossier();
    this.renderAnswersList();
  },

  handleGuess(code) {
    if (this.isRoundOver || this.guessedCodes.includes(code)) return;

    const pool = typeof DB !== 'undefined' ? DB : [];
    const guessed = pool.find(c => c.code === code);
    if (!guessed) return;

    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) gameScreen.classList.remove('search-keyboard-active');

    this.guessedCodes.push(code);

    if (guessed.code === this.targetCountry.code) {
      this.finishRound(true);
      return;
    }

    this.wrongAttempts += 1;
    this.attemptsHistory.push({
      country: guessed,
      attemptNum: this.wrongAttempts
    });
    // Автоматически переключаемся на самую последнюю попытку
    this.viewedAttemptIndex = this.attemptsHistory.length - 1;

    if (this.wrongAttempts >= this.maxAttempts) {
      this.finishRound(false);
      return;
    }

    this.updateHeaderStats();
    this.renderQuestionDossier();
    this.renderAnswersList();
  },

  // БЛОК 5: Супер-компактный одноэкранный финал в «Правда / Ложь» без вертикального скролла
  finishRound(isWin) {
    this.isRoundOver = true;
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) gameScreen.classList.remove('search-keyboard-active');

    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const earnedPoints = isWin ? this.getCurrentPotentialPoints() : 0;
    const earnedCoins = earnedPoints;
    const earnedStars = isWin ? (diff === 'hard' ? 15 : (diff === 'normal' ? 10 : 5)) : 0;
    this.lastAwardedScore = earnedPoints;

    if (typeof userProfile !== 'undefined') {
      userProfile.coins += earnedCoins;
      userProfile.stars += earnedStars;
      userProfile.gamesPlayed += 1;
      userProfile.save();
    }

    this.updateHeaderStats();

    const c = this.targetCountry;
    const leaderImg = (typeof getLeaderImage === 'function') ? getLeaderImage(c.code) : null;
    const foodImg = (typeof getFoodImage === 'function') ? getFoodImage(c.code) : null;
    const mapSVG = (typeof MapsGame !== 'undefined' && typeof MapsGame.renderMapSVG === 'function')
      ? MapsGame.renderMapSVG(c, 'normal')
      : '';

    const usedTries = isWin ? (this.wrongAttempts + 1) : this.maxAttempts;
    const bannerTitle = isWin
      ? `🎉 Угадано с ${usedTries}-й попытки! (+${earnedPoints} очк.)`
      : `❌ 10 попыток позади! Загадана: ${c.name}`;
    const bannerSub = isWin
      ? `Награда: +${earnedCoins} 🪙 • +${earnedStars} ⭐`
      : `Изучите экспресс-досье загаданной страны:`;

    const questionBox = document.getElementById('question-box');
    if (questionBox) {
      questionBox.innerHTML = `
        <div class="fd-final-screen">
          <!-- Компактная шапка результата -->
          <div class="fd-final-banner ${isWin ? 'win' : 'lose'}">
            <h3>${bannerTitle}</h3>
            <p>${bannerSub}</p>
          </div>

          <!-- Плотная плашка страны -->
          <div class="fd-final-country-badge">
            <div class="fd-final-flag">
              <img src="${getFlagUrl(c.code)}" alt="${c.name}">
            </div>
            <div class="fd-final-country-meta">
              <h2>${c.name}</h2>
              <div class="fd-final-country-sub">
                ${c.continent} • ${c.isUN ? 'Член ООН' : 'Не в ООН'} • ${c.isMainland ? '🌍 Материк' : '🏝️ Остров'}
              </div>
            </div>
          </div>

          <!-- Сетка из 6 мини-плиток (включая Температуру 2025 и Соседей) -->
          <div class="fd-final-stats-2x2">
            <div class="fd-final-stat-tile">
              <span>Столица</span>
              <strong>🏛️ ${c.capital}</strong>
            </div>
            <div class="fd-final-stat-tile">
              <span>Площадь</span>
              <strong>📐 ${c.areaFormatted || `${c.area} км²`}</strong>
            </div>
            <div class="fd-final-stat-tile">
              <span>Население</span>
              <strong>👥 ${c.population} млн</strong>
            </div>
            <div class="fd-final-stat-tile">
              <span>Регионы / Миллионники</span>
              <strong>🗺️ ${c.regionsCount} / 🏙️ ${c.millionCitiesCount}</strong>
            </div>
            <div class="fd-final-stat-tile">
              <span>Температура (2025)</span>
              <strong>🌡️ ${c.temp2025Formatted || `${c.temp2025} °C`}</strong>
            </div>
            <div class="fd-final-stat-tile">
              <span>Сухопутные соседи (${c.neighborsCount || 0})</span>
              <strong title="${(c.neighborNames && c.neighborNames.length) ? c.neighborNames.join(', ') : 'Нет сухопутных границ'}">🤝 ${(c.neighborNames && c.neighborNames.length) ? c.neighborNames.join(', ') : 'Нет (остров)'}</strong>
            </div>
          </div>

          <!-- Горизонтальный ряд из 3 мини-блоков (Глава | Контур 10m | Блюдо) -->
          <div class="fd-final-visuals-3col">
            <div class="fd-final-vis-box" data-zoom-final="leader" style="cursor:pointer;" title="Нажмите, чтобы увеличить">
              <span class="fd-final-vis-label">👤 Глава</span>
              <div class="fd-final-vis-media">
                ${leaderImg
                  ? `<img src="${leaderImg}" alt="${c.leader}" onerror="this.parentElement.innerHTML='<span>👤</span>';">`
                  : `<span>👤</span>`
                }
              </div>
              <div class="fd-final-vis-caption">${c.leader}</div>
            </div>

            <div class="fd-final-vis-box" id="facts-final-atlas-btn" style="cursor:pointer;" title="Нажмите, чтобы открыть на карте мира">
              <span class="fd-final-vis-label">🗺️ Контур 10m</span>
              <div class="fd-final-vis-media">
                ${mapSVG || '<span>🗺️</span>'}
              </div>
              <div class="fd-final-vis-caption">🔍 На карте</div>
            </div>

            <div class="fd-final-vis-box" data-zoom-final="food" style="cursor:pointer;" title="Нажмите, чтобы увеличить">
              <span class="fd-final-vis-label">🍲 Блюдо</span>
              <div class="fd-final-vis-media">
                ${foodImg
                  ? `<img src="${foodImg}" alt="${c.food.name}" onerror="this.parentElement.innerHTML='<span>🍲</span>';">`
                  : `<span>🍲</span>`
                }
              </div>
              <div class="fd-final-vis-caption">${c.food.name}</div>
            </div>
          </div>
        </div>
      `;

      const openAtlasBtn = document.getElementById('facts-final-atlas-btn');
      if (openAtlasBtn) {
        openAtlasBtn.addEventListener('click', () => {
          if (typeof MapsGame !== 'undefined') {
            MapsGame.openFullscreenAtlas(c.code);
          }
        });
      }

      questionBox.querySelectorAll('[data-zoom-final]').forEach(box => {
        box.addEventListener('click', () => {
          const slot = box.getAttribute('data-zoom-final');
          if (slot) this.openVisualZoom(slot);
        });
      });
    }

    const answersGrid = document.getElementById('answers-grid');
    if (answersGrid) {
      answersGrid.className = 'answers-grid facts-final-actions';
      answersGrid.innerHTML = `
        <button type="button" class="action-btn retry-btn" id="facts-more-btn">🔄 Ещё</button>
        <button type="button" class="action-btn home-btn" id="facts-menu-btn">🏠 В меню</button>
      `;

      const moreBtn = document.getElementById('facts-more-btn');
      const menuBtn = document.getElementById('facts-menu-btn');
      if (moreBtn) {
        moreBtn.addEventListener('click', () => {
          this.start();
        });
      }
      if (menuBtn) {
        menuBtn.addEventListener('click', () => {
          this.exit();
        });
      }
    }
  },

  exit() {
    this.usedCountryCodes = [];
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
      gameScreen.classList.remove('search-keyboard-active');
      gameScreen.style.display = 'none';
    }
    document.getElementById('results-modal').style.display = 'none';
    document.querySelector('.main-screen').style.display = 'block';
    document.querySelector('.top-bar').style.display = 'flex';
  }
};

// ================= НОВЫЙ РЕЖИМ «СОСЕДИ» (NeighborsGame) =================
const NeighborsGame = {
  questions: [],
  currentIndex: 0,
  totalQuestions: 10,
  score: 0,
  isQuestionDone: false,
  searchQuery: '',
  keyboardBlurTimer: null,

  // Состояние текущего вопроса:
  guessedNeighbors: [], // для easy: массив уже угаданных кодов соседей
  wrongPicks: [],       // для easy: массив ошибочно выбранных кодов
  currentMistakes: 0,   // для easy: число ошибок в текущем вопросе

  // Для normal и hard:
  dynamicSlots: [''],   // массив кодов стран в созданных игроком слотах ('' = пустой слот)
  activeSlotIndex: 0,   // какой слот сейчас заполняется из поиска
  noNeighborsSelected: false, // выбрана ли кнопка «🏝️ Нет соседей»
  checkResult: null,    // объект с результатами проверки на normal/hard

  start() {
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const rawPool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;

    // На easy в пул попадают только страны, у которых есть хотя бы 1 сухопутный сосед
    let pool = diff === 'easy'
      ? rawPool.filter(c => Array.isArray(c.neighbors) && c.neighbors.length > 0)
      : [...rawPool];

    if (pool.length === 0 && diff === 'easy') {
      pool = DB.filter(c => Array.isArray(c.neighbors) && c.neighbors.length > 0);
    }

    if (!pool || pool.length === 0) {
      alert("Недостаточно стран по выбранным фильтрам! Включите больше регионов в настройках.");
      return;
    }

    window.lastActiveGame = NeighborsGame;
    this.totalQuestions = Math.min(10, pool.length);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    this.questions = shuffled.slice(0, this.totalQuestions);
    this.currentIndex = 0;
    this.score = 0;

    if (typeof preloadModeImages === 'function') {
      preloadModeImages('flags', this.questions);
    }

    document.querySelector('.main-screen').style.display = 'none';
    document.querySelector('.top-bar').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('results-modal').style.display = 'none';

    updateShopAndProfileUI();
    this.loadQuestion();
  },

  loadQuestion() {
    this.isQuestionDone = false;
    this.searchQuery = '';
    this.guessedNeighbors = [];
    this.wrongPicks = [];
    this.currentMistakes = 0;
    this.dynamicSlots = [''];
    this.activeSlotIndex = 0;
    this.noNeighborsSelected = false;
    this.checkResult = null;

    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) gameScreen.classList.remove('search-keyboard-active');

    this.updateHeader();
    this.renderQuestionArea();
    this.renderSearchAndControls();
  },

  updateHeader() {
    const progressEl = document.getElementById('game-progress');
    const scoreEl = document.getElementById('game-score');
    if (progressEl) {
      progressEl.textContent = `${this.currentIndex + 1} / ${this.totalQuestions}`;
    }
    if (scoreEl) {
      scoreEl.textContent = this.score;
    }
  },

  renderQuestionArea() {
    const questionBox = document.getElementById('question-box');
    if (!questionBox) return;

    const c = this.questions[this.currentIndex];
    if (!c) return;
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const codeToCountry = {};
    DB.forEach(item => { codeToCountry[item.code] = item; });

    // 1. Визуальная часть (зависит от сложности)
    let visualPartHTML = '';
    if (diff === 'easy') {
      const mapSVG = (typeof MapsGame !== 'undefined' && typeof MapsGame.renderMapSVG === 'function')
        ? MapsGame.renderMapSVG(c, 'easy')
        : '';
      visualPartHTML = `
        <div class="nb-target-header">
          <img src="${getFlagUrl(c.code)}" alt="${c.name}" class="nb-target-flag">
          <div class="nb-target-titles">
            <span class="nb-mode-tag">🟢 Лёгкий • Назовите всех соседей (${c.neighbors.length})</span>
            <h3>${c.name}</h3>
          </div>
        </div>
        <div class="nb-map-box" id="nb-easy-map-box">${mapSVG}</div>
      `;
    } else if (diff === 'normal') {
      const mapSVG = (typeof MapsGame !== 'undefined' && typeof MapsGame.renderMapSVG === 'function')
        ? MapsGame.renderMapSVG(c, 'normal')
        : '';
      visualPartHTML = `
        <div class="nb-target-header">
          <div class="nb-target-titles">
            <span class="nb-mode-tag">🟡 Средний • Силуэт без флага и числа соседей</span>
            <h3>${c.name} (${c.continent})</h3>
          </div>
        </div>
        <div class="nb-map-box nb-silhouette-box">${mapSVG}</div>
      `;
    } else {
      visualPartHTML = `
        <div class="nb-target-header nb-hard-header">
          <div class="nb-target-titles">
            <span class="nb-mode-tag">🔴 Сложный • Только название страны</span>
            <h2 class="nb-hard-country-title">${c.name}</h2>
            <small class="nb-hard-continent">${c.continent}</small>
          </div>
        </div>
      `;
    }

    // 2. Слоты соседей
    let slotsHTML = '';
    if (diff === 'easy') {
      const total = c.neighbors.length;
      const items = [];
      for (let i = 0; i < total; i++) {
        const gCode = this.guessedNeighbors[i];
        if (gCode && codeToCountry[gCode]) {
          const nb = codeToCountry[gCode];
          items.push(`
            <div class="nb-slot filled-correct">
              <img src="${getFlagUrl(nb.code)}" alt="">
              <span>${nb.name}</span>
              <strong class="nb-slot-mark">✓</strong>
            </div>
          `);
        } else if (this.isQuestionDone) {
          // Если нажали «Показать ответ», показываем оставшихся соседей
          const missedCodes = c.neighbors.filter(code => !this.guessedNeighbors.includes(code));
          const mCode = missedCodes[i - this.guessedNeighbors.length];
          const nb = mCode ? codeToCountry[mCode] : null;
          items.push(`
            <div class="nb-slot filled-missed">
              ${nb ? `<img src="${getFlagUrl(nb.code)}" alt=""><span>${nb.name}</span>` : `<span>—</span>`}
              <strong class="nb-slot-mark">!</strong>
            </div>
          `);
        } else {
          items.push(`
            <div class="nb-slot empty-slot">
              <span>🔒 Сосед #${i + 1}</span>
            </div>
          `);
        }
      }
      slotsHTML = `
        <div class="nb-slots-header">
          <span>Сухопутные соседи: <strong>${this.guessedNeighbors.length} из ${total}</strong></span>
          ${this.currentMistakes > 0 ? `<span class="nb-mistakes-pill">Ошибок: ${this.currentMistakes}</span>` : ''}
        </div>
        <div class="nb-slots-grid">${items.join('')}</div>
      `;
    } else {
      // На normal и hard: динамические слоты или режим «Нет соседей»
      if (!this.isQuestionDone) {
        if (this.noNeighborsSelected) {
          slotsHTML = `
            <div class="nb-no-neighbors-banner active">
              🏝️ Выбрано: <strong>У этой страны нет сухопутных соседей (0 границ)</strong>
            </div>
          `;
        } else {
          const slotCards = this.dynamicSlots.map((slotCode, idx) => {
            const isActive = idx === this.activeSlotIndex;
            const countryObj = slotCode ? codeToCountry[slotCode] : null;
            return `
              <div class="nb-slot dynamic-slot ${isActive ? 'active-target-slot' : ''} ${countryObj ? 'has-country' : ''}" data-slot-idx="${idx}">
                ${countryObj
                  ? `<img src="${getFlagUrl(countryObj.code)}" alt=""><span>${countryObj.name}</span>`
                  : `<span>🔍 Слот #${idx + 1}: выберите страну ниже...</span>`
                }
                <button type="button" class="nb-slot-remove" data-remove-slot="${idx}" title="Удалить слот">✕</button>
              </div>
            `;
          }).join('');
          slotsHTML = `
            <div class="nb-slots-header">
              <span>Добавлено стран-соседей: <strong>${this.dynamicSlots.filter(Boolean).length}</strong></span>
              <small>Нажмите «➕ Ещё слот» или «🏝️ Нет соседей»</small>
            </div>
            <div class="nb-slots-grid">${slotCards}</div>
          `;
        }
      } else if (this.checkResult) {
        // Отображение результата проверки на normal / hard
        const res = this.checkResult;
        const resultBadges = [];

        if (c.neighbors.length === 0) {
          if (res.isPerfect) {
            resultBadges.push(`<div class="nb-slot filled-correct"><span>🏝️ Верно! Сухопутных соседей нет (0)</span><strong class="nb-slot-mark">✓</strong></div>`);
          } else {
            resultBadges.push(`<div class="nb-slot filled-wrong"><span>🏝️ На самом деле у страны 0 сухопутных соседей!</span><strong class="nb-slot-mark">✕</strong></div>`);
          }
        }

        res.correctCodes.forEach(code => {
          const nb = codeToCountry[code];
          if (nb) {
            resultBadges.push(`
              <div class="nb-slot filled-correct">
                <img src="${getFlagUrl(nb.code)}" alt="">
                <span>${nb.name}</span>
                <strong class="nb-slot-mark">✓</strong>
              </div>
            `);
          }
        });

        res.wrongCodes.forEach(code => {
          const nb = codeToCountry[code];
          if (nb) {
            resultBadges.push(`
              <div class="nb-slot filled-wrong">
                <img src="${getFlagUrl(nb.code)}" alt="">
                <span>${nb.name} (не сосед)</span>
                <strong class="nb-slot-mark">✕</strong>
              </div>
            `);
          }
        });

        res.missedCodes.forEach(code => {
          const nb = codeToCountry[code];
          if (nb) {
            resultBadges.push(`
              <div class="nb-slot filled-missed">
                <img src="${getFlagUrl(nb.code)}" alt="">
                <span>${nb.name} (пропущено)</span>
                <strong class="nb-slot-mark">!</strong>
              </div>
            `);
          }
        });

        slotsHTML = `
          <div class="nb-result-summary ${res.isPerfect ? 'win' : 'lose'}">
            ${res.summaryText}
          </div>
          <div class="nb-slots-grid">${resultBadges.join('')}</div>
        `;
      }
    }

    questionBox.innerHTML = `
      <div class="neighbors-game-box">
        ${visualPartHTML}
        ${slotsHTML}
      </div>
    `;

    // На easy подсвечиваем на карте уже угаданных соседей зеленым цветом
    if (diff === 'easy') {
      const mapBox = document.getElementById('nb-easy-map-box');
      if (mapBox) {
        const codesToHighlight = this.isQuestionDone ? c.neighbors : this.guessedNeighbors;
        codesToHighlight.forEach(nCode => {
          mapBox.querySelectorAll(`.map-neighbor-path[data-neighbor-code="${nCode}"]`).forEach(pathEl => {
            pathEl.classList.add('guessed-neighbor');
          });
        });
      }
    }

    // Привязка переключения и удаления слотов на normal / hard
    if (diff !== 'easy' && !this.isQuestionDone) {
      questionBox.querySelectorAll('.dynamic-slot[data-slot-idx]').forEach(slotEl => {
        slotEl.addEventListener('click', (e) => {
          if (e.target.closest('[data-remove-slot]')) return;
          this.activeSlotIndex = parseInt(slotEl.getAttribute('data-slot-idx'), 10);
          this.noNeighborsSelected = false;
          this.renderQuestionArea();
        });
      });

      questionBox.querySelectorAll('[data-remove-slot]').forEach(rmBtn => {
        rmBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rmIdx = parseInt(rmBtn.getAttribute('data-remove-slot'), 10);
          if (this.dynamicSlots.length <= 1) {
            this.dynamicSlots = [''];
            this.activeSlotIndex = 0;
          } else {
            this.dynamicSlots.splice(rmIdx, 1);
            this.activeSlotIndex = Math.max(0, Math.min(this.activeSlotIndex, this.dynamicSlots.length - 1));
          }
          this.renderQuestionArea();
          this.renderSearchAndControls();
        });
      });
    }
  },

  renderSearchAndControls() {
    const answersGrid = document.getElementById('answers-grid');
    if (!answersGrid) return;

    const c = this.questions[this.currentIndex];
    if (!c) return;
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';

    if (this.isQuestionDone) {
      answersGrid.className = 'answers-grid nb-done-actions';
      const isLast = this.currentIndex >= this.totalQuestions - 1;
      answersGrid.innerHTML = `
        <button type="button" class="action-btn retry-btn nb-next-btn" id="nb-next-btn">
          ${isLast ? '🏁 Завершить раунд' : 'Дальше ➔'}
        </button>
      `;
      const nextBtn = document.getElementById('nb-next-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (this.currentIndex + 1 < this.totalQuestions) {
            this.currentIndex += 1;
            this.loadQuestion();
          } else {
            this.finishRound();
          }
        });
      }
      return;
    }

    answersGrid.className = 'answers-grid facts-answers-panel nb-answers-panel';
    const sortedCountries = [...DB]
      .filter(item => item.code !== c.code)
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

    const controlsRowHTML = diff === 'easy'
      ? `
        <div class="nb-controls-bar">
          <button type="button" class="nb-ctrl-btn giveup" id="nb-giveup-btn">🏳️ Показать всех соседей</button>
        </div>
      `
      : `
        <div class="nb-controls-bar">
          <button type="button" class="nb-ctrl-btn add-slot" id="nb-add-slot-btn">➕ Добавить слот</button>
          <button type="button" class="nb-ctrl-btn no-nb ${this.noNeighborsSelected ? 'active' : ''}" id="nb-zero-btn">🏝️ Нет соседей</button>
          <button type="button" class="nb-ctrl-btn submit-nb" id="nb-submit-btn">✅ Проверить</button>
        </div>
      `;

    answersGrid.innerHTML = `
      ${controlsRowHTML}
      <div class="fd-search-section" id="nb-search-section">
        <input type="text" class="facts-search-input" id="nb-country-search" placeholder="🔍 Поиск страны-соседа..." value="${this.searchQuery}" autocomplete="off">
        <div class="facts-countries-scroll" id="nb-countries-scroll"></div>
      </div>
    `;

    const gameScreen = document.getElementById('game-screen');
    const searchInput = document.getElementById('nb-country-search');
    const scrollContainer = document.getElementById('nb-countries-scroll');

    const updateButtons = (qText) => {
      const q = qText.trim().toLowerCase();
      const filtered = sortedCountries.filter(item => {
        if (!q) return true;
        return item.name.toLowerCase().includes(q) || item.capital.toLowerCase().includes(q);
      });

      if (filtered.length === 0) {
        scrollContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:8px; color:var(--text-muted); font-size:12px;">Страны не найдены 🔍</div>`;
        return;
      }

      scrollContainer.innerHTML = filtered.map(item => {
        if (diff === 'easy') {
          const isGuessed = this.guessedNeighbors.includes(item.code);
          const isWrong = this.wrongPicks.includes(item.code);
          const disabled = isGuessed || isWrong;
          const badge = isGuessed
            ? `<span class="fd-checked-badge" style="color:#22c55e;">✓</span>`
            : (isWrong ? `<span class="fd-checked-badge" style="color:#ef4444;">✕</span>` : '');
          return `
            <button type="button" class="facts-country-btn ${disabled ? 'is-checked' : ''}" data-code="${item.code}" ${disabled ? 'disabled' : ''}>
              <img src="${getFlagUrl(item.code)}" alt="" loading="lazy">
              <span class="fd-country-btn-name">${item.name}</span>
              ${badge}
            </button>
          `;
        } else {
          const usedInSlot = this.dynamicSlots.includes(item.code);
          const badge = usedInSlot ? `<span class="fd-checked-badge">В слоте</span>` : '';
          return `
            <button type="button" class="facts-country-btn ${usedInSlot ? 'is-checked' : ''}" data-code="${item.code}" ${usedInSlot ? 'disabled' : ''}>
              <img src="${getFlagUrl(item.code)}" alt="" loading="lazy">
              <span class="fd-country-btn-name">${item.name}</span>
              ${badge}
            </button>
          `;
        }
      }).join('');
    };

    updateButtons(this.searchQuery);

    if (searchInput) {
      searchInput.addEventListener('focus', () => {
        if (this.keyboardBlurTimer) {
          clearTimeout(this.keyboardBlurTimer);
          this.keyboardBlurTimer = null;
        }
        if (gameScreen) gameScreen.classList.add('search-keyboard-active');
      });
      searchInput.addEventListener('blur', () => {
        this.keyboardBlurTimer = setTimeout(() => {
          if (gameScreen) gameScreen.classList.remove('search-keyboard-active');
        }, 180);
      });
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        updateButtons(this.searchQuery);
      });
    }

    if (scrollContainer) {
      scrollContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.facts-country-btn');
        if (!btn || btn.disabled || !btn.dataset.code) return;
        if (this.keyboardBlurTimer) {
          clearTimeout(this.keyboardBlurTimer);
          this.keyboardBlurTimer = null;
        }
        if (gameScreen) gameScreen.classList.remove('search-keyboard-active');
        this.searchQuery = '';
        this.handleCountryPick(btn.dataset.code);
      });
    }

    // Кнопки управления
    const giveupBtn = document.getElementById('nb-giveup-btn');
    if (giveupBtn) {
      giveupBtn.addEventListener('click', () => {
        this.isQuestionDone = true;
        this.renderQuestionArea();
        this.renderSearchAndControls();
      });
    }

    const addSlotBtn = document.getElementById('nb-add-slot-btn');
    if (addSlotBtn) {
      addSlotBtn.addEventListener('click', () => {
        this.noNeighborsSelected = false;
        this.dynamicSlots.push('');
        this.activeSlotIndex = this.dynamicSlots.length - 1;
        this.renderQuestionArea();
        this.renderSearchAndControls();
      });
    }

    const zeroBtn = document.getElementById('nb-zero-btn');
    if (zeroBtn) {
      zeroBtn.addEventListener('click', () => {
        this.noNeighborsSelected = !this.noNeighborsSelected;
        if (this.noNeighborsSelected) {
          this.dynamicSlots = [];
          this.activeSlotIndex = 0;
        } else if (this.dynamicSlots.length === 0) {
          this.dynamicSlots = [''];
          this.activeSlotIndex = 0;
        }
        this.renderQuestionArea();
        this.renderSearchAndControls();
      });
    }

    const submitBtn = document.getElementById('nb-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this.validateNormalOrHard();
      });
    }
  },

  handleCountryPick(pickedCode) {
    if (this.isQuestionDone) return;
    const c = this.questions[this.currentIndex];
    if (!c) return;
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';

    if (diff === 'easy') {
      if (c.neighbors.includes(pickedCode)) {
        if (!this.guessedNeighbors.includes(pickedCode)) {
          this.guessedNeighbors.push(pickedCode);
        }
        if (this.guessedNeighbors.length >= c.neighbors.length) {
          const earned = Math.max(10, 50 - this.currentMistakes * 10);
          this.score += earned;
          this.isQuestionDone = true;
          this.updateHeader();
        }
      } else {
        if (!this.wrongPicks.includes(pickedCode)) {
          this.wrongPicks.push(pickedCode);
        }
        this.currentMistakes += 1;
      }
      this.renderQuestionArea();
      this.renderSearchAndControls();
    } else {
      // На normal и hard: помещаем выбранную страну в активный слот
      this.noNeighborsSelected = false;
      if (this.dynamicSlots.length === 0) {
        this.dynamicSlots = [pickedCode];
        this.activeSlotIndex = 0;
      } else {
        const targetIdx = Math.max(0, Math.min(this.activeSlotIndex, this.dynamicSlots.length - 1));
        this.dynamicSlots[targetIdx] = pickedCode;
        // Если есть следующий пустой слот — переключаемся на него
        const nextEmpty = this.dynamicSlots.findIndex((val, i) => i > targetIdx && !val);
        if (nextEmpty !== -1) {
          this.activeSlotIndex = nextEmpty;
        }
      }
      this.renderQuestionArea();
      this.renderSearchAndControls();
    }
  },

  validateNormalOrHard() {
    if (this.isQuestionDone) return;
    const c = this.questions[this.currentIndex];
    if (!c) return;
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';

    const submitted = this.noNeighborsSelected
      ? []
      : Array.from(new Set(this.dynamicSlots.filter(Boolean)));

    const actual = c.neighbors || [];
    const correctCodes = submitted.filter(code => actual.includes(code));
    const wrongCodes = submitted.filter(code => !actual.includes(code));
    const missedCodes = actual.filter(code => !submitted.includes(code));

    const isPerfect = (correctCodes.length === actual.length) && (wrongCodes.length === 0);
    const maxPts = diff === 'hard' ? 150 : 100;
    let earned = 0;

    if (isPerfect) {
      earned = maxPts;
    } else if (actual.length > 0 && correctCodes.length > 0) {
      const ratio = Math.max(0, (correctCodes.length - wrongCodes.length) / actual.length);
      earned = Math.round(maxPts * ratio * 0.5);
    }

    this.score += earned;
    this.isQuestionDone = true;

    const summaryText = isPerfect
      ? `🎉 Идеально! Все соседи указаны верно (+${earned} очк.)`
      : `Угадано: ${correctCodes.length} из ${actual.length} • Ошибок: ${wrongCodes.length} (+${earned} очк.)`;

    this.checkResult = {
      isPerfect,
      correctCodes,
      wrongCodes,
      missedCodes,
      summaryText
    };

    this.updateHeader();
    this.renderQuestionArea();
    this.renderSearchAndControls();
  },

  finishRound() {
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const earnedCoins = Math.max(10, Math.round(this.score * 0.6));
    const earnedStars = this.score > 0 ? (diff === 'hard' ? 15 : (diff === 'normal' ? 10 : 5)) : 0;

    if (typeof userProfile !== 'undefined') {
      userProfile.coins += earnedCoins;
      userProfile.stars += earnedStars;
      userProfile.gamesPlayed += 1;
      userProfile.save();
    }

    document.getElementById('final-score').textContent = this.score;
    document.getElementById('final-coins').textContent = `+${earnedCoins} 🪙`;
    document.getElementById('final-stars').textContent = `+${earnedStars} ⭐`;
    document.getElementById('results-modal').style.display = 'flex';
  },

  exit() {
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
      gameScreen.classList.remove('search-keyboard-active');
      gameScreen.style.display = 'none';
    }
    document.getElementById('results-modal').style.display = 'none';
    document.querySelector('.main-screen').style.display = 'block';
    document.querySelector('.top-bar').style.display = 'flex';
  }
};

// Глобальный быстрый словарь стран по ISO-коду
const codeToCountry = {};
if (typeof DB !== 'undefined' && Array.isArray(DB)) {
  DB.forEach(item => { codeToCountry[item.code] = item; });
}

// ================= НОВЫЙ РЕЖИМ «ТЕМПЕРАТУРА» (TemperatureGame — данные 2025) =================
const ALL_CONTINENTS_LIST = [
  'Европа',
  'Азия',
  'Африка',
  'Северная Америка',
  'Южная Америка',
  'Австралия и Океания'
];

const TemperatureGame = {
  questions: [],
  currentIndex: 0,
  totalQuestions: 10,
  score: 0,
  isAnswered: false,
  selectedContinent: null,
  selectedCode: null,
  currentRange: null, // для normal: { min, max, label }
  d3ZoomInstance: null,
  worldProjection: null,
  atlasWidth: 640,
  atlasHeight: 300,

  getCountry(code) {
    if (!code) return null;
    if (codeToCountry[code]) return codeToCountry[code];
    return (typeof DB !== 'undefined' ? DB.find(item => item.code === code) : null) || null;
  },

  getClimateBadge(temp) {
    if (temp < 0) return '❄️ Морозный / Субарктический пояс';
    if (temp < 8) return '🌨️ Прохладный умеренный климат';
    if (temp < 16) return '🌤️ Тёплый умеренный климат';
    if (temp < 23) return '☀️ Субтропический климат';
    return '🔥 Жаркий тропический / Экваториальный';
  },

  async start() {
    const pool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
    if (!pool || pool.length < 4) {
      alert("Недостаточно стран по выбранным фильтрам! Выберите больше регионов в настройках.");
      return;
    }

    if (typeof DB !== 'undefined' && Object.keys(codeToCountry).length === 0) {
      DB.forEach(item => { codeToCountry[item.code] = item; });
    }

    window.lastActiveGame = TemperatureGame;
    this.totalQuestions = Math.min(10, pool.length);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    this.questions = shuffled.slice(0, this.totalQuestions);
    this.currentIndex = 0;
    this.score = 0;

    document.querySelector('.main-screen').style.display = 'none';
    document.querySelector('.top-bar').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('results-modal').style.display = 'none';

    const questionBox = document.getElementById('question-box');
    const answersGrid = document.getElementById('answers-grid');
    if (answersGrid) answersGrid.innerHTML = '';
    if (questionBox) {
      questionBox.innerHTML = `
        <div style="text-align:center; padding: 24px;">
          <div style="font-size: 36px; margin-bottom: 8px;">🌍</div>
          <div style="color: var(--text-muted); font-size: 13px; font-weight: 700;">Загрузка интерактивного атласа...</div>
        </div>
      `;
    }

    if (typeof MapsGame !== 'undefined' && typeof MapsGame.initAtlas === 'function') {
      await MapsGame.initAtlas();
    }

    updateShopAndProfileUI();
    this.loadQuestion();
  },

  loadQuestion() {
    this.isAnswered = false;
    this.selectedContinent = null;
    this.selectedCode = null;

    const c = this.questions[this.currentIndex];
    if (!c) return;
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';

    if (diff === 'normal') {
      const filtered = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
      const pool = (filtered && filtered.length > 0) ? filtered : DB;
      const temps = pool.map(item => item.temp2025).filter(t => Number.isFinite(t));
      const minDBTemp = +(Math.min(...temps)).toFixed(1);
      const maxDBTemp = +(Math.max(...temps)).toFixed(1);

      let chosenMin = minDBTemp;
      let chosenMax = Math.min(maxDBTemp, +(minDBTemp + 3.0).toFixed(1));
      let matches = [];

      for (let attempt = 0; attempt < 60; attempt++) {
        const span = +(2.0 + Math.random() * 2.0).toFixed(1); // разброс от 2.0 до 4.0 °C
        const maxPossibleMin = Math.max(minDBTemp, +(maxDBTemp - span).toFixed(1));
        let minT = +(minDBTemp + Math.random() * (maxPossibleMin - minDBTemp)).toFixed(1);
        minT = Math.max(minDBTemp, Math.min(maxPossibleMin, minT));
        let maxT = +(minT + span).toFixed(1);
        if (maxT > maxDBTemp) {
          maxT = maxDBTemp;
          minT = Math.max(minDBTemp, +(maxT - span).toFixed(1));
        }

        const found = pool.filter(item => item.temp2025 >= minT - 1e-6 && item.temp2025 <= maxT + 1e-6);
        if (found.length > 0) {
          chosenMin = minT;
          chosenMax = maxT;
          matches = found;
          break;
        }
      }

      if (matches.length === 0) {
        const span = +(2.0 + Math.random() * 2.0).toFixed(1);
        const offset = +(Math.random() * span).toFixed(1);
        let minT = +(c.temp2025 - offset).toFixed(1);
        let maxT = +(minT + span).toFixed(1);
        if (minT < minDBTemp) {
          minT = minDBTemp;
          maxT = Math.min(maxDBTemp, +(minT + span).toFixed(1));
        }
        if (maxT > maxDBTemp) {
          maxT = maxDBTemp;
          minT = Math.max(minDBTemp, +(maxT - span).toFixed(1));
        }
        chosenMin = minT;
        chosenMax = maxT;
        matches = pool.filter(item => item.temp2025 >= chosenMin - 1e-6 && item.temp2025 <= chosenMax + 1e-6);
      }

      this.currentRange = {
        min: chosenMin,
        max: chosenMax,
        matches,
        label: `от ${formatTempC(chosenMin)} до ${formatTempC(chosenMax)}`
      };
    } else {
      this.currentRange = null;
    }

    this.updateHeader();
    this.renderUI();
  },

  updateHeader() {
    const progressEl = document.getElementById('game-progress');
    const scoreEl = document.getElementById('game-score');
    if (progressEl) progressEl.textContent = `${this.currentIndex + 1} / ${this.totalQuestions}`;
    if (scoreEl) scoreEl.textContent = this.score;
  },

  renderUI() {
    const questionBox = document.getElementById('question-box');
    const answersGrid = document.getElementById('answers-grid');
    if (!questionBox || !answersGrid) return;

    const c = this.questions[this.currentIndex];
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const refTemp = (diff === 'normal' && this.currentRange)
      ? (this.currentRange.min + this.currentRange.max) / 2
      : c.temp2025;
    const climateBadge = this.getClimateBadge(refTemp);

    let modeSubtitle = '';
    let tempReadingHTML = '';

    if (diff === 'easy') {
      modeSubtitle = '🟢 Лёгкий • Выберите континент на интерактивном атласе';
      tempReadingHTML = `
        <div class="temp-main-reading">🌡️ ${c.temp2025Formatted}</div>
        <div class="temp-climate-pill">${climateBadge}</div>
      `;
    } else if (diff === 'normal') {
      modeSubtitle = '🟡 Средний • Выберите страну на атласе в этом диапазоне';
      tempReadingHTML = `
        <div class="temp-main-reading range-reading">🌡️ ${this.currentRange.label}</div>
        <div class="temp-climate-pill">${climateBadge}</div>
      `;
    } else {
      modeSubtitle = '🔴 Сложный • Выберите страну на атласе по точной температуре (2025)';
      tempReadingHTML = `
        <div class="temp-main-reading">🌡️ ${c.temp2025Formatted}</div>
        <div class="temp-climate-pill">${climateBadge}</div>
      `;
    }

    // Быстрые кнопки континентов на лёгком или быстрый поиск для микрогосударств на среднем/сложном
    let quickHelperHTML = '';
    if (diff === 'easy') {
      quickHelperHTML = `
        <div class="temp-continent-chips" id="temp-continent-chips">
          ${ALL_CONTINENTS_LIST.map(cont => `
            <button type="button" class="temp-cont-chip" data-cont="${cont}">${cont}</button>
          `).join('')}
        </div>
      `;
    } else {
      const sortedDB = [...DB].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      quickHelperHTML = `
        <div class="temp-atlas-Select-row">
          <select id="temp-atlas-country-select" class="temp-atlas-select">
            <option value="">🔍 Нажмите на страну на карте или выберите из списка...</option>
            ${sortedDB.map(item => `<option value="${item.code}">${item.name}</option>`).join('')}
          </select>
        </div>
      `;
    }

    questionBox.innerHTML = `
      <div class="temp-game-box">
        <span class="nb-mode-tag">${modeSubtitle}</span>
        <div class="temp-thermometer-card compact-temp-card">
          ${tempReadingHTML}
        </div>
        ${quickHelperHTML}
        <div class="temp-atlas-wrapper" id="temp-atlas-wrapper">
          <div class="temp-atlas-map-stage" id="temp-atlas-map-stage"></div>
          <div class="temp-atlas-zoom-controls">
            <button type="button" class="temp-zoom-btn" id="temp-zoom-in" title="Приблизить">＋</button>
            <button type="button" class="temp-zoom-btn" id="temp-zoom-out" title="Отдалить">－</button>
            <button type="button" class="temp-zoom-btn" id="temp-zoom-reset" title="Весь мир">🌍</button>
          </div>
        </div>
      </div>
    `;

    answersGrid.className = 'answers-grid temp-confirm-panel';
    this.renderBottomBar();
    this.renderInteractiveAtlas();
    this.bindHelperEvents();
  },

  bindHelperEvents() {
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    if (diff === 'easy') {
      const chipsWrap = document.getElementById('temp-continent-chips');
      if (chipsWrap) {
        chipsWrap.querySelectorAll('.temp-cont-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            if (this.isAnswered) return;
            const cont = chip.getAttribute('data-cont');
            this.selectContinentOnAtlas(cont);
          });
        });
      }
    } else {
      const selectEl = document.getElementById('temp-atlas-country-select');
      if (selectEl) {
        selectEl.addEventListener('change', (e) => {
          if (this.isAnswered) return;
          const code = e.target.value;
          if (code) {
            this.selectCountryOnAtlas(code, true);
          }
        });
      }
    }
  },

  renderInteractiveAtlas() {
    const stage = document.getElementById('temp-atlas-map-stage');
    if (!stage || typeof d3 === 'undefined' || typeof MapsGame === 'undefined') return;

    if (!MapsGame.isAtlasLoaded || !MapsGame.allFeaturesList || MapsGame.allFeaturesList.length === 0) {
      MapsGame.initAtlas();
    }

    const width = 640;
    const height = 300;
    this.atlasWidth = width;
    this.atlasHeight = height;

    const proj = d3.geoNaturalEarth1().precision(0.01);
    proj.fitExtent([[10, 10], [width - 10, height - 10]], { type: "Sphere" });
    this.worldProjection = proj;

    const pathGen = d3.geoPath().projection(proj);
    if (typeof pathGen.digits === 'function') pathGen.digits(2);
    const spherePath = pathGen({ type: "Sphere" }) || '';
    const graticulePath = pathGen(d3.geoGraticule().step([20, 20])()) || '';

    const features = MapsGame.allFeaturesList || [];
    const countriesHTML = features.map(f => {
      const code = f.properties && f.properties.code ? f.properties.code : '';
      const countryObj = this.getCountry(code);
      const cont = countryObj ? countryObj.continent : '';
      const d = pathGen(f);
      if (!d) return '';
      return `<path class="temp-atlas-country" vector-effect="non-scaling-stroke" data-code="${code}" data-continent="${cont}" d="${d}" />`;
    }).join('');

    stage.innerHTML = `
      <svg class="temp-atlas-svg" id="temp-atlas-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="touch-action: none; cursor: grab;">
        <g id="temp-atlas-zoom-group">
          <path d="${spherePath}" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255,255,255,0.16)" stroke-width="1" vector-effect="non-scaling-stroke" />
          <path d="${graticulePath}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" vector-effect="non-scaling-stroke" />
          <g id="temp-atlas-countries-layer">${countriesHTML}</g>
          <g id="temp-atlas-beacon-layer"></g>
        </g>
      </svg>
    `;

    const svgEl = document.getElementById('temp-atlas-svg');
    const zoomGroup = d3.select('#temp-atlas-zoom-group');

    this.d3ZoomInstance = d3.zoom()
      .scaleExtent([1, 40])
      .translateExtent([[-width * 0.5, -height * 0.5], [width * 1.5, height * 1.5]])
      .on('zoom', (event) => {
        zoomGroup.attr('transform', event.transform);
        const k = event.transform.k;
        const beacon = document.getElementById('temp-atlas-beacon');
        if (beacon && beacon.dataset.px && beacon.dataset.py) {
          beacon.setAttribute(
            'transform',
            `translate(${beacon.dataset.px}, ${beacon.dataset.py}) scale(${1 / Math.pow(k, 0.75)})`
          );
        }
      });

    d3.select(svgEl).call(this.d3ZoomInstance);

    const zoomInBtn = document.getElementById('temp-zoom-in');
    const zoomOutBtn = document.getElementById('temp-zoom-out');
    const zoomResetBtn = document.getElementById('temp-zoom-reset');

    if (zoomInBtn) {
      zoomInBtn.onclick = (e) => {
        e.stopPropagation();
        d3.select(svgEl).transition().duration(250).call(this.d3ZoomInstance.scaleBy, 1.8);
      };
    }
    if (zoomOutBtn) {
      zoomOutBtn.onclick = (e) => {
        e.stopPropagation();
        d3.select(svgEl).transition().duration(250).call(this.d3ZoomInstance.scaleBy, 1 / 1.8);
      };
    }
    if (zoomResetBtn) {
      zoomResetBtn.onclick = (e) => {
        e.stopPropagation();
        d3.select(svgEl).transition().duration(350).call(this.d3ZoomInstance.transform, d3.zoomIdentity);
      };
    }

    // Надёжная обработка клика и тапа по стране на карте (без ложных срабатываний при перетаскивании карты)
    let pointerDownPos = null;
    svgEl.addEventListener('pointerdown', (e) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    svgEl.addEventListener('pointerup', (e) => {
      if (this.isAnswered || !pointerDownPos) return;
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      pointerDownPos = null;
      if (dist > 7) return; // это было перетаскивание карты, а не клик

      const pathEl = e.target.closest('.temp-atlas-country');
      if (!pathEl || !pathEl.dataset.code) return;

      const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
      const clickedCode = pathEl.dataset.code;
      const clickedCountry = this.getCountry(clickedCode);
      if (!clickedCountry) return;

      if (diff === 'easy') {
        this.selectContinentOnAtlas(clickedCountry.continent);
      } else {
        this.selectCountryOnAtlas(clickedCode, false);
      }
    });
  },

  selectContinentOnAtlas(continentName) {
    if (this.isAnswered || !continentName) return;
    this.selectedContinent = continentName;

    const stage = document.getElementById('temp-atlas-map-stage');
    if (stage) {
      stage.querySelectorAll('.temp-atlas-country').forEach(p => {
        const isMatch = p.dataset.continent === continentName;
        p.classList.toggle('selected', isMatch);
      });
    }

    const chipsWrap = document.getElementById('temp-continent-chips');
    if (chipsWrap) {
      chipsWrap.querySelectorAll('.temp-cont-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-cont') === continentName);
      });
    }

    this.renderBottomBar();
  },

  selectCountryOnAtlas(code, shouldZoom = false) {
    if (this.isAnswered || !code) return;
    this.selectedCode = code;

    const stage = document.getElementById('temp-atlas-map-stage');
    if (stage) {
      stage.querySelectorAll('.temp-atlas-country').forEach(p => {
        const isMatch = p.dataset.code === code;
        p.classList.toggle('selected', isMatch);
        if (isMatch && p.parentNode) {
          p.parentNode.appendChild(p);
        }
      });
    }

    const selectEl = document.getElementById('temp-atlas-country-select');
    if (selectEl && selectEl.value !== code) {
      selectEl.value = code;
    }

    this.placeBeaconOnCountry(code, 'selected');
    if (shouldZoom) {
      this.zoomToCountryOnTempAtlas(code);
    }

    this.renderBottomBar();
  },

  placeBeaconOnCountry(code, stateClass = 'selected') {
    const beaconLayer = document.getElementById('temp-atlas-beacon-layer');
    if (!beaconLayer || !this.worldProjection || typeof MapsGame === 'undefined') return;

    const feat = MapsGame.geoFeaturesMap ? MapsGame.geoFeaturesMap[code] : null;
    if (!feat) {
      beaconLayer.innerHTML = '';
      return;
    }

    const center = d3.geoCentroid(feat._metro || feat);
    const pt = (center && Number.isFinite(center[0])) ? this.worldProjection(center) : null;
    if (!pt) {
      beaconLayer.innerHTML = '';
      return;
    }

    const strokeColor = stateClass === 'correct' ? '#22c55e' : (stateClass === 'wrong' ? '#ef4444' : '#38bdf8');
    beaconLayer.innerHTML = `
      <g id="temp-atlas-beacon" data-px="${pt[0]}" data-py="${pt[1]}" transform="translate(${pt[0]}, ${pt[1]})">
        <circle class="atlas-beacon-ring" r="8" style="stroke: ${strokeColor};" />
        <circle class="atlas-beacon-dot" r="3.5" style="stroke: ${strokeColor};" />
      </g>
    `;
  },

  zoomToCountryOnTempAtlas(code) {
    const svgEl = document.getElementById('temp-atlas-svg');
    if (!svgEl || !this.d3ZoomInstance || !this.worldProjection || typeof MapsGame === 'undefined') return;
    const feat = MapsGame.geoFeaturesMap ? MapsGame.geoFeaturesMap[code] : null;
    if (!feat) return;

    const metro = feat._metro || feat;
    const pathGen = d3.geoPath().projection(this.worldProjection);
    let bounds = pathGen.bounds(metro);
    if (!bounds || !Number.isFinite(bounds[0][0])) return;

    if ((bounds[1][0] - bounds[0][0]) > this.atlasWidth * 0.55 && metro.geometry && metro.geometry.type === 'MultiPolygon') {
      const mainPolyFeature = {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: metro.geometry.coordinates[0] }
      };
      const mainBounds = pathGen.bounds(mainPolyFeature);
      if (mainBounds && Number.isFinite(mainBounds[0][0])) {
        bounds = mainBounds;
      }
    }

    const dx = Math.max(bounds[1][0] - bounds[0][0], 6);
    const dy = Math.max(bounds[1][1] - bounds[0][1], 6);
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(1.5, Math.min(18, 0.55 / Math.max(dx / this.atlasWidth, dy / this.atlasHeight)));
    const translate = [this.atlasWidth / 2 - scale * x, this.atlasHeight / 2 - scale * y];

    d3.select(svgEl)
      .transition()
      .duration(550)
      .call(this.d3ZoomInstance.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
  },

  renderBottomBar(feedbackHTML = '') {
    const answersGrid = document.getElementById('answers-grid');
    if (!answersGrid) return;

    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';

    if (this.isAnswered) {
      const isLast = this.currentIndex >= this.totalQuestions - 1;
      answersGrid.innerHTML = `
        <div class="temp-feedback-banner">${feedbackHTML}</div>
        <button type="button" class="action-btn retry-btn nb-next-btn" id="temp-next-btn">
          ${isLast ? '🏁 Завершить раунд' : 'Дальше ➔'}
        </button>
      `;
      const nextBtn = document.getElementById('temp-next-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (this.currentIndex + 1 < this.totalQuestions) {
            this.currentIndex += 1;
            this.loadQuestion();
          } else {
            this.finishRound();
          }
        });
      }
      return;
    }

    let statusHTML = '';
    let canConfirm = false;

    if (diff === 'easy') {
      if (this.selectedContinent) {
        canConfirm = true;
        statusHTML = `<div class="temp-selection-status active">🌍 Выбран континент: <strong>${this.selectedContinent}</strong></div>`;
      } else {
        statusHTML = `<div class="temp-selection-status">👆 Нажмите на любой континент на атласе</div>`;
      }
    } else {
      const picked = this.selectedCode ? this.getCountry(this.selectedCode) : null;
      if (picked) {
        canConfirm = true;
        statusHTML = `
          <div class="temp-selection-status active">
            <img src="${getFlagUrl(picked.code)}" alt="">
            <span>Выбрана: <strong>${picked.name}</strong></span>
          </div>
        `;
      } else {
        statusHTML = `<div class="temp-selection-status">👆 Приблизьте атлас и нажмите на страну</div>`;
      }
    }

    answersGrid.innerHTML = `
      ${statusHTML}
      <button type="button" class="temp-confirm-btn" id="temp-confirm-btn" ${canConfirm ? '' : 'disabled'}>
        ✅ Подтвердить
      </button>
    `;

    const confirmBtn = document.getElementById('temp-confirm-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.confirmSelection();
      });
    }
  },

  confirmSelection() {
    if (this.isAnswered) return;
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const c = this.questions[this.currentIndex];
    if (!c) return;

    if (diff === 'easy' && !this.selectedContinent) return;
    if (diff !== 'easy' && !this.selectedCode) return;

    this.isAnswered = true;
    const stage = document.getElementById('temp-atlas-map-stage');

    if (diff === 'easy') {
      const isCorrect = this.selectedContinent === c.continent;
      if (isCorrect) this.score += 10;

      if (stage) {
        stage.querySelectorAll('.temp-atlas-country').forEach(p => {
          p.classList.remove('selected');
          if (p.dataset.continent === c.continent) {
            p.classList.add('correct');
          } else if (p.dataset.continent === this.selectedContinent && !isCorrect) {
            p.classList.add('wrong');
          }
          if (p.dataset.code === c.code && p.parentNode) {
            p.parentNode.appendChild(p);
          }
        });
      }

      this.placeBeaconOnCountry(c.code, isCorrect ? 'correct' : 'wrong');
      this.zoomToCountryOnTempAtlas(c.code);

      const fb = isCorrect
        ? `<div class="temp-fb-box win">
             ✓ Верно! Континент: <strong>${c.continent}</strong> • Загадана:
             <img src="${getFlagUrl(c.code)}" alt=""> <strong>${c.name}</strong> (${c.temp2025Formatted})
           </div>`
        : `<div class="temp-fb-box lose">
             ✕ Вы выбрали «${this.selectedContinent}». Правильный континент: <strong>${c.continent}</strong>
             (<img src="${getFlagUrl(c.code)}" alt=""> <strong>${c.name}</strong>, ${c.temp2025Formatted})
           </div>`;

      this.updateHeader();
      this.renderBottomBar(fb);
      return;
    }

    const pickedCountry = this.getCountry(this.selectedCode);
    if (!pickedCountry) return;

    if (diff === 'normal' && this.currentRange) {
      const matchingCountries = DB.filter(
        item => item.temp2025 >= this.currentRange.min - 1e-6 && item.temp2025 <= this.currentRange.max + 1e-6
      );
      const matchingCodes = new Set(matchingCountries.map(item => item.code));
      const isCorrect = matchingCodes.has(pickedCountry.code);

      if (isCorrect) {
        this.score += 20;
      }

      if (stage) {
        stage.querySelectorAll('.temp-atlas-country').forEach(p => {
          p.classList.remove('selected');
          const code = p.dataset.code;
          if (matchingCodes.has(code)) {
            p.classList.add('correct');
            if (p.parentNode) p.parentNode.appendChild(p);
          } else if (code === pickedCountry.code && !isCorrect) {
            p.classList.add('wrong');
            if (p.parentNode) p.parentNode.appendChild(p);
          }
        });
      }

      this.placeBeaconOnCountry(pickedCountry.code, isCorrect ? 'correct' : 'wrong');

      // Показываем весь атлас целиком, чтобы были видны все подходящие к диапазону страны
      const svgEl = document.getElementById('temp-atlas-svg');
      if (svgEl && this.d3ZoomInstance) {
        d3.select(svgEl)
          .transition()
          .duration(500)
          .call(this.d3ZoomInstance.transform, d3.zoomIdentity);
      }

      const sampleMatches = matchingCountries
        .slice(0, 4)
        .map(m => `<img src="${getFlagUrl(m.code)}" alt=""> <strong>${m.name}</strong> (${m.temp2025Formatted})`)
        .join(', ');
      const moreCount = matchingCountries.length > 4 ? ` и ещё ${matchingCountries.length - 4}` : '';

      const fb = isCorrect
        ? `<div class="temp-fb-box win">
             ✓ Верно! <img src="${getFlagUrl(pickedCountry.code)}" alt="">
             <strong>${pickedCountry.name}</strong> (${pickedCountry.temp2025Formatted}) • На карте выделено стран в диапазоне: <strong>${matchingCountries.length}</strong>
           </div>`
        : `<div class="temp-fb-box lose">
             ✕ У <img src="${getFlagUrl(pickedCountry.code)}" alt=""> <strong>${pickedCountry.name}</strong> ${pickedCountry.temp2025Formatted}.
             Подходят (${matchingCountries.length}): ${sampleMatches}${moreCount}
           </div>`;

      this.updateHeader();
      this.renderBottomBar(fb);
      return;
    }

    const isCorrect = (pickedCountry.code === c.code) || (Math.abs(pickedCountry.temp2025 - c.temp2025) < 0.05);
    if (isCorrect) {
      this.score += 30;
    }

    if (stage) {
      stage.querySelectorAll('.temp-atlas-country').forEach(p => {
        p.classList.remove('selected');
        if (isCorrect && p.dataset.code === pickedCountry.code) {
          p.classList.add('correct');
          if (p.parentNode) p.parentNode.appendChild(p);
        } else if (!isCorrect) {
          if (p.dataset.code === pickedCountry.code) {
            p.classList.add('wrong');
          }
          if (p.dataset.code === c.code) {
            p.classList.add('correct');
            if (p.parentNode) p.parentNode.appendChild(p);
          }
        }
      });
    }

    const focusCode = isCorrect ? pickedCountry.code : c.code;
    this.placeBeaconOnCountry(focusCode, isCorrect ? 'correct' : 'wrong');
    this.zoomToCountryOnTempAtlas(focusCode);

    let fb = '';
    if (isCorrect) {
      fb = `
        <div class="temp-fb-box win">
          ✓ Верно! <img src="${getFlagUrl(pickedCountry.code)}" alt="">
          <strong>${pickedCountry.name}</strong> (${pickedCountry.temp2025Formatted})
        </div>
      `;
    } else {
      fb = `
        <div class="temp-fb-box lose">
          ✕ у <img src="${getFlagUrl(pickedCountry.code)}" alt=""> <strong>${pickedCountry.name}</strong> ${pickedCountry.temp2025Formatted}.
          Верный ответ: <img src="${getFlagUrl(c.code)}" alt=""> <strong>${c.name}</strong> (${c.temp2025Formatted})
        </div>
      `;
    }

    this.updateHeader();
    this.renderBottomBar(fb);
  },

  finishRound() {
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const earnedCoins = Math.max(10, Math.round(this.score * 0.7));
    const earnedStars = this.score > 0 ? (diff === 'hard' ? 15 : (diff === 'normal' ? 10 : 5)) : 0;

    if (typeof userProfile !== 'undefined') {
      userProfile.coins += earnedCoins;
      userProfile.stars += earnedStars;
      userProfile.gamesPlayed += 1;
      userProfile.save();
    }

    document.getElementById('final-score').textContent = this.score;
    document.getElementById('final-coins').textContent = `+${earnedCoins} 🪙`;
    document.getElementById('final-stars').textContent = `+${earnedStars} ⭐`;
    document.getElementById('results-modal').style.display = 'flex';
  },

  exit() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('results-modal').style.display = 'none';
    document.querySelector('.main-screen').style.display = 'block';
    document.querySelector('.top-bar').style.display = 'flex';
  }
};

// ================= НОВЫЙ РЕЖИМ «РАССТОЯНИЕ / КТО БЛИЖЕ?» (DistanceGame) =================
const borderPointsCache = {};
const borderDistancePairCache = {};

function extractCountryBorderPoints(code) {
  if (borderPointsCache[code]) return borderPointsCache[code];

  const atlas = (typeof window !== 'undefined' && window.ATLAS_10M_DATA) ? window.ATLAS_10M_DATA : null;
  const entry = atlas ? atlas[code] : null;
  const rings = [];

  const collectRings = (geom) => {
    if (!geom || !geom.coordinates) return;
    if (geom.type === 'Polygon') {
      if (Array.isArray(geom.coordinates[0]) && geom.coordinates[0].length > 0) {
        rings.push(geom.coordinates[0]);
      }
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates.forEach(poly => {
        if (Array.isArray(poly) && Array.isArray(poly[0]) && poly[0].length > 0) {
          rings.push(poly[0]);
        }
      });
    }
  };

  if (entry) {
    collectRings(entry.metro);
    if (rings.length === 0 && Array.isArray(entry.insets)) {
      entry.insets.forEach(ins => collectRings(ins.geometry));
    }
  }

  const allVertices = [];
  rings.forEach(ring => {
    for (let i = 0; i < ring.length; i++) {
      const pt = ring[i];
      if (Array.isArray(pt) && pt.length >= 2 && Number.isFinite(pt[0]) && Number.isFinite(pt[1])) {
        allVertices.push(pt);
      }
    }
  });

  const maxPoints = 100;
  const sampled = [];
  if (allVertices.length <= maxPoints) {
    for (let i = 0; i < allVertices.length; i++) {
      sampled.push(allVertices[i]);
    }
  } else {
    // Гарантируем участие каждого контура (острова/эксклава) + равномерный шаг до ~100 опорных точек
    rings.forEach(ring => {
      if (ring.length > 0 && Array.isArray(ring[0])) {
        sampled.push(ring[0]);
        const mid = ring[Math.floor(ring.length / 2)];
        if (Array.isArray(mid)) sampled.push(mid);
      }
    });
    const remainingBudget = Math.max(20, maxPoints - sampled.length);
    const step = Math.max(1, Math.floor(allVertices.length / remainingBudget));
    for (let i = 0; i < allVertices.length && sampled.length < 120; i += step) {
      sampled.push(allVertices[i]);
    }
  }

  borderPointsCache[code] = sampled;
  return sampled;
}

function getMinBorderDistanceKm(codeA, codeB) {
  if (!codeA || !codeB) return Infinity;
  if (codeA === codeB) return 0;

  const pairKey = codeA < codeB ? `${codeA}_${codeB}` : `${codeB}_${codeA}`;
  if (borderDistancePairCache[pairKey] !== undefined) {
    return borderDistancePairCache[pairKey];
  }

  const ptsA = extractCountryBorderPoints(codeA);
  const ptsB = extractCountryBorderPoints(codeB);
  if (!ptsA.length || !ptsB.length) {
    borderDistancePairCache[pairKey] = 9999;
    return 9999;
  }

  const R = 6371; // радиус Земли в км
  const toRad = Math.PI / 180;
  let minKm = Infinity;

  for (let i = 0; i < ptsA.length; i++) {
    const lon1 = ptsA[i][0];
    const lat1 = ptsA[i][1];
    const rLat1 = lat1 * toRad;
    const cosLat1 = Math.cos(rLat1);

    for (let j = 0; j < ptsB.length; j++) {
      const lon2 = ptsB[j][0];
      const lat2 = ptsB[j][1];
      const dLat = (lat2 - lat1) * toRad;
      const dLon = (lon2 - lon1) * toRad;
      const rLat2 = lat2 * toRad;

      const sinDLat = Math.sin(dLat * 0.5);
      const sinDLon = Math.sin(dLon * 0.5);
      const a = sinDLat * sinDLat + cosLat1 * Math.cos(rLat2) * sinDLon * sinDLon;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
      const d = R * c;
      if (d < minKm) {
        minKm = d;
      }
    }
  }

  const roundedKm = Math.max(1, Math.round(minKm));
  borderDistancePairCache[pairKey] = roundedKm;
  return roundedKm;
}

function formatDistanceKm(km) {
  return Math.round(km).toLocaleString('ru-RU');
}

const DistanceGame = {
  questions: [],
  currentIndex: 0,
  totalQuestions: 20,
  score: 0,
  isAnswered: false,
  autoNextTimer: null,

  // Данные текущего вопроса
  blockCloser: null,  // { options: [{ country, distKm }], closestCode, closestKm, farthestCode, farthestKm }
  blockFarther: null, // { options: [{ country, distKm }], closestCode, closestKm, farthestCode, farthestKm }
  selectedCloserCode: null,
  selectedFartherCode: null,
  closerKmInputVal: '',
  fartherKmInputVal: '',
  validationResult: null,

  async start() {
    if (this.autoNextTimer) {
      clearTimeout(this.autoNextTimer);
      this.autoNextTimer = null;
    }

    const pool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
    if (!pool || pool.length < 5) {
      alert("Недостаточно стран по выбранным фильтрам! Выберите больше регионов в настройках.");
      return;
    }

    if (typeof MapsGame !== 'undefined' && typeof MapsGame.initAtlas === 'function' && !MapsGame.isAtlasLoaded) {
      await MapsGame.initAtlas();
    }

    window.lastActiveGame = DistanceGame;
    const desiredCount = (typeof gameSettings !== 'undefined' && gameSettings.questionsCount) ? gameSettings.questionsCount : 20;
    this.totalQuestions = Math.min(desiredCount, pool.length);

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    this.questions = shuffled.slice(0, this.totalQuestions);
    this.currentIndex = 0;
    this.score = 0;

    document.querySelector('.main-screen').style.display = 'none';
    document.querySelector('.top-bar').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('results-modal').style.display = 'none';

    updateShopAndProfileUI();
    this.loadQuestion();
  },

  isNeighborOrTooClose(targetCountry, candidateCountry, distKm) {
    if (!targetCountry || !candidateCountry) return true;
    if (targetCountry.code === candidateCountry.code) return true;
    if (Array.isArray(targetCountry.neighbors) && targetCountry.neighbors.includes(candidateCountry.code)) return true;
    if (Array.isArray(candidateCountry.neighbors) && candidateCountry.neighbors.includes(targetCountry.code)) return true;
    if (typeof NEIGHBORS_DB !== 'undefined') {
      const nbA = NEIGHBORS_DB[targetCountry.code] || [];
      const nbB = NEIGHBORS_DB[candidateCountry.code] || [];
      if (nbA.includes(candidateCountry.code) || nbB.includes(targetCountry.code)) return true;
    }
    if (!Number.isFinite(distKm) || distKm <= 30) return true;
    return false;
  },

  buildNonNeighborCandidates(targetCountry) {
    const filteredPool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
    const collectFromList = (list, existingCodes) => {
      const result = [];
      for (let i = 0; i < list.length; i++) {
        const cand = list[i];
        if (!cand || existingCodes.has(cand.code)) continue;
        const distKm = getMinBorderDistanceKm(targetCountry.code, cand.code);
        if (!this.isNeighborOrTooClose(targetCountry, cand, distKm)) {
          existingCodes.add(cand.code);
          result.push({ country: cand, distKm });
        }
      }
      return result;
    };

    const used = new Set([targetCountry.code]);
    let candidates = collectFromList(filteredPool || [], used);
    // Если в выбранном регионе меньше 10 не-соседних стран, дополняем из общей базы DB (строго без соседей)
    if (candidates.length < 10 && typeof DB !== 'undefined') {
      candidates = candidates.concat(collectFromList(DB, used));
    }
    return candidates;
  },

  pickDistinctFourBlock(candidates, excludedCodesSet) {
    const available = candidates.filter(item => !excludedCodesSet.has(item.country.code));
    const minGaps = [200, 160, 120, 75, 30, 1];
    let chosen = [];

    for (let g = 0; g < minGaps.length; g++) {
      const gap = minGaps[g];
      for (let attempt = 0; attempt < 35; attempt++) {
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        const picked = [];
        for (let i = 0; i < shuffled.length && picked.length < 4; i++) {
          const item = shuffled[i];
          const isDistinctEnough = picked.every(p => Math.abs(p.distKm - item.distKm) >= gap);
          if (isDistinctEnough) {
            picked.push(item);
          }
        }
        if (picked.length === 4) {
          chosen = picked;
          break;
        }
      }
      if (chosen.length === 4) break;
    }

    if (chosen.length < 4) {
      chosen = [...available].sort(() => Math.random() - 0.5).slice(0, 4);
    }

    const sortedByDist = [...chosen].sort((a, b) => a.distKm - b.distKm);
    const closest = sortedByDist[0];
    const farthest = sortedByDist[sortedByDist.length - 1];

    // Перемешиваем порядок отображения кнопок 2x2
    const displayOptions = [...chosen].sort(() => Math.random() - 0.5);

    return {
      options: displayOptions,
      closestCode: closest ? closest.country.code : '',
      closestKm: closest ? closest.distKm : 0,
      farthestCode: farthest ? farthest.country.code : '',
      farthestKm: farthest ? farthest.distKm : 0
    };
  },

  loadQuestion() {
    if (this.autoNextTimer) {
      clearTimeout(this.autoNextTimer);
      this.autoNextTimer = null;
    }

    const targetCountry = this.questions[this.currentIndex];
    if (!targetCountry) {
      this.finishRound();
      return;
    }

    this.isAnswered = false;
    this.selectedCloserCode = null;
    this.selectedFartherCode = null;
    this.closerKmInputVal = '';
    this.fartherKmInputVal = '';
    this.validationResult = null;

    const candidates = this.buildNonNeighborCandidates(targetCountry);
    this.blockCloser = this.pickDistinctFourBlock(candidates, new Set());

    const usedInBlock1 = new Set(this.blockCloser.options.map(o => o.country.code));
    this.blockFarther = this.pickDistinctFourBlock(candidates, usedInBlock1);

    this.updateHeader();
    this.renderQuestion();
  },

  updateHeader() {
    const progressEl = document.getElementById('game-progress');
    const scoreEl = document.getElementById('game-score');
    if (progressEl) progressEl.textContent = `${this.currentIndex + 1} / ${this.totalQuestions}`;
    if (scoreEl) scoreEl.textContent = this.score;
  },

  renderQuestion() {
    const questionBox = document.getElementById('question-box');
    const answersGrid = document.getElementById('answers-grid');
    if (!questionBox || !answersGrid) return;

    const targetCountry = this.questions[this.currentIndex];
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';

    if (diff === 'easy') {
      const mapSvgHTML = (typeof MapsGame !== 'undefined' && typeof MapsGame.renderMapSVG === 'function')
        ? MapsGame.renderMapSVG(targetCountry, 'easy')
        : '';

      questionBox.innerHTML = `
        <div class="distance-question-box">
          <div class="map-diff-badge easy">🟢 Лёгкий • По границам государств</div>
          <div class="distance-map-card">
            ${mapSvgHTML}
          </div>
          <h2 class="distance-target-name">${targetCountry.name}</h2>
        </div>
      `;

      answersGrid.className = 'answers-grid distance-answers-panel';
      answersGrid.innerHTML = `
        <div class="distance-block-card closer-block">
          <div class="distance-block-header">
            <span class="distance-block-title closer-title">📍 Кто ближе к этой стране?</span>
            <span class="distance-block-sub">Без общих границ</span>
          </div>
          <div class="distance-options-grid" id="distance-easy-grid">
            ${this.blockCloser.options.map(opt => `
              <button type="button" class="distance-opt-btn easy-opt-btn" data-code="${opt.country.code}">
                <span class="distance-opt-name">${opt.country.name}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      answersGrid.querySelectorAll('#distance-easy-grid .distance-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const pickedCode = btn.getAttribute('data-code');
          this.handleEasyPick(pickedCode);
        });
      });
      return;
    }

    // СРЕДНИЙ (normal) и СЛОЖНЫЙ (hard) уровни — без карты, только название страны + 2 блока
    const badgeText = diff === 'hard'
      ? '🔴 Сложный • Выберите страны и расстояние (±20%)'
      : '🟡 Средний • Выберите ближайшую и дальнюю страну';

    questionBox.innerHTML = `
      <div class="distance-question-box compact-header">
        <span class="nb-mode-tag">${badgeText}</span>
        <h2 class="distance-target-name">${targetCountry.name}</h2>
      </div>
    `;

    answersGrid.className = 'answers-grid distance-answers-panel';
    this.renderNormalOrHardControls();
  },

  handleEasyPick(pickedCode) {
    if (this.isAnswered || !pickedCode) return;
    this.isAnswered = true;

    const isCorrect = pickedCode === this.blockCloser.closestCode;
    if (isCorrect) {
      this.score += 5;
      this.updateHeader();
    }

    const buttons = document.querySelectorAll('#distance-easy-grid .distance-opt-btn');
    buttons.forEach(btn => {
      const code = btn.getAttribute('data-code');
      const optObj = this.blockCloser.options.find(o => o.country.code === code);
      const kmText = optObj ? `~${formatDistanceKm(optObj.distKm)} км` : '';

      btn.disabled = true;
      if (code === this.blockCloser.closestCode) {
        btn.classList.add('correct');
      } else if (code === pickedCode && !isCorrect) {
        btn.classList.add('wrong');
      }

      btn.innerHTML = `
        <span class="distance-opt-name">${optObj ? optObj.country.name : code}</span>
        <span class="distance-opt-km">${kmText}</span>
      `;
    });

    this.autoNextTimer = setTimeout(() => {
      this.nextQuestion();
    }, 1500);
  },

  canSubmitNormalOrHard() {
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    if (!this.selectedCloserCode || !this.selectedFartherCode) return false;
    if (diff === 'hard') {
      const v1 = parseFloat(String(this.closerKmInputVal).trim());
      const v2 = parseFloat(String(this.fartherKmInputVal).trim());
      if (!Number.isFinite(v1) || v1 <= 0 || !Number.isFinite(v2) || v2 <= 0) return false;
    }
    return true;
  },

  renderNormalOrHardControls() {
    const answersGrid = document.getElementById('answers-grid');
    if (!answersGrid) return;

    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const isHard = diff === 'hard';
    const res = this.validationResult;

    const renderBlockButtons = (blockObj, selectedCode, targetAnswerCode) => {
      return blockObj.options.map(opt => {
        const code = opt.country.code;
        let cls = 'distance-opt-btn';
        if (!this.isAnswered) {
          if (code === selectedCode) cls += ' selected';
        } else {
          if (code === targetAnswerCode) cls += ' correct';
          else if (code === selectedCode && selectedCode !== targetAnswerCode) cls += ' wrong';
        }

        const kmBadge = this.isAnswered
          ? `<span class="distance-opt-km">~${formatDistanceKm(opt.distKm)} км</span>`
          : '';

        return `
          <button type="button" class="${cls}" data-code="${code}" ${this.isAnswered ? 'disabled' : ''}>
            <span class="distance-opt-name">${opt.country.name}</span>
            ${kmBadge}
          </button>
        `;
      }).join('');
    };

    let closerInputHTML = '';
    let fartherInputHTML = '';

    if (isHard) {
      const cInputCls = this.isAnswered
        ? (res && res.isCloserKmOk ? 'distance-km-input input-correct' : 'distance-km-input input-wrong')
        : 'distance-km-input';
      const fInputCls = this.isAnswered
        ? (res && res.isFartherKmOk ? 'distance-km-input input-correct' : 'distance-km-input input-wrong')
        : 'distance-km-input';

      const closerFeedbackHTML = (this.isAnswered && res)
        ? `<div class="distance-input-feedback ${res.isCloserKmOk ? 'ok' : 'fail'}">
             ${res.isCloserKmOk ? '✓ В пределах ±20%!' : '✕ Промах по км:'} Точно <strong>${formatDistanceKm(res.actualCloserKm)} км</strong> (допуск ${formatDistanceKm(res.closerMinAllowed)}–${formatDistanceKm(res.closerMaxAllowed)} км)
           </div>`
        : '';

      const fartherFeedbackHTML = (this.isAnswered && res)
        ? `<div class="distance-input-feedback ${res.isFartherKmOk ? 'ok' : 'fail'}">
             ${res.isFartherKmOk ? '✓ В пределах ±20%!' : '✕ Промах по км:'} Точно <strong>${formatDistanceKm(res.actualFartherKm)} км</strong> (допуск ${formatDistanceKm(res.fartherMinAllowed)}–${formatDistanceKm(res.fartherMaxAllowed)} км)
           </div>`
        : '';

      closerInputHTML = `
        <div class="distance-input-row">
          <input type="number" inputmode="numeric" min="1" id="distance-closer-input" class="${cInputCls}" placeholder="Расстояние в км..." value="${this.closerKmInputVal}" ${this.isAnswered ? 'disabled' : ''}>
          ${closerFeedbackHTML}
        </div>
      `;

      fartherInputHTML = `
        <div class="distance-input-row">
          <input type="number" inputmode="numeric" min="1" id="distance-farther-input" class="${fInputCls}" placeholder="Расстояние в км..." value="${this.fartherKmInputVal}" ${this.isAnswered ? 'disabled' : ''}>
          ${fartherFeedbackHTML}
        </div>
      `;
    }

    let summaryBannerHTML = '';
    if (this.isAnswered && res) {
      summaryBannerHTML = `
        <div class="distance-summary-banner ${res.isRoundWin ? 'win' : 'lose'}">
          ${res.summaryText}
        </div>
      `;
    }

    const isLast = this.currentIndex + 1 >= this.totalQuestions;
    const actionBtnHTML = !this.isAnswered
      ? `<button type="button" class="distance-submit-btn" id="distance-submit-btn" ${this.canSubmitNormalOrHard() ? '' : 'disabled'}>✅ Подтвердить</button>`
      : `<button type="button" class="distance-submit-btn next-btn" id="distance-next-btn">${isLast ? 'Завершить раунд 🏁' : 'Дальше ➔'}</button>`;

    answersGrid.innerHTML = `
      <!-- Блок 1: Кто ближе? -->
      <div class="distance-block-card closer-block">
        <div class="distance-block-header">
          <span class="distance-block-title closer-title">📍 1. Кто ближе?</span>
          <span class="distance-block-sub">${this.isAnswered ? `Минимум: ${formatDistanceKm(this.blockCloser.closestKm)} км` : 'Выберите 1 страну'}</span>
        </div>
        <div class="distance-options-grid" id="distance-closer-grid">
          ${renderBlockButtons(this.blockCloser, this.selectedCloserCode, this.blockCloser.closestCode)}
        </div>
        ${closerInputHTML}
      </div>

      <!-- Блок 2: Кто дальше? -->
      <div class="distance-block-card farther-block">
        <div class="distance-block-header">
          <span class="distance-block-title farther-title">🧭 2. Кто дальше?</span>
          <span class="distance-block-sub">${this.isAnswered ? `Максимум: ${formatDistanceKm(this.blockFarther.farthestKm)} км` : 'Выберите 1 страну'}</span>
        </div>
        <div class="distance-options-grid" id="distance-farther-grid">
          ${renderBlockButtons(this.blockFarther, this.selectedFartherCode, this.blockFarther.farthestCode)}
        </div>
        ${fartherInputHTML}
      </div>

      ${summaryBannerHTML}
      ${actionBtnHTML}
    `;

    if (!this.isAnswered) {
      answersGrid.querySelectorAll('#distance-closer-grid .distance-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.selectedCloserCode = btn.getAttribute('data-code');
          this.renderNormalOrHardControls();
        });
      });

      answersGrid.querySelectorAll('#distance-farther-grid .distance-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.selectedFartherCode = btn.getAttribute('data-code');
          this.renderNormalOrHardControls();
        });
      });

      if (isHard) {
        const cInput = document.getElementById('distance-closer-input');
        const fInput = document.getElementById('distance-farther-input');
        const submitBtn = document.getElementById('distance-submit-btn');

        const syncInputs = () => {
          if (cInput) this.closerKmInputVal = cInput.value;
          if (fInput) this.fartherKmInputVal = fInput.value;
          if (submitBtn) submitBtn.disabled = !this.canSubmitNormalOrHard();
        };

        if (cInput) {
          cInput.addEventListener('input', syncInputs);
          cInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.canSubmitNormalOrHard()) {
              this.validateNormalOrHard();
            }
          });
        }
        if (fInput) {
          fInput.addEventListener('input', syncInputs);
          fInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.canSubmitNormalOrHard()) {
              this.validateNormalOrHard();
            }
          });
        }
      }

      const submitBtn = document.getElementById('distance-submit-btn');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          this.validateNormalOrHard();
        });
      }
    } else {
      const nextBtn = document.getElementById('distance-next-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          this.nextQuestion();
        });
      }
    }
  },

  validateNormalOrHard() {
    if (this.isAnswered || !this.canSubmitNormalOrHard()) return;
    this.isAnswered = true;

    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const isCloserCountryOk = this.selectedCloserCode === this.blockCloser.closestCode;
    const isFartherCountryOk = this.selectedFartherCode === this.blockFarther.farthestCode;

    if (diff === 'normal') {
      const isRoundWin = isCloserCountryOk && isFartherCountryOk;
      if (isRoundWin) {
        this.score += 10;
        this.updateHeader();
      }

      this.validationResult = {
        isRoundWin,
        isCloserCountryOk,
        isFartherCountryOk,
        summaryText: isRoundWin
          ? '✓ Отлично! Обе страны («Кто ближе?» и «Кто дальше?») угаданы верно (+10 очков)'
          : `✕ Раунд не засчитан: ${!isCloserCountryOk && !isFartherCountryOk ? 'ошибка в обоих блоках' : (!isCloserCountryOk ? 'ошибка в блоке «Кто ближе?»' : 'ошибка в блоке «Кто дальше?»')}`
      };

      this.renderNormalOrHardControls();
      return;
    }

    // Сложный уровень (hard): проверка стран + погрешность ±20% для каждого поля
    const selectedCloserOpt = this.blockCloser.options.find(o => o.country.code === this.selectedCloserCode);
    const selectedFartherOpt = this.blockFarther.options.find(o => o.country.code === this.selectedFartherCode);

    const actualCloserKm = selectedCloserOpt ? selectedCloserOpt.distKm : this.blockCloser.closestKm;
    const actualFartherKm = selectedFartherOpt ? selectedFartherOpt.distKm : this.blockFarther.farthestKm;

    const userCloserKm = parseFloat(String(this.closerKmInputVal).trim());
    const userFartherKm = parseFloat(String(this.fartherKmInputVal).trim());

    const isCloserKmOk = Number.isFinite(userCloserKm) && Math.abs(userCloserKm - actualCloserKm) <= actualCloserKm * 0.20;
    const isFartherKmOk = Number.isFinite(userFartherKm) && Math.abs(userFartherKm - actualFartherKm) <= actualFartherKm * 0.20;

    const isRoundWin = isCloserCountryOk && isCloserKmOk && isFartherCountryOk && isFartherKmOk;
    if (isRoundWin) {
      this.score += 15;
      this.updateHeader();
    }

    this.validationResult = {
      isRoundWin,
      isCloserCountryOk,
      isFartherCountryOk,
      isCloserKmOk,
      isFartherKmOk,
      actualCloserKm,
      actualFartherKm,
      closerMinAllowed: Math.max(1, Math.floor(actualCloserKm * 0.80)),
      closerMaxAllowed: Math.ceil(actualCloserKm * 1.20),
      fartherMinAllowed: Math.max(1, Math.floor(actualFartherKm * 0.80)),
      fartherMaxAllowed: Math.ceil(actualFartherKm * 1.20),
      summaryText: isRoundWin
        ? '🔥 Идеально! Все 4 условия выполнены: обе страны и оба расстояния в ±20% (+15 очков)'
        : '✕ Раунд не засчитан: для +15 очков нужно верно выбрать обе страны и попасть в ±20% по км'
    };

    this.renderNormalOrHardControls();
  },

  nextQuestion() {
    this.currentIndex += 1;
    if (this.currentIndex < this.totalQuestions) {
      this.loadQuestion();
    } else {
      this.finishRound();
    }
  },

  finishRound() {
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const earnedCoins = Math.max(10, Math.round(this.score * 0.8));
    const earnedStars = this.score > 0 ? (diff === 'hard' ? 15 : (diff === 'normal' ? 10 : 5)) : 0;

    if (typeof userProfile !== 'undefined') {
      userProfile.coins += earnedCoins;
      userProfile.stars += earnedStars;
      userProfile.gamesPlayed += 1;
      userProfile.save();
    }

    document.getElementById('final-score').textContent = this.score;
    document.getElementById('final-coins').textContent = `+${earnedCoins} 🪙`;
    document.getElementById('final-stars').textContent = `+${earnedStars} ⭐`;
    document.getElementById('results-modal').style.display = 'flex';
  },

  exit() {
    if (this.autoNextTimer) {
      clearTimeout(this.autoNextTimer);
      this.autoNextTimer = null;
    }
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('results-modal').style.display = 'none';
    document.querySelector('.main-screen').style.display = 'block';
    document.querySelector('.top-bar').style.display = 'flex';
  }
};

// ================= НОВЫЙ РЕЖИМ «МАРШРУТ» (RouteGame) =================
const RouteGame = {
  questions: [],
  currentIndex: 0,
  totalQuestions: 20,
  score: 0,
  isRoundOver: false,
  autoNextTimer: null,

  // Состояние текущего раунда
  startCode: null,
  endCode: null,
  checkpointCode: null,
  checkpointVisited: false,
  currentCode: null,
  visitedPath: [],
  referencePath: [],
  distToTarget: {},
  roundOutcome: null, // { isWin: boolean, message: string, solutionText: string }

  getCountry(code) {
    if (!code) return null;
    if (codeToCountry[code]) return codeToCountry[code];
    return (typeof DB !== 'undefined' ? DB.find(c => c.code === code) : null) || null;
  },

  getNeighborsList(code) {
    const c = this.getCountry(code);
    const raw = (c && Array.isArray(c.neighbors))
      ? c.neighbors
      : ((typeof NEIGHBORS_DB !== 'undefined' && NEIGHBORS_DB[code]) ? NEIGHBORS_DB[code] : []);
    return raw.filter(nCode => Boolean(this.getCountry(nCode)));
  },

  bfsShortestPath(startCode, endCode, bannedSet = new Set()) {
    if (startCode === endCode) return [startCode];
    const visited = new Set([startCode]);
    const queue = [[startCode]];

    while (queue.length > 0) {
      const path = queue.shift();
      const last = path[path.length - 1];
      const neighbors = this.getNeighborsList(last);

      for (let i = 0; i < neighbors.length; i++) {
        const next = neighbors[i];
        if (next === endCode) {
          return [...path, next];
        }
        if (!visited.has(next) && !bannedSet.has(next)) {
          visited.add(next);
          queue.push([...path, next]);
        }
      }
    }
    return null;
  },

  bfsDistanceMapToTarget(targetCode) {
    const distMap = { [targetCode]: 0 };
    const queue = [targetCode];

    while (queue.length > 0) {
      const curr = queue.shift();
      const currDist = distMap[curr];
      const neighbors = this.getNeighborsList(curr);

      for (let i = 0; i < neighbors.length; i++) {
        const nb = neighbors[i];
        if (distMap[nb] === undefined) {
          distMap[nb] = currDist + 1;
          queue.push(nb);
        }
      }
    }
    return distMap;
  },

  // Находит реальный простой путь start -> ... -> checkpoint -> ... -> end без повторного захода в страны
  findSimplePathThroughCheckpoint(startCode, checkpointCode, endCode) {
    // Попытка 1: сначала кратчайший путь A -> V (не заходя в B), затем V -> B (не заходя в уже пройденные вершины A..V)
    const p1 = this.bfsShortestPath(startCode, checkpointCode, new Set([endCode]));
    if (p1 && p1.length >= 3) {
      const bannedForP2 = new Set(p1.slice(0, p1.length - 1));
      const p2 = this.bfsShortestPath(checkpointCode, endCode, bannedForP2);
      if (p2 && p2.length >= 3) {
        return [...p1, ...p2.slice(1)];
      }
    }

    // Попытка 2: сначала кратчайший путь V -> B (не заходя в A), затем A -> V (не заходя в V..B)
    const p2Alt = this.bfsShortestPath(checkpointCode, endCode, new Set([startCode]));
    if (p2Alt && p2Alt.length >= 3) {
      const bannedForP1 = new Set(p2Alt.slice(1));
      const p1Alt = this.bfsShortestPath(startCode, checkpointCode, bannedForP1);
      if (p1Alt && p1Alt.length >= 3) {
        return [...p1Alt, ...p2Alt.slice(1)];
      }
    }

    return null;
  },

  buildQuestionsList(desiredCount, diff) {
    if (typeof DB !== 'undefined' && Object.keys(codeToCountry).length === 0) {
      DB.forEach(item => { codeToCountry[item.code] = item; });
    }

    const filteredPool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
    let mainlandPool = (filteredPool || []).filter(c => c.isMainland && this.getNeighborsList(c.code).length > 0);
    if (mainlandPool.length < 12 && typeof DB !== 'undefined') {
      mainlandPool = DB.filter(c => c.isMainland && this.getNeighborsList(c.code).length > 0);
    }

    const candidates = [];
    const seenPairs = new Set();

    if (diff === 'easy') {
      // Лёгкий: 2 материковые страны на одном континенте, кратчайший путь от 2 до 4 шагов
      for (let i = 0; i < mainlandPool.length; i++) {
        const cA = mainlandPool[i];
        const distMapFromA = this.bfsDistanceMapToTarget(cA.code);
        for (let j = 0; j < mainlandPool.length; j++) {
          if (i === j) continue;
          const cB = mainlandPool[j];
          if (cA.continent !== cB.continent) continue;
          const steps = distMapFromA[cB.code];
          if (steps !== undefined && steps >= 2 && steps <= 4) {
            const pairKey = `${cA.code}_${cB.code}`;
            if (!seenPairs.has(pairKey)) {
              seenPairs.add(pairKey);
              const path = this.bfsShortestPath(cA.code, cB.code);
              if (path && path.length >= 3) {
                candidates.push({
                  startCode: cA.code,
                  endCode: cB.code,
                  checkpointCode: null,
                  referencePath: path
                });
              }
            }
          }
        }
      }
    } else if (diff === 'hard') {
      // Сложный: 2 материковые страны, кратчайший путь по BFS от 3 до 6 шагов
      for (let i = 0; i < mainlandPool.length; i++) {
        const cA = mainlandPool[i];
        const distMapFromA = this.bfsDistanceMapToTarget(cA.code);
        for (let j = 0; j < mainlandPool.length; j++) {
          if (i === j) continue;
          const cB = mainlandPool[j];
          const steps = distMapFromA[cB.code];
          if (steps !== undefined && steps >= 3 && steps <= 6) {
            const pairKey = `${cA.code}_${cB.code}`;
            if (!seenPairs.has(pairKey)) {
              seenPairs.add(pairKey);
              const path = this.bfsShortestPath(cA.code, cB.code);
              if (path && path.length >= 4) {
                candidates.push({
                  startCode: cA.code,
                  endCode: cB.code,
                  checkpointCode: null,
                  referencePath: path
                });
              }
            }
          }
        }
      }
    } else {
      // Средний (normal): Старт А, Финиш Б и Чекпоинт В (не сосед А и не сосед Б, реальный простой путь А -> ... -> В -> ... -> Б)
      const shuffledMainland = [...mainlandPool].sort(() => Math.random() - 0.5);
      for (let idx = 0; idx < shuffledMainland.length && candidates.length < desiredCount * 4; idx++) {
        const cV = shuffledMainland[idx];
        if (!cV.isMainland) continue;
        const distFromV = this.bfsDistanceMapToTarget(cV.code);

        // Ищем материковые страны на расстоянии 2..3 шагов от чекпоинта В
        const validEndpoints = mainlandPool.filter(c => {
          const d = distFromV[c.code];
          return c.isMainland && d !== undefined && d >= 2 && d <= 3;
        });

        if (validEndpoints.length < 2) continue;
        const shuffledEnds = [...validEndpoints].sort(() => Math.random() - 0.5);

        for (let a = 0; a < Math.min(shuffledEnds.length, 8); a++) {
          for (let b = a + 1; b < Math.min(shuffledEnds.length, 10); b++) {
            const cA = shuffledEnds[a];
            const cB = shuffledEnds[b];
            if (cA.code === cB.code) continue;
            // А и Б не должны быть прямыми соседями друг друга
            if (this.getNeighborsList(cA.code).includes(cB.code)) continue;
            // Чекпоинт В не должен быть прямым соседом ни А, ни Б
            if (this.getNeighborsList(cA.code).includes(cV.code)) continue;
            if (this.getNeighborsList(cB.code).includes(cV.code)) continue;

            const simplePath = this.findSimplePathThroughCheckpoint(cA.code, cV.code, cB.code);
            if (simplePath && simplePath.length >= 5 && simplePath.length <= 8) {
              const key = `${cA.code}_${cV.code}_${cB.code}`;
              if (!seenPairs.has(key)) {
                seenPairs.add(key);
                candidates.push({
                  startCode: cA.code,
                  endCode: cB.code,
                  checkpointCode: cV.code,
                  referencePath: simplePath
                });
                break;
              }
            }
          }
        }
      }
    }

    // Если из-за узкого регионального фильтра кандидатов мало — дополняем по всей базе DB
    if (candidates.length === 0 && typeof DB !== 'undefined') {
      const fallbackPath = ['ES', 'FR', 'DE', 'PL'];
      candidates.push({
        startCode: 'ES',
        endCode: 'PL',
        checkpointCode: null,
        referencePath: fallbackPath
      });
    }

    const shuffledCandidates = candidates.sort(() => Math.random() - 0.5);
    const selected = [];
    for (let i = 0; i < desiredCount; i++) {
      selected.push(shuffledCandidates[i % shuffledCandidates.length]);
    }
    return selected;
  },

  async start() {
    if (this.autoNextTimer) {
      clearTimeout(this.autoNextTimer);
      this.autoNextTimer = null;
    }

    if (typeof MapsGame !== 'undefined' && typeof MapsGame.initAtlas === 'function' && !MapsGame.isAtlasLoaded) {
      await MapsGame.initAtlas();
    }

    window.lastActiveGame = RouteGame;
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const desiredCount = (typeof gameSettings !== 'undefined' && gameSettings.questionsCount) ? gameSettings.questionsCount : 20;

    this.questions = this.buildQuestionsList(desiredCount, diff);
    this.totalQuestions = this.questions.length;
    this.currentIndex = 0;
    this.score = 0;

    document.querySelector('.main-screen').style.display = 'none';
    document.querySelector('.top-bar').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('results-modal').style.display = 'none';

    updateShopAndProfileUI();
    this.loadQuestion();
  },

  loadQuestion() {
    if (this.autoNextTimer) {
      clearTimeout(this.autoNextTimer);
      this.autoNextTimer = null;
    }

    const q = this.questions[this.currentIndex];
    if (!q) {
      this.finishRound();
      return;
    }

    this.isRoundOver = false;
    this.startCode = q.startCode;
    this.endCode = q.endCode;
    this.checkpointCode = q.checkpointCode || null;
    this.checkpointVisited = false;
    this.currentCode = q.startCode;
    this.visitedPath = [q.startCode];
    this.referencePath = q.referencePath || [];
    this.distToTarget = this.bfsDistanceMapToTarget(q.endCode);
    this.roundOutcome = null;

    this.updateHeader();
    this.renderUI();
  },

  updateHeader() {
    const progressEl = document.getElementById('game-progress');
    const scoreEl = document.getElementById('game-score');
    if (progressEl) progressEl.textContent = `${this.currentIndex + 1} / ${this.totalQuestions}`;
    if (scoreEl) scoreEl.textContent = this.score;
  },

  formatPathNames(codesList) {
    return (codesList || [])
      .map(code => {
        const c = this.getCountry(code);
        return c ? c.name : code;
      })
      .join(' → ');
  },

  renderRouteMapSVG() {
    if (typeof d3 === 'undefined' || typeof MapsGame === 'undefined' || !MapsGame.isAtlasLoaded) {
      return `<div style="padding:20px;color:var(--text-muted);font-size:12px;">🗺️ Карта загружается...</div>`;
    }

    const width = 340;
    const height = 176;

    const focusCodes = new Set([
      ...this.referencePath,
      ...this.visitedPath,
      this.startCode,
      this.endCode
    ]);
    if (this.checkpointCode) focusCodes.add(this.checkpointCode);

    const focusFeatures = [];
    focusCodes.forEach(code => {
      const f = MapsGame.geoFeaturesMap[code];
      if (f) {
        focusFeatures.push(f._metro || f);
      }
    });

    if (focusFeatures.length === 0) {
      return `<div style="padding:20px;color:var(--text-muted);">🗺️ Контур недоступен</div>`;
    }

    const featureCollection = {
      type: 'FeatureCollection',
      features: focusFeatures
    };

    const proj = d3.geoMercator().precision(0.01);
    const center = d3.geoCentroid(featureCollection);
    if (center && Number.isFinite(center[0])) {
      proj.rotate([-center[0], 0]);
    }
    proj.fitExtent([[18, 16], [width - 18, height - 26]], featureCollection);

    const pathGen = d3.geoPath().projection(proj);
    const visitedSet = new Set(this.visitedPath);

    const backgroundPaths = [];
    const highlightedPaths = [];

    (MapsGame.allFeaturesList || []).forEach(worldFeat => {
      const code = worldFeat.properties && worldFeat.properties.code ? worldFeat.properties.code : '';
      if (!code) return;
      const metroFeat = (MapsGame.geoFeaturesMap[code] && MapsGame.geoFeaturesMap[code]._metro)
        ? MapsGame.geoFeaturesMap[code]._metro
        : worldFeat;

      const d = pathGen(metroFeat);
      if (!d) return;

      let stateClass = '';
      if (code === this.currentCode) {
        stateClass = 'route-current';
      } else if (code === this.endCode) {
        stateClass = 'route-finish';
      } else if (this.checkpointCode && code === this.checkpointCode && !this.checkpointVisited) {
        stateClass = 'route-checkpoint';
      } else if (visitedSet.has(code)) {
        stateClass = 'route-visited';
      }

      const pathHTML = `<path class="route-country-path ${stateClass}" data-code="${code}" d="${d}" />`;
      if (stateClass) {
        highlightedPaths.push(pathHTML);
      } else {
        backgroundPaths.push(pathHTML);
      }
    });

    // Маркер финиша 🏁 над страной Б
    let finishPinHTML = '';
    const finishFeature = MapsGame.geoFeaturesMap[this.endCode];
    if (finishFeature) {
      const fc = d3.geoCentroid(finishFeature._metro || finishFeature);
      const pt = fc && proj(fc);
      if (pt && Number.isFinite(pt[0]) && Number.isFinite(pt[1])) {
        finishPinHTML = `
          <g transform="translate(${pt[0]}, ${pt[1]})">
            <circle r="9" fill="rgba(15, 23, 42, 0.85)" stroke="#f43f5e" stroke-width="1.5" />
            <text x="0" y="3.5" text-anchor="middle" font-size="10">🏁</text>
          </g>
        `;
      }
    }

    const checkpointLegendHTML = this.checkpointCode
      ? `<span class="route-legend-item"><span class="route-legend-dot" style="background:#f59e0b;"></span>Чекпоинт</span>`
      : '';

    return `
      <svg class="route-map-svg" viewBox="0 0 ${width} ${height}">
        <g>${backgroundPaths.join('')}</g>
        <g>${highlightedPaths.join('')}</g>
        ${finishPinHTML}
      </svg>
      <div class="route-map-legend">
        <span class="route-legend-item"><span class="route-legend-dot" style="background:#38bdf8;"></span>Вы здесь</span>
        <span class="route-legend-item"><span class="route-legend-dot" style="background:#22c55e;"></span>Пройдено</span>
        ${checkpointLegendHTML}
        <span class="route-legend-item"><span class="route-legend-dot" style="background:#f43f5e;"></span>Финиш</span>
      </div>
    `;
  },

  renderUI() {
    const questionBox = document.getElementById('question-box');
    const answersGrid = document.getElementById('answers-grid');
    if (!questionBox || !answersGrid) return;

    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const startCountry = this.getCountry(this.startCode);
    const endCountry = this.getCountry(this.endCode);
    const currentCountry = this.getCountry(this.currentCode);
    const checkpointCountry = this.checkpointCode ? this.getCountry(this.checkpointCode) : null;

    let diffBadgeHTML = '';
    if (diff === 'easy') {
      diffBadgeHTML = `<span class="nb-mode-tag">🟢 Лёгкий • Дойдите по суше до цели (+5 очк.)</span>`;
    } else if (diff === 'normal') {
      diffBadgeHTML = `<span class="nb-mode-tag">🟡 Средний • Обязательно посетите чекпоинт (+10 очк.)</span>`;
    } else {
      const optSteps = Math.max(1, this.referencePath.length - 1);
      diffBadgeHTML = `<span class="nb-mode-tag">🔴 Сложный • Кратчайший путь (${optSteps} шаг.) без ошибок (+15 очк.)</span>`;
    }

    let taskEndpointsHTML = '';
    if (diff === 'normal' && checkpointCountry) {
      taskEndpointsHTML = `
        <span class="route-endpoint-badge"><img src="${getFlagUrl(startCountry.code)}" alt="">${startCountry.name}</span>
        <span>➔</span>
        <span class="route-checkpoint-tag ${this.checkpointVisited ? 'done' : ''}">
          ${this.checkpointVisited ? '✓' : '📍'} Чекпоинт: ${checkpointCountry.name}
        </span>
        <span>➔</span>
        <span class="route-endpoint-badge"><img src="${getFlagUrl(endCountry.code)}" alt="">🏁 ${endCountry.name}</span>
      `;
    } else {
      taskEndpointsHTML = `
        <span class="route-endpoint-badge"><img src="${getFlagUrl(startCountry.code)}" alt="">${startCountry.name}</span>
        <span>➔</span>
        <span class="route-endpoint-badge"><img src="${getFlagUrl(endCountry.code)}" alt="">🏁 ${endCountry.name}</span>
      `;
    }

    const chainStepsHTML = this.visitedPath.map((code, idx) => {
      const c = this.getCountry(code);
      const isCurr = idx === this.visitedPath.length - 1;
      return `
        <span class="route-chain-step ${isCurr ? 'is-current' : ''}">
          <img src="${getFlagUrl(code)}" alt="">
          <span>${c ? c.name : code}</span>
        </span>
      `;
    }).join('<span class="route-chain-arrow">→</span>');

    questionBox.innerHTML = `
      <div class="route-question-box">
        ${diffBadgeHTML}
        <div class="route-map-card">
          ${this.renderRouteMapSVG()}
        </div>
        <div class="route-task-banner">
          <div class="route-task-Endpoints">${taskEndpointsHTML}</div>
        </div>
        <div class="route-chain-box">
          ${chainStepsHTML}
        </div>
        <div class="route-current-pill">
          Сейчас вы в: <img src="${getFlagUrl(currentCountry.code)}" alt=""> <strong>${currentCountry.name}</strong>
        </div>
      </div>
    `;

    answersGrid.className = 'answers-grid route-answers-panel';

    if (this.isRoundOver && this.roundOutcome) {
      const isLast = this.currentIndex + 1 >= this.totalQuestions;
      const nextBtnHTML = diff !== 'hard'
        ? `<button type="button" class="distance-submit-btn next-btn" id="route-next-btn">${isLast ? 'Завершить раунд 🏁' : 'Дальше ➔'}</button>`
        : '';

      answersGrid.innerHTML = `
        <div class="route-feedback-card ${this.roundOutcome.isWin ? 'win' : 'lose'}">
          <div>${this.roundOutcome.message}</div>
          <div class="route-solution-path">Эталонный маршрут: ${this.roundOutcome.solutionText}</div>
        </div>
        ${nextBtnHTML}
      `;

      const nextBtn = document.getElementById('route-next-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          this.nextQuestion();
        });
      }
      return;
    }

    // Выводим кнопки всех сухопутных соседей текущей страны (уже посещённые заблокированы)
    const neighborsCodes = this.getNeighborsList(this.currentCode);
    const visitedSet = new Set(this.visitedPath);
    const sortedNeighbors = neighborsCodes
      .map(code => this.getCountry(code))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

    answersGrid.innerHTML = `
      <div class="route-neighbors-header">Выберите соседнюю страну для следующего шага (${sortedNeighbors.length}):</div>
      <div class="route-neighbors-grid" id="route-neighbors-grid">
        ${sortedNeighbors.map(nb => {
          const isVisited = visitedSet.has(nb.code);
          return `
            <button type="button" class="route-neighbor-btn ${isVisited ? 'visited-neighbor' : ''}" data-code="${nb.code}" ${isVisited ? 'disabled' : ''}>
              <img src="${getFlagUrl(nb.code)}" alt="">
              <span class="distance-opt-name">${nb.name}${isVisited ? ' ✓' : ''}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;

    answersGrid.querySelectorAll('#route-neighbors-grid .route-neighbor-btn:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const pickedCode = btn.getAttribute('data-code');
        this.handleStepPick(pickedCode, btn);
      });
    });
  },

  handleStepPick(nextCode, btnEl) {
    if (this.isRoundOver || !nextCode) return;
    if (this.visitedPath.includes(nextCode)) return;

    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const nextCountry = this.getCountry(nextCode);

    // 1. СЛОЖНЫЙ УРОВЕНЬ (hard): проверка кратчайшего маршрута на каждом шаге
    if (diff === 'hard') {
      const currDist = this.distToTarget[this.currentCode];
      const nextDist = this.distToTarget[nextCode];
      const isShortestStep = (currDist !== undefined && nextDist !== undefined && nextDist === currDist - 1);

      if (!isShortestStep) {
        this.isRoundOver = true;
        if (btnEl) {
          btnEl.classList.add('wrong');
        }
        const solutionStr = this.formatPathNames(this.referencePath);
        this.roundOutcome = {
          isWin: false,
          message: `✕ Ошибка! Выбор «${nextCountry ? nextCountry.name : nextCode}» отклоняется от кратчайшего пути.`,
          solutionText: solutionStr
        };

        // Показываем красную кнопку на мгновение и выводим эталонный маршрут, через 1.8 сек следующий раунд
        setTimeout(() => {
          this.renderUI();
        }, 220);

        this.autoNextTimer = setTimeout(() => {
          this.nextQuestion();
        }, 1800);
        return;
      }

      // Шаг верный по кратчайшему маршруту
      this.visitedPath.push(nextCode);
      this.currentCode = nextCode;

      if (nextCode === this.endCode) {
        this.isRoundOver = true;
        this.score += 15;
        this.updateHeader();
        this.roundOutcome = {
          isWin: true,
          message: `🔥 Блестяще! Вы прошли кратчайший маршрут за ${this.visitedPath.length - 1} шаг. без единой ошибки (+15 очков)!`,
          solutionText: this.formatPathNames(this.visitedPath)
        };
        this.renderUI();

        this.autoNextTimer = setTimeout(() => {
          this.nextQuestion();
        }, 1800);
        return;
      }

      this.renderUI();
      return;
    }

    // 2. ЛЁГКИЙ (easy) и СРЕДНИЙ (normal) уровни
    this.visitedPath.push(nextCode);
    this.currentCode = nextCode;

    if (diff === 'normal' && this.checkpointCode && nextCode === this.checkpointCode) {
      this.checkpointVisited = true;
    }

    // Проверка достижения финальной страны Б
    if (nextCode === this.endCode) {
      this.isRoundOver = true;

      if (diff === 'normal' && this.checkpointCode && !this.checkpointVisited) {
        const cpCountry = this.getCountry(this.checkpointCode);
        this.roundOutcome = {
          isWin: false,
          message: `✕ Вы пришли в финиш, но пропустили обязательный чекпоинт «${cpCountry ? cpCountry.name : this.checkpointCode}»!`,
          solutionText: this.formatPathNames(this.referencePath)
        };
        this.renderUI();
        return;
      }

      const earned = diff === 'normal' ? 10 : 5;
      this.score += earned;
      this.updateHeader();
      this.roundOutcome = {
        isWin: true,
        message: `✓ Маршрут успешно пройден за ${this.visitedPath.length - 1} шаг.! (+${earned} очков)`,
        solutionText: this.formatPathNames(this.visitedPath)
      };
      this.renderUI();
      return;
    }

    // Проверка правила тупика (для всех уровней): есть ли из новой текущей страны хотя бы 1 непосещённый сосед?
    const visitedSet = new Set(this.visitedPath);
    const availableNext = this.getNeighborsList(this.currentCode).filter(nCode => !visitedSet.has(nCode));

    if (availableNext.length === 0) {
      this.isRoundOver = true;
      this.roundOutcome = {
        isWin: false,
        message: `✕ Тупик в стране «${nextCountry ? nextCountry.name : nextCode}»! Доступных непосещённых соседей больше нет.`,
        solutionText: this.formatPathNames(this.referencePath)
      };
      this.renderUI();
      return;
    }

    this.renderUI();
  },

  nextQuestion() {
    if (this.autoNextTimer) {
      clearTimeout(this.autoNextTimer);
      this.autoNextTimer = null;
    }
    this.currentIndex += 1;
    if (this.currentIndex < this.totalQuestions) {
      this.loadQuestion();
    } else {
      this.finishRound();
    }
  },

  finishRound() {
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const earnedCoins = Math.max(10, Math.round(this.score * 0.8));
    const earnedStars = this.score > 0 ? (diff === 'hard' ? 15 : (diff === 'normal' ? 10 : 5)) : 0;

    if (typeof userProfile !== 'undefined') {
      userProfile.coins += earnedCoins;
      userProfile.stars += earnedStars;
      userProfile.gamesPlayed += 1;
      userProfile.save();
    }

    document.getElementById('final-score').textContent = this.score;
    document.getElementById('final-coins').textContent = `+${earnedCoins} 🪙`;
    document.getElementById('final-stars').textContent = `+${earnedStars} ⭐`;
    document.getElementById('results-modal').style.display = 'flex';
  },

  exit() {
    if (this.autoNextTimer) {
      clearTimeout(this.autoNextTimer);
      this.autoNextTimer = null;
    }
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('results-modal').style.display = 'none';
    document.querySelector('.main-screen').style.display = 'block';
    document.querySelector('.top-bar').style.display = 'flex';
  }
};

// ================= ИГРОВОЙ РЕЖИМ 12: СОРТИРОВКА (SORTING GAME) =================
const SORTING_CATEGORIES = {
  '1': {
    id: '1',
    title: '1 • По площади территории (км²)',
    shortLabel: 'Площадь территории',
    getValue(c) {
      return Number(c.area) || 0;
    },
    formatValue(c) {
      if (c.areaFormatted) {
        return c.areaFormatted.includes('км') ? c.areaFormatted : `${c.areaFormatted} км²`;
      }
      return `${Math.round(Number(c.area) || 0).toLocaleString('ru-RU')} км²`;
    }
  },
  '2': {
    id: '2',
    title: '2 • По населению',
    shortLabel: 'Население страны',
    getValue(c) {
      return Number(c.population) || 0;
    },
    formatValue(c) {
      return `${c.population} млн`;
    }
  },
  '3': {
    id: '3',
    title: '3 • По среднегодовой температуре',
    shortLabel: 'Среднегодовая температура',
    getValue(c) {
      return Number(c.temp2025) || 0;
    },
    formatValue(c) {
      if (c.temp2025Formatted) return c.temp2025Formatted;
      const val = Number(c.temp2025) || 0;
      return `${val > 0 ? '+' : ''}${val.toFixed(1)} °C`;
    }
  },
  '4': {
    id: '4',
    title: '4 • По количеству регионов',
    shortLabel: 'Количество регионов',
    getValue(c) {
      return Number(c.regionsCount) || 0;
    },
    formatValue(c) {
      return `${Number(c.regionsCount) || 0} рег.`;
    }
  },
  '5': {
    id: '5',
    title: '5 • По городам-миллионникам',
    shortLabel: 'Города-миллионники',
    getValue(c) {
      return Number(c.millionCitiesCount) || 0;
    },
    formatValue(c) {
      return `${Number(c.millionCitiesCount) || 0} гор.`;
    }
  }
};

const SortingGame = {
  categoryId: '1',
  currentIndex: 0,
  totalQuestions: 5,
  score: 0,
  userOrder: [],
  correctOrder: [],
  isAnswered: false,
  lastEarnedPoints: 0,
  lastCorrectCount: 0,
  dragState: null,

  getCategoryMeta() {
    return SORTING_CATEGORIES[this.categoryId] || SORTING_CATEGORIES['1'];
  },

  getMetricValue(c) {
    return this.getCategoryMeta().getValue(c);
  },

  formatMetricValue(c) {
    return this.getCategoryMeta().formatValue(c);
  },

  getItemsCountForDifficulty(diff) {
    if (diff === 'easy') return 4;
    if (diff === 'hard') return 8;
    return 6;
  },

  // Формирует отсортированный по убыванию список стран со СТРОГО уникальными значениями выбранного параметра
  buildUniqueSortedPool(sourcePool) {
    const byValueMap = new Map();
    const shuffled = [...sourcePool].sort(() => 0.5 - Math.random());
    shuffled.forEach(c => {
      const val = this.getMetricValue(c);
      if (!byValueMap.has(val)) {
        byValueMap.set(val, c);
      }
    });
    return Array.from(byValueMap.values()).sort((a, b) => this.getMetricValue(b) - this.getMetricValue(a));
  },

  pickRoundCountries() {
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const countNeeded = this.getItemsCountForDifficulty(diff);

    const filteredPool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
    let uniqueSorted = this.buildUniqueSortedPool(filteredPool);

    // Если из-за узких фильтров уникальных значений меньше нужного числа (например, для миллионников в одном регионе), дополняем из всей базы DB
    if (uniqueSorted.length < countNeeded) {
      uniqueSorted = this.buildUniqueSortedPool(DB);
    }

    const M = uniqueSorted.length;
    if (M <= countNeeded) {
      return [...uniqueSorted];
    }

    let picked = [];

    if (diff === 'easy') {
      // 4 страны с большой разницей в значениях (из 4 разнесённых квантилей)
      const bands = [
        [0, Math.max(0, Math.floor(M * 0.2) - 1)],
        [Math.floor(M * 0.3), Math.max(Math.floor(M * 0.3), Math.floor(M * 0.5) - 1)],
        [Math.floor(M * 0.6), Math.max(Math.floor(M * 0.6), Math.floor(M * 0.8) - 1)],
        [Math.floor(M * 0.85), M - 1]
      ];
      const usedCodes = new Set();
      bands.forEach(([lo, hi]) => {
        const clampedLo = Math.min(Math.max(0, lo), M - 1);
        const clampedHi = Math.min(Math.max(clampedLo, hi), M - 1);
        let idx = clampedLo + Math.floor(Math.random() * (clampedHi - clampedLo + 1));
        while (usedCodes.has(uniqueSorted[idx].code) && idx < M - 1) idx += 1;
        while (usedCodes.has(uniqueSorted[idx].code) && idx > 0) idx -= 1;
        usedCodes.add(uniqueSorted[idx].code);
        picked.push(uniqueSorted[idx]);
      });
    } else if (diff === 'normal') {
      // 6 стран со средним разбросом значений
      const windowLen = Math.max(countNeeded, Math.min(M, Math.round(M * 0.65)));
      const maxStart = Math.max(0, M - windowLen);
      const startOffset = Math.floor(Math.random() * (maxStart + 1));
      const subPool = uniqueSorted.slice(startOffset, startOffset + windowLen);
      const step = subPool.length / countNeeded;
      const usedCodes = new Set();
      for (let i = 0; i < countNeeded; i++) {
        const segStart = Math.floor(i * step);
        const segEnd = Math.max(segStart, Math.floor((i + 1) * step) - 1);
        let idx = segStart + Math.floor(Math.random() * (segEnd - segStart + 1));
        idx = Math.min(subPool.length - 1, Math.max(0, idx));
        while (usedCodes.has(subPool[idx].code) && idx < subPool.length - 1) idx += 1;
        while (usedCodes.has(subPool[idx].code) && idx > 0) idx -= 1;
        usedCodes.add(subPool[idx].code);
        picked.push(subPool[idx]);
      }
    } else {
      // Сложный (hard): 8 стран с максимально близкими друг к другу показателями (соседние по рангу)
      const maxStart = Math.max(0, M - countNeeded);
      const startIdx = Math.floor(Math.random() * (maxStart + 1));
      picked = uniqueSorted.slice(startIdx, startIdx + countNeeded);
    }

    return picked.sort((a, b) => this.getMetricValue(b) - this.getMetricValue(a));
  },

  start(categoryId = '1') {
    const pool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
    if (!pool || pool.length < 4 || gameSettings.questionsCount === 0) {
      alert("Недостаточно стран! Выберите больше регионов в настройках.");
      return;
    }

    this.categoryId = String(categoryId || '1');
    this.totalQuestions = Math.max(1, gameSettings.questionsCount || 5);
    this.currentIndex = 0;
    this.score = 0;
    this.isAnswered = false;
    this.dragState = null;

    document.querySelector('.main-screen').style.display = 'none';
    document.querySelector('.top-bar').style.display = 'none';
    document.getElementById('results-modal').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';

    const boostersBar = document.querySelector('.ingame-boosters');
    if (boostersBar) boostersBar.style.display = 'flex';

    this.loadQuestion();
  },

  loadQuestion() {
    this.isAnswered = false;
    this.lastEarnedPoints = 0;
    this.lastCorrectCount = 0;
    this.dragState = null;

    const sortedItems = this.pickRoundCountries();
    this.correctOrder = [...sortedItems];

    // Перемешиваем список так, чтобы он изначально не совпадал на 100% с правильным ответом
    let shuffled = [...sortedItems].sort(() => 0.5 - Math.random());
    const isAlreadySorted = shuffled.every((c, i) => c.code === this.correctOrder[i].code);
    if (isAlreadySorted && shuffled.length >= 2) {
      const tmp = shuffled[0];
      shuffled[0] = shuffled[shuffled.length - 1];
      shuffled[shuffled.length - 1] = tmp;
    }
    this.userOrder = shuffled;

    document.getElementById('game-progress').textContent = `${this.currentIndex + 1} / ${this.totalQuestions}`;
    document.getElementById('game-score').textContent = this.score;

    this.renderUI();
  },

  getTrueRankForCountry(countryObj) {
    const val = this.getMetricValue(countryObj);
    const idx = this.correctOrder.findIndex(c => this.getMetricValue(c) === val);
    return idx >= 0 ? idx + 1 : 1;
  },

  isCountryInCorrectSlot(index) {
    const userItem = this.userOrder[index];
    const targetItem = this.correctOrder[index];
    if (!userItem || !targetItem) return false;
    return this.getMetricValue(userItem) === this.getMetricValue(targetItem);
  },

  renderUI() {
    const questionBox = document.getElementById('question-box');
    const answersGrid = document.getElementById('answers-grid');
    if (!questionBox || !answersGrid) return;

    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const isHard = diff === 'hard';
    const meta = this.getCategoryMeta();

    let diffLabel = '🟡 Средний (6 стран)';
    if (diff === 'easy') diffLabel = '🟢 Лёгкий (4 страны)';
    if (diff === 'hard') diffLabel = '🔴 Сложный (8 близких стран)';

    questionBox.innerHTML = `
      <div class="sorting-question-box">
        <div class="sorting-header-card">
          <div class="sorting-cat-title">${meta.title}</div>
          <div class="sorting-cat-subtitle">${diffLabel} • От большего сверху (1) к меньшему снизу (${this.userOrder.length})</div>
        </div>
      </div>
    `;

    answersGrid.className = 'answers-grid sorting-answers-panel';

    const rowsHTML = this.userOrder.map((c, idx) => {
      const flagUrl = typeof getFlagUrl === 'function' ? getFlagUrl(c.code) : '';
      let stateClass = isHard ? 'hard-compact' : '';
      if (this.dragState && this.dragState.dragIndex === idx) {
        stateClass += ' dragging';
      }

      let rightControlsHTML = '';
      if (this.isAnswered) {
        const isRight = this.isCountryInCorrectSlot(idx);
        const trueRank = this.getTrueRankForCountry(c);
        stateClass += isRight ? ' correct' : ' wrong';
        const trueRankBadge = !isRight
          ? `<span class="sort-true-rank-tag" title="Правильное место">#${trueRank}</span>`
          : '';
        rightControlsHTML = `
          <div class="sort-item-right">
            ${trueRankBadge}
            <span class="sort-val-badge">${this.formatMetricValue(c)}</span>
          </div>
        `;
      } else {
        const disableUp = idx === 0 ? 'disabled' : '';
        const disableDown = idx === this.userOrder.length - 1 ? 'disabled' : '';
        rightControlsHTML = `
          <div class="sort-item-right">
            <div class="sort-move-btns">
              <button type="button" class="sort-move-btn" data-move-dir="up" data-idx="${idx}" ${disableUp} title="Поднять выше">▲</button>
              <button type="button" class="sort-move-btn" data-move-dir="down" data-idx="${idx}" ${disableDown} title="Опустить ниже">▼</button>
            </div>
          </div>
        `;
      }

      return `
        <div class="sort-item-row ${stateClass}" data-index="${idx}" data-code="${c.code}">
          <div class="sort-item-left">
            <span class="sort-rank-badge">${idx + 1}</span>
            ${!this.isAnswered ? `<span class="sort-drag-grip" title="Зажмите и перетащите">⠿</span>` : ''}
            ${flagUrl ? `<img class="sort-country-flag" src="${flagUrl}" alt="" draggable="false">` : ''}
            <span class="sort-country-name">${c.name}</span>
          </div>
          ${rightControlsHTML}
        </div>
      `;
    }).join('');

    let feedbackHTML = '';
    if (this.isAnswered) {
      const total = this.userOrder.length;
      const isPerfect = this.lastCorrectCount === total;
      feedbackHTML = `
        <div class="sorting-feedback-pill ${isPerfect ? 'perfect' : ''}">
          ${isPerfect ? '🏆 Идеальный порядок!' : `На своих местах: ${this.lastCorrectCount} из ${total}`} • Начислено: <strong>+${this.lastEarnedPoints} очк.</strong>
        </div>
      `;
    }

    const actionButtonHTML = !this.isAnswered
      ? `<button type="button" class="nb-submit-btn dist-confirm-btn" id="sorting-confirm-btn">✅ Подтвердить</button>`
      : `<button type="button" class="nb-submit-btn dist-next-btn" id="sorting-next-btn">Дальше ➔</button>`;

    answersGrid.innerHTML = `
      <div class="sorting-list ${isHard ? 'hard-compact-list' : ''}" id="sorting-list">
        ${rowsHTML}
      </div>
      ${feedbackHTML}
      ${actionButtonHTML}
    `;

    this.bindSortingEvents();
  },

  moveItem(fromIdx, toIdx) {
    if (this.isAnswered) return;
    if (fromIdx < 0 || toIdx < 0 || fromIdx >= this.userOrder.length || toIdx >= this.userOrder.length) return;
    if (fromIdx === toIdx) return;

    const updated = [...this.userOrder];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    this.userOrder = updated;
  },

  // Переставляет существующие DOM-элементы .sort-item-row на лету без пересоздания innerHTML (чтобы не прерывать touchmove на смартфонах)
  syncDOMOrderInPlace() {
    const listEl = document.getElementById('sorting-list');
    if (!listEl) return;
    const rowsByCode = new Map();
    listEl.querySelectorAll('.sort-item-row').forEach(r => {
      rowsByCode.set(r.getAttribute('data-code'), r);
    });

    const total = this.userOrder.length;
    this.userOrder.forEach((c, idx) => {
      const row = rowsByCode.get(c.code);
      if (!row) return;
      listEl.appendChild(row);
      row.setAttribute('data-index', String(idx));
      row.classList.toggle('dragging', Boolean(this.dragState && this.dragState.dragIndex === idx));

      const rankBadge = row.querySelector('.sort-rank-badge');
      if (rankBadge) rankBadge.textContent = String(idx + 1);

      const upBtn = row.querySelector('.sort-move-btn[data-move-dir="up"]');
      const downBtn = row.querySelector('.sort-move-btn[data-move-dir="down"]');
      if (upBtn) {
        upBtn.setAttribute('data-idx', String(idx));
        upBtn.disabled = idx === 0;
      }
      if (downBtn) {
        downBtn.setAttribute('data-idx', String(idx));
        downBtn.disabled = idx === total - 1;
      }
    });
  },

  bindSortingEvents() {
    const listEl = document.getElementById('sorting-list');
    const confirmBtn = document.getElementById('sorting-confirm-btn');
    const nextBtn = document.getElementById('sorting-next-btn');

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.checkOrder());
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextQuestion());
    }

    if (!listEl || this.isAnswered) return;

    // 1. Кнопки ▲ / ▼
    listEl.querySelectorAll('.sort-move-btn[data-move-dir]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.isAnswered) return;
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const dir = btn.getAttribute('data-move-dir');
        const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
        this.moveItem(idx, targetIdx);
        this.syncDOMOrderInPlace();
      });
    });

    // 2. Плавное перетаскивание пальцем (touchstart, touchmove, touchend) и мышью (mousedown, mousemove, mouseup)
    const handlePointerMoveY = (clientY) => {
      if (!this.dragState || this.isAnswered) return;
      const currentListEl = document.getElementById('sorting-list');
      if (!currentListEl) return;

      const rows = Array.from(currentListEl.querySelectorAll('.sort-item-row'));
      let targetIdx = this.dragState.dragIndex;

      for (let i = 0; i < rows.length; i++) {
        const rect = rows[i].getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (i < this.dragState.dragIndex && clientY < midY) {
          targetIdx = i;
          break;
        } else if (i > this.dragState.dragIndex && clientY > midY) {
          targetIdx = i;
        }
      }

      if (targetIdx !== this.dragState.dragIndex) {
        this.moveItem(this.dragState.dragIndex, targetIdx);
        this.dragState.dragIndex = targetIdx;
        this.syncDOMOrderInPlace();
      }
    };

    const endDrag = () => {
      if (!this.dragState) return;
      this.dragState = null;
      const currentListEl = document.getElementById('sorting-list');
      if (currentListEl) {
        currentListEl.querySelectorAll('.sort-item-row.dragging').forEach(r => r.classList.remove('dragging'));
      }
    };

    // Touch события на списке (для мобильных устройств)
    listEl.addEventListener('touchstart', (e) => {
      if (this.isAnswered) return;
      if (e.target.closest('.sort-move-btn')) return;
      const row = e.target.closest('.sort-item-row');
      if (!row) return;
      const idx = parseInt(row.getAttribute('data-index'), 10);
      if (Number.isNaN(idx)) return;

      this.dragState = { dragIndex: idx };
      row.classList.add('dragging');
    }, { passive: true });

    listEl.addEventListener('touchmove', (e) => {
      if (!this.dragState || this.isAnswered) return;
      if (e.cancelable) e.preventDefault();
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      handlePointerMoveY(touch.clientY);
    }, { passive: false });

    listEl.addEventListener('touchend', () => endDrag());
    listEl.addEventListener('touchcancel', () => endDrag());

    // Mouse события для ПК
    listEl.addEventListener('mousedown', (e) => {
      if (this.isAnswered || e.button !== 0) return;
      if (e.target.closest('.sort-move-btn')) return;
      const row = e.target.closest('.sort-item-row');
      if (!row) return;
      const idx = parseInt(row.getAttribute('data-index'), 10);
      if (Number.isNaN(idx)) return;

      e.preventDefault();
      this.dragState = { dragIndex: idx };
      row.classList.add('dragging');

      const onMouseMove = (moveEvent) => {
        if (!this.dragState) return;
        handlePointerMoveY(moveEvent.clientY);
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        endDrag();
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  },

  checkOrder() {
    if (this.isAnswered) return;
    this.isAnswered = true;
    this.dragState = null;

    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const total = this.userOrder.length;
    let correctCount = 0;

    for (let i = 0; i < total; i++) {
      if (this.isCountryInCorrectSlot(i)) {
        correctCount += 1;
      }
    }

    const perItemPts = diff === 'hard' ? 4 : (diff === 'normal' ? 3 : 2);
    const perfectBonus = diff === 'hard' ? 8 : (diff === 'normal' ? 4 : 2);
    const earned = (correctCount * perItemPts) + (correctCount === total ? perfectBonus : 0);

    this.lastCorrectCount = correctCount;
    this.lastEarnedPoints = earned;
    this.score += earned;

    document.getElementById('game-score').textContent = this.score;
    this.renderUI();
  },

  nextQuestion() {
    this.currentIndex += 1;
    if (this.currentIndex < this.totalQuestions) {
      this.loadQuestion();
    } else {
      this.finishRound();
    }
  },

  finishRound() {
    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const earnedCoins = Math.max(10, Math.round(this.score * 0.8));
    const earnedStars = this.score > 0 ? (diff === 'hard' ? 15 : (diff === 'normal' ? 10 : 5)) : 0;

    if (typeof userProfile !== 'undefined') {
      userProfile.coins += earnedCoins;
      userProfile.stars += earnedStars;
      userProfile.gamesPlayed += 1;
      userProfile.save();
    }

    document.getElementById('final-score').textContent = this.score;
    document.getElementById('final-coins').textContent = `+${earnedCoins} 🪙`;
    document.getElementById('final-stars').textContent = `+${earnedStars} ⭐`;
    document.getElementById('results-modal').style.display = 'flex';
  },

  exit() {
    this.dragState = null;
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('results-modal').style.display = 'none';
    document.querySelector('.main-screen').style.display = 'block';
    document.querySelector('.top-bar').style.display = 'flex';
  }
};

// ================= МИНИ-ОКНО ПОДСКАЗОК ВО ВРЕМЯ ИГРЫ (#ingame-hints-modal) =================
function getActiveModeBoosterKeys() {
  if (
    window.lastActiveGame === NeighborsGame ||
    window.lastActiveGame === TemperatureGame ||
    window.lastActiveGame === DistanceGame ||
    window.lastActiveGame === RouteGame ||
    window.lastActiveGame === SortingGame
  ) {
    return [];
  }
  if (window.lastActiveGame === HigherLowerGame) {
    return ['hlRange', 'hlSkip'];
  }
  if (window.lastActiveGame === FactsDeductionGame) {
    return ['fdFact', 'fdVisual', 'fdSolve'];
  }
  return ['fifty', 'skip'];
}

function getActiveModeTitle() {
  if (window.lastActiveGame === HigherLowerGame) {
    return '💡 Подсказки: Больше / Меньше';
  }
  if (window.lastActiveGame === FactsDeductionGame) {
    return '💡 Подсказки: По фактам';
  }
  return '💡 Подсказки: Классический режим';
}

function triggerBoosterInCurrentGame(key) {
  if (window.lastActiveGame === HigherLowerGame) {
    if (key === 'hlRange') return HigherLowerGame.useRangeBooster();
    if (key === 'hlSkip') return HigherLowerGame.useSkipBooster();
    return false;
  }

  if (window.lastActiveGame === FactsDeductionGame) {
    if (key === 'fdFact') return FactsDeductionGame.useFactBooster();
    if (key === 'fdVisual') return FactsDeductionGame.useVisualBooster();
    if (key === 'fdSolve') return FactsDeductionGame.useSolveBooster();
    return false;
  }

  // Классические режимы (FlagGame, CapitalsGame, FoodGame, MapsGame, LeadersGame)
  if (key === 'fifty') {
    const btn = document.getElementById('use-fifty-btn');
    if (btn && userProfile.boosters.fifty > 0) {
      btn.click();
      return true;
    } else {
      alert("У вас нет подсказок 50/50! Купите их за монеты 🪙");
      return false;
    }
  }

  if (key === 'skip') {
    const btn = document.getElementById('use-skip-btn');
    if (btn && userProfile.boosters.skip > 0) {
      btn.click();
      return true;
    } else {
      alert("У вас нет подсказок «Точный ответ»! Купите их за монеты 🪙");
      return false;
    }
  }

  return false;
}

function renderIngameHintsModal() {
  const modal = document.getElementById('ingame-hints-modal');
  const titleEl = document.getElementById('ingame-hints-title');
  const listEl = document.getElementById('ingame-hints-list');
  if (!modal || !listEl) return;

  if (titleEl) titleEl.textContent = '💡 Подсказки';
  listEl.innerHTML = `
    <div class="unavailable-placeholder-card">
      <div class="unavailable-placeholder-icon">🔒</div>
      <div class="unavailable-placeholder-title">Пока недоступно</div>
      <p class="unavailable-placeholder-desc">Раздел подсказок временно отключён и появится в следующих обновлениях.</p>
    </div>
  `;
}

// Метаданные 5 классических режимов для режимов направления: Обычный / Наоборот / Двойной
const CLASSIC_MODES_META = {
  'flag-to-country': {
    normalTitle: 'Флаг → Страна',
    normalDesc: 'Угадай государство по официальному флагу',
    reverseTitle: 'Страна → Флаг',
    reverseDesc: 'Найди правильный флаг указанной страны'
  },
  'capitals': {
    normalTitle: 'Столицы мира',
    normalDesc: 'Угадай государство по его столице',
    reverseTitle: 'Страна → Столица',
    reverseDesc: 'Угадай столицу по названию государства'
  },
  'maps': {
    normalTitle: 'Карты мира',
    normalDesc: 'Определи страну по её 10m контуру и врезкам',
    reverseTitle: 'Страна → Карта',
    reverseDesc: 'Найди верный 10m контур указанной страны'
  },
  'food': {
    normalTitle: 'Кухни мира',
    normalDesc: 'Блюда и ингредиенты без спойлеров',
    reverseTitle: 'Страна → Кухня',
    reverseDesc: 'Выбери блюдо национальной кухни страны'
  },
  'leaders': {
    normalTitle: 'Лидеры стран',
    normalDesc: 'Портреты глав государств без гербов',
    reverseTitle: 'ФИО → Портрет',
    reverseDesc: 'Найди портрет главы государства по имени'
  }
};

function launchClassicMode(modeKey, explicitDirection) {
  const dir = explicitDirection || (gameSettings.questionDirection === 'reverse' ? 'reverse' : 'normal');
  updateShopAndProfileUI();

  if (modeKey === 'flag-to-country') {
    window.lastActiveGame = FlagGame;
    if (typeof FlagGame !== 'undefined') {
      FlagGame.start(dir === 'reverse' ? 'country-to-flag' : 'flag-to-country');
    }
  } else if (modeKey === 'capitals') {
    window.lastActiveGame = CapitalsGame;
    if (typeof CapitalsGame !== 'undefined') {
      CapitalsGame.start(dir);
    }
  } else if (modeKey === 'maps') {
    window.lastActiveGame = MapsGame;
    if (typeof MapsGame !== 'undefined') {
      MapsGame.start(dir);
    }
  } else if (modeKey === 'food') {
    window.lastActiveGame = FoodGame;
    if (typeof FoodGame !== 'undefined') {
      FoodGame.start(dir);
    }
  } else if (modeKey === 'leaders') {
    window.lastActiveGame = LeadersGame;
    if (typeof LeadersGame !== 'undefined') {
      LeadersGame.start(dir);
    }
  }
}

function updateClassicCardsDirectionUI() {
  const dirMode = gameSettings.questionDirection || 'normal';
  Object.keys(CLASSIC_MODES_META).forEach(modeKey => {
    const card = document.querySelector(`.mode-card[data-mode="${modeKey}"]`);
    if (!card) return;
    const meta = CLASSIC_MODES_META[modeKey];

    if (dirMode === 'split') {
      card.classList.add('classic-split-card');
      card.innerHTML = `
        <h3>${meta.normalTitle}</h3>
        <p>${meta.normalDesc}</p>
        <div class="classic-split-halves">
          <button type="button" class="classic-split-half reverse-side" data-split-dir="reverse" title="${meta.reverseTitle} (Наоборот)" aria-label="${meta.reverseTitle}"></button>
          <button type="button" class="classic-split-half normal-side" data-split-dir="normal" title="${meta.normalTitle} (Обычный)" aria-label="${meta.normalTitle}"></button>
        </div>
      `;
    } else if (dirMode === 'reverse') {
      card.classList.remove('classic-split-card');
      card.innerHTML = `
        <h3>${meta.reverseTitle}</h3>
        <p>${meta.reverseDesc}</p>
      `;
    } else {
      card.classList.remove('classic-split-card');
      card.innerHTML = `
        <h3>${meta.normalTitle}</h3>
        <p>${meta.normalDesc}</p>
      `;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Применяем сохраненную тему сразу
  document.body.className = gameSettings.theme;

  // Элементы модальных окон
  const settingsModal = document.getElementById('settings-modal');
  const leaderboardModal = document.getElementById('leaderboard-modal');
  const shopModal = document.getElementById('shop-modal');
  const bookModal = document.getElementById('book-modal');
  const exitConfirmModal = document.getElementById('exit-confirm-modal');
  const ingameHintsModal = document.getElementById('ingame-hints-modal');

  // Счётчик 10 последовательных нажатий на вкладку «Системные» для открытия #secret-download-group
  let systemTabClicks = 0;
  const secretDownloadGroup = document.getElementById('secret-download-group');

  // Кнопки открытия окон в шапке
  document.getElementById('settings-btn').addEventListener('click', () => {
    systemTabClicks = 0;
    settingsModal.classList.add('open');
  });
  document.querySelectorAll('#close-settings, #close-settings-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      systemTabClicks = 0;
      settingsModal.classList.remove('open');
    });
  });

  document.getElementById('leaderboard-btn').addEventListener('click', () => {
    updateShopAndProfileUI();
    leaderboardModal.classList.add('open');
  });
  document.getElementById('close-leaderboard').addEventListener('click', () => leaderboardModal.classList.remove('open'));

  document.getElementById('shop-btn').addEventListener('click', () => {
    updateShopAndProfileUI();
    shopModal.classList.add('open');
  });
  document.getElementById('close-shop').addEventListener('click', () => shopModal.classList.remove('open'));

  document.getElementById('book-btn').addEventListener('click', () => {
    document.getElementById('country-search').value = '';
    renderEncyclopedia();
    bookModal.classList.add('open');
  });
  document.getElementById('close-book').addEventListener('click', () => bookModal.classList.remove('open'));

  // Единая кнопка «💡 Подсказки» внутри игры
  const openIngameHintsBtn = document.getElementById('open-ingame-hints-btn');
  const closeIngameHintsBtn = document.getElementById('close-ingame-hints');

  if (openIngameHintsBtn && ingameHintsModal) {
    openIngameHintsBtn.addEventListener('click', () => {
      renderIngameHintsModal();
      ingameHintsModal.style.display = 'flex';
      ingameHintsModal.classList.add('open');
    });
  }

  if (closeIngameHintsBtn && ingameHintsModal) {
    closeIngameHintsBtn.addEventListener('click', () => {
      ingameHintsModal.style.display = 'none';
      ingameHintsModal.classList.remove('open');
    });
  }

  if (ingameHintsModal) {
    ingameHintsModal.addEventListener('click', (e) => {
      if (e.target === ingameHintsModal) {
        ingameHintsModal.style.display = 'none';
        ingameHintsModal.classList.remove('open');
      }
    });
  }

  // Закрытие окон по клику на тёмный фон
  [settingsModal, leaderboardModal, shopModal, bookModal].forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) {
        if (m === settingsModal) systemTabClicks = 0;
        m.classList.remove('open');
      }
    });
  });

  if (exitConfirmModal) {
    exitConfirmModal.addEventListener('click', (e) => {
      if (e.target === exitConfirmModal) exitConfirmModal.style.display = 'none';
    });
  }

  // ================= ВКЛАДКИ НАСТРОЕК (РАУНДЫ / СИСТЕМНЫЕ + СЕКРЕТНЫЕ 10 НАЖАТИЙ) =================
  const navBtns = document.querySelectorAll('.settings-nav-btn');
  const paneRounds = document.getElementById('pane-rounds');
  const paneSystem = document.getElementById('pane-system');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (btn.dataset.tab === 'rounds') {
        systemTabClicks = 0;
        paneRounds.style.display = 'block';
        paneSystem.style.display = 'none';
      } else {
        paneRounds.style.display = 'none';
        paneSystem.style.display = 'block';
        systemTabClicks += 1;
        if (systemTabClicks >= 10 && secretDownloadGroup) {
          secretDownloadGroup.style.display = 'block';
        }
      }
    });
  });

  // ================= НАДЁЖНОЕ СКАЧИВАНИЕ И КОПИРОВАНИЕ КОДА ДЛЯ ACODE (ЧЕРЕЗ BLOB В ПАМЯТИ БРАУЗЕРА) =================
  const ALL_PROJECT_FILES = [
    'index.html',
    'style.css',
    'app.js',
    'data.js',
    'media.js',
    'atlas-10m-data.js',
    'mode-maps.js',
    'mode-leaders.js',
    'mode-food.js',
    'mode-flags.js',
    'mode-capitals.js'
  ];

  async function fetchProjectFileText(fileName) {
    const res = await fetch(`/${fileName}?t=${Date.now()}`, { credentials: 'include', cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let text = await res.text();
    if (fileName === 'index.html') {
      // Делаем пути относительными, чтобы в Acode проект работал из любой папки
      text = text
        .replace(/href="\/style\.css[^"]*"/g, 'href="style.css"')
        .replace(/src="\/([a-zA-Z0-9_-]+\.js)[^"]*"/g, 'src="$1"');
    }
    return text;
  }

  function triggerBlobDownload(blob, downloadName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 3000);
  }

  // Генератор стандартного .ZIP архива прямо в памяти браузера (метод Store + CRC32),
  // чтобы Android Download Manager никогда не повреждал архив при скачивании из iframe
  function buildStandardZipBlob(filesList) {
    const encoder = new TextEncoder();
    const crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      crcTable[n] = c >>> 0;
    }
    function crc32(bytes) {
      let crc = 0xffffffff;
      for (let i = 0; i < bytes.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xff];
      }
      return (crc ^ 0xffffffff) >>> 0;
    }

    const localParts = [];
    const centralParts = [];
    let offset = 0;

    filesList.forEach(({ name, content }) => {
      const nameBytes = encoder.encode(name);
      const dataBytes = encoder.encode(content);
      const crc = crc32(dataBytes);
      const size = dataBytes.length;

      const localHeader = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(localHeader.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0x0800, true); // UTF-8
      lv.setUint16(8, 0, true);      // Store (без сжатия — открывается любым проводником)
      lv.setUint16(10, 0, true);
      lv.setUint16(12, 0, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, size, true);
      lv.setUint32(22, size, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      localHeader.set(nameBytes, 30);

      localParts.push(localHeader, dataBytes);

      const centralHeader = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(centralHeader.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, size, true);
      cv.setUint32(24, size, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      centralHeader.set(nameBytes, 46);

      centralParts.push(centralHeader);
      offset += localHeader.length + size;
    });

    const centralSize = centralParts.reduce((acc, arr) => acc + arr.length, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, filesList.length, true);
    ev.setUint16(10, filesList.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, eocd], { type: 'application/zip' });
  }

  const downloadStatusHint = document.getElementById('download-status-hint');
  const downloadZipBtn = document.getElementById('download-full-zip-btn');
  const downloadSingleHtmlBtn = document.getElementById('download-single-html-btn');

  if (downloadZipBtn) {
    downloadZipBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const origText = downloadZipBtn.textContent;
      try {
        downloadZipBtn.textContent = '⏳ Сборка архива .ZIP...';
        const loadedFiles = [];
        for (const fName of ALL_PROJECT_FILES) {
          const content = await fetchProjectFileText(fName);
          loadedFiles.push({ name: fName, content });
        }
        const zipBlob = buildStandardZipBlob(loadedFiles);
        triggerBlobDownload(zipBlob, 'sllizgeo-full-code.zip');
        downloadZipBtn.textContent = '✅ Архив .ZIP скачан!';
        if (downloadStatusHint) {
          downloadStatusHint.textContent = '✅ Архив sllizgeo-full-code.zip собран в браузере и готов к распаковке!';
        }
      } catch (err) {
        downloadZipBtn.textContent = '❌ Ошибка сборки архива';
      }
      setTimeout(() => {
        downloadZipBtn.textContent = origText;
      }, 3000);
    });
  }

  if (downloadSingleHtmlBtn) {
    downloadSingleHtmlBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const origText = downloadSingleHtmlBtn.textContent;
      try {
        downloadSingleHtmlBtn.textContent = '⏳ Сборка единого index.html...';
        let html = await fetchProjectFileText('index.html');
        const css = await fetchProjectFileText('style.css');
        const jsFiles = [
          'atlas-10m-data.js',
          'data.js',
          'media.js',
          'mode-flags.js',
          'mode-capitals.js',
          'mode-food.js',
          'mode-maps.js',
          'mode-leaders.js',
          'app.js'
        ];
        html = html.replace(/<link[^>]*href="[^"]*style\.css[^"]*"[^>]*>/i, () => `<style>\n${css}\n</style>`);
        for (const jsName of jsFiles) {
          const jsCode = await fetchProjectFileText(jsName);
          const regex = new RegExp(`<script[^>]*src="[^"]*${jsName.replace('.', '\\.')}[^"]*"[^>]*><\\/script>`, 'i');
          html = html.replace(regex, () => `<script>\n${jsCode}\n</script>`);
        }
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        triggerBlobDownload(blob, 'index.html');
        downloadSingleHtmlBtn.textContent = '✅ Единый index.html скачан!';
        if (downloadStatusHint) {
          downloadStatusHint.textContent = '✅ Скачан автономный index.html (внутри уже вшиты все стили и скрипты — просто откройте его в Acode и нажмите ▶)!';
        }
      } catch (err) {
        downloadSingleHtmlBtn.textContent = '❌ Ошибка сборки файла';
      }
      setTimeout(() => {
        downloadSingleHtmlBtn.textContent = origText;
      }, 3500);
    });
  }

  if (secretDownloadGroup) {
    secretDownloadGroup.querySelectorAll('a[data-dl-file]').forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const fileName = link.getAttribute('data-dl-file');
        if (!fileName) return;
        const origText = link.textContent;
        try {
          link.textContent = '⏳...';
          const content = await fetchProjectFileText(fileName);
          const mime = fileName.endsWith('.html')
            ? 'text/html;charset=utf-8'
            : (fileName.endsWith('.css') ? 'text/css;charset=utf-8' : 'application/javascript;charset=utf-8');
          triggerBlobDownload(new Blob([content], { type: mime }), fileName);
          link.textContent = `✅ ${fileName}`;
        } catch (err) {
          link.textContent = '❌ Ошибка';
        }
        setTimeout(() => {
          link.textContent = origText;
        }, 2000);
      });
    });

    secretDownloadGroup.querySelectorAll('.copy-code-btn[data-copy-file]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const fileName = btn.getAttribute('data-copy-file');
        if (!fileName) return;
        const origText = btn.textContent;
        try {
          btn.textContent = '⏳...';
          const content = await fetchProjectFileText(fileName);
          await navigator.clipboard.writeText(content);
          btn.textContent = '✅ Скопировано!';
          if (downloadStatusHint) {
            downloadStatusHint.textContent = `✅ Код файла ${fileName} скопирован в буфер обмена — вставьте его в Acode!`;
          }
        } catch (err) {
          btn.textContent = '❌ Ошибка';
        }
        setTimeout(() => {
          btn.textContent = origText;
        }, 2200);
      });
    });
  }

  // ================= ПОКУПКА В МАГАЗИНЕ (ВСЕ 7 ТОВАРОВ ПО РЕЖИМАМ) =================
  const shopBuyBindings = [
    { id: 'buy-fifty-btn', key: 'fifty' },
    { id: 'buy-skip-btn', key: 'skip' },
    { id: 'buy-hlRange-btn', key: 'hlRange' },
    { id: 'buy-hlSkip-btn', key: 'hlSkip' },
    { id: 'buy-fdFact-btn', key: 'fdFact' },
    { id: 'buy-fdVisual-btn', key: 'fdVisual' },
    { id: 'buy-fdSolve-btn', key: 'fdSolve' }
  ];

  shopBuyBindings.forEach(({ id, key }) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        buyBoosterByKey(key);
      });
    }
  });

  updateShopAndProfileUI();

  // ================= ПОЛЗУНОК И СЧЕТЧИКИ СТРАН =================
  const availableCountEl = document.getElementById('available-count');
  const totalCountEl = document.getElementById('total-count');
  const slider = document.getElementById('questions-slider');
  const sliderVal = document.getElementById('questions-val');
  const sliderHint = document.getElementById('slider-hint');

  totalCountEl.textContent = typeof DB !== 'undefined' ? DB.length : 0;

  function updateCountryStatsAndSlider() {
    const filtered = getFilteredCountries();
    const count = filtered.length;
    availableCountEl.textContent = count;
    const maxPossible = Math.floor(count / 5) * 5;

    if (maxPossible < 5) {
      slider.min = 0;
      slider.max = 0;
      slider.value = 0;
      slider.disabled = true;
      sliderVal.textContent = "0";
      sliderHint.textContent = "Слишком мало стран по фильтрам";
      gameSettings.questionsCount = 0;
    } else {
      slider.disabled = false;
      slider.min = 5;
      slider.step = 5;
      slider.max = maxPossible;
      if (parseInt(slider.value, 10) > maxPossible || parseInt(slider.value, 10) < 5) {
        slider.value = Math.min(20, maxPossible);
      }
      sliderVal.textContent = slider.value;
      sliderHint.textContent = `Доступно стран: ${count} (макс. вопросов: ${maxPossible})`;
      gameSettings.questionsCount = parseInt(slider.value, 10);
    }
  }

  updateCountryStatsAndSlider();

  slider.addEventListener('input', (e) => {
    sliderVal.textContent = e.target.value;
    gameSettings.questionsCount = parseInt(e.target.value, 10);
  });

  // ================= ТЕМЫ И СЛОЖНОСТЬ =================
  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach(btn => {
    if (btn.dataset.theme === gameSettings.theme) {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.body.className = btn.dataset.theme;
      gameSettings.theme = btn.dataset.theme;
      localStorage.setItem('sg_theme', btn.dataset.theme);
    });
  });

  const diffBtns = document.querySelectorAll('.diff-btn');
  diffBtns.forEach(btn => {
    if (btn.dataset.diff === gameSettings.difficulty) {
      diffBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      diffBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameSettings.difficulty = btn.dataset.diff;
      localStorage.setItem('sg_diff', btn.dataset.diff);
    });
  });

  // Переключатель направления вопросов (Обычный / Наоборот / Двойной)
  const directionBtns = document.querySelectorAll('.direction-btn');
  directionBtns.forEach(btn => {
    if (btn.dataset.direction === gameSettings.questionDirection) {
      directionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      directionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameSettings.questionDirection = btn.dataset.direction;
      localStorage.setItem('sg_direction', btn.dataset.direction);
      updateClassicCardsDirectionUI();
    });
  });

  updateClassicCardsDirectionUI();

  // Фильтры ООН и Материки
  document.getElementById('filter-un').addEventListener('change', (e) => {
    gameSettings.onlyUN = e.target.checked;
    updateCountryStatsAndSlider();
  });

  document.getElementById('filter-mainland').addEventListener('change', (e) => {
    gameSettings.onlyMainland = e.target.checked;
    updateCountryStatsAndSlider();
  });

  const continentBtns = document.querySelectorAll('.continent-btn');
  continentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const region = btn.dataset.region;
      if (btn.classList.contains('active')) {
        if (!gameSettings.continents.includes(region)) gameSettings.continents.push(region);
      } else {
        gameSettings.continents = gameSettings.continents.filter(r => r !== region);
      }
      updateCountryStatsAndSlider();
    });
  });

  // ================= ЭНЦИКЛОПЕДИЯ (КНИГА) =================
  function renderEncyclopedia(query = '') {
    const bookList = document.getElementById('book-list');
    if (typeof DB === 'undefined' || !bookList) return;
    const q = query.trim().toLowerCase();
    const filtered = DB.filter(c => c.name.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q));

    if (filtered.length === 0) {
      bookList.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-muted);">Ничего не найдено 🔍</div>`;
      return;
    }

    // Предзагружаем портреты и флаги для первых видимых карточек
    if (typeof preloadModeImages === 'function') {
      preloadModeImages('leaders', filtered.slice(0, 24));
      preloadModeImages('flags', filtered.slice(0, 24));
    }

    bookList.innerHTML = filtered.map(c => {
      const leaderImg = (typeof getLeaderImage === 'function') ? getLeaderImage(c.code) : null;
      const leaderThumbHTML = leaderImg
        ? `<img src="${leaderImg}" alt="${c.leader}" loading="lazy" onerror="this.outerHTML='<span>👤</span>';">`
        : `<span>👤</span>`;

      return `
        <div class="country-card">
          <div class="country-card-header">
            <div class="country-card-flag clickable-flag" data-code="${c.code}" title="Нажмите на флаг, чтобы открыть полную страницу о стране">
              <img src="${getFlagUrl(c.code)}" alt="${c.name}" loading="lazy">
              <span class="flag-click-badge">ИНФО</span>
            </div>
            <div class="country-card-title">
              <h3>${c.name}</h3>
              <div class="country-card-meta-line1">${c.continent} • ${c.isUN ? 'ООН' : 'Не ООН'}</div>
              <div class="country-card-meta-line2">${c.isMainland ? 'Материковая' : 'Остров'}</div>
            </div>
            <div class="country-card-visuals">
              <!-- Фото действующего главы слева от территории -->
              <div class="country-card-leader-thumb" data-code="${c.code}" title="Глава государства: ${c.leader} (нажмите для полного досье)">
                ${leaderThumbHTML}
              </div>
              <!-- Чёткий контур территории 10m справа от фото главы -->
              <div class="country-card-map clickable-silhouette" data-code="${c.code}" title="Нажмите, чтобы подсветить страну в Атласе мира">
                ${(typeof MapsGame !== 'undefined') ? MapsGame.renderThumbnail(c.code) : '🗺️'}
              </div>
            </div>
          </div>
          <div class="country-card-info">
            <div class="info-row"><span>Столица</span><strong>🏛️ ${c.capital}</strong></div>
            <div class="info-row"><span>Действующий глава</span><strong>👤 ${c.leader}</strong></div>
            <div class="info-row"><span>Площадь</span><strong>🗺️ ${c.areaFormatted}</strong></div>
            <div class="info-row"><span>Население</span><strong>👥 ${c.population} млн</strong></div>
            <div class="info-row"><span>Температура (2025)</span><strong>🌡️ ${c.temp2025Formatted}</strong></div>
            <div class="info-row"><span>Сухопутные соседи</span><strong>🤝 ${c.neighborsCount > 0 ? `${c.neighborsCount} стр.` : 'Нет (остров)'}</strong></div>
            <div class="info-row" style="grid-column: span 2;"><span>Регионы / Города-миллионники</span><strong>🗺️ ${c.regionsCount} рег. / 🏙️ ${c.millionCitiesCount} гор.</strong></div>
            ${c.neighborNames && c.neighborNames.length > 0
              ? `<div class="info-row" style="grid-column: span 2;"><span>Границы с государствами</span><strong>${c.neighborNames.join(', ')}</strong></div>`
              : ''
            }
          </div>
          <div class="country-card-food">🍲 <strong>${c.food.name}</strong>${c.food.desc ? ` — ${c.food.desc}` : ''}</div>
        </div>
      `;
    }).join('');
  }

  // ================= ПОЛНАЯ СТРАНИЦА О СТРАНЕ (ПО КЛИКУ НА ФЛАГ) =================
  const countryDetailModal = document.getElementById('country-detail-modal');
  const closeCountryDetailBtn = document.getElementById('close-country-detail');
  const detailSearchInput = document.getElementById('detail-country-search');
  const detailSelectEl = document.getElementById('detail-country-select');
  const detailChipsEl = document.getElementById('detail-country-chips');
  const detailBodyEl = document.getElementById('country-detail-body');
  let activeDetailCode = 'RU';

  function updateDetailCountryList(searchQuery = '', selectedCode = activeDetailCode) {
    if (typeof DB === 'undefined') return;
    const q = searchQuery.trim().toLowerCase();
    const sorted = [...DB].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    const matches = q
      ? sorted.filter(c => c.name.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
      : sorted;

    if (detailSelectEl) {
      if (matches.length === 0) {
        detailSelectEl.innerHTML = `<option value="">Ничего не найдено</option>`;
      } else {
        detailSelectEl.innerHTML = matches.map(c =>
          `<option value="${c.code}" ${c.code === selectedCode ? 'selected' : ''}>${c.name} — ${c.capital} (${c.continent})</option>`
        ).join('');
      }
    }

    if (detailChipsEl) {
      if (matches.length === 0) {
        detailChipsEl.innerHTML = `<div class="detail-no-matches">Страна не найдена 🔍</div>`;
      } else {
        detailChipsEl.innerHTML = matches.map(c => `
          <button type="button" class="detail-country-chip ${c.code === selectedCode ? 'active' : ''}" data-code="${c.code}">
            <img src="${getFlagUrl(c.code)}" alt="">
            <span>${c.name}</span>
          </button>
        `).join('');

        const activeChip = detailChipsEl.querySelector('.detail-country-chip.active');
        if (activeChip && !q) {
          activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }
  }

  function renderCountryDetailBody(code) {
    if (typeof DB === 'undefined' || !detailBodyEl) return;
    const c = DB.find(item => item.code === code) || DB[0];
    if (!c) return;
    activeDetailCode = c.code;

    const leaderImg = (typeof getLeaderImage === 'function') ? getLeaderImage(c.code) : null;
    const foodImg = (typeof getFoodImage === 'function') ? getFoodImage(c.code) : null;

    if (typeof preloadSingleUrl === 'function') {
      if (leaderImg) preloadSingleUrl(leaderImg, true);
      if (foodImg) preloadSingleUrl(foodImg, true);
      preloadSingleUrl(getFlagUrl(c.code), true);
    }

    const allFoods = (c.foods && c.foods.length > 0) ? c.foods : [c.food];
    const mapDetailHTML = (typeof MapsGame !== 'undefined' && typeof MapsGame.renderDetailMapSVG === 'function')
      ? MapsGame.renderDetailMapSVG(c.code)
      : '';

    detailBodyEl.innerHTML = `
      <!-- Шапка страны с крупным флагом и статусами -->
      <div class="detail-hero-card">
        <div class="detail-hero-flag">
          <img src="${getFlagUrl(c.code)}" alt="${c.name}">
        </div>
        <div class="detail-hero-info">
          <div class="detail-iso-badge">Код ISO: ${c.code}</div>
          <h2 class="detail-country-name">${c.name}</h2>
          <div class="detail-badges-col">
            <div class="detail-meta-primary">${c.continent} • ${c.isUN ? 'Страна — член ООН' : 'Не входит в ООН (наблюдатель / частично признанная)'}</div>
            <div class="detail-meta-secondary">${c.isMainland ? '🌍 Материковое государство' : '🏝️ Островное государство'}</div>
          </div>
        </div>
      </div>

      <!-- Ключевые показатели -->
      <div class="detail-stats-grid">
        <div class="detail-stat-box">
          <span class="detail-stat-label">Столица</span>
          <strong class="detail-stat-value">🏛️ ${c.capital}</strong>
        </div>
        <div class="detail-stat-box">
          <span class="detail-stat-label">Площадь территории</span>
          <strong class="detail-stat-value">🗺️ ${c.areaFormatted}</strong>
        </div>
        <div class="detail-stat-box">
          <span class="detail-stat-label">Население</span>
          <strong class="detail-stat-value">👥 ${c.population} млн чел.</strong>
        </div>
        <div class="detail-stat-box">
          <span class="detail-stat-label">Регионы / Города-миллионники</span>
          <strong class="detail-stat-value">🗺️ ${c.regionsCount} ед. / 🏙️ ${c.millionCitiesCount}</strong>
        </div>
        <div class="detail-stat-box">
          <span class="detail-stat-label">Годовая температура (2025)</span>
          <strong class="detail-stat-value">🌡️ ${c.temp2025Formatted}</strong>
        </div>
        <div class="detail-stat-box">
          <span class="detail-stat-label">Сухопутные соседи</span>
          <strong class="detail-stat-value">🤝 ${c.neighborsCount > 0 ? `${c.neighborsCount} гос.` : '0 (нет сухопутных границ)'}</strong>
        </div>
      </div>

      <!-- Блок: Сухопутные соседи (с быстрым переходом по клику) -->
      <div class="detail-section-card detail-neighbors-card">
        <div class="detail-section-title">🤝 Сухопутные границы и страны-соседи (${c.neighborsCount || 0})</div>
        ${(c.neighbors && c.neighbors.length > 0)
          ? `<div class="detail-neighbors-chips">
               ${c.neighbors.map(nCode => {
                 const nb = DB.find(item => item.code === nCode);
                 if (!nb) return '';
                 return `
                   <button type="button" class="detail-country-chip detail-neighbor-jump" data-neighbor-code="${nb.code}" title="Открыть досье: ${nb.name}">
                     <img src="${getFlagUrl(nb.code)}" alt="">
                     <span>${nb.name}</span>
                   </button>
                 `;
               }).join('')}
             </div>`
          : `<div class="detail-no-neighbors-note">🏝️ Государство не имеет сухопутных границ с другими странами</div>`
        }
      </div>

      <!-- Блок: Глава государства и Территория 10m рядом -->
      <div class="detail-two-col">
        <div class="detail-section-card detail-leader-card">
          <div class="detail-section-title">👤 Действующий глава государства</div>
          <div class="detail-leader-portrait">
            ${leaderImg
              ? `<img src="${leaderImg}" alt="${c.leader}" onerror="this.parentElement.innerHTML='<span>👤</span>';">`
              : `<span>👤</span>`
            }
          </div>
          <h3 class="detail-leader-name">${c.leader}</h3>
          <span class="detail-leader-sub">Актуально на октябрь 2026 г.</span>
        </div>

        <div class="detail-section-card detail-territory-card">
          <div class="detail-section-header-row">
            <span class="detail-section-title">🗺️ Территория и чёткие границы (10m)</span>
            <button type="button" class="detail-open-atlas-btn" data-code="${c.code}">🔍 На карте мира</button>
          </div>
          ${mapDetailHTML}
        </div>
      </div>

      <!-- Блок: Национальная кухня (Главное блюдо с фото + все 5 блюд с описанием) -->
      <div class="detail-section-card detail-cuisine-card">
        <div class="detail-section-title">🍲 Национальная кухня и гастрономия (${allFoods.length} блюд)</div>
        <div class="detail-main-dish-row">
          <div class="detail-main-dish-photo">
            ${foodImg
              ? `<img src="${foodImg}" alt="${c.food.name}" onerror="this.parentElement.innerHTML='<span>🍲</span>';">`
              : `<span>🍲</span>`
            }
          </div>
          <div class="detail-main-dish-info">
            <span class="detail-dish-badge">Главное национальное блюдо</span>
            <h4>${c.food.name}</h4>
            <p>${c.food.desc || 'Традиционное блюдо национальной кухни'}</p>
          </div>
        </div>

        <div class="detail-all-dishes-list">
          ${allFoods.map((dish, idx) => `
            <div class="detail-dish-item ${dish.isMain ? 'is-main' : ''}">
              <div class="detail-dish-num">${idx + 1}</div>
              <div class="detail-dish-text">
                <strong>${dish.name} ${dish.isMain ? '<span class="mini-main-tag">Основное</span>' : ''}</strong>
                <span>${dish.desc || ''}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const openAtlasBtn = detailBodyEl.querySelector('.detail-open-atlas-btn');
    if (openAtlasBtn) {
      openAtlasBtn.addEventListener('click', () => {
        if (typeof MapsGame !== 'undefined') {
          MapsGame.openFullscreenAtlas(c.code);
        }
      });
    }

    detailBodyEl.querySelectorAll('.detail-neighbor-jump[data-neighbor-code]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetCode = btn.getAttribute('data-neighbor-code');
        if (targetCode) {
          renderCountryDetailBody(targetCode);
          updateDetailCountryList(detailSearchInput ? detailSearchInput.value : '', targetCode);
        }
      });
    });
  }

  function openCountryDetailModal(code) {
    if (!countryDetailModal) return;
    activeDetailCode = code || 'RU';
    if (detailSearchInput) detailSearchInput.value = '';
    updateDetailCountryList('', activeDetailCode);
    renderCountryDetailBody(activeDetailCode);
    countryDetailModal.classList.add('open');
  }

  window.openCountryDetailModal = openCountryDetailModal;

  if (closeCountryDetailBtn && countryDetailModal) {
    closeCountryDetailBtn.addEventListener('click', () => {
      countryDetailModal.classList.remove('open');
    });
    countryDetailModal.addEventListener('click', (e) => {
      if (e.target === countryDetailModal) countryDetailModal.classList.remove('open');
    });
  }

  if (detailSearchInput) {
    detailSearchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      updateDetailCountryList(val, activeDetailCode);
      const q = val.trim().toLowerCase();
      if (q && typeof DB !== 'undefined') {
        const firstMatch = DB.find(c => c.name.toLowerCase().startsWith(q) || c.capital.toLowerCase().startsWith(q));
        if (firstMatch && firstMatch.code !== activeDetailCode) {
          renderCountryDetailBody(firstMatch.code);
          if (detailSelectEl) detailSelectEl.value = firstMatch.code;
          if (detailChipsEl) {
            detailChipsEl.querySelectorAll('.detail-country-chip').forEach(btn => {
              btn.classList.toggle('active', btn.dataset.code === firstMatch.code);
            });
          }
        }
      }
    });
  }

  if (detailSelectEl) {
    detailSelectEl.addEventListener('change', (e) => {
      const code = e.target.value;
      if (code) {
        renderCountryDetailBody(code);
        updateDetailCountryList(detailSearchInput ? detailSearchInput.value : '', code);
      }
    });
  }

  if (detailChipsEl) {
    detailChipsEl.addEventListener('click', (e) => {
      const chip = e.target.closest('.detail-country-chip');
      if (chip && chip.dataset.code) {
        const code = chip.dataset.code;
        renderCountryDetailBody(code);
        if (detailSelectEl) detailSelectEl.value = code;
        detailChipsEl.querySelectorAll('.detail-country-chip').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.code === code);
        });
      }
    });
  }

  // Обработка кликов в Энциклопедии:
  const bookListEl = document.getElementById('book-list');
  if (bookListEl) {
    bookListEl.addEventListener('click', (e) => {
      const flagBtn = e.target.closest('.clickable-flag') || e.target.closest('.country-card-leader-thumb');
      if (flagBtn && flagBtn.dataset.code) {
        openCountryDetailModal(flagBtn.dataset.code);
        return;
      }

      const mapBtn = e.target.closest('.clickable-silhouette');
      if (mapBtn) {
        const code = mapBtn.dataset.code;
        if (code && typeof MapsGame !== 'undefined') {
          MapsGame.openFullscreenAtlas(code);
        }
      }
    });
  }

  document.getElementById('country-search').addEventListener('input', (e) => {
    renderEncyclopedia(e.target.value);
  });

  // ================= ЗАПУСК РЕЖИМОВ ИГРЫ =================
  // 5 классических режимов с поддержкой направлений «Обычный», «Наоборот» и «Двойной»
  ['flag-to-country', 'capitals', 'food', 'maps', 'leaders'].forEach(modeKey => {
    const modeCard = document.querySelector(`.mode-card[data-mode="${modeKey}"]`);
    if (modeCard) {
      modeCard.addEventListener('click', (e) => {
        if (gameSettings.questionDirection === 'split') {
          const splitHalf = e.target.closest('.classic-split-half[data-split-dir]');
          if (splitHalf) {
            e.stopPropagation();
            launchClassicMode(modeKey, splitHalf.dataset.splitDir);
          }
          return;
        }
        launchClassicMode(modeKey);
      });
    }
  });

  // Скрытая карточка «Страна → Флаг» (оставлена в коде для обратной совместимости)
  const countryModeCard = document.querySelector('[data-mode="country-to-flag"]');
  if (countryModeCard) {
    countryModeCard.addEventListener('click', () => {
      window.lastActiveGame = FlagGame;
      updateShopAndProfileUI();
      if (typeof FlagGame !== 'undefined') FlagGame.start('country-to-flag');
    });
  }

  // Режим 7: По фактам (угадай страну за 10 попыток)
  const factsDeductionCard = document.querySelector('[data-mode="facts-deduction"]');
  if (factsDeductionCard) {
    factsDeductionCard.addEventListener('click', () => {
      window.lastActiveGame = FactsDeductionGame;
      updateShopAndProfileUI();
      FactsDeductionGame.start();
    });
  }

  // Режим 8: Соседи (впиши всех сухопутных соседей государства)
  const neighborsModeCard = document.querySelector('[data-mode="neighbors"]');
  if (neighborsModeCard) {
    neighborsModeCard.addEventListener('click', () => {
      window.lastActiveGame = NeighborsGame;
      updateShopAndProfileUI();
      NeighborsGame.start();
    });
  }

  // Режим 9: Температура (угадай континент, диапазон или страну по годовой температуре 2025)
  const temperatureModeCard = document.querySelector('[data-mode="temperature"]');
  if (temperatureModeCard) {
    temperatureModeCard.addEventListener('click', () => {
      window.lastActiveGame = TemperatureGame;
      updateShopAndProfileUI();
      TemperatureGame.start();
    });
  }

  // Режим 10: Расстояние (угадай ближайшую и дальнюю страну по границам)
  const distanceModeCard = document.querySelector('[data-mode="distance"]');
  if (distanceModeCard) {
    distanceModeCard.addEventListener('click', () => {
      window.lastActiveGame = DistanceGame;
      updateShopAndProfileUI();
      DistanceGame.start();
    });
  }

  // Режим 11: Маршрут (проложи сухопутный путь из страны А в страну Б)
  const routeModeCard = document.querySelector('[data-mode="route"]');
  if (routeModeCard) {
    routeModeCard.addEventListener('click', () => {
      window.lastActiveGame = RouteGame;
      updateShopAndProfileUI();
      RouteGame.start();
    });
  }

  // Режим 10: Больше / Меньше (разделённая кнопка: Территория км² | Население)
  document.querySelectorAll('.split-mode-half[data-hl-type]').forEach(halfBtn => {
    halfBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const hlType = halfBtn.dataset.hlType || 'area';
      window.lastActiveGame = HigherLowerGame;
      updateShopAndProfileUI();
      HigherLowerGame.start(hlType);
    });
  });

  // Режим 12: Сортировка (5 кнопок категорий 1 | 2 | 3 | 4 | 5 + круглая кнопка памятки ?)
  document.querySelectorAll('.sorting-cat-btn[data-sort-cat]').forEach(catBtn => {
    catBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sortCat = catBtn.dataset.sortCat || '1';
      window.lastActiveGame = SortingGame;
      updateShopAndProfileUI();
      SortingGame.start(sortCat);
    });
  });

  const sortingInfoBtn = document.getElementById('sorting-info-btn');
  const sortingInfoModal = document.getElementById('sorting-info-modal');
  const closeSortingInfoBtn = document.getElementById('close-sorting-info');

  if (sortingInfoBtn && sortingInfoModal) {
    sortingInfoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sortingInfoModal.style.display = 'flex';
      sortingInfoModal.classList.add('open');
    });
  }

  if (closeSortingInfoBtn && sortingInfoModal) {
    closeSortingInfoBtn.addEventListener('click', () => {
      sortingInfoModal.style.display = 'none';
      sortingInfoModal.classList.remove('open');
    });
  }

  if (sortingInfoModal) {
    sortingInfoModal.addEventListener('click', (e) => {
      if (e.target === sortingInfoModal) {
        sortingInfoModal.style.display = 'none';
        sortingInfoModal.classList.remove('open');
      }
    });
  }

  // Отдельная кнопка Атласа всего мира в шапке
  const atlasBtn = document.getElementById('atlas-btn');
  if (atlasBtn) {
    atlasBtn.addEventListener('click', () => {
      if (typeof MapsGame !== 'undefined') {
        MapsGame.openFullscreenAtlas(null);
      }
    });
  }

  // Надёжное закрытие Атласа по кнопке «✕ Выйти» и клавише Escape
  const closeAtlasBtn = document.getElementById('close-atlas-btn');
  if (closeAtlasBtn) {
    closeAtlasBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const modal = document.getElementById('fullscreen-atlas-modal');
      if (modal) modal.style.display = 'none';
      if (typeof MapsGame !== 'undefined') MapsGame.closeFullscreenAtlas();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('fullscreen-atlas-modal');
      if (modal && modal.style.display !== 'none') {
        modal.style.display = 'none';
      }
    }
  });
  
  // ================= КРАСИВОЕ ОКНО ВЫХОДА ИЗ РАУНДА =================
  const exitGameBtn = document.getElementById('exit-game-btn');
  const cancelExitBtn = document.getElementById('cancel-exit-btn');
  const confirmExitBtn = document.getElementById('confirm-exit-btn');

  if (exitGameBtn) {
    exitGameBtn.addEventListener('click', () => {
      if (exitConfirmModal) exitConfirmModal.style.display = 'flex';
    });
  }

  if (cancelExitBtn) {
    cancelExitBtn.addEventListener('click', () => {
      if (exitConfirmModal) exitConfirmModal.style.display = 'none';
    });
  }

  if (confirmExitBtn) {
    confirmExitBtn.addEventListener('click', () => {
      if (exitConfirmModal) exitConfirmModal.style.display = 'none';
      if (window.lastActiveGame) {
        window.lastActiveGame.exit();
      }
    });
  }

  // ================= КНОПКИ ЭКРАНА РЕЗУЛЬТАТОВ =================
  const retryBtn = document.getElementById('retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      if (window.lastActiveGame) {
        if (window.lastActiveGame === FlagGame) {
          FlagGame.start(FlagGame.mode);
        } else if (window.lastActiveGame === CapitalsGame) {
          CapitalsGame.start(CapitalsGame.direction);
        } else if (window.lastActiveGame === FoodGame) {
          FoodGame.start(FoodGame.direction);
        } else if (window.lastActiveGame === MapsGame) {
          MapsGame.start(MapsGame.direction);
        } else if (window.lastActiveGame === LeadersGame) {
          LeadersGame.start(LeadersGame.direction);
        } else if (window.lastActiveGame === HigherLowerGame) {
          HigherLowerGame.start(HigherLowerGame.type);
        } else if (window.lastActiveGame === SortingGame) {
          SortingGame.start(SortingGame.categoryId);
        } else {
          window.lastActiveGame.start();
        }
      }
    });
  }

  const toMenuBtn = document.getElementById('to-menu-btn');
  if (toMenuBtn) {
    toMenuBtn.addEventListener('click', () => {
      if (window.lastActiveGame) {
        window.lastActiveGame.exit();
      }
    });
  }
});