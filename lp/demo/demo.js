// mapx-Landing: interaktives Produktbeispiel. Vor dem Klick auf "Ausprobieren" wird nichts von api.mapx.at geladen
// (nur das Vorschaubild aus /lp/img/demo/). Der Klick laedt Leaflet (lokal, /lp/vendor/) und /lp/demo/<id>.js.
// Jede Beispieldatei setzt window.mxDemo = (c) => {...}; c ist der hier gebaute Kontext (Karte, API, Texte).
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
  const start = root.querySelector('.mx-demo-start');
  const stage = root.querySelector('.mx-demo-stage');
  const panel = root.querySelector('.mx-demo-panel');
  const info = root.querySelector('.mx-demo-info');
  const CC = '<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>';
  const ATTR = {
    streets: `<a href="https://www.bev.gv.at">BEV</a>, <a href="https://www.gip.gv.at">GIP.at</a>, ${CC}`,
    'streets-night': `<a href="https://www.bev.gv.at">BEV</a>, <a href="https://www.gip.gv.at">GIP.at</a>, ${CC}`,
    satellite: `Orthofoto: <a href="https://www.bev.gv.at">BEV</a>, <a href="https://basemap.at">basemap.at</a>; BEV – DKM, ${CC}`,
    outdoors: `<a href="https://www.bev.gv.at">BEV</a> (ALS-DTM), <a href="https://www.gip.gv.at">GIP.at</a>, ${CC}`,
  };

  // Fehler in Klartext statt "HTTP 403"
  function errText(status, detail) {
    const m = {
      401: t('Der Beispiel-Token fehlt oder ist ungültig (401).', 'The example token is missing or invalid (401).'),
      403: t('Der Beispiel-Token gilt für diese Seite nicht (403).', 'The example token is not valid for this page (403).'),
      404: t('Nichts gefunden (404).', 'Nothing found (404).'),
      429: t('Gerade zu viele Anfragen (429). Warte kurz und versuch es noch einmal.', 'Too many requests right now (429). Please wait a moment and try again.'),
    }[status];
    return m || (detail ? `${detail} (${status})` : t(`Die Anfrage ist fehlgeschlagen (${status}).`, `The request failed (${status}).`));
  }
  const say = (s, bad) => { info.textContent = s; info.classList.toggle('mx-demo-bad', !!bad); };

  async function api(path) {
    const r = await fetch(API + path, { headers: { Authorization: 'Bearer ' + TOKEN } });
    if (!r.ok) { let d; try { d = (await r.json()).title; } catch { /* kein JSON */ } throw new Error(errText(r.status, d)); }
    return r.json();
  }
  const fail = (e) => say(e.message || String(e), true);

  // Bausteine fuer die Bedienleiste (alles als Text, nie als HTML)
  const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };
  function select(label, options, value) {
    const s = el('select'); for (const [v, l] of options) s.append(el('option', { value: v, textContent: l }));
    if (value) s.value = value;
    panel.append(el('label', {}, el('span', { textContent: label }), s)); return s;
  }
  function button(label, fn) { const b = el('button', { type: 'button', textContent: label, className: 'mx-demo-btn' }); b.addEventListener('click', fn); panel.append(b); return b; }
  function toggles(options, value, fn) {
    const g = el('div', { className: 'mx-demo-seg', role: 'group' });
    for (const [v, l] of options) {
      const b = el('button', { type: 'button', textContent: l }); b.dataset.v = v; b.setAttribute('aria-pressed', String(v === value));
      b.addEventListener('click', () => { for (const k of g.children) k.setAttribute('aria-pressed', String(k === b)); fn(v); });
      g.append(b);
    }
    panel.append(g); return g;
  }

  let L, map, base, mapEl, tileErr = false;
  function tiles(style) {
    const layer = L.tileLayer(`${API}/styles/${style}/tiles/512/{z}/{x}/{y}?access_token=${encodeURIComponent(TOKEN)}`, { tileSize: 512, zoomOffset: -1, minZoom: 1, maxZoom: 21, attribution: ATTR[style] || ATTR.streets });
    layer.on('tileerror', async (e) => { // einmal nachfragen, warum die Kachel fehlt
      if (tileErr) return; tileErr = true;
      try { const r = await fetch(e.tile.src); if (!r.ok) say(errText(r.status), true); } catch { say(t('Kacheln konnten nicht geladen werden.', 'Tiles could not be loaded.'), true); }
    });
    return layer;
  }
  function makeMap(center, zoom, style = 'streets') {
    mapEl = el('div', { className: 'mx-demo-map' });
    mapEl.setAttribute('aria-label', t('Interaktive Karte', 'Interactive map'));
    stage.replaceChildren(mapEl);
    map = L.map(mapEl, { scrollWheelZoom: false, dragging: !touch, tap: false, zoomAnimation: !reduce, fadeAnimation: !reduce, markerZoomAnimation: !reduce, attributionControl: false }).setView(center, zoom);
    L.control.attribution({ prefix: '<a href="https://mapx.at">mapx.at</a>' })  // Leaflet trennt mit „ | “: mapx.at | Quellen.addTo(map);
    base = tiles(style).addTo(map);
    if (touch) stage.append(el('p', { className: 'mx-demo-hint', textContent: t('Zwei Finger: zoomen und verschieben', 'Two fingers: zoom and pan') }));
    else stage.append(el('p', { className: 'mx-demo-hint', textContent: t('Ziehen verschiebt, + und − zoomen', 'Drag to pan, + and − to zoom') }));
    return map;
  }
  function setStyle(style) { base.remove(); tileErr = false; base = tiles(style).addTo(map); }
  // Tastatur-Ersatz fuer den Kartenklick: dieselbe Aktion an der Kartenmitte
  function centerButton(label, fn) { return button(label, () => { const c = map.getCenter(); fn({ latlng: c }); }); }
  const dot = (latlng, color) => L.circleMarker(latlng, { radius: 8, color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 });
  const text = (s) => el('span', { textContent: s });

  function load(src, css) {
    return new Promise((res, rej) => {
      const n = css ? el('link', { rel: 'stylesheet', href: src }) : el('script', { src });
      n.onload = res; n.onerror = () => rej(new Error(t('Das Beispiel konnte nicht geladen werden.', 'The example could not be loaded.')));
      document.head.append(n);
    });
  }

  start.addEventListener('click', async () => {
    start.disabled = true; start.textContent = t('Lädt …', 'Loading …');
    if (!/^mx_pk_/.test(TOKEN)) { say(t('Für dieses Beispiel ist noch kein öffentlicher Token hinterlegt.', 'No public token has been set for this example yet.'), true); start.hidden = true; return; }
    try {
      if (root.dataset.leaflet !== 'false') {
        await Promise.all([load(LEAFLET + 'leaflet.css', true), load(LEAFLET + 'leaflet.js')]);
        L = window.L;
      }
      await load(`/lp/demo/${root.dataset.demo}.js`);
      root.classList.add('mx-demo-on'); start.hidden = true; panel.hidden = false;
      window.mxDemo({ L, de, t, api, errText, API, TOKEN, say, fail, el, select, button, toggles, makeMap, setStyle, centerButton, dot, text, panel, stage, info, reduce, ATTR, get map() { return map; } });
    } catch (e) { start.disabled = false; start.textContent = t('Noch einmal versuchen', 'Try again'); fail(e); }
  });
})();
