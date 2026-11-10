// ================= РЕЖИМ: КУХНИ МИРА =================

const FOOD_EASY_FAMOUS = [
  'IT', 'FR', 'JP', 'MX', 'US', 'GE', 'CN', 'TR', 
  'RU', 'ES', 'GR', 'IN', 'TH', 'UA', 'DE', 'GB'
];

function getFoodCountryWeight(candidate, correctCountry, difficulty) {
  const BASE = 1.0;
  if (difficulty === 'easy') {
    return FOOD_EASY_FAMOUS.includes(candidate.code) ? BASE * 4.5 : BASE;
  }
  if (difficulty === 'hard') {
    // На сложном уровне соперники берутся из одного континента
    if (candidate.continent === correctCountry.continent) {
      return BASE * 8.0;
    }
  }
  return BASE;
}

function pickWrongFoodCountries(pool, correctCountry, difficulty) {
  let candidates = pool.filter(c => c.code !== correctCountry.code);
  const selected = [];

  for (let i = 0; i < 3 && candidates.length > 0; i++) {
    const weights = candidates.map(c => getFoodCountryWeight(c, correctCountry, difficulty));
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

const FoodGame = {
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

    const pool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
    if (pool.length < 4) {
      alert("Недостаточно стран для игры! Выберите больше регионов в настройках.");
      return;
    }

    window.lastActiveGame = FoodGame;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const count = Math.min((typeof gameSettings !== 'undefined' ? gameSettings.questionsCount : 20), shuffled.length);
    this.questions = shuffled.slice(0, count);

    if (typeof preloadModeImages === 'function') {
      preloadModeImages('food', this.questions);
      if (this.direction === 'reverse') {
        preloadModeImages('food', pool.slice(0, 32));
        preloadModeImages('flags', this.questions);
      }
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
    const allBtns = Array.from(document.querySelectorAll('.answer-btn, .reverse-visual-btn'));
    const wrongBtns = allBtns.filter(b => b.dataset.code !== currentCountry.code);
    wrongBtns.sort(() => Math.random() - 0.5).slice(0, 2).forEach(btn => {
      btn.classList.add('eliminated');
    });
  },

  applyAutoCorrect() {
    const currentCountry = this.questions[this.currentIndex];
    const correctBtn = Array.from(document.querySelectorAll('.answer-btn, .reverse-visual-btn')).find(b => b.dataset.code === currentCountry.code);
    if (correctBtn) {
      this.handleAnswer(correctBtn, currentCountry, currentCountry);
    }
  },

  pickRareDishForCountry(country) {
    const extraList = (country.foods && country.foods.length > 1)
      ? country.foods.filter(f => !f.isMain)
      : [country.food];
    return extraList[Math.floor(Math.random() * extraList.length)] || country.food;
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
    const questionBox = document.getElementById('question-box');
    const answersGrid = document.getElementById('answers-grid');
    if (!questionBox || !answersGrid) return;

    const pool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
    const wrongCountries = pickWrongFoodCountries(pool, currentCountry, currentDiff);
    const options = [currentCountry, ...wrongCountries].sort(() => Math.random() - 0.5);

    // РЕЖИМ «НАОБОРОТ»: сверху название страны (и флаг на легком) -> в #answers-grid сетка 2x2 из 4 карточек блюд
    if (this.direction === 'reverse') {
      if (currentDiff !== 'hard' && typeof preloadModeImages === 'function') {
        preloadModeImages('food', options);
      }

      const easyBadgeHTML = currentDiff === 'easy'
        ? `<div class="reverse-country-flag-pill">
             <span>🌍 ${currentCountry.continent}</span>
           </div>`
        : (currentDiff === 'hard' ? `<div class="food-hard-badge">Сложный • Редкие блюда без фото</div>` : '');

      questionBox.innerHTML = `
        <div class="food-question-box reverse-question-box">
          ${easyBadgeHTML}
          <div class="food-question-prompt">Выбери блюдо национальной кухни страны:</div>
          <h2 class="country-question-name">${currentCountry.name}</h2>
        </div>
      `;

      answersGrid.className = 'answers-grid reverse-grid-2x2 food-reverse-grid';
      answersGrid.innerHTML = '';

      options.forEach(option => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.code = option.code;

        if (currentDiff === 'hard') {
          const rareDish = this.pickRareDishForCountry(option);
          btn.className = 'reverse-visual-btn food-answer-card hard-text-card';
          btn.innerHTML = `
            <div class="food-reverse-hard-icon">🍲</div>
            <div class="food-reverse-hard-title">${rareDish.name}</div>
            ${rareDish.desc ? `<div class="food-reverse-hard-desc">${rareDish.desc}</div>` : ''}
          `;
        } else {
          const optImg = (typeof getFoodImage === 'function') ? getFoodImage(option.code) : null;
          btn.className = 'reverse-visual-btn food-answer-card';
          btn.innerHTML = `
            <div class="food-reverse-thumb">
              ${optImg
                ? `<img src="${optImg}" alt="${option.food.name}" loading="eager" draggable="false" onerror="this.parentElement.innerHTML='<span>🍲</span>';">`
                : `<span>🍲</span>`
              }
            </div>
            <div class="food-reverse-caption">${option.food.name}</div>
          `;
        }

        btn.addEventListener('click', () => this.handleAnswer(btn, option, currentCountry));
        answersGrid.appendChild(btn);
      });
      return;
    }

    // ОБЫЧНЫЙ РЕЖИМ: сверху блюдо -> в ответах 4 страны
    const imgUrl = (typeof getFoodImage === 'function') ? getFoodImage(currentCountry.code) : null;
    const photoHTML = imgUrl
      ? `<div class="food-photo-card"><img src="${imgUrl}" alt="${currentCountry.food.name}" loading="eager" draggable="false" onerror="this.parentElement.classList.add('placeholder'); this.outerHTML='<span>🍲</span><small>Фото блюда</small>';"></div>`
      : `<div class="food-photo-card placeholder"><span>🍲</span><small>Фото блюда</small></div>`;

    if (currentDiff === 'easy') {
      const allDishes = currentCountry.foods || [currentCountry.food];
      const tagsHTML = allDishes.map(d => `<span class="food-menu-tag">${d.name}</span>`).join('');

      questionBox.innerHTML = `
        <div class="food-question-box">
          ${photoHTML}
          <div class="food-question-prompt">Главное блюдо:</div>
          <h2 class="food-question-name">${currentCountry.food.name}</h2>
          ${currentCountry.food.desc ? `<div class="food-question-desc">${currentCountry.food.desc}</div>` : ''}
          <div class="food-menu-section">
            <span class="food-menu-title">Традиционные блюда (5):</span>
            <div class="food-menu-tags">${tagsHTML}</div>
          </div>
        </div>
      `;
    } else if (currentDiff === 'normal') {
      questionBox.innerHTML = `
        <div class="food-question-box">
          ${photoHTML}
          <div class="food-question-prompt">Чья это кухня?</div>
          <h2 class="food-question-name">${currentCountry.food.name}</h2>
          ${currentCountry.food.desc ? `<div class="food-question-desc">${currentCountry.food.desc}</div>` : ''}
        </div>
      `;
    } else {
      const rareDish = this.pickRareDishForCountry(currentCountry);
      questionBox.innerHTML = `
        <div class="food-question-box hard">
          <div class="food-hard-badge">Сложное блюдо</div>
          <div class="food-question-prompt">Чья это кухня?</div>
          <h2 class="food-question-name">${rareDish.name}</h2>
          ${rareDish.desc ? `<div class="food-question-desc">${rareDish.desc}</div>` : ''}
        </div>
      `;
    }

    answersGrid.className = 'answers-grid';
    answersGrid.innerHTML = '';

    options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = option.name;
      btn.dataset.code = option.code;
      btn.addEventListener('click', () => this.handleAnswer(btn, option, currentCountry));
      answersGrid.appendChild(btn);
    });
  },

  handleAnswer(selectedBtn, selectedOption, correctCountry) {
    if (this.isAnswering) return;
    this.isAnswering = true;

    const isCorrect = selectedOption.code === correctCountry.code;
    const allBtns = document.querySelectorAll('.answer-btn, .reverse-visual-btn');

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