/**
 * SllizGeo — Мобильная географическая веб-игра
 * Архитектура: Vanilla JS, LocalStorage адаптивность, предзагрузка картинок.
 */

// Список островных государств для фильтра «Только материковые страны»
const ISLAND_CODES = new Set([
  "GB", "IE", "IS", "MT", "CY", "CY-NC", "JP", "PH", "ID", "LK", "MV", "TW", 
  "SG", "BH", "MG", "MU", "KM", "SC", "CV", "ST", "CU", "DO", "HT", "JM", 
  "TT", "BS", "BB", "LC", "GD", "VC", "AG", "DM", "KN", "AU", "NZ", "FJ", 
  "PG", "SB", "VU", "WS", "TO", "FM", "PW", "MH", "KI", "NR", "TV"
]);

// Непризнанные / частично признанные территории (не члены ООН)
const NON_UN_CODES = new Set(["XK", "CY-NC", "TW", "PS", "EH", "VA"]);

// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
const state = {
  countries: [],
  settings: {
    questionsCount: 15,
    unOnly: false,
    mainlandOnly: false,
    territoryLevel: "easy", // easy, medium, hard
    questionTimer: 10,      // сек (0 — выкл)
    roundTimer: 0          // сек (0 — выкл)
  },
  game: {
    mode: null,
    queue: [],
    currentIndex: 0,
    score: 0,
    currentQuestion: null,
    isAnswered: false,
    qTimerInterval: null,
    rTimerInterval: null,
    qTimeLeft: 0,
    rTimeSpent: 0
  },
  stats: {} // { countryId: { correct: 0, wrong: 0 } }
};

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener("DOMContentLoaded", async () => {
  loadStoredStats();
  initSettingsListeners();
  initNavigation();
  await loadDatabase();
});

// 1. ЗАГРУЗКА БАЗЫ ДАННЫХ
async function loadDatabase() {
  try {
    const res = await fetch("data.json");
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    state.countries = await res.json();
    renderEncyclopedia();
    updateStatsScreen();
  } catch (err) {
    alert("Ошибка загрузки data.json. Убедитесь, что файл сгенерирован и находится в одной папке с веб-игрой.");
    console.error(err);
  }
}

// 2. ХРАНИЛИЩЕ И УМНАЯ СЛОЖНОСТЬ
function loadStoredStats() {
  const saved = localStorage.getItem("sllizgeo_stats");
  state.stats = saved ? JSON.parse(saved) : {};
}

function recordAnswerStat(countryId, isCorrect) {
  if (!state.stats[countryId]) {
    state.stats[countryId] = { correct: 0, wrong: 0 };
  }
  if (isCorrect) {
    state.stats[countryId].correct++;
  } else {
    state.stats[countryId].wrong++;
  }
  localStorage.setItem("sllizgeo_stats", JSON.stringify(state.stats));
}

// 3. ПРЕДЗАГРУЗКА ИЗОБРАЖЕНИЙ В ОЗУ
function preloadImages(urlList, onProgress) {
  return new Promise((resolve) => {
    if (!urlList.length) return resolve();
    let loaded = 0;
    const total = urlList.length;

    urlList.forEach((url) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (onProgress) onProgress(loaded, total);
        if (loaded >= total) resolve();
      };
      img.src = url;
    });
  });
}

// 4. ГЕНЕРАТОР РАУНДА И АДАПТИВНАЯ ВЫБОРКА
function buildFilteredPool() {
  return state.countries.filter(c => {
    const iso = c.flag.split("/").pop().replace(".png", "").toUpperCase();
    if (state.settings.unOnly && NON_UN_CODES.has(iso)) return false;
    if (state.settings.mainlandOnly && ISLAND_CODES.has(iso)) return false;
    return true;
  });
}

function selectAdaptiveQuestions(pool, count) {
  // Вычисляем веса: страны с большим числом ошибок имеют повышенный вес
  const weighted = pool.map(c => {
    const st = state.stats[c.id] || { correct: 0, wrong: 0 };
    // Базовый вес = 1. Каждая ошибка дает +2 к шансу выпадения
    const weight = 1 + (st.wrong * 2) - Math.min(st.correct * 0.3, 0.8);
    return { country: c, weight: Math.max(0.2, weight) };
  });

  const selected = [];
  const chosenIds = new Set();
  const targetCount = Math.min(count, pool.length);

  while (selected.length < targetCount) {
    const totalWeight = weighted.reduce((acc, item) => acc + (chosenIds.has(item.country.id) ? 0 : item.weight), 0);
    let rand = Math.random() * totalWeight;

    for (const item of weighted) {
      if (chosenIds.has(item.country.id)) continue;
      rand -= item.weight;
      if (rand <= 0) {
        selected.push(item.country);
        chosenIds.add(item.country.id);
        break;
      }
    }
  }

  return selected;
}

// 5. ЗАПУСК ИГРОВОГО РАУНДА
async function startRound(mode) {
  state.game.mode = mode;
  const pool = buildFilteredPool();

  if (pool.length < 4) {
    alert("Слишком жесткие фильтры! В пуле осталось меньше 4 стран.");
    return;
  }

  state.game.queue = selectAdaptiveQuestions(pool, state.settings.questionsCount);
  state.game.currentIndex = 0;
  state.game.score = 0;
  state.game.rTimeSpent = 0;

  // Формируем список картинок для предзагрузки в зависимости от режима
  const urlsToPreload = [];
  state.game.queue.forEach(c => {
    if (mode === "flag_to_country" || mode === "country_to_flag") urlsToPreload.push(c.flag);
    if (mode === "cuisine") urlsToPreload.push(c.dish_image);
    if (mode === "territory" && state.settings.territoryLevel !== "hard") urlsToPreload.push(c.contour_data);
  });

  // Переход на экран загрузки
  switchScreen("screen-preloader");
  const pBar = document.getElementById("loader-progress");
  const pStatus = document.getElementById("loader-status");

  await preloadImages(urlsToPreload, (loaded, total) => {
    const pct = Math.round((loaded / total) * 100);
    pBar.style.width = pct + "%";
    pStatus.innerText = `Кэширование медиа: ${pct}%`;
  });

  // Запуск игры
  switchScreen("screen-game");
  startRoundStopwatch();
  nextQuestion();
}

// 6. ТАЙМЕРЫ
function startRoundStopwatch() {
  clearInterval(state.game.rTimerInterval);
  state.game.rTimerInterval = setInterval(() => {
    state.game.rTimeSpent++;
    const m = String(Math.floor(state.game.rTimeSpent / 60)).padStart(2, "0");
    const s = String(state.game.rTimeSpent % 60).padStart(2, "0");
    document.getElementById("round-timer-badge").innerText = `⏱️ ${m}:${s}`;
  }, 1000);
}

function resetQuestionTimer() {
  clearInterval(state.game.qTimerInterval);
  const qBadge = document.getElementById("question-timer-badge");

  if (state.settings.questionTimer <= 0) {
    qBadge.style.display = "none";
    return;
  }

  qBadge.style.display = "inline-block";
  state.game.qTimeLeft = state.settings.questionTimer;
  qBadge.innerText = `⏳ ${state.game.qTimeLeft}`;

  state.game.qTimerInterval = setInterval(() => {
    state.game.qTimeLeft--;
    qBadge.innerText = `⏳ ${state.game.qTimeLeft}`;

    if (state.game.qTimeLeft <= 0) {
      clearInterval(state.game.qTimerInterval);
      handleTimeout();
    }
  }, 1000);
}

// 7. ПОКАЗ ВОПРОСА
function nextQuestion() {
  if (state.game.currentIndex >= state.game.queue.length) {
    finishRound();
    return;
  }

  state.game.isAnswered = false;
  const target = state.game.queue[state.game.currentIndex];
  state.game.currentQuestion = target;

  // Обновление шапки
  document.getElementById("game-progress-text").innerText = `${state.game.currentIndex + 1} / ${state.game.queue.length}`;
  document.getElementById("game-score").innerText = state.game.score;

  // Подготовка 4 вариантов (1 правильный + 3 случайных дистрактора)
  const pool = buildFilteredPool();
  const distractors = pool
    .filter(c => c.id !== target.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
  const options = [...distractors, target].sort(() => 0.5 - Math.random());

  renderQuestionContent(target, options);
  resetQuestionTimer();
}

function renderQuestionContent(target, options) {
  const media = document.getElementById("question-media-wrapper");
  const title = document.getElementById("question-title");
  const subtitle = document.getElementById("question-subtitle");
  const grid = document.getElementById("answers-grid");

  media.innerHTML = "";
  subtitle.innerText = "";
  grid.className = "answers-grid";

  const mode = state.game.mode;

  if (mode === "flag_to_country") {
    media.innerHTML = `<img src="${target.flag}" class="question-img" alt="Флаг">`;
    title.innerText = "Флаг какой страны представлен?";
    renderTextOptions(options, target);
  } 
  else if (mode === "country_to_flag") {
    title.innerText = target.name;
    subtitle.innerText = "Выберите флаг этого государства";
    grid.classList.add("flags-mode");
    renderFlagOptions(options, target);
  } 
  else if (mode === "capitals") {
    title.innerText = target.capital;
    subtitle.innerText = "Столицей какой страны является этот город?";
    renderTextOptions(options, target);
  } 
  else if (mode === "cuisine") {
    media.innerHTML = `<img src="${target.dish_image}" class="question-img" alt="Блюдо">`;
    title.innerText = target.dish;
    subtitle.innerText = target.dish_desc;
    renderTextOptions(options, target);
  } 
  else if (mode === "leaders") {
    title.innerText = target.leader_name;
    subtitle.innerText = `${target.leader_title} какого государства?`;
    renderTextOptions(options, target);
  } 
  else if (mode === "territory") {
    const lvl = state.settings.territoryLevel;
    if (lvl === "easy") {
      media.innerHTML = `<img src="${target.contour_data}" class="question-img" alt="Контур">`;
      title.innerText = "Узнайте силуэт территории";
      subtitle.innerText = `Регион: ${target.region_group.replace("_", " ")} | Площадь: ${target.territory_sq_km.toLocaleString()} кв. км`;
    } else if (lvl === "medium") {
      media.innerHTML = `<img src="${target.contour_data}" class="question-img" style="filter: brightness(0) invert(1);" alt="Силуэт">`;
      title.innerText = "Чей это изолированный контур?";
    } else if (lvl === "hard") {
      const b = target.bbox;
      media.innerHTML = `
        <div class="bbox-canvas-card">
          <div class="bbox-axis-row"><span>Север: ${b.max_lat}°</span><span>Восток: ${b.max_lon}°</span></div>
          <div style="text-align:center; color:#fff; font-size:1.1rem; font-weight:800;">[ Геометрический BBOX ]</div>
          <div class="bbox-axis-row"><span>Юг: ${b.min_lat}°</span><span>Запад: ${b.min_lon}°</span></div>
        </div>
      `;
      title.innerText = "Определите страну по координатным осям";
      subtitle.innerText = `Континент: ${target.continent}`;
    }
    renderTextOptions(options, target);
  }
}

function renderTextOptions(options, target) {
  const grid = document.getElementById("answers-grid");
  grid.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.innerText = opt.name;
    btn.onclick = () => handleAnswer(opt.id === target.id, btn);
    grid.appendChild(btn);
  });
}

function renderFlagOptions(options, target) {
  const grid = document.getElementById("answers-grid");
  grid.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "answer-btn flag-btn";
    btn.innerHTML = `<img src="${opt.flag}" alt="Флаг">`;
    btn.onclick = () => handleAnswer(opt.id === target.id, btn);
    grid.appendChild(btn);
  });
}

// 8. ОБРАБОТКА ОТВЕТОВ
function handleAnswer(isCorrect, clickedBtn) {
  if (state.game.isAnswered) return;
  state.game.isAnswered = true;
  clearInterval(state.game.qTimerInterval);

  const target = state.game.currentQuestion;
  recordAnswerStat(target.id, isCorrect);

  if (isCorrect) {
    state.game.score++;
    if (clickedBtn) clickedBtn.classList.add("correct");
  } else {
    if (clickedBtn) clickedBtn.classList.add("wrong");
    highlightCorrectOption();
  }

  // Блокировка всех кнопок
  document.querySelectorAll(".answer-btn").forEach(b => b.disabled = true);

  setTimeout(() => {
    state.game.currentIndex++;
    nextQuestion();
  }, 1200);
}

function handleTimeout() {
  handleAnswer(false, null);
}

function highlightCorrectOption() {
  const target = state.game.currentQuestion;
  const buttons = document.querySelectorAll(".answer-btn");
  buttons.forEach(b => {
    if (b.innerText === target.name || (b.querySelector("img") && b.querySelector("img").src === target.flag)) {
      b.classList.add("correct");
    }
  });
}

// 9. ИТОГИ РАУНДА
function finishRound() {
  clearInterval(state.game.qTimerInterval);
  clearInterval(state.game.rTimerInterval);

  const total = state.game.queue.length;
  const score = state.game.score;
  const pct = Math.round((score / total) * 100);

  document.getElementById("res-score").innerText = `${score} / ${total}`;
  document.getElementById("res-accuracy").innerText = `${pct}%`;

  const m = String(Math.floor(state.game.rTimeSpent / 60)).padStart(2, "0");
  const s = String(state.game.rTimeSpent % 60).padStart(2, "0");
  document.getElementById("res-time").innerText = `${m}:${s}`;

  const emoji = document.getElementById("result-emoji");
  if (pct >= 90) emoji.innerText = "🏆";
  else if (pct >= 60) emoji.innerText = "⭐";
  else emoji.innerText = "📚";

  updateStatsScreen();
  switchScreen("screen-result");
}

// 10. ЭКРАН ЭНЦИКЛОПЕДИИ
function renderEncyclopedia(filter = "") {
  const list = document.getElementById("enc-list");
  list.innerHTML = "";

  const q = filter.trim().toLowerCase();
  const filtered = state.countries.filter(c => 
    c.name.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q)
  );

  filtered.forEach(c => {
    const item = document.createElement("div");
    item.className = "enc-item";
    item.innerHTML = `
      <img src="${c.flag}" alt="${c.name}">
      <div class="enc-item-info">
        <span class="enc-item-name">${c.name}</span>
        <span class="enc-item-sub">Столица: ${c.capital}</span>
      </div>
    `;
    item.onclick = () => openCountryDetail(c);
    list.appendChild(item);
  });
}

function openCountryDetail(c) {
  const body = document.getElementById("country-detail-body");
  body.innerHTML = `
    <img src="${c.flag}" class="detail-flag" alt="${c.name}">
    <h2 style="margin-bottom:12px; font-weight:800;">${c.name}</h2>
    <div class="detail-row"><span>Столица:</span><strong>${c.capital}</strong></div>
    <div class="detail-row"><span>Континент:</span><strong>${c.continent}</strong></div>
    <div class="detail-row"><span>Площадь:</span><strong>${c.territory_sq_km.toLocaleString()} кв. км</strong></div>
    <div class="detail-row"><span>Лидер:</span><strong>${c.leader_title} ${c.leader_name}</strong></div>
    <div class="detail-row"><span>Традиционное блюдо:</span><strong class="accent">${c.dish}</strong></div>
    <p style="font-size:0.85rem; color:var(--text-muted); margin:10px 0;">${c.dish_desc}</p>
    <img src="${c.dish_image}" class="detail-dish-img" alt="${c.dish}">
  `;
  document.getElementById("modal-country-detail").classList.add("active");
}

// 11. ЭКРАН СТАТИСТИКИ
function updateStatsScreen() {
  let totalAns = 0;
  let totalCorr = 0;
  const troubled = [];

  for (const [id, s] of Object.entries(state.stats)) {
    const sum = s.correct + s.wrong;
    totalAns += sum;
    totalCorr += s.correct;

    if (s.wrong > 0) {
      const c = state.countries.find(x => x.id === parseInt(id));
      if (c) {
        const errorRate = Math.round((s.wrong / sum) * 100);
        troubled.push({ country: c, wrong: s.wrong, rate: errorRate });
      }
    }
  }

  document.getElementById("stat-total-answers").innerText = totalAns;
  document.getElementById("stat-overall-acc").innerText = totalAns > 0 ? `${Math.round((totalCorr / totalAns) * 100)}%` : "0%";
  document.getElementById("stat-known-countries").innerText = Object.keys(state.stats).length;

  const tList = document.getElementById("troubled-countries-list");
  tList.innerHTML = "";

  if (!troubled.length) {
    tList.innerHTML = '<p class="muted">Ошибок пока не зафиксировано. Продолжайте тренировки!</p>';
    return;
  }

  troubled.sort((a, b) => b.wrong - a.wrong).slice(0, 10).forEach(item => {
    const row = document.createElement("div");
    row.className = "troubled-item";
    row.innerHTML = `
      <span>${item.country.name}</span>
      <span style="color:var(--danger)">Ошибок: ${item.wrong} (${item.rate}%)</span>
    `;
    tList.appendChild(row);
  });
}

// 12. НАВИГАЦИЯ И СЛУШАТЕЛИ
function switchScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
}

function initNavigation() {
  // Выбор режима игры
  document.querySelectorAll(".mode-card").forEach(btn => {
    btn.onclick = () => startRound(btn.dataset.mode);
  });

  // Кнопки нижнего меню
  document.getElementById("btn-open-settings").onclick = () => document.getElementById("modal-settings").classList.add("active");
  document.getElementById("btn-open-stats").onclick = () => switchScreen("screen-stats");
  document.getElementById("btn-open-encyclopedia").onclick = () => switchScreen("screen-encyclopedia");

  // Кнопки «Назад»
  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.onclick = () => switchScreen(btn.dataset.back);
  });

  // Закрытие модальных окон
  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.onclick = () => document.getElementById(btn.dataset.close).classList.remove("active");
  });

  // Поиск в энциклопедии
  document.getElementById("enc-search-input").oninput = (e) => {
    renderEncyclopedia(e.target.value);
  };

  // Выход из игры с подтверждением
  document.getElementById("btn-game-exit").onclick = () => {
    document.getElementById("modal-confirm-exit").classList.add("active");
  };
  document.getElementById("btn-exit-cancel").onclick = () => {
    document.getElementById("modal-confirm-exit").classList.remove("active");
  };
  document.getElementById("btn-exit-confirm").onclick = () => {
    clearInterval(state.game.qTimerInterval);
    clearInterval(state.game.rTimerInterval);
    document.getElementById("modal-confirm-exit").classList.remove("active");
    switchScreen("screen-menu");
  };

  // Кнопки экрана результатов
  document.getElementById("btn-replay").onclick = () => startRound(state.game.mode);
  document.getElementById("btn-result-menu").onclick = () => switchScreen("screen-menu");

  // Сброс статистики
  document.getElementById("btn-reset-stats").onclick = () => {
    if (confirm("Вы действительно хотите удалить всю историю статистики?")) {
      state.stats = {};
      localStorage.removeItem("sllizgeo_stats");
      updateStatsScreen();
    }
  };
}

function initSettingsListeners() {
  const slider = document.getElementById("setting-questions-count");
  const sVal = document.getElementById("slider-val");
  slider.oninput = (e) => {
    state.settings.questionsCount = parseInt(e.target.value);
    sVal.innerText = e.target.value;
  };

  document.getElementById("setting-un-only").onchange = (e) => {
    state.settings.unOnly = e.target.checked;
  };

  document.getElementById("setting-mainland-only").onchange = (e) => {
    state.settings.mainlandOnly = e.target.checked;
  };

  document.querySelectorAll("input[name='setting-territory-lvl']").forEach(radio => {
    radio.onchange = (e) => {
      state.settings.territoryLevel = e.target.value;
    };
  });

  document.getElementById("setting-timer-question").onchange = (e) => {
    state.settings.questionTimer = Math.max(0, parseInt(e.target.value) || 0);
  };

  document.getElementById("setting-timer-round").onchange = (e) => {
    state.settings.roundTimer = Math.max(0, parseInt(e.target.value) || 0);
  };
}