/**
 * SllizGeo — Мобильная географическая веб-игра
 * Обновленный игровой движок script.js с поддержкой медиа-полей,
 * SVG-осевых линий BBOX и расширенной статистики базы данных.
 */

// Коды островных государств для фильтра «Только материковые страны»
const ISLAND_CODES = new Set([
  "GB", "IE", "IS", "MT", "CY", "CY-NC", "JP", "PH", "ID", "LK", "MV", "TW",
  "SG", "BH", "MG", "MU", "KM", "SC", "CV", "ST", "CU", "DO", "HT", "JM",
  "TT", "BS", "BB", "LC", "GD", "VC", "AG", "DM", "KN", "AU", "NZ", "FJ",
  "PG", "SB", "VU", "WS", "TO", "FM", "PW", "MH", "KI", "NR", "TV"
]);

// Территории, не входящие в 193 официальных государства-члена ООН
const NON_UN_CODES = new Set(["XK", "CY-NC", "TW", "PS", "EH", "VA"]);

// Глобальное состояние игры
const state = {
  countries: [],
  settings: {
    questionsCount: 15,
    unOnly: false,
    mainlandOnly: false,
    territoryLevel: "easy", // easy | medium | hard
    questionTimer: 10,      // секунд (0 = отключен)
    roundTimer: 0          // секунд (0 = отключен)
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
  stats: {} // { [countryId]: { correct: 0, wrong: 0 } }
};

// Запуск при загрузке документа
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
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    state.countries = await res.json();
    renderEncyclopedia();
    updateStatsScreen();
  } catch (err) {
    console.error("Ошибка загрузки data.json:", err);
    alert("Не удалось загрузить data.json. Убедитесь, что файл сгенерирован и лежит в корне сайта.");
  }
}

// 2. ХРАНИЛИЩЕ И УМНАЯ АДАПТИВНАЯ СЛОЖНОСТЬ
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

// 3. ПРЕДЗАГРУЗКА ИЗОБРАЖЕНИЙ В КЭШ ПАМЯТИ
function preloadImages(urls, onProgress) {
  return new Promise((resolve) => {
    const validUrls = urls.filter(u => typeof u === "string" && u.trim().length > 0);
    if (!validUrls.length) return resolve();

    let loaded = 0;
    const total = validUrls.length;

    validUrls.forEach((url) => {
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

// 4. ФИЛЬТРАЦИЯ ПУЛА И ВЫБОР ВОПРОСОВ (ИНТЕРВАЛЬНЫЙ АЛГОРИТМ)
function getCountryIso(country) {
  if (!country.flag) return "";
  return country.flag.split("/").pop().replace(".png", "").replace(".svg", "").toUpperCase();
}

function buildFilteredPool() {
  return state.countries.filter(c => {
    const iso = getCountryIso(c);
    if (state.settings.unOnly && NON_UN_CODES.has(iso)) return false;
    if (state.settings.mainlandOnly && ISLAND_CODES.has(iso)) return false;
    return true;
  });
}

function selectAdaptiveQuestions(pool, count) {
  const weighted = pool.map(c => {
    const st = state.stats[c.id] || { correct: 0, wrong: 0 };
    // Страны с ошибками выпадают чаще
    const weight = 1 + (st.wrong * 2.5) - Math.min(st.correct * 0.4, 0.9);
    return { country: c, weight: Math.max(0.15, weight) };
  });

  const selected = [];
  const chosenIds = new Set();
  const targetCount = Math.min(count, pool.length);

  while (selected.length < targetCount) {
    const totalWeight = weighted.reduce(
      (sum, item) => sum + (chosenIds.has(item.country.id) ? 0 : item.weight), 
      0
    );
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

// 5. ГРАФИЧЕСКИЕ ОСИ ПО BBOX (СЛОЖНЫЙ РЕЖИМ ТЕРРИТОРИИ)
function renderBBoxAxesSvg(bbox) {
  const north = bbox.north ?? bbox.max_lat ?? 0;
  const south = bbox.south ?? bbox.min_lat ?? 0;
  const west = bbox.west ?? bbox.min_lon ?? 0;
  const east = bbox.east ?? bbox.max_lon ?? 0;

  let dLat = Math.abs(north - south);
  if (dLat < 0.1) dLat = 0.1;

  let dLon = east >= west ? (east - west) : (360 - west + east);
  if (dLon < 0.1) dLon = 0.1;

  // Учет искажения пропорций проекции Меркатора в зависимости от широты
  const midLatRad = ((north + south) / 2) * (Math.PI / 180);
  const cosLat = Math.max(0.2, Math.cos(midLatRad));
  const aspectRatio = (dLon * cosLat) / dLat;

  const maxW = 200;
  const maxH = 100;
  let boxW, boxH;

  if (aspectRatio > maxW / maxH) {
    boxW = maxW;
    boxH = Math.max(26, Math.min(maxH, maxW / aspectRatio));
  } else {
    boxH = maxH;
    boxW = Math.max(26, Math.min(maxW, maxH * aspectRatio));
  }

  const cx = 140;
  const cy = 75;
  const x1 = cx - boxW / 2;
  const y1 = cy - boxH / 2;
  const x2 = cx + boxW / 2;
  const y2 = cy + boxH / 2;

  return `
    <div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
      <svg viewBox="0 0 280 150" width="100%" height="150" style="overflow:visible;">
        <!-- Фоновая габаритная рамка -->
        <rect x="${x1}" y="${y1}" width="${boxW}" height="${boxH}"
              fill="rgba(34, 197, 94, 0.06)" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4,4" rx="4"/>
        
        <!-- Вертикальная меридиональная ось (Север — Юг) -->
        <line x1="${cx}" y1="${y1}" x2="${cx}" y2="${y2}" stroke="#22c55e" stroke-width="1.8"/>
        <line x1="${cx - 5}" y1="${y1}" x2="${cx + 5}" y2="${y1}" stroke="#22c55e" stroke-width="2"/>
        <line x1="${cx - 5}" y1="${y2}" x2="${cx + 5}" y2="${y2}" stroke="#22c55e" stroke-width="2"/>

        <!-- Горизонтальная широтная ось (Запад — Восток) -->
        <line x1="${x1}" y1="${cy}" x2="${x2}" y2="${cy}" stroke="#22c55e" stroke-width="1.8"/>
        <line x1="${x1}" y1="${cy - 5}" x2="${x1}" y2="${cy + 5}" stroke="#22c55e" stroke-width="2"/>
        <line x1="${x2}" y1="${cy - 5}" x2="${x2}" y2="${cy + 5}" stroke="#22c55e" stroke-width="2"/>

        <!-- Центральный маркер пересечения осей -->
        <circle cx="${cx}" cy="${cy}" r="3" fill="#22c55e"/>

        <!-- Координатные подписи -->
        <text x="${cx}" y="${y1 - 6}" fill="#9ca3af" font-size="9" text-anchor="middle" font-family="monospace">С: ${north.toFixed(1)}°</text>
        <text x="${cx}" y="${y2 + 13}" fill="#9ca3af" font-size="9" text-anchor="middle" font-family="monospace">Ю: ${south.toFixed(1)}°</text>
        <text x="${x1 - 6}" y="${cy + 3}" fill="#9ca3af" font-size="9" text-anchor="end" font-family="monospace">З: ${west.toFixed(1)}°</text>
        <text x="${x2 + 6}" y="${cy + 3}" fill="#9ca3af" font-size="9" text-anchor="start" font-family="monospace">В: ${east.toFixed(1)}°</text>
      </svg>
    </div>
  `;
}

// 6. ЗАПУСК ИГРОВОГО РАУНДА
async function startRound(mode) {
  state.game.mode = mode;
  const pool = buildFilteredPool();

  if (pool.length < 4) {
    alert("Слишком строгие фильтры! В пуле должно быть минимум 4 страны.");
    return;
  }

  state.game.queue = selectAdaptiveQuestions(pool, state.settings.questionsCount);
  state.game.currentIndex = 0;
  state.game.score = 0;
  state.game.rTimeSpent = 0;

  // Определение списка картинок для предварительной загрузки
  const urlsToPreload = [];
  state.game.queue.forEach(c => {
    if (mode === "flag_to_country") urlsToPreload.push(c.flag);
    if (mode === "cuisine" && c.dish_image) urlsToPreload.push(c.dish_image);
    if (mode === "leaders" && c.leader_image) urlsToPreload.push(c.leader_image);
    if (mode === "territory" && state.settings.territoryLevel !== "hard" && c.contour_data) {
      urlsToPreload.push(c.contour_data);
    }
  });

  if (mode === "country_to_flag") {
    pool.forEach(c => { if (c.flag) urlsToPreload.push(c.flag); });
  }

  // Экран предзагрузки
  switchScreen("screen-preloader");
  const pBar = document.getElementById("loader-progress");
  const pStatus = document.getElementById("loader-status");

  await preloadImages(urlsToPreload, (loaded, total) => {
    const pct = Math.round((loaded / total) * 100);
    pBar.style.width = pct + "%";
    pStatus.innerText = `Подготовка ресурсов: ${pct}%`;
  });

  switchScreen("screen-game");
  startRoundStopwatch();
  nextQuestion();
}

// 7. СИСТЕМА ТАЙМЕРОВ
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
      handleAnswer(false, null);
    }
  }, 1000);
}

// 8. РЕНДЕР ВОПРОСА
function nextQuestion() {
  if (state.game.currentIndex >= state.game.queue.length) {
    finishRound();
    return;
  }

  state.game.isAnswered = false;
  const target = state.game.queue[state.game.currentIndex];
  state.game.currentQuestion = target;

  document.getElementById("game-progress-text").innerText = `${state.game.currentIndex + 1} / ${state.game.queue.length}`;
  document.getElementById("game-score").innerText = state.game.score;

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
    title.innerText = "Флаг какой страны показан?";
    renderTextOptions(options, target);
  } 
  else if (mode === "country_to_flag") {
    title.innerText = target.name;
    subtitle.innerText = "Выберите верный флаг этого государства";
    grid.classList.add("flags-mode");
    renderFlagOptions(options, target);
  } 
  else if (mode === "capitals") {
    title.innerText = target.capital;
    subtitle.innerText = "Столицей какого государства является этот город?";
    renderTextOptions(options, target);
  } 
  else if (mode === "cuisine") {
    if (target.dish_image) {
      media.innerHTML = `<img src="${target.dish_image}" class="question-img" alt="${target.dish}">`;
    }
    title.innerText = target.dish;
    subtitle.innerText = target.dish_desc || "Традиционное национальное блюдо";
    renderTextOptions(options, target);
  } 
  else if (mode === "leaders") {
    if (target.leader_image) {
      media.innerHTML = `
        <img src="${target.leader_image}" 
             class="question-img portrait-img" 
             alt="${target.leader_name}"
             style="width: 120px; height: 120px; object-fit: cover; border-radius: 50%; border: 3px solid var(--accent); box-shadow: 0 4px 16px rgba(0,0,0,0.5);">
      `;
    }
    title.innerText = target.leader_name;
    subtitle.innerText = `${target.leader_title} какого государства?`;
    renderTextOptions(options, target);
  } 
  else if (mode === "territory") {
    const lvl = state.settings.territoryLevel;
    if (lvl === "easy") {
      media.innerHTML = `<img src="${target.contour_data}" class="question-img" alt="Контур территории">`;
      title.innerText = "Определите территорию";
      subtitle.innerText = `Регион: ${target.region} | Площадь: ${Number(target.territory_sq_km).toLocaleString()} кв. км`;
    } else if (lvl === "medium") {
      media.innerHTML = `<img src="${target.contour_data}" class="question-img" style="filter: brightness(0) invert(1);" alt="Силуэт территории">`;
      title.innerText = "Чей это изолированный силуэт?";
    } else if (lvl === "hard") {
      media.innerHTML = renderBBoxAxesSvg(target.bbox);
      title.innerText = "Габаритные оси и пропорции территории";
      subtitle.innerText = `Макрорегион: ${target.region} (${target.continent})`;
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

// 9. ОБРАБОТКА ВЫБОРА ОТВЕТА
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

  document.querySelectorAll(".answer-btn").forEach(b => {
    b.disabled = true;
  });

  setTimeout(() => {
    state.game.currentIndex++;
    nextQuestion();
  }, 1200);
}

function highlightCorrectOption() {
  const target = state.game.currentQuestion;
  document.querySelectorAll(".answer-btn").forEach(b => {
    if (b.innerText === target.name || (b.querySelector("img") && b.querySelector("img").src === target.flag)) {
      b.classList.add("correct");
    }
  });
}

// 10. ИТОГИ РАУНДА
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

// 11. ЭНЦИКЛОПЕДИЯ И ЖИВОЙ ПОИСК
function renderEncyclopedia(filter = "") {
  const list = document.getElementById("enc-list");
  if (!list) return;
  list.innerHTML = "";

  const query = filter.trim().toLowerCase();
  const filtered = state.countries.filter(c => {
    if (!query) return true;
    const matchName = c.name.toLowerCase().includes(query);
    const matchCap = c.capital && c.capital.toLowerCase().includes(query);
    const matchReg = c.region && c.region.toLowerCase().includes(query);
    const matchCities = Array.isArray(c.major_cities) && c.major_cities.some(city => city.toLowerCase().includes(query));
    return matchName || matchCap || matchReg || matchCities;
  });

  if (!filtered.length) {
    list.innerHTML = '<p class="muted" style="text-align:center; padding:20px;">Ничего не найдено</p>';
    return;
  }

  filtered.forEach(c => {
    const item = document.createElement("div");
    item.className = "enc-item";
    item.innerHTML = `
      <img src="${c.flag}" alt="${c.name}">
      <div class="enc-item-info">
        <span class="enc-item-name">${c.name}</span>
        <span class="enc-item-sub">Столица: ${c.capital} | ${c.region || c.continent}</span>
      </div>
    `;
    item.onclick = () => openCountryDetail(c);
    list.appendChild(item);
  });
}

function openCountryDetail(c) {
  const body = document.getElementById("country-detail-body");
  const citiesStr = Array.isArray(c.major_cities) && c.major_cities.length ? c.major_cities.join(", ") : "Данные уточняются";
  const popStr = c.population ? `${Number(c.population).toLocaleString()} чел.` : "Нет данных";
  const areaStr = c.territory_sq_km ? `${Number(c.territory_sq_km).toLocaleString()} кв. км` : "Нет данных";

  body.innerHTML = `
    <img src="${c.flag}" class="detail-flag" alt="${c.name}">
    <h2 style="margin-bottom:12px; font-weight:800;">${c.name}</h2>
    
    <div class="detail-row"><span>Столица:</span><strong>${c.capital}</strong></div>
    <div class="detail-row"><span>Континент / Регион:</span><strong>${c.continent} (${c.region || "—"})</strong></div>
    <div class="detail-row"><span>Население:</span><strong class="accent">${popStr}</strong></div>
    <div class="detail-row"><span>Территория:</span><strong>${areaStr}</strong></div>
    <div class="detail-row"><span>Крупные города:</span><strong>${citiesStr}</strong></div>

    <div style="margin-top:16px; border-top:1px solid var(--border); padding-top:12px;">
      <span style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase;">Руководство страны</span>
      <div style="display:flex; align-items:center; gap:12px; margin-top:8px;">
        ${c.leader_image ? `<img src="${c.leader_image}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--accent);">` : ""}
        <div>
          <div style="font-weight:700;">${c.leader_name || "—"}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${c.leader_title || "Глава государства"}</div>
        </div>
      </div>
    </div>

    <div style="margin-top:16px; border-top:1px solid var(--border); padding-top:12px;">
      <span style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase;">Национальная кухня</span>
      <div style="font-weight:700; color:var(--accent); margin-top:6px;">${c.dish || "Традиционное блюдо"}</div>
      <p style="font-size:0.85rem; color:var(--text-muted); margin:4px 0 10px;">${c.dish_desc || ""}</p>
      ${c.dish_image ? `<img src="${c.dish_image}" class="detail-dish-img" alt="${c.dish}">` : ""}
    </div>
  `;

  document.getElementById("modal-country-detail").classList.add("active");
}

// 12. ОБНОВЛЕНИЕ ЭКРАНА СТАТИСТИКИ
function updateStatsScreen() {
  // Игровая статистика пользователя
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
    tList.innerHTML = '<p class="muted">Ошибок пока нет. Отличный результат!</p>';
  } else {
    troubled.sort((a, b) => b.wrong - a.wrong).slice(0, 8).forEach(item => {
      const row = document.createElement("div");
      row.className = "troubled-item";
      row.innerHTML = `
        <span>${item.country.name}</span>
        <span style="color:var(--danger)">${item.wrong} ош. (${item.rate}%)</span>
      `;
      tList.appendChild(row);
    });
  }

  // Расчет географических агрегатов из data.json
  renderDatabaseAggregates();
}

function renderDatabaseAggregates() {
  const statsScreen = document.getElementById("screen-stats");
  let dbBlock = document.getElementById("db-analytics-block");

  if (!dbBlock) {
    dbBlock = document.createElement("div");
    dbBlock.id = "db-analytics-block";
    dbBlock.style.marginTop = "20px";
    dbBlock.style.borderTop = "1px solid var(--border)";
    dbBlock.style.paddingTop = "14px";
    
    // Вставка перед кнопкой сброса
    const resetBtn = document.getElementById("btn-reset-stats");
    statsScreen.insertBefore(dbBlock, resetBtn);
  }

  if (!state.countries.length) return;

  const totalPop = state.countries.reduce((acc, c) => acc + (c.population || 0), 0);
  const regionsSet = new Set(state.countries.map(c => c.region).filter(Boolean));
  let totalCities = 0;
  state.countries.forEach(c => {
    if (Array.isArray(c.major_cities)) totalCities += c.major_cities.length;
  });

  dbBlock.innerHTML = `
    <div class="stats-section-title">Географический справочник (data.json)</div>
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom:14px;">
      <div class="stat-box">
        <span class="stat-num" style="font-size:1.05rem;">${(totalPop / 1e9).toFixed(2)} млрд</span>
        <span class="stat-name">Население</span>
      </div>
      <div class="stat-box">
        <span class="stat-num" style="font-size:1.05rem;">${regionsSet.size}</span>
        <span class="stat-name">Регионов</span>
      </div>
      <div class="stat-box">
        <span class="stat-num" style="font-size:1.05rem;">${totalCities}</span>
        <span class="stat-name">Городов в базе</span>
      </div>
    </div>
  `;
}

// 13. НАВИГАЦИЯ И СОБЫТИЯ
function switchScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(screenId);
  if (target) target.classList.add("active");
}

function initNavigation() {
  document.querySelectorAll(".mode-card").forEach(btn => {
    btn.onclick = () => startRound(btn.dataset.mode);
  });

  document.getElementById("btn-open-settings").onclick = () => {
    document.getElementById("modal-settings").classList.add("active");
  };
  document.getElementById("btn-open-stats").onclick = () => {
    updateStatsScreen();
    switchScreen("screen-stats");
  };
  document.getElementById("btn-open-encyclopedia").onclick = () => {
    renderEncyclopedia();
    switchScreen("screen-encyclopedia");
  };

  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.onclick = () => switchScreen(btn.dataset.back);
  });

  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.onclick = () => {
      const modalId = btn.dataset.close;
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove("active");
    };
  });

  // Живой поиск в энциклопедии
  const searchInput = document.getElementById("enc-search-input");
  if (searchInput) {
    searchInput.oninput = (e) => renderEncyclopedia(e.target.value);
  }

  // Завершение раунда с подтверждением
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

  // Кнопки после раунда
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
  if (slider && sVal) {
    slider.oninput = (e) => {
      state.settings.questionsCount = parseInt(e.target.value);
      sVal.innerText = e.target.value;
    };
  }

  const unCheck = document.getElementById("setting-un-only");
  if (unCheck) {
    unCheck.onchange = (e) => { state.settings.unOnly = e.target.checked; };
  }

  const mainlandCheck = document.getElementById("setting-mainland-only");
  if (mainlandCheck) {
    mainlandCheck.onchange = (e) => { state.settings.mainlandOnly = e.target.checked; };
  }

  document.querySelectorAll("input[name='setting-territory-lvl']").forEach(radio => {
    radio.onchange = (e) => {
      state.settings.territoryLevel = e.target.value;
    };
  });

  const qTimerInput = document.getElementById("setting-timer-question");
  if (qTimerInput) {
    qTimerInput.onchange = (e) => {
      state.settings.questionTimer = Math.max(0, parseInt(e.target.value) || 0);
    };
  }

  const rTimerInput = document.getElementById("setting-timer-round");
  if (rTimerInput) {
    rTimerInput.onchange = (e) => {
      state.settings.roundTimer = Math.max(0, parseInt(e.target.value) || 0);
    };
  }
}