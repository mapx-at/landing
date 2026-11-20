// mapx-Galerie: Fenster mit Live-Karte je Stil. Vor dem ersten Öffnen keine Anfrage an api.mapx.at;
// MapLibre und pmtiles kommen lokal aus /lp/vendor/. Direktlink: #<karte> oder #<stil-id> (z. B. #streets-night).
(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('mx-gdata').textContent);
  const dlg = document.querySelector('.mx-gdlg');
  if (!dlg || typeof dlg.showModal !== 'function') return; // ohne <dialog> bleibt das Raster
  const de = (document.documentElement.lang || 'de').startsWith('de');
  const t = (d, e) => (de ? d : e);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const V = '/lp/vendor/';
  const $ = (s, r = dlg) => r.querySelector(s);
  const byKey = Object.fromEntries(data.cards.map((c) => [c.key, c]));
  const byStyle = {};
  for (const c of data.cards) for (const v of c.variants) byStyle[v.id] = c;

  // Kopieren: Zwischenablage, sonst Text markieren
  async function copy(btn, text, node) {
    const old = btn.dataset.label || (btn.dataset.label = btn.textContent);
    try { await navigator.clipboard.writeText(text); btn.textContent = t('Kopiert', 'Copied'); }
    catch { const r = document.createRange(); r.selectNodeContents(node); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = t('Markiert', 'Selected'); }
    setTimeout(() => { btn.textContent = old; }, 1600);
  }
  for (const b of document.querySelectorAll('.mx-gcard .mx-gcopy')) {
    b.hidden = false;
    b.addEventListener('click', () => copy(b, b.dataset.copy, b.previousElementSibling));
  }

  // MapLibre erst beim ersten Öffnen laden
  let ml;
  function lib() {
    if (!ml) {
      const css = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: V + 'maplibre-gl-6.19.0/maplibre-gl.css' });
      document.head.append(css);
      const pm = new Promise((ok, bad) => { const s = Object.assign(document.createElement('script'), { src: V + 'pmtiles-4.5.0/pmtiles.js', onload: ok, onerror: bad }); document.head.append(s); });
      ml = Promise.all([import(V + 'maplibre-gl-6.19.0/maplibre-gl.mjs'), pm]).then(([m]) => {
        m.addProtocol('pmtiles', new window.pmtiles.Protocol().tile);
        return m;
      });
    }
    return ml;
  }
  const auth = (url) => ({ url: /^https:\/\/([\w-]+\.)?mapx\.at\//.test(url) ? url + (url.includes('?') ? '&' : '?') + 'access_token=' + data.token : url });
  const snippet = (id, c) => `const map = new maplibregl.Map({\n  container: "map",\n  style: "${data.api}${id}?access_token=YOUR_TOKEN",\n  center: [${c.center.join(', ')}], zoom: ${c.zoom},\n});`;

  let map = null, card = null, opener = null, style = '', pushed = false;
  const info = $('.mx-ginfo');
  function setStyle(id) {
    style = id;
    const v = card.variants.find((x) => x.id === id);
    $('.mx-gdlg-url').textContent = data.api + id;
    $('.mx-gsnip code').textContent = snippet(id, card);
    const a = $('.mx-gdlg-map');
    a.hidden = !v.map; if (v.map) a.href = 'https://map.mapx.at/#' + v.map;
    for (const b of $('.mx-gseg').children) b.setAttribute('aria-pressed', String(b.dataset.id === id));
    if (map) map.setStyle(data.api + id);
    if (location.hash.slice(1) !== id && !(id === card.def && location.hash.slice(1) === card.key)) history.replaceState(null, '', '#' + id);
  }

  async function open(key, styleId, from) {
    const c = byKey[key]; if (!c) return;
    card = c; opener = from || document.querySelector(`.mx-gbtn[data-key="${key}"]`);
    $('#mx-gdlg-h').textContent = c.name;
    $('.mx-gdlg-place').textContent = t('Vorschau: ', 'Preview: ') + c.place;
    $('.mx-gdlg-p').textContent = c.text;
    const seg = $('.mx-gseg'); seg.replaceChildren(); seg.hidden = c.variants.length < 2;
    for (const v of c.variants) {
      const b = Object.assign(document.createElement('button'), { type: 'button', textContent: v.label });
      b.dataset.id = v.id; b.addEventListener('click', () => setStyle(v.id)); seg.append(b);
    }
    info.textContent = '';
    // Klick: eigener Verlaufseintrag, damit der Zurück-Knopf das Fenster schließt
    if (from && location.hash.slice(1) !== key) { history.pushState(null, '', '#' + key); pushed = true; }
    if (!dlg.open) dlg.showModal();
    setStyle(styleId || c.def);
    try {
      const m = await lib();
      if (!dlg.open || card !== c) return;
      if (map) map.remove();
      map = new m.Map({
        container: $('.mx-gmap'), style: data.api + style, center: c.center, zoom: c.zoom,
        transformRequest: auth, attributionControl: false, fadeDuration: reduce ? 0 : 300, cooperativeGestures: false,
      });
      dlg.mxMap = map; // für Tests und Konsole
      map.addControl(new m.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new m.AttributionControl({ compact: true }), 'bottom-right');
      // Quellenangabe eingeklappt starten (Knopf „i“ bleibt sichtbar), sonst verdeckt sie einen Teil der Karte
      map.once('load', () => map.getContainer().querySelector('.maplibregl-compact-show')?.classList.remove('maplibregl-compact-show'));
      map.on('error', (e) => { const s = e?.error?.status; if (s === 401 || s === 403) info.textContent = t('Der Beispiel-Token gilt für diese Seite nicht.', 'The example token is not valid for this page.'); });
    } catch { info.textContent = t('Die Karte ließ sich nicht laden.', 'The map could not be loaded.'); }
  }
  function close() { if (dlg.open) dlg.close(); }
  dlg.addEventListener('close', () => {
    if (map) { map.remove(); map = null; }
    if (pushed) { pushed = false; history.back(); }
    else if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    opener?.focus();
  });
  // Fokusfalle: Tab und Umschalt+Tab bleiben im Fenster (auch wenn der Browser sonst in seine eigene Leiste springt)
  dlg.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [...dlg.querySelectorAll('a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"]),canvas')].filter((n) => n.offsetParent !== null || n === document.activeElement);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); }); // Klick auf den abgedunkelten Hintergrund
  dlg.querySelector('.mx-gdlg-in').addEventListener('click', (e) => e.stopPropagation());
  $('.mx-gdlg-text .mx-gcopy').addEventListener('click', (e) => copy(e.currentTarget, $('.mx-gdlg-url').textContent, $('.mx-gdlg-url')));
  $('.mx-gsnip .mx-gcopy').addEventListener('click', (e) => copy(e.currentTarget, $('.mx-gsnip code').textContent, $('.mx-gsnip code')));

  for (const b of document.querySelectorAll('.mx-gbtn')) {
    b.disabled = false;
    b.addEventListener('click', () => open(b.dataset.key, null, b));
  }
  document.documentElement.classList.add('mx-gjs');
  function fromHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (byKey[h]) open(h); else if (byStyle[h]) open(byStyle[h].key, h);
    else if (dlg.open) { pushed = false; close(); } // Zurück-Knopf oder unbekannter Hash
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
