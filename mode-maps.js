/* ================= MODE-MAPS.JS (10m WORLD ATLAS & HIGH-PRECISION CONTOURS) ================= */

function pickWrongMapCountries(pool, correctCountry, difficulty) {
  let candidates = pool.filter(c => c.code !== correctCountry.code);
  const selected = [];

  for (let i = 0; i < 3 && candidates.length > 0; i++) {
    const weights = candidates.map(c => {
      let w = 1.0;
      if (difficulty === 'hard' && c.continent === correctCountry.continent) w *= 7.0;
      return w;
    });
    const totalWeight = weights.reduce((s, val) => s + val, 0);
    let r = Math.random() * totalWeight;
    let chosenIdx = 0;

    for (let j = 0; j < candidates.length; j++) {
      r -= weights[j];
      if (r <= 0) {
        chosenIdx = j;
        break;
      }
    }
    selected.push(candidates[chosenIdx]);
    candidates.splice(chosenIdx, 1);
  }
  return selected;
}

const MapsGame = {
  questions: [],
  currentIndex: 0,
  score: 0,
  isAnswering: false,
  correctCount: 0,
  geoFeaturesMap: {},
  allFeaturesList: [],
  isAtlasLoaded: false,
  isLoadingAtlas: false,

  currentAtlasCode: null,
  d3ZoomInstance: null,
  currentZoomTransform: null,

  // Safe North-up Mercator projection rotated ONLY in longitude so:
  // 1) North is always strictly UP (no strange tilt).
  // 2) Russia (RU), Fiji (FJ), Kiribati (KI), Tuvalu (TV), USA (US) never wrap across the 180° meridian.
  // 3) Never calls .center() after .rotate() + .fitExtent(), preventing the camera shift onto USA/Canada.
  createCountryProjection(code, feature, extentBox) {
    const proj = d3.geoMercator().precision(0.01);
    if (code === 'RU') {
      proj.rotate([-100, 0]);
    } else if (code === 'FJ' || code === 'KI' || code === 'TV' || code === 'NZ' || code === 'TO' || code === 'WS') {
      proj.rotate([-178, 0]);
    } else {
      const centroid = d3.geoCentroid(feature);
      if (centroid && Number.isFinite(centroid[0])) {
        proj.rotate([-centroid[0], 0]);
      }
    }
    proj.fitExtent(extentBox, feature);
    return proj;
  },

  async initAtlas() {
    if (this.isAtlasLoaded && Object.keys(this.geoFeaturesMap).length >= 200) return true;
    if (this.isLoadingAtlas) return false;
    this.isLoadingAtlas = true;

    try {
      if (typeof window.ATLAS_10M_DATA !== 'undefined') {
        const sanitizeGeom = (geom) => {
          if (!geom || !geom.coordinates || typeof d3 === 'undefined') return geom;
          if (geom.type === 'Polygon') {
            if (d3.geoArea({ type: 'Feature', geometry: geom }) > Math.PI) {
              return { type: 'Polygon', coordinates: geom.coordinates.map(r => [...r].reverse()) };
            }
            return geom;
          }
          if (geom.type === 'MultiPolygon') {
            return {
              type: 'MultiPolygon',
              coordinates: geom.coordinates.map(poly => {
                if (d3.geoArea({ type: 'Feature', geometry: { type: 'Polygon', coordinates: poly } }) > Math.PI) {
                  return poly.map(r => [...r].reverse());
                }
                return poly;
              })
            };
          }
          return geom;
        };

        this.allFeaturesList = [];
        for (const [code, entry] of Object.entries(window.ATLAS_10M_DATA)) {
          const safeMetro = sanitizeGeom(entry.metro);
          const metroFeature = {
            type: "Feature",
            id: code,
            properties: { code, vertices: entry.vertices || 0 },
            geometry: safeMetro
          };
          const insetsList = (entry.insets || []).map(ins => ({
            name: ins.name,
            feature: {
              type: "Feature",
              properties: { name: ins.name, code },
              geometry: sanitizeGeom(ins.geometry)
            }
          }));

          // Build full combined geometry (mainland + overseas territories) for the World Atlas map
          let fullGeom = safeMetro;
          if (insetsList.length > 0) {
            const basePolys = safeMetro.type === 'MultiPolygon' ? safeMetro.coordinates : [safeMetro.coordinates];
            const extraPolys = [];
            insetsList.forEach(ins => {
              const g = ins.feature.geometry;
              if (g.type === 'MultiPolygon') extraPolys.push(...g.coordinates);
              else if (g.type === 'Polygon') extraPolys.push(g.coordinates);
            });
            fullGeom = { type: 'MultiPolygon', coordinates: [...basePolys, ...extraPolys] };
          }

          const worldFeature = {
            type: "Feature",
            id: code,
            properties: { code, vertices: entry.vertices || 0 },
            geometry: fullGeom
          };

          metroFeature._metro = metroFeature;
          metroFeature._world = worldFeature;
          metroFeature._insets = insetsList;
          metroFeature._vertices = entry.vertices || 0;
          metroFeature._thumb = entry.thumb || '';

          this.geoFeaturesMap[code] = metroFeature;
          this.allFeaturesList.push(worldFeature);
        }
      }

      this.isAtlasLoaded = true;
      this.isLoadingAtlas = false;

      const bookModal = document.getElementById('book-modal');
      if (bookModal && bookModal.classList.contains('open') && typeof renderEncyclopedia === 'function') {
        const searchInput = document.getElementById('country-search');
        renderEncyclopedia(searchInput ? searchInput.value : '');
      }

      return true;
    } catch (e) {
      console.error('Error initializing 10m Atlas:', e);
      this.isAtlasLoaded = true;
      this.isLoadingAtlas = false;
      return false;
    }
  },

  // ================= МИНИАТЮРА В ЭНЦИКЛОПЕДИИ =================
  renderThumbnail(code) {
    if (!this.isAtlasLoaded) this.initAtlas();
    const targetFeature = this.geoFeaturesMap[code];
    if (!targetFeature) {
      return `<svg viewBox="0 0 44 44"><text x="22" y="27" text-anchor="middle" font-size="20">🗺️</text></svg>`;
    }

    if (targetFeature._thumb) {
      return `
        <svg viewBox="0 0 44 44" class="encyclopedia-thumb-svg">
          <path d="${targetFeature._thumb}" vector-effect="non-scaling-stroke" />
        </svg>
      `;
    }

    const featureToRender = targetFeature._metro || targetFeature;
    const proj = this.createCountryProjection(code, featureToRender, [[3.5, 3.5], [40.5, 40.5]]);
    const pathGen = d3.geoPath().projection(proj);
    const d = pathGen(featureToRender);

    return `
      <svg viewBox="0 0 44 44" class="encyclopedia-thumb-svg">
        <path d="${d || ''}" vector-effect="non-scaling-stroke" />
      </svg>
    `;
  },

  // ================= КРУПНЫЙ ЧЁТКИЙ КОНТУР ДЛЯ ПОЛНОЙ СТРАНИЦЫ СТРАНЫ =================
  renderDetailMapSVG(code) {
    if (!this.isAtlasLoaded) this.initAtlas();
    const targetFeature = this.geoFeaturesMap[code];
    if (!targetFeature || typeof d3 === 'undefined') {
      return `<div style="padding:20px;text-align:center;">🗺️ Контур недоступен</div>`;
    }

    const metro = targetFeature._metro || targetFeature;
    const insets = targetFeature._insets || [];
    const width = 340;
    const height = 220;

    const proj = this.createCountryProjection(code, metro, [[16, 16], [width - 16, height - 16]]);
    const pathGen = d3.geoPath().projection(proj);
    const d = pathGen(metro) || '';

    let insetsHTML = '';
    if (insets.length > 0) {
      insetsHTML = `
        <div class="detail-insets-row">
          ${insets.map(ins => {
            const iProj = this.createCountryProjection(code, ins.feature, [[6, 6], [66, 66]]);
            const iPath = d3.geoPath().projection(iProj)(ins.feature) || '';
            return `
              <div class="detail-inset-card">
                <svg viewBox="0 0 72 72">
                  <path d="${iPath}" class="map-target-path" vector-effect="non-scaling-stroke" style="stroke-width:1.1px;" />
                </svg>
                <span>${ins.name}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    return `
      <div class="detail-map-wrapper">
        <svg viewBox="0 0 ${width} ${height}" class="detail-main-map-svg">
          <path d="${d}" class="map-target-path isolated-silhouette" vector-effect="non-scaling-stroke" />
        </svg>
        ${insetsHTML}
      </div>
    `;
  },

  // ================= ПОЛНОЭКРАННЫЙ АТЛАС ВСЕГО МИРА =================
  // code = null (просто открыли Атлас всей карты мира кнопкой 🗺️)
  // code = 'IT' (открыли из Энциклопедии — показываем весь Атлас мира, а выбранная страна ярко подсвечена!)
  openFullscreenAtlas(code = null) {
    if (!this.isAtlasLoaded) this.initAtlas();

    const modal = document.getElementById('fullscreen-atlas-modal');
    if (!modal) return;

    this.currentAtlasCode = (code && this.geoFeaturesMap[code]) ? code : null;

    modal.style.display = 'flex';
    modal.classList.add('open');

    this.populateAtlasCountrySelector(this.currentAtlasCode || '');
    this.updateAtlasHeaderInfo(this.currentAtlasCode);
    this.renderFullscreenAtlasMap();
    this.bindAtlasControls();
  },

  closeFullscreenAtlas() {
    const modal = document.getElementById('fullscreen-atlas-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('open');
    }
  },

  populateAtlasCountrySelector(selectedCode) {
    const selectEl = document.getElementById('atlas-country-select');
    if (!selectEl || typeof DB === 'undefined') return;

    if (selectEl.options.length <= 1) {
      const sorted = [...DB].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      selectEl.innerHTML = `<option value="">🌍 Весь мир (выберите страну...)</option>` +
        sorted.map(c => `<option value="${c.code}">${c.name} (${c.continent})</option>`).join('');
    }
    selectEl.value = selectedCode || '';
  },

  updateAtlasHeaderInfo(code) {
    const flagEl = document.getElementById('atlas-flag');
    const titleEl = document.getElementById('atlas-title');
    const subEl = document.getElementById('atlas-subtitle');
    const focusBtn = document.getElementById('atlas-focus-country');

    if (!code) {
      if (flagEl) flagEl.innerHTML = `🌍`;
      if (titleEl) titleEl.textContent = `Атлас мира (205 стран)`;
      if (subEl) subEl.textContent = `Нажмите на любую страну на карте или двигайте карту пальцем / мышью`;
      if (focusBtn) focusBtn.style.display = 'none';
      return;
    }

    const countryObj = typeof DB !== 'undefined' ? DB.find(c => c.code === code) : null;
    if (countryObj) {
      if (flagEl) {
        flagEl.innerHTML = `<img src="${getFlagUrl(countryObj.code)}" style="width:38px;height:26px;border-radius:5px;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,0.4);">`;
      }
      if (titleEl) titleEl.textContent = countryObj.name;
      if (subEl) subEl.textContent = `🏛️ Столица: ${countryObj.capital} • ${countryObj.continent} • 🗺️ Площадь: ${countryObj.areaFormatted || ''} • 👥 ${countryObj.population} млн`;
      if (focusBtn) focusBtn.style.display = 'inline-flex';
    }
  },

  selectCountryOnWorldAtlas(code, autoFocus = false) {
    this.currentAtlasCode = code || null;
    const selectEl = document.getElementById('atlas-country-select');
    if (selectEl) selectEl.value = code || '';

    this.updateAtlasHeaderInfo(this.currentAtlasCode);

    // Update highlight class on the world map SVG without resetting current zoom/pan!
    const svg = document.getElementById('atlas-world-svg');
    if (svg) {
      svg.querySelectorAll('.atlas-world-country').forEach(pathEl => {
        const isTarget = pathEl.dataset.code === this.currentAtlasCode;
        pathEl.classList.toggle('atlas-target-country', isTarget);
        if (isTarget) {
          // Bring highlighted country to front of layer
          pathEl.parentNode.appendChild(pathEl);
        }
      });
    }

    this.updateBeaconAndLoupe();

    if (autoFocus && this.currentAtlasCode) {
      this.zoomToCountry(this.currentAtlasCode);
    }
  },

  updateBeaconAndLoupe() {
    const beaconLayer = document.getElementById('atlas-beacon-layer');
    const loupeContainer = document.getElementById('atlas-country-loupe');

    if (beaconLayer) beaconLayer.innerHTML = '';
    if (loupeContainer) loupeContainer.style.display = 'none';

    if (!this.currentAtlasCode || !this.worldProjection) return;

    const targetFeature = this.geoFeaturesMap[this.currentAtlasCode];
    if (!targetFeature) return;

    const metro = targetFeature._metro || targetFeature;
    const center = d3.geoCentroid(metro);
    if (center && Number.isFinite(center[0]) && beaconLayer) {
      const pt = this.worldProjection(center);
      if (pt) {
        const k = (this.currentZoomTransform && this.currentZoomTransform.k) ? this.currentZoomTransform.k : 1;
        beaconLayer.innerHTML = `
          <g class="atlas-beacon-group" id="atlas-active-beacon" transform="translate(${pt[0]}, ${pt[1]}) scale(${1 / Math.pow(k, 0.7)})">
            <circle class="atlas-beacon-ring" r="16" />
            <circle class="atlas-beacon-dot" r="4.5" />
          </g>
        `;
      }
    }

    // Also render a crisp high-res corner card showing the selected country's 10m contour + overseas insets
    if (loupeContainer) {
      const countryObj = typeof DB !== 'undefined' ? DB.find(c => c.code === this.currentAtlasCode) : null;
      const proj = this.createCountryProjection(this.currentAtlasCode, metro, [[10, 10], [150, 110]]);
      const d = d3.geoPath().projection(proj)(metro) || '';
      const insets = targetFeature._insets || [];

      let insetsMiniHTML = '';
      if (insets.length > 0) {
        insetsMiniHTML = insets.slice(0, 2).map(ins => {
          const iProj = this.createCountryProjection(this.currentAtlasCode, ins.feature, [[4, 4], [44, 44]]);
          const iPath = d3.geoPath().projection(iProj)(ins.feature) || '';
          return `
            <div class="atlas-loupe-inset" title="${ins.name}">
              <svg viewBox="0 0 48 48"><path d="${iPath}" class="map-target-path" style="stroke-width:1px;" /></svg>
              <span>${ins.name}</span>
            </div>
          `;
        }).join('');
      }

      loupeContainer.style.display = 'flex';
      loupeContainer.innerHTML = `
        <div class="atlas-loupe-main">
          <div class="atlas-loupe-title">${countryObj ? countryObj.name : this.currentAtlasCode} (контур 10m)</div>
          <svg viewBox="0 0 160 120" class="atlas-loupe-svg">
            <path d="${d}" class="map-target-path" style="stroke-width: 1.2px;" />
          </svg>
        </div>
        ${insetsMiniHTML ? `<div class="atlas-loupe-insets-col">${insetsMiniHTML}</div>` : ''}
      `;
    }
  },

  zoomToCountry(code) {
    if (!code || !this.d3ZoomInstance || !this.worldProjection) return;
    const svgEl = document.getElementById('atlas-world-svg');
    const targetFeature = this.geoFeaturesMap[code];
    if (!svgEl || !targetFeature) return;

    const metro = targetFeature._metro || targetFeature;
    const pathGen = d3.geoPath().projection(this.worldProjection);
    const width = this.atlasWidth || 960;
    const height = this.atlasHeight || 540;

    let bounds = pathGen.bounds(metro);
    if (!bounds || !Number.isFinite(bounds[0][0])) return;

    // If a country crosses the 180° anti-meridian on the flat world map (e.g., Russia's Chukotka tip),
    // focus on its main continental polygon (coordinates[0]) so the camera centers on Russia, not the Atlantic!
    if ((bounds[1][0] - bounds[0][0]) > width * 0.55 && metro.geometry.type === 'MultiPolygon') {
      const mainPolyFeature = {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: metro.geometry.coordinates[0] }
      };
      const mainBounds = pathGen.bounds(mainPolyFeature);
      if (mainBounds && Number.isFinite(mainBounds[0][0])) {
        bounds = mainBounds;
      }
    }

    const dx = Math.max(bounds[1][0] - bounds[0][0], 0.8);
    const dy = Math.max(bounds[1][1] - bounds[0][1], 0.8);
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;

    const scale = Math.max(1.8, Math.min(45, 0.55 / Math.max(dx / width, dy / height)));
    const translate = [width / 2 - scale * x, height / 2 - scale * y];

    d3.select(svgEl)
      .transition()
      .duration(550)
      .call(
        this.d3ZoomInstance.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  },

  resetWorldZoom() {
    const svgEl = document.getElementById('atlas-world-svg');
    if (!svgEl || !this.d3ZoomInstance) return;
    d3.select(svgEl)
      .transition()
      .duration(400)
      .call(this.d3ZoomInstance.transform, d3.zoomIdentity);
  },

  bindAtlasControls() {
    const closeBtn = document.getElementById('close-atlas-btn');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeFullscreenAtlas();
      };
    }

    const zoomIn = document.getElementById('atlas-zoom-in');
    const zoomOut = document.getElementById('atlas-zoom-out');
    const zoomReset = document.getElementById('atlas-zoom-reset');
    const focusBtn = document.getElementById('atlas-focus-country');

    if (zoomIn) {
      zoomIn.onclick = (e) => {
        e.stopPropagation();
        const svgEl = document.getElementById('atlas-world-svg');
        if (svgEl && this.d3ZoomInstance) {
          d3.select(svgEl).transition().duration(250).call(this.d3ZoomInstance.scaleBy, 1.5);
        }
      };
    }

    if (zoomOut) {
      zoomOut.onclick = (e) => {
        e.stopPropagation();
        const svgEl = document.getElementById('atlas-world-svg');
        if (svgEl && this.d3ZoomInstance) {
          d3.select(svgEl).transition().duration(250).call(this.d3ZoomInstance.scaleBy, 1 / 1.5);
        }
      };
    }

    if (zoomReset) {
      zoomReset.onclick = (e) => {
        e.stopPropagation();
        this.resetWorldZoom();
      };
    }

    if (focusBtn) {
      focusBtn.onclick = (e) => {
        e.stopPropagation();
        if (this.currentAtlasCode) {
          this.zoomToCountry(this.currentAtlasCode);
        }
      };
    }

    const selectEl = document.getElementById('atlas-country-select');
    if (selectEl) {
      selectEl.onchange = (e) => {
        const val = e.target.value;
        if (val) {
          this.selectCountryOnWorldAtlas(val, true);
        } else {
          this.selectCountryOnWorldAtlas(null, false);
          this.resetWorldZoom();
        }
      };
    }
  },

  renderFullscreenAtlasMap() {
    const container = document.getElementById('atlas-map-container');
    if (!container || typeof d3 === 'undefined') return;

    const width = container.clientWidth || window.innerWidth || 960;
    const height = container.clientHeight || (window.innerHeight - 80) || 560;
    this.atlasWidth = width;
    this.atlasHeight = height;

    // Equirectangular / NaturalEarth1 projection with high precision (0.01) so microstates stay crisp at 45x zoom
    const proj = d3.geoNaturalEarth1().precision(0.01);
    proj.fitExtent([[20, 20], [width - 20, height - 20]], { type: "Sphere" });
    this.worldProjection = proj;

    const pathGen = d3.geoPath().projection(proj);
    if (typeof pathGen.digits === 'function') pathGen.digits(3);
    const spherePath = pathGen({ type: "Sphere" }) || '';
    const graticulePath = pathGen(d3.geoGraticule().step([15, 15])()) || '';

    // Draw all 205 countries on the world map; highlight currentAtlasCode if selected
    const countriesHTML = this.allFeaturesList.map(f => {
      const code = f.properties && f.properties.code ? f.properties.code : '';
      const d = pathGen(f);
      if (!d) return '';
      const isSelected = code && code === this.currentAtlasCode;
      return `<path class="atlas-world-country ${isSelected ? 'atlas-target-country' : ''}" vector-effect="non-scaling-stroke" data-code="${code}" d="${d}" />`;
    }).join('');

    container.innerHTML = `
      <svg class="atlas-fullscreen-svg" id="atlas-world-svg" viewBox="0 0 ${width} ${height}" style="touch-action: none; cursor: grab;">
        <g id="atlas-zoom-group">
          <path d="${spherePath}" fill="rgba(15, 23, 42, 0.55)" stroke="rgba(255,255,255,0.12)" stroke-width="1" vector-effect="non-scaling-stroke" />
          <path d="${graticulePath}" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5" vector-effect="non-scaling-stroke" />
          <g id="atlas-countries-layer">${countriesHTML}</g>
          <g id="atlas-beacon-layer"></g>
        </g>
      </svg>
      <div id="atlas-country-loupe" class="atlas-country-loupe" style="display: none;"></div>
    `;

    // Bring highlighted country path to the top of the SVG layer
    const svgEl = document.getElementById('atlas-world-svg');
    if (svgEl && this.currentAtlasCode) {
      const activePath = svgEl.querySelector(`.atlas-world-country[data-code="${this.currentAtlasCode}"]`);
      if (activePath && activePath.parentNode) {
        activePath.parentNode.appendChild(activePath);
      }
    }

    this.currentZoomTransform = d3.zoomIdentity;
    this.updateBeaconAndLoupe();

    // Set up full D3 pan & zoom (supports 1-finger touch drag in all directions, 2-finger pinch zoom, mouse drag, and wheel zoom)
    const zoomGroup = d3.select('#atlas-zoom-group');
    this.d3ZoomInstance = d3.zoom()
      .scaleExtent([1, 55])
      .translateExtent([[-width * 0.6, -height * 0.6], [width * 1.6, height * 1.6]])
      .on('zoom', (event) => {
        this.currentZoomTransform = event.transform;
        zoomGroup.attr('transform', event.transform);

        const k = event.transform.k;
        zoomGroup.style('--atlas-inv-scale', (1 / Math.pow(k, 0.85)).toFixed(4));

        const beacon = document.getElementById('atlas-active-beacon');
        if (beacon && this.currentAtlasCode) {
          const targetFeature = this.geoFeaturesMap[this.currentAtlasCode];
          const center = targetFeature ? d3.geoCentroid(targetFeature._metro || targetFeature) : null;
          const pt = (center && Number.isFinite(center[0])) ? this.worldProjection(center) : null;
          if (pt) {
            beacon.setAttribute('transform', `translate(${pt[0]}, ${pt[1]}) scale(${1 / Math.pow(k, 0.75)})`);
          }
        }
      });

    d3.select(svgEl).call(this.d3ZoomInstance);

    // Click on any country on the world map to select & highlight it
    const countriesLayer = document.getElementById('atlas-countries-layer');
    if (countriesLayer) {
      countriesLayer.addEventListener('click', (e) => {
        const pathEl = e.target.closest('.atlas-world-country');
        if (pathEl && pathEl.dataset.code) {
          this.selectCountryOnWorldAtlas(pathEl.dataset.code, false);
        }
      });
    }
  },

  // ================= ЛОГИКА РАУНДА (ВИКТОРИНА) =================
  direction: 'normal',

  async start(direction) {
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

    window.lastActiveGame = MapsGame;

    document.querySelector('.main-screen').style.display = 'none';
    document.querySelector('.top-bar').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('results-modal').style.display = 'none';

    const answersGrid = document.getElementById('answers-grid');
    if (answersGrid) answersGrid.innerHTML = '';

    const questionBox = document.getElementById('question-box');
    questionBox.innerHTML = `
      <div style="text-align:center; padding: 24px;">
        <div style="font-size: 38px; margin-bottom: 10px;">🌍</div>
        <div style="color: var(--text-muted); font-size: 14px; font-weight: 600;">Подготовка карты...</div>
      </div>
    `;

    await this.initAtlas();

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const count = Math.min((typeof gameSettings !== 'undefined' ? gameSettings.questionsCount : 20), shuffled.length);
    this.questions = shuffled.slice(0, count);

    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.isAnswering = false;

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

  getExtremeCoordinates(feature) {
    let minLon = Infinity, maxLon = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    let pWest = null, pEast = null, pNorth = null, pSouth = null;

    function scanCoords(arr) {
      if (!Array.isArray(arr) || arr.length === 0) return;
      if (typeof arr[0] === 'number') {
        const [lon, lat] = arr;
        if (lon < minLon) { minLon = lon; pWest = [lon, lat]; }
        if (lon > maxLon) { maxLon = lon; pEast = [lon, lat]; }
        if (lat < minLat) { minLat = lat; pSouth = [lon, lat]; }
        if (lat > maxLat) { maxLat = lat; pNorth = [lon, lat]; }
      } else {
        arr.forEach(scanCoords);
      }
    }

    scanCoords(feature.geometry.coordinates);
    return { pWest, pEast, pNorth, pSouth };
  },

  // Render clean square inset boxes for overseas territories (without spoiler text inside the quiz!)
  renderQuizInsetsHTML(code, insets, width, height) {
    if (!insets || insets.length === 0) return '';
    const visible = insets.slice(0, 3);
    const boxSize = visible.length === 3 ? 52 : 56;
    const gap = 6;
    const totalH = visible.length * boxSize + (visible.length - 1) * gap;
    const startY = Math.max(8, Math.round((height - totalH) / 2));
    const boxX = width - boxSize - 6;

    return visible.map((ins, idx) => {
      const boxY = startY + idx * (boxSize + gap);
      const insProj = this.createCountryProjection(
        code,
        ins.feature,
        [[boxX + 6, boxY + 6], [boxX + boxSize - 6, boxY + boxSize - 6]]
      );
      const insPath = d3.geoPath().projection(insProj)(ins.feature) || '';

      return `
        <g class="map-inset-group">
          <rect x="${boxX}" y="${boxY}" width="${boxSize}" height="${boxSize}" rx="8" class="map-inset-rect" />
          <path class="map-target-path" d="${insPath}" style="stroke-width: 1px;" />
        </g>
      `;
    }).join('');
  },

  renderMapSVG(targetCountry, difficulty) {
    const width = 290;
    const height = 190;
    const targetFeature = this.geoFeaturesMap[targetCountry.code];

    if (!targetFeature || typeof d3 === 'undefined') {
      return targetCountry.mapSvg || `
        <svg class="map-render-svg" viewBox="0 0 100 100">
          <text x="50" y="55" text-anchor="middle" fill="var(--accent-green)" font-size="28">🗺️</text>
        </svg>
      `;
    }

    const featureToRender = targetFeature._metro || targetFeature;
    const insets = targetFeature._insets || [];
    const hasInsets = insets.length > 0;

    // 1. ЛЁГКИЙ УРОВЕНЬ: целевая страна + плотные контрастные соседи + квадраты заморских территорий
    // ВАЖНО: используем createCountryProjection с внутренним отступом без вызова .center(),
    // чтобы Россия (и любая страна на 180° меридиане) показывалась целиком по центру, а не съезжала на США и Канаду!
    if (difficulty === 'easy') {
      const rightBound = hasInsets ? width - 66 : width;
      const padX = Math.round(rightBound * 0.16);
      const padY = Math.round(height * 0.16);

      const projection = this.createCountryProjection(
        targetCountry.code,
        featureToRender,
        [[padX, padY], [rightBound - padX, height - padY]]
      );

      const pathGen = d3.geoPath().projection(projection);

      const neighborsHTML = this.allFeaturesList
        .filter(f => f.properties && f.properties.code !== targetCountry.code)
        .map(f => {
          const d = pathGen(f);
          const nCode = f.properties.code || '';
          return d ? `<path class="map-neighbor-path" data-neighbor-code="${nCode}" d="${d}" />` : '';
        }).join('');

      const targetPath = pathGen(featureToRender) || '';
      const insetHTML = this.renderQuizInsetsHTML(targetCountry.code, insets, width, height);

      return `
        <svg class="map-render-svg" viewBox="0 0 ${width} ${height}">
          <g class="map-neighbors-layer">${neighborsHTML}</g>
          <path class="map-target-path active-glow" d="${targetPath}" />
          ${insetHTML}
        </svg>
      `;
    }

    // 2. СРЕДНИЙ УРОВЕНЬ: изолированный силуэт + квадраты заморских территорий
    if (difficulty === 'normal') {
      const rightBound = hasInsets ? width - 66 : width - 14;
      const projection = this.createCountryProjection(
        targetCountry.code,
        featureToRender,
        [[14, 14], [rightBound, height - 14]]
      );
      const pathGen = d3.geoPath().projection(projection);
      const targetPath = pathGen(featureToRender) || '';
      const insetHTML = this.renderQuizInsetsHTML(targetCountry.code, insets, width, height);

      return `
        <svg class="map-render-svg" viewBox="0 0 ${width} ${height}">
          <path class="map-target-path isolated-silhouette" d="${targetPath}" />
          ${insetHTML}
        </svg>
      `;
    }

    // 3. СЛОЖНЫЙ УРОВЕНЬ: ЧИСТЫЙ ХАРДКОР (ТОЛЬКО ОСИ И ТОЧКИ, СИЛУЭТ УБРАН)
    if (difficulty === 'hard') {
      const projection = this.createCountryProjection(
        targetCountry.code,
        featureToRender,
        [[25, 20], [width - 25, height - 20]]
      );

      const { pWest, pEast, pNorth, pSouth } = this.getExtremeCoordinates(featureToRender);

      const ptW = (pWest && projection(pWest)) || [width * 0.2, height * 0.5];
      const ptE = (pEast && projection(pEast)) || [width * 0.8, height * 0.5];
      const ptN = (pNorth && projection(pNorth)) || [width * 0.5, height * 0.2];
      const ptS = (pSouth && projection(pSouth)) || [width * 0.5, height * 0.8];

      return `
        <svg class="map-render-svg" viewBox="0 0 ${width} ${height}">
          <line class="map-axis-line we" x1="${ptW[0]}" y1="${ptW[1]}" x2="${ptE[0]}" y2="${ptE[1]}" />
          <line class="map-axis-line ns" x1="${ptN[0]}" y1="${ptN[1]}" x2="${ptS[0]}" y2="${ptS[1]}" />

          <circle class="map-axis-point" cx="${ptW[0]}" cy="${ptW[1]}" r="4.5" />
          <text class="map-point-label" x="${ptW[0] - 7}" y="${ptW[1] + 3}" text-anchor="end">З</text>

          <circle class="map-axis-point" cx="${ptE[0]}" cy="${ptE[1]}" r="4.5" />
          <text class="map-point-label" x="${ptE[0] + 7}" y="${ptE[1] + 3}" text-anchor="start">В</text>

          <circle class="map-axis-point" cx="${ptN[0]}" cy="${ptN[1]}" r="4.5" />
          <text class="map-point-label" x="${ptN[0]}" y="${ptN[1] - 7}" text-anchor="middle">С</text>

          <circle class="map-axis-point" cx="${ptS[0]}" cy="${ptS[1]}" r="4.5" />
          <text class="map-point-label" x="${ptS[0]}" y="${ptS[1] + 13}" text-anchor="middle">Ю</text>
        </svg>
      `;
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
    const questionBox = document.getElementById('question-box');
    const answersGrid = document.getElementById('answers-grid');
    if (!questionBox || !answersGrid) return;

    const pool = typeof getFilteredCountries === 'function' ? getFilteredCountries() : DB;
    const wrongOptions = pickWrongMapCountries(pool, currentCountry, currentDiff);
    const options = [currentCountry, ...wrongOptions].sort(() => Math.random() - 0.5);

    // РЕЖИМ «НАОБОРОТ»: сверху название страны -> в #answers-grid компактная сетка 2x2 из 4 SVG-контуров
    if (this.direction === 'reverse') {
      let badgeHTML = '';
      if (currentDiff === 'easy') {
        badgeHTML = `<div class="map-diff-badge easy">Лёгкий • В окружении соседей (${currentCountry.continent})</div>`;
      } else if (currentDiff === 'hard') {
        badgeHTML = `<div class="map-diff-badge hard">Сложный • Крайние точки и оси</div>`;
      }

      questionBox.innerHTML = `
        <div class="map-question-box reverse-question-box">
          ${badgeHTML}
          <div class="country-question-prompt">Найди контур территории страны</div>
          <h2 class="country-question-name">${currentCountry.name}</h2>
        </div>
      `;

      answersGrid.className = 'answers-grid reverse-grid-2x2 maps-reverse-grid';
      answersGrid.innerHTML = '';

      options.forEach(option => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'reverse-visual-btn map-answer-card';
        btn.dataset.code = option.code;
        btn.innerHTML = `<div class="map-reverse-svg-wrap">${this.renderMapSVG(option, currentDiff)}</div>`;
        btn.addEventListener('click', () => this.handleAnswer(btn, option, currentCountry));
        answersGrid.appendChild(btn);
      });
      return;
    }

    // ОБЫЧНЫЙ РЕЖИМ: сверху 1 контур карты -> в ответах 4 названия стран
    const mapHTML = this.renderMapSVG(currentCountry, currentDiff);

    let promptText = "Определи страну по контуру";
    let badgeHTML = "";

    if (currentDiff === 'easy') {
      promptText = "Какая страна подсвечена на карте?";
      badgeHTML = `<div class="map-diff-badge easy">Лёгкий • В окружении соседей</div>`;
    } else if (currentDiff === 'hard') {
      promptText = "Угадай страну только по крайним точкам и осям";
      badgeHTML = `<div class="map-diff-badge hard">Сложный • Оси габаритов</div>`;
    }

    questionBox.innerHTML = `
      <div class="map-question-box">
        ${badgeHTML}
        <div class="map-display-card">
          ${mapHTML}
        </div>
        <div class="map-question-prompt">${promptText}</div>
      </div>
    `;

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

document.addEventListener('DOMContentLoaded', () => {
  if (typeof MapsGame !== 'undefined') {
    MapsGame.initAtlas();
  }
});
