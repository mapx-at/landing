// mapx-Landing: interaktives Produktbeispiel. Vor dem Klick auf "Ausprobieren" wird nichts von api.mapx.at geladen
// (nur das Vorschaubild aus /lp/img/demo/). Der Klick laedt Leaflet (lokal, /lp/vendor/) und /lp/demo/<id>.js.
// Jede Beispieldatei setzt window.mxDemo = (c) => {...}; c ist der hier gebaute Kontext (Karte, API, Texte, Overlays, Animation).
//
// Gerüst (Paket 1, Vault mapx/Demo-UX-Konzept-2026-11):
// - Rahmen .mx-demo-frame (4:3, ab 768 px 16:9), Overlays: c.panel oben links (Steuer-Chips), c.result()/c.say() unten (Ergebnis-Karte),
//   Zoom oben rechts. Zusatzinhalte unter der Karte über c.below(node).
// - Fehler: c.fail(e) zeigt nie den Text einer JS-Ausnahme, sondern eine freundliche Meldung mit „Neu laden“; Details nur in der Konsole.
// - Requests: c.api(path, {key}) bricht den vorigen Request mit demselben key ab (AbortController), 429 wird einmal nach Retry-After
//   wiederholt; jeder Request landet im Aufklapper „Code ansehen“ (curl mit YOUR_TOKEN). c.debounce(fn, ms) mit mindestens 300 ms.
// - Budget je Demo-Start: höchstens BUDGET.tiles Kacheln und BUDGET.requests API-Requests bis zur ersten Nutzer-Interaktion (Warnung in der Konsole).
// - Rasterkacheln laufen über einen Puffer (Token-Bucket TILE_RATE/TILE_BURST), weil /v1/styles/*/tiles/* in der Gateway-Zone
//   „static“ liegt (5/s je IP, burst 60); 429 auf Kacheln wird nach Retry-After still nachgeladen.
// - Animation: c.drawLine, c.pulse, c.countUp, c.typeText; bei prefers-reduced-motion sofort im Endzustand.
(() => {
  'use strict';
  const root = document.querySelector('.mx-demo');
  if (!root) return;
  const de = (document.documentElement.lang || 'de').startsWith('de');
  const t = (d, e) => (de ? d : e);
  const TOKEN = root.dataset.token || '';
  const API = 'https://api.mapx.at/v1';
  const LEAFLET = '/lp/vendor/leaflet-1.9.4/';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(pointer: coarse)').matches;
  // Limits des Gateways je Client-IP (infra-ansible roles/docker_stack/defaults/main.yml, mapx_gw_zones), Stand 22.11.2026
  const LIMITS = { tiles: 100, search: 10, route: 5, heavyPerMin: 30, elevation: 10, static: 5, weather: 20 }; // je Sekunde, heavy je Minute
  const TILE_RATE = 4, TILE_BURST = 40; // unter static 5/s, burst 60 – auch bei schnellem Stilwechsel kein 429
  const BUDGET = { tiles: 30, requests: 5 };
  const AUTOSTART = 'mx-demo-autostart';
  const start = root.querySelector('.mx-demo-start');
  const frame = root.querySelector('.mx-demo-frame');
  const stage = root.querySelector('.mx-demo-stage');
  const panel = root.querySelector('.mx-demo-panel');
  const sheet = root.querySelector('.mx-demo-sheet');
  const info = root.querySelector('.mx-demo-info');
  const belowEl = root.querySelector('.mx-demo-below');
  const codeBtn = root.querySelector('.mx-demo-codebtn');
  const codeBox = root.querySelector('.mx-demo-code');
  const codeEl = codeBox.querySelector('code');
  const CC = '<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>';
  const ATTR = {
    streets: `<a href="https://www.bev.gv.at">BEV</a>, <a href="https://www.gip.gv.at">GIP.at</a>, ${CC}`,
    'streets-night': `<a href="https://www.bev.gv.at">BEV</a>, <a href="https://www.gip.gv.at">GIP.at</a>, ${CC}`,
    satellite: `Orthofoto: <a href="https://www.bev.gv.at">BEV</a>, <a href="https://basemap.at">basemap.at</a>; BEV – DKM, ${CC}`,
    outdoors: `<a href="https://www.bev.gv.at">BEV</a> (ALS-DTM), <a href="https://www.gip.gv.at">GIP.at</a>, ${CC}`,
  };
  const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };
  const wait = (ms, signal) => new Promise((res, rej) => {
    const id = setTimeout(res, ms);
    signal?.addEventListener('abort', () => { clearTimeout(id); rej(new DOMException('aborted', 'AbortError')); }, { once: true });
  });

  // --- Fehler ---------------------------------------------------------------------------------------------
  // Freundliche Texte für HTTP-Status; JS-Ausnahmen werden nie angezeigt.
  function errText(status) {
    return {
      401: t('Der Beispiel-Token fehlt oder ist ungültig.', 'The example token is missing or invalid.'),
      403: t('Der Beispiel-Token gilt nur auf mapx.at.', 'The example token only works on mapx.at.'),
      404: t('Hier gibt es dazu nichts.', 'Nothing here for this.'),
      429: t('Gerade sind viele Anfragen unterwegs. Gleich noch einmal versuchen.', 'Lots of requests right now. Try again in a moment.'),
    }[status] || t('Der Dienst hat gerade nicht geantwortet.', 'The service did not answer just now.');
  }
  class ApiError extends Error { constructor(status, retry) { super(errText(status)); this.status = status; this.retry = retry; this.friendly = true; } }
  const isAbort = (e) => e?.name === 'AbortError';

  // --- Ergebnis-Karte und Infozeile -------------------------------------------------------------------------
  // Unten in der Karte: optional result({title, chips, rows}) und darunter die Statuszeile von say(). info bleibt als aria-live.
  const resBox = el('div', { className: 'mx-demo-res' });
  const status = el('p', { className: 'mx-demo-status' });
  sheet.append(resBox, status);
  const showSheet = () => { sheet.hidden = !resBox.childElementCount && !status.textContent; };
  function say(s, bad) {
    info.textContent = s || ''; status.textContent = s || '';
    status.classList.toggle('mx-demo-bad', !!bad); showSheet();
  }
  function result(r) {
    resBox.replaceChildren();
    if (r) {
      if (r.title) resBox.append(el('p', { className: 'mx-demo-res-title', textContent: r.title }));
      if (r.chips?.length) resBox.append(el('div', { className: 'mx-demo-chips' }, ...r.chips.map((x) => (x instanceof Node ? x : el('span', { className: 'mx-demo-chip', textContent: x })))));
      if (r.rows?.length) resBox.append(el('dl', { className: 'mx-demo-rows' }, ...r.rows.flatMap(([k, v]) => [el('dt', { textContent: k }), el('dd', {}, v instanceof Node ? v : String(v))])));
    }
    showSheet(); return resBox;
  }
  // Fehler im Rahmen: freundlicher Satz und „Neu laden“ (startet die Demo nach dem Neuladen gleich wieder)
  let errBox;
  function fail(e) {
    if (isAbort(e)) return;
    console.error('[mapx-demo]', e);
    const msg = e?.friendly ? e.message : t('Das Beispiel hat sich verschluckt.', 'The example tripped up.');
    say(msg, true);
    if (e?.status === 429) { countdown(e.retry || 5); return; }
    if (errBox) return;
    const again = el('button', { type: 'button', className: 'mx-demo-btn mx-demo-primary', textContent: t('Neu laden', 'Reload') });
    again.addEventListener('click', () => { try { sessionStorage.setItem(AUTOSTART, root.dataset.demo); } catch { /* ohne Speicher: normal neu laden */ } location.reload(); });
    errBox = el('div', { className: 'mx-demo-err', role: 'alert' }, el('p', { textContent: msg }), again);
    frame.append(errBox);
  }
  let cdTimer;
  function countdown(s) {
    clearInterval(cdTimer);
    const tick = () => { if (s <= 0) { clearInterval(cdTimer); say(t('Bereit, versuch es noch einmal.', 'Ready, try again.')); return; } say(t(`Kurz Pause wegen vieler Anfragen, noch ${s} s …`, `Short pause because of many requests, ${s} s …`), true); s--; };
    tick(); cdTimer = setInterval(tick, 1000);
  }

  // --- Request-Log und „Code ansehen“ ----------------------------------------------------------------------
  let apiLogged = false;
  const curl = ({ url, header }) => (header
    ? `curl -H "Authorization: Bearer YOUR_TOKEN" \\\n  "${url}"`
    : `curl -o mapx-bild "${url}${url.includes('?') ? '&' : '?'}access_token=YOUR_TOKEN"`);
  // header=false: Token gehört in die URL (Kacheln, Bilder). fromApi=false: nur loggen, solange noch kein API-Request lief.
  function logReq(url, header = true, fromApi = true) {
    if (fromApi) apiLogged = true; else if (apiLogged) return;
    codeEl.textContent = curl({ url: url.replace(/([?&])access_token=[^&]*&?/, '$1').replace(/[?&]$/, ''), header });
  }
  codeBtn.addEventListener('click', () => {
    const open = codeBox.hidden; codeBox.hidden = !open; codeBtn.setAttribute('aria-expanded', String(open));
  });
  const copyBtn = codeBox.querySelector('.mx-demo-copy');
  copyBtn.addEventListener('click', async () => {
    const old = copyBtn.textContent;
    try { await navigator.clipboard.writeText(codeEl.textContent); copyBtn.textContent = t('Kopiert', 'Copied'); } catch { copyBtn.textContent = t('Bitte markieren', 'Select it'); }
    setTimeout(() => { copyBtn.textContent = old; }, 1500);
  });

  // --- Budget ---------------------------------------------------------------------------------------------
  const used = { tiles: 0, requests: 0 }; let startPhase = true;
  const endStart = () => { startPhase = false; };
  function count(kind) {
    used[kind]++;
    if (startPhase && used[kind] === BUDGET[kind] + 1) console.warn(`[mapx-demo] Start-Budget überschritten: mehr als ${BUDGET[kind]} ${kind}`);
  }

  // --- API mit Abbruch und 429-Behandlung ------------------------------------------------------------------
  const ctrls = new Map();
  async function api(path, opts = {}) {
    const { key, signal: outer } = opts;
    let ac;
    if (key) { ctrls.get(key)?.abort(); ac = new AbortController(); ctrls.set(key, ac); }
    const signal = ac?.signal || outer;
    logReq(API + path); count('requests');
    for (let attempt = 0; ; attempt++) {
      const r = await fetch(API + path, { headers: { Authorization: 'Bearer ' + TOKEN }, signal });
      if (r.ok) { if (key && ctrls.get(key) === ac) ctrls.delete(key); return r.json(); }
      const retry = Math.min(30, Math.max(1, Number(r.headers.get('Retry-After')) || 1));
      if (r.status === 429 && attempt === 0 && retry <= 5) { say(t('Kurz warten …', 'One moment …')); await wait(retry * 1000, signal); continue; }
      throw new ApiError(r.status, retry);
    }
  }
  // Nach der letzten Eingabe erst nach ms (mindestens 300) ausführen
  function debounce(fn, ms = 300) {
    let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), Math.max(300, ms)); };
  }

  // --- Bausteine für die Bedienleiste (alles als Text, nie als HTML) --------------------------------------
  function select(label, options, value) { // nur noch für Sonderfälle; Standard sind toggles()
    const s = el('select'); for (const [v, l] of options) s.append(el('option', { value: v, textContent: l }));
    if (value) s.value = value;
    panel.append(el('label', {}, el('span', { textContent: label }), s)); return s;
  }
  function button(label, fn) { const b = el('button', { type: 'button', textContent: label, className: 'mx-demo-btn' }); b.addEventListener('click', () => { endStart(); fn(); }); panel.append(b); return b; }
  // Segment-Chips; g.value und g.label() geben den gewählten Eintrag
  function toggles(options, value, fn, label) {
    const g = el('div', { className: 'mx-demo-seg', role: 'group' });
    if (label) g.setAttribute('aria-label', label);
    g.value = value;
    for (const [v, l] of options) {
      const b = el('button', { type: 'button', textContent: l }); b.dataset.v = v; b.setAttribute('aria-pressed', String(v === value));
      b.addEventListener('click', () => { endStart(); for (const k of g.children) k.setAttribute('aria-pressed', String(k === b)); g.value = v; fn(v); });
      g.append(b);
    }
    g.label = () => (options.find(([v]) => v === g.value) || [, ''])[1];
    panel.append(g); return g;
  }
  const below = (n) => { belowEl.append(n); return n; };

  // --- Kacheln mit Puffer ------------------------------------------------------------------------------------
  let bucket = TILE_BURST, bucketAt = performance.now(), pumping = false;
  const queue = [];
  function pump() {
    const now = performance.now(); bucket = Math.min(TILE_BURST, bucket + ((now - bucketAt) / 1000) * TILE_RATE); bucketAt = now;
    while (queue.length && bucket >= 1) { const j = queue.shift(); if (!j.ac.signal.aborted) { bucket--; j.go(); } }
    pumping = queue.length > 0;
    if (pumping) setTimeout(pump, Math.ceil(1000 / TILE_RATE));
  }
  function fetchTile(url, ac) {
    return new Promise((res, rej) => { queue.push({ ac, go: () => fetch(url, { signal: ac.signal }).then(res, rej) }); if (!pumping) pump(); });
  }

  let L, map, base, mapEl, tileErr = false;
  function tiles(style) {
    const Buffered = L.TileLayer.extend({
      createTile(coords, done) {
        const img = document.createElement('img'), ac = new AbortController(), url = this.getTileUrl(coords);
        img.alt = ''; img.setAttribute('role', 'presentation'); img._mxAbort = ac;
        logReq(url, false, false); count('tiles');
        (async () => {
          for (let attempt = 0; attempt < 4; attempt++) {
            const r = await fetchTile(url, ac);
            if (r.ok) { const u = URL.createObjectURL(await r.blob()); img.onload = () => { URL.revokeObjectURL(u); done(null, img); }; img.onerror = () => done(new Error('decode'), img); img.src = u; return; }
            if (r.status !== 429) { tileStatus(r.status); done(new Error('HTTP ' + r.status), img); return; }
            await wait(Math.max(1, Number(r.headers.get('Retry-After')) || 1) * 1000 + attempt * 500, ac.signal); // sanft nachladen
          }
          done(new Error('429'), img);
        })().catch((e) => { if (!isAbort(e)) done(e, img); });
        return img;
      },
    });
    const layer = new Buffered(`${API}/styles/${style}/tiles/512/{z}/{x}/{y}{r}?access_token=${encodeURIComponent(TOKEN)}`, { tileSize: 512, zoomOffset: -1, minZoom: 1, maxZoom: 21, keepBuffer: 1, /* {r} = @2x bei devicePixelRatio > 1: gleiche Kachelzahl, 1024-px-Bilder */ attribution: ATTR[style] || ATTR.streets });
    layer.on('tileunload', (e) => e.tile._mxAbort?.abort());
    layer.once('load', () => frame.classList.remove('mx-demo-loading'));
    return layer;
  }
  function tileStatus(st) { if (tileErr) return; tileErr = true; say(errText(st), true); }

  // Overlay-Chip kurz einblenden
  function flash(node, ms) { node.hidden = false; requestAnimationFrame(() => node.classList.add('mx-on')); clearTimeout(node._t); node._t = setTimeout(() => { node.classList.remove('mx-on'); node._t = setTimeout(() => { node.hidden = true; }, 300); }, ms); }
  // Bedienhinweis der Demo (z. B. „Blauen Punkt antippen“): beim Start einige Sekunden sichtbar, dann ausgeblendet
  let hintEl;
  function hint(s, ms = 4000) {
    if (!hintEl) { hintEl = el('p', { className: 'mx-demo-hint', hidden: true }); frame.append(hintEl); }
    hintEl.textContent = s; flash(hintEl, ms);
  }
  function makeMap(center, zoom, style = 'streets', hintText) {
    mapEl = el('div', { className: 'mx-demo-map' });
    mapEl.setAttribute('aria-label', t('Interaktive Karte', 'Interactive map'));
    stage.replaceChildren(mapEl);
    frame.classList.add('mx-demo-loading');
    map = L.map(mapEl, { scrollWheelZoom: false, dragging: !touch, tap: false, zoomControl: false, zoomAnimation: !reduce, fadeAnimation: !reduce, markerZoomAnimation: !reduce, attributionControl: false }).setView(center, zoom);
    L.control.zoom({ position: 'topright', zoomInTitle: t('Hineinzoomen', 'Zoom in'), zoomOutTitle: t('Herauszoomen', 'Zoom out') }).addTo(map);
    // eigenes Control mit Präfix „mapx.at“ (Leaflet trennt mit „ | “); als map.attributionControl hinterlegt, damit Demos addAttribution nutzen können
    map.attributionControl = L.control.attribution({ prefix: '<a href="https://mapx.at">mapx.at</a>' }).addTo(map);
    base = tiles(style).addTo(map);
    setTimeout(() => frame.classList.remove('mx-demo-loading'), 10000);
    map.on('click dragstart', endStart);
    // Gesten-Hinweis: nur kurz nach einem Einfinger-Touch (die Seite scrollt dabei weiter, das ist gewollt)
    if (touch) {
      const gesture = el('p', { className: 'mx-demo-gesture', hidden: true, textContent: t('Zwei Finger: zoomen und verschieben', 'Two fingers: zoom and pan') });
      frame.append(gesture);
      let gt;
      mapEl.addEventListener('touchstart', (e) => { clearTimeout(gt); if (e.touches.length === 1) gt = setTimeout(() => flash(gesture, 1500), 150); }, { passive: true });
      mapEl.addEventListener('touchmove', (e) => { if (e.touches.length > 1) clearTimeout(gt); }, { passive: true });
    }
    if (hintText) hint(hintText);
    return map;
  }
  // Stilwechsel: neue Ebene darüber laden, alte erst nach `load` entfernen (keine grauen Kacheln)
  function setStyle(style) { const old = base; tileErr = false; base = tiles(style).addTo(map); const drop = () => { if (map.hasLayer(old)) old.remove(); }; base.once('load', drop); setTimeout(drop, 5000); }
  // Tastatur-Ersatz für den Kartenklick: dieselbe Aktion an der Kartenmitte, sichtbar nur bei Tastaturfokus
  function centerButton(label, fn) { const b = button(label, () => { const c = map.getCenter(); fn({ latlng: c }); }); b.classList.add('mx-demo-kbd'); return b; }
  const dot = (latlng, color) => L.circleMarker(latlng, { radius: 8, color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 });
  const text = (s) => el('span', { textContent: s });

  // --- Animation (bei reduced motion sofort Endzustand) -----------------------------------------------------
  const paths = (layer) => { const out = []; const walk = (l) => { if (l.eachLayer) l.eachLayer(walk); else if (l._path) out.push(l._path); }; walk(layer); return out; };
  function drawLine(layer, ms = 1200) {
    const ps = paths(layer);
    if (reduce || !ps.length) return Promise.resolve();
    for (const p of ps) { const n = p.getTotalLength(); p.style.transition = 'none'; p.style.strokeDasharray = `${n} ${n}`; p.style.strokeDashoffset = String(n); p.getBoundingClientRect(); p.style.transition = `stroke-dashoffset ${ms}ms ease-in-out`; p.style.strokeDashoffset = '0'; }
    return wait(ms).then(() => { for (const p of ps) { p.style.transition = p.style.strokeDasharray = p.style.strokeDashoffset = ''; } });
  }
  function pulse(marker, on = true) { for (const p of paths(marker)) p.classList.toggle('mx-pulse', on && !reduce); }
  function countUp(node, n, { ms = 800, fmt = (v) => Math.round(v).toLocaleString(t('de-AT', 'en-GB')) } = {}) {
    if (reduce) { node.textContent = fmt(n); return Promise.resolve(); }
    return new Promise((res) => { const t0 = performance.now(); (function step(now) { const k = Math.min(1, (now - t0) / ms); node.textContent = fmt(n * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); else res(); })(t0); });
  }
  async function typeText(input, s, { ms = 70 } = {}) {
    const fire = () => input.dispatchEvent(new Event('input', { bubbles: true }));
    if (reduce) { input.value = s; fire(); return; }
    input.value = '';
    for (const ch of s) { input.value += ch; fire(); await wait(ms); }
  }

  function load(src, css) {
    return new Promise((res, rej) => {
      const n = css ? el('link', { rel: 'stylesheet', href: src }) : el('script', { src });
      n.onload = res; n.onerror = () => rej(new Error('load ' + src));
      document.head.append(n);
    });
  }

  start.addEventListener('click', async () => {
    start.disabled = true; start.hidden = true; frame.classList.add('mx-demo-loading');
    if (!/^mx_pk_/.test(TOKEN)) { frame.classList.remove('mx-demo-loading'); say(t('Für dieses Beispiel ist noch kein öffentlicher Token hinterlegt.', 'No public token has been set for this example yet.'), true); return; }
    try {
      if (root.dataset.leaflet !== 'false') {
        await Promise.all([load(LEAFLET + 'leaflet.css', true), load(LEAFLET + 'leaflet.js')]);
        L = window.L;
      } else setTimeout(() => frame.classList.remove('mx-demo-loading'), 10000);
      await load(`/lp/demo/${root.dataset.demo}.js`);
      root.classList.add('mx-demo-on'); panel.hidden = false;
      window.mxDemo({ L, de, t, api, errText, API, TOKEN, LIMITS, BUDGET, say, fail, result, hint, el, select, button, toggles, below, makeMap, setStyle, centerButton, dot, text, debounce, logReq, endStart, drawLine, pulse, countUp, typeText, panel, stage, frame, info, reduce, touch, ATTR, get map() { return map; }, done: () => frame.classList.remove('mx-demo-loading') });
      if (!panel.childElementCount) panel.hidden = true;
    } catch (e) { frame.classList.remove('mx-demo-loading'); fail(e); }
  });
  try { if (sessionStorage.getItem(AUTOSTART) === root.dataset.demo) { sessionStorage.removeItem(AUTOSTART); start.click(); } } catch { /* kein Speicher */ }
})();
