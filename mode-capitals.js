// ================= РЕЖИМ: СТОЛИЦЫ МИРА =================

// Узнаваемые страны для режима Easy
const CAPITALS_EASY_CODES = [
  'US', 'JP', 'BR', 'FR', 'DE', 'CA', 'CN', 'GB', 
  'IT', 'AU', 'IN', 'RU', 'EG', 'MX', 'ES', 'AR', 
  'TR', 'KR'
];

// Функция расчёта весов для неправильных стран
function getCapitalCountryWeight(candidate, correctCountry, difficulty) {
  const BASE = 1.0;

  if (difficulty === 'easy') {
    return CAPITALS_EASY_CODES.includes(candidate.code) ? BASE * 4.0 : BASE;
  }

  if (difficulty === 'hard') {
    // На сложном уровне варианты берутся из того же континента
    if (candidate.continent === correctCountry.continent) {
      return BASE * 8.0;
    }
  }

  return BASE;
}

// Выбор 3 неправильных стран
function pickWeightedWrongCapitals(pool, correctCountry, difficulty) {
  let candidates = pool.filter(c => c.code !== correctCountry.code);
  const selected = [];

  for (let i = 0; i < 3 && candidates.length > 0; i++) {
    const weights = candidates.map(c => getCapitalCountryWeight(c, correctCountry, difficulty));
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

// Генерация 4 вариантов стран для заданной столицы
function generateCapitalOptions(correctCountry, difficulty, pool) {
  const wrongOptions = pickWeightedWrongCapitals(pool, correctCountry, difficulty);
  return [correctCountry, ...wrongOptions].sort(() => Math.random() - 0.5);
}

// Главный объект игры
const CapitalsGame = {
  direction: 'normal',
  questions: [],
  currentIndex: 0,
  score: 0,
  isAnswering: false,
  correctCount: 0,

  start(direction) {
    if (direction === 'reverse' || direction === 'normal') {
      this.direction = direction;
    } else {
      this.direction = (typeof gameSettings !== 'undefined' && gameSettings.questionDirection === 'reverse')
        ? 'reverse'
        : 'normal';
    }

    const pool = getFilteredCountries();
    if (pool.length < 4) {
      alert("Недостаточно стран для игры! Выберите больше регионов в настройках.");
      return;
    }

    // Запоминаем для кнопки «Играть снова»
    window.lastActiveGame = CapitalsGame;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const count = Math.min(gameSettings.questionsCount, shuffled.length);
    this.questions = shuffled.slice(0, count);

    if (this.direction === 'reverse' && typeof preloadModeImages === 'function') {
      preloadModeImages('flags', this.questions);
    }

    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.isAnswering = false;

    // Скрываем меню, открываем игровой экран
    document.querySelector('.main-screen').style.display = 'none';
    document.querySelector('.top-bar').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('results-modal').style.display = 'none';

    this.bindBoosters();
    this.loadQuestion();
  },

  // Подключение кнопок 50/50 и Ответ
  bindBoosters() {
    const fiftyBtn = document.getElementById('use-fifty-btn');
    const skipBtn = document.getElementById('use-skip-btn');

    const newFifty = fiftyBtn.cloneNode(true);
    const newSkip = skipBtn.cloneNode(true);
    fiftyBtn.parentNode.replaceChild(newFifty, fiftyBtn);
    skipBtn.parentNode.replaceChild(newSkip, skipBtn);

    newFifty.addEventListener('click', () => {
      if (userProfile.boosters.fifty > 0 && !this.isAnswering) {
        userProfile.boosters.fifty--;
        userProfile.save();
        this.applyFiftyFifty();
      } else if (userProfile.boosters.fifty <= 0) {
        alert("У вас нет подсказок 50/50! Купите их в магазине 🛒");
      }
    });

    newSkip.addEventListener('click', () => {
      if (userProfile.boosters.skip > 0 && !this.isAnswering) {
        userProfile.boosters.skip--;
        userProfile.save();
        this.applyAutoCorrect();
      } else if (userProfile.boosters.skip <= 0) {
        alert("У вас нет бонусов «Правильный ответ»! Купите их в магазине 🛒");
      }
    });
  },

  applyFiftyFifty() {
    const currentCountry = this.questions[this.currentIndex];
    const allBtns = Array.from(document.querySelectorAll('.answer-btn'));
    const wrongBtns = allBtns.filter(b => b.dataset.code !== currentCountry.code);
    wrongBtns.sort(() => Math.random() - 0.5).slice(0, 2).forEach(btn => {
      btn.classList.add('eliminated');
    });
  },

  applyAutoCorrect() {
    const currentCountry = this.questions[this.currentIndex];
    const correctBtn = Array.from(document.querySelectorAll('.answer-btn')).find(b => b.dataset.code === currentCountry.code);
    if (correctBtn) {
      this.handleAnswer(correctBtn, currentCountry, currentCountry);
    }
  },

  loadQuestion() {
    this.isAnswering = false;
    const currentCountry = this.questions[this.currentIndex];

    document.getElementById('game-progress').textContent = `${this.currentIndex + 1} / ${this.questions.length}`;
    document.getElementById('game-score').textContent = this.score;

    updateShopAndProfileUI();

    const currentDiff = gameSettings.difficulty || 'normal';
    const pool = getFilteredCountries();
    const options = generateCapitalOptions(currentCountry, currentDiff, pool);

    const questionBox = document.getElementById('question-box');
    const answersGrid = document.getElementById('answers-grid');
    answersGrid.className = 'answers-grid';
    answersGrid.innerHTML = '';

    if (this.direction === 'reverse') {
      // Наоборот: сверху название страны (и мини-флаг на легком/среднем) -> в ответах 4 названия столиц
      const showMiniFlag = currentDiff === 'easy' || currentDiff === 'normal';
      const miniFlagHTML = showMiniFlag
        ? `<div class="reverse-country-flag-pill">
             <img src="${getFlagUrl(currentCountry.code)}" alt="${currentCountry.name}" class="reverse-question-mini-flag">
             ${currentDiff === 'easy' ? `<span>${currentCountry.continent}</span>` : ''}
           </div>`
        : `<div class="capital-question-icon">🏛️</div>`;

      questionBox.innerHTML = `
        <div class="capital-question-box reverse-question-box">
          ${miniFlagHTML}
          <div class="capital-question-prompt">Назови столицу государства</div>
          <h2 class="capital-question-name">${currentCountry.name}</h2>
        </div>
      `;

      options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = option.capital;
        btn.dataset.code = option.code;
        btn.addEventListener('click', () => this.handleAnswer(btn, option, currentCountry));
        answersGrid.appendChild(btn);
      });
    } else {
      // Обычный: сверху название столицы -> в ответах 4 названия стран
      questionBox.innerHTML = `
        <div class="capital-question-box">
          <div class="capital-question-icon">🏛️</div>
          <div class="capital-question-prompt">Чья это столица?</div>
          <h2 class="capital-question-name">${currentCountry.capital}</h2>
        </div>
      `;

      options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = option.name;
        btn.dataset.code = option.code;
        btn.addEventListener('click', () => this.handleAnswer(btn, option, currentCountry));
        answersGrid.appendChild(btn);
      });
    }
  },

  handleAnswer(selectedBtn, selectedOption, correctCountry) {
    if (this.isAnswering) return;
    this.isAnswering = true;

    const isCorrect = selectedOption.code === correctCountry.code;
    const allBtns = document.querySelectorAll('.answer-btn');

    const pointsMap = { easy: 5, normal: 10, hard: 15 };
    const points = pointsMap[gameSettings.difficulty] || 10;

    if (isCorrect) {
      selectedBtn.classList.add('correct');
      this.score += points;
      this.correctCount++;
      document.getElementById('game-score').textContent = this.score;
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

    userProfile.coins += earnedCoins;
    userProfile.stars += earnedStars;
    userProfile.gamesPlayed += 1;
    userProfile.save();

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