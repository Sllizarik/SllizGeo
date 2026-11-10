// ================= РЕЖИМ: ЛИДЕРЫ СТРАН (ДЕЙСТВУЮЩИЕ ГЛАВЫ ГОСУДАРСТВ 2022+) =================

const LEADERS_EASY_FAMOUS = [
  'US', 'RU', 'CN', 'FR', 'IT', 'GB', 'DE', 'UA',
  'TR', 'IN', 'JP', 'BR', 'AR', 'CA', 'BY', 'KZ',
  'KP', 'SA', 'IL', 'HU', 'PL', 'ES', 'MX', 'UZ'
];

function getLeaderCountryWeight(candidate, correctCountry, difficulty) {
  const BASE = 1.0;
  if (difficulty === 'easy') {
    return LEADERS_EASY_FAMOUS.includes(candidate.code) ? BASE * 4.5 : BASE;
  }
  if (difficulty === 'hard') {
    if (candidate.continent === correctCountry.continent) {
      return BASE * 8.0;
    }
  }
  return BASE;
}

function pickWrongLeaderCountries(pool, correctCountry, difficulty) {
  let candidates = pool.filter(c => c.code !== correctCountry.code);
  const selected = [];

  for (let i = 0; i < 3 && candidates.length > 0; i++) {
    const weights = candidates.map(c => getLeaderCountryWeight(c, correctCountry, difficulty));
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

const LeadersGame = {
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

    window.lastActiveGame = LeadersGame;

    const currentDiff = typeof gameSettings !== 'undefined' ? gameSettings.difficulty : 'normal';
    let orderedPool = [...pool];
    if (currentDiff === 'easy') {
      // На лёгком уровне чаще попадаются самые узнаваемые мировые лидеры
      orderedPool.sort((a, b) => {
        const aFam = LEADERS_EASY_FAMOUS.includes(a.code) ? 0.35 : 0;
        const bFam = LEADERS_EASY_FAMOUS.includes(b.code) ? 0.35 : 0;
        return (Math.random() - aFam) - (Math.random() - bFam);
      });
    } else {
      orderedPool.sort(() => Math.random() - 0.5);
    }

    const count = Math.min((typeof gameSettings !== 'undefined' ? gameSettings.questionsCount : 20), orderedPool.length);
    this.questions = orderedPool.slice(0, count);

    if (typeof preloadModeImages === 'function') {
      preloadModeImages('leaders', this.questions);
      if (this.direction === 'reverse') {
        preloadModeImages('leaders', orderedPool.slice(0, 32));
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
        const currentCountry = this.questions[this.currentIndex];
        const allBtns = Array.from(document.querySelectorAll('.answer-btn, .reverse-visual-btn'));
        const wrongBtns = allBtns.filter(b => b.dataset.code !== currentCountry.code);
        wrongBtns.sort(() => Math.random() - 0.5).slice(0, 2).forEach(btn => btn.classList.add('eliminated'));
      } else {
        alert("У вас нет подсказок 50/50! Купите их в магазине 🛒");
      }
    });

    newSkip.addEventListener('click', () => {
      if (typeof userProfile !== 'undefined' && userProfile.boosters.skip > 0 && !this.isAnswering) {
        userProfile.boosters.skip--;
        userProfile.save();
        const currentCountry = this.questions[this.currentIndex];
        const correctBtn = Array.from(document.querySelectorAll('.answer-btn, .reverse-visual-btn')).find(b => b.dataset.code === currentCountry.code);
        if (correctBtn) this.handleAnswer(correctBtn, currentCountry, currentCountry);
      } else {
        alert("У вас нет бонусов «Правильный ответ»! Купите их в магазине 🛒");
      }
    });
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
    const wrongOptions = pickWrongLeaderCountries(pool, currentCountry, currentDiff);
    const options = [currentCountry, ...wrongOptions].sort(() => Math.random() - 0.5);

    // РЕЖИМ «НАОБОРОТ»: сверху ФИО лидера (на easy с титулом/страной, на normal и hard только ФИО) -> сетка 2x2 из 4 портретов
    if (this.direction === 'reverse') {
      if (typeof preloadModeImages === 'function') {
        preloadModeImages('leaders', options);
      }

      const easyCountrySubHTML = currentDiff === 'easy'
        ? `<div class="reverse-country-flag-pill">
             <img src="${getFlagUrl(currentCountry.code)}" alt="${currentCountry.name}" class="reverse-question-mini-flag">
             <span>Глава государства: <strong>${currentCountry.name}</strong> (${currentCountry.continent})</span>
           </div>`
        : (currentDiff === 'hard' ? `<div class="food-hard-badge">Сложный • Только ФИО</div>` : '');

      questionBox.innerHTML = `
        <div class="leader-question-box reverse-question-box">
          ${easyCountrySubHTML}
          <div class="food-question-prompt">Найди портрет этого лидера:</div>
          <h2 class="country-question-name leader-reverse-name">${currentCountry.leader}</h2>
        </div>
      `;

      answersGrid.className = 'answers-grid reverse-grid-2x2 leaders-reverse-grid';
      answersGrid.innerHTML = '';

      options.forEach(option => {
        const optImg = (typeof getLeaderImage === 'function') ? getLeaderImage(option.code) : null;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'reverse-visual-btn leader-answer-card';
        btn.dataset.code = option.code;
        btn.innerHTML = optImg
          ? `<img src="${optImg}" alt="${option.leader}" loading="eager" draggable="false"
                  onerror="this.parentElement.innerHTML='<span class=\\'leader-fallback-emoji\\'>👤</span><small>${option.name}</small>';">`
          : `<span class="leader-fallback-emoji">👤</span><small>${option.name}</small>`;
        btn.addEventListener('click', () => this.handleAnswer(btn, option, currentCountry));
        answersGrid.appendChild(btn);
      });
      return;
    }

    // ОБЫЧНЫЙ РЕЖИМ: сверху 1 фото и ФИО лидера -> в ответах 4 страны
    const imgUrl = (typeof getLeaderImage === 'function') ? getLeaderImage(currentCountry.code) : null;
    const photoHTML = imgUrl
      ? `<div class="leader-photo-card">
           <img src="${imgUrl}" alt="Глава государства" loading="eager" draggable="false"
                onerror="this.parentElement.classList.add('placeholder'); this.outerHTML='<span>👤</span><small>Портрет лидера</small>';">
         </div>`
      : `<div class="leader-photo-card placeholder"><span>👤</span><small>Портрет лидера</small></div>`;

    if (currentDiff === 'easy') {
      questionBox.innerHTML = `
        <div class="leader-question-box">
          ${photoHTML}
          <div class="food-question-prompt">Действующий глава государства (${currentCountry.continent}):</div>
          <h2 class="food-question-name">${currentCountry.leader}</h2>
        </div>
      `;
    } else if (currentDiff === 'normal') {
      questionBox.innerHTML = `
        <div class="leader-question-box">
          ${photoHTML}
          <div class="food-question-prompt">Какую страну возглавляет этот лидер?</div>
          <h2 class="food-question-name">${currentCountry.leader}</h2>
        </div>
      `;
    } else {
      questionBox.innerHTML = `
        <div class="leader-question-box hard">
          <div class="food-hard-badge">Сложный уровень • По портрету</div>
          ${photoHTML}
          <div class="food-question-prompt">Главой какого государства является этот человек?</div>
          ${!imgUrl ? `<h2 class="food-question-name">${currentCountry.leader}</h2>` : ''}
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
        if (btn.dataset.code === correctCountry.code) btn.classList.add('correct');
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
