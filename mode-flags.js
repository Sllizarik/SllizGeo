// ================= РЕЖИМЫ: ФЛАГИ И СТРАНЫ =================

const EASY_FAMOUS_CODES = [
  'US', 'JP', 'BR', 'FR', 'DE', 'CA', 'CN', 'GB', 
  'IT', 'AU', 'IN', 'RU', 'EG', 'MX', 'ES', 'AR', 
  'TR', 'KR', 'ZA', 'GR'
];

const SIMILAR_FLAG_GROUPS = [
  ['RO', 'TD'], ['MC', 'ID', 'PL'], ['IE', 'CI'], ['ML', 'GN'],
  ['AU', 'NZ'], ['NL', 'LU'], ['SE', 'NO', 'DK', 'FI', 'IS'],
  ['RU', 'RS', 'SK', 'SI', 'HR', 'CZ', 'BG'],
  ['EG', 'SY', 'IQ', 'YE', 'JO', 'PS', 'SD', 'AE', 'KW'],
  ['SN', 'CM', 'GH', 'ET', 'TG', 'BJ', 'CG'],
  ['CO', 'VE', 'EC'], ['GT', 'HN', 'SV', 'NI', 'CR'], ['JP', 'BD', 'PW']
];

function getCountryWeight(candidate, correctCountry, difficulty) {
  const BASE = 1.0;
  if (difficulty === 'easy') {
    return EASY_FAMOUS_CODES.includes(candidate.code) ? BASE * 4.5 : BASE;
  }
  if (difficulty === 'hard') {
    const matchingGroups = SIMILAR_FLAG_GROUPS.filter(g => g.includes(correctCountry.code));
    const similarCodes = matchingGroups.flat ? matchingGroups.flat() : [].concat(...matchingGroups);
    if (similarCodes.includes(candidate.code)) return BASE * 18.0;
    if (matchingGroups.length === 0 && candidate.continent === correctCountry.continent) return BASE * 2.5;
  }
  return BASE;
}

function pickWeightedWrongAnswers(pool, correctCountry, difficulty, count = 3) {
  let candidates = pool.filter(c => c.code !== correctCountry.code);
  const selected = [];

  for (let i = 0; i < count && candidates.length > 0; i++) {
    const weights = candidates.map(c => getCountryWeight(c, correctCountry, difficulty));
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * totalWeight;
    let chosenIndex = 0;

    for (let j = 0; j < candidates.length; j++) {
      r -= weights[j];
      if (r <= 0) {
        chosenIndex = j;
        break;
      }
    }
    selected.push(candidates[chosenIndex]);
    candidates.splice(chosenIndex, 1);
  }
  return selected;
}

function generateFlagOptions(correctCountry, difficulty = 'normal', pool = []) {
  const wrongOptions = pickWeightedWrongAnswers(pool, correctCountry, difficulty, 3);
  return [correctCountry, ...wrongOptions].sort(() => Math.random() - 0.5);
}

const FlagGame = {
  mode: 'flag-to-country',
  direction: 'normal',
  questions: [],
  currentIndex: 0,
  score: 0,
  isAnswering: false,
  correctCount: 0,

  start(modeOrDir) {
    if (modeOrDir === 'reverse' || modeOrDir === 'country-to-flag') {
      this.mode = 'country-to-flag';
      this.direction = 'reverse';
    } else if (modeOrDir === 'normal' || modeOrDir === 'flag-to-country') {
      this.mode = 'flag-to-country';
      this.direction = 'normal';
    } else {
      const isRev = typeof gameSettings !== 'undefined' && gameSettings.questionDirection === 'reverse';
      this.mode = isRev ? 'country-to-flag' : 'flag-to-country';
      this.direction = isRev ? 'reverse' : 'normal';
    }

    const pool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
    if (pool.length < 4) {
      alert("Недостаточно стран для игры! Выберите больше регионов в настройках.");
      return;
    }

    window.lastActiveGame = FlagGame;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const count = Math.min((typeof gameSettings !== 'undefined' ? gameSettings.questionsCount : 20), shuffled.length);
    this.questions = shuffled.slice(0, count);

    if (typeof preloadModeImages === 'function') {
      preloadModeImages('flags', this.questions);
      preloadModeImages('flags', pool);
    }

    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.isAnswering = false;

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
      if (typeof userProfile !== 'undefined' && userProfile.boosters.fifty > 0 && !this.isAnswering) {
        userProfile.boosters.fifty--;
        userProfile.save();
        this.applyFiftyFifty();
      } else {
        alert("У вас нет подсказок 50/50! Купите их в магазине 🛒");
      }
    });

    newSkip.addEventListener('click', () => {
      if (typeof userProfile !== 'undefined' && userProfile.boosters.skip > 0 && !this.isAnswering) {
        userProfile.boosters.skip--;
        userProfile.save();
        this.applyAutoCorrect();
      } else {
        alert("У вас нет бонусов «Правильный ответ»! Купите их в магазине 🛒");
      }
    });
  },

  applyFiftyFifty() {
    const currentCountry = this.questions[this.currentIndex];
    const selector = this.mode === 'flag-to-country' ? '.answer-btn' : '.flag-answer-btn';
    const allBtns = Array.from(document.querySelectorAll(selector));

    const wrongBtns = allBtns.filter(b => b.dataset.code !== currentCountry.code);
    wrongBtns.sort(() => Math.random() - 0.5).slice(0, 2).forEach(btn => {
      btn.classList.add('eliminated');
    });
  },

  applyAutoCorrect() {
    const currentCountry = this.questions[this.currentIndex];
    const selector = this.mode === 'flag-to-country' ? '.answer-btn' : '.flag-answer-btn';
    const correctBtn = Array.from(document.querySelectorAll(selector)).find(b => b.dataset.code === currentCountry.code);
    if (correctBtn) {
      this.handleAnswer(correctBtn, currentCountry, currentCountry);
    }
  },

  loadQuestion() {
    this.isAnswering = false;
    const currentCountry = this.questions[this.currentIndex];
    if (!currentCountry) return;

    const progressEl = document.getElementById('game-progress');
    const scoreEl = document.getElementById('game-score');
    if (progressEl) progressEl.textContent = `${this.currentIndex + 1} / ${this.questions.length}`;
    if (scoreEl) scoreEl.textContent = this.score;

    if (typeof updateShopAndProfileUI === 'function') {
      updateShopAndProfileUI();
    }

    const currentDiff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const pool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
    const options = generateFlagOptions(currentCountry, currentDiff, pool);

    const questionBox = document.getElementById('question-box');
    const answersGrid = document.getElementById('answers-grid');
    if (!questionBox || !answersGrid) return;
    answersGrid.innerHTML = '';

    if (this.mode === 'flag-to-country') {
      answersGrid.className = 'answers-grid';
      questionBox.innerHTML = flagHTML(currentCountry);

      options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = option.name;
        btn.dataset.code = option.code;
        btn.addEventListener('click', () => this.handleAnswer(btn, option, currentCountry));
        answersGrid.appendChild(btn);
      });
    } else {
      answersGrid.className = 'answers-grid flags-grid reverse-grid-2x2';
      const continentHintHTML = currentDiff === 'easy'
        ? `<div class="reverse-easy-badge">🌍 Континент: <strong>${currentCountry.continent}</strong></div>`
        : '';

      questionBox.innerHTML = `
        <div class="country-question-box reverse-question-box">
          ${continentHintHTML}
          <div class="country-question-prompt">Найди официальный флаг страны</div>
          <h2 class="country-question-name">${currentCountry.name}</h2>
        </div>
      `;

      options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'flag-answer-btn reverse-visual-btn';
        btn.dataset.code = option.code;
        btn.innerHTML = `<img src="${getFlagUrl(option.code)}" alt="${option.name}" draggable="false">`;
        btn.addEventListener('click', () => this.handleAnswer(btn, option, currentCountry));
        answersGrid.appendChild(btn);
      });
    }
  },

  handleAnswer(selectedBtn, selectedOption, correctCountry) {
    if (this.isAnswering) return;
    this.isAnswering = true;

    const isCorrect = selectedOption.code === correctCountry.code;
    const selector = this.mode === 'flag-to-country' ? '.answer-btn' : '.flag-answer-btn';
    const allBtns = document.querySelectorAll(selector);

    const diff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    const pointsMap = { easy: 5, normal: 10, hard: 15 };
    const points = pointsMap[diff] || 10;

    if (isCorrect) {
      selectedBtn.classList.add('correct');
      this.score += points;
      this.correctCount++;
      const scoreEl = document.getElementById('game-score');
      if (scoreEl) scoreEl.textContent = this.score;
    } else {
      selectedBtn.classList.add('wrong');
      allBtns.forEach(btn => {
        if (btn.dataset.code === correctCountry.code) {
          btn.classList.add('correct');
        }
      });
    }

    setTimeout(() => {
      this.currentIndex++;
      if (this.currentIndex < this.questions.length) {
        this.loadQuestion();
      } else {
        this.endGame();
      }
    }, 1100);
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

    document.getElementById('final-score').textContent = `${this.score} очков (${this.correctCount}/${this.questions.length})`;
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