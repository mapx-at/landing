// Wetter: Temperatur oder Niederschlag als Rasterkacheln (/v1/weather/tiles), Stundenregler mit Abspielen; Doppelpuffer gegen Flackern.
window.mxDemo = (c) => {
  const { L, t, el } = c;
  const map = c.makeMap([47.6, 13.3], 7, 'streets');
  // Doppelpuffer: jede Stunde ist eine eigene Ebene, unsichtbar geladen und erst nach `load` eingeblendet (kein weißes Aufblitzen).
  // Höchstens drei Ebenen im Speicher (aktuelle, vorige, nächste vorgeladen), damit Last und Requests klein bleiben.
  const ATTRW = t('Wetter: GeoSphere Austria, CC BY 4.0', 'Weather: GeoSphere Austria, CC BY 4.0');
  const OPA = 0.8, cache = new Map(); // key -> { layer, ready: Promise }
  let current = null;
  function get(key, ts) {
    if (cache.has(key)) return cache.get(key);
    const layer = L.tileLayer(`${c.API}/weather/tiles/${param.value}/${ts}/{z}/{x}/{y}.png?access_token=${encodeURIComponent(c.TOKEN)}`,
      { tileSize: 512, zoomOffset: -1, maxNativeZoom: 12, maxZoom: 21, opacity: 0, attribution: ATTRW, keepBuffer: 1, updateWhenZooming: false });
    const ready = new Promise((res) => { layer.once('load', res); setTimeout(res, 8000); });
    layer.addTo(map); const e = { layer, ready }; cache.set(key, e); return e;
  }
  function prune(keep) { for (const [k, e] of cache) if (!keep.includes(k)) { e.layer.remove(); cache.delete(k); } }
  function fade(e) {
    if (current === e) { e.layer.setOpacity(OPA); return; }
    const old = current; current = e;
    if (c.reduce) { e.layer.setOpacity(OPA); old?.layer.setOpacity(0); return; }
    const t0 = performance.now();
    (function step(now) { const k = Math.min(1, (now - t0) / 250); e.layer.setOpacity(OPA * k); if (old && old !== current) old.layer.setOpacity(OPA * (1 - k)); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  const param = c.select(t('Größe', 'Variable'), [['temperature', t('Temperatur', 'Temperature')], ['precipitation', t('Niederschlag', 'Precipitation')]], 'temperature');
  const play = c.button(t('▶ Abspielen', '▶ Play'), () => (playing ? stop() : run()));
  const slider = el('input', { type: 'range', min: 0, max: 0, value: 0, step: 1 });
  const out = el('output', { textContent: '' });
  c.panel.append(el('label', { className: 'mx-demo-range' }, el('span', { textContent: t('Stunde', 'Hour') }), slider, out));
  const fmt = new Intl.DateTimeFormat(t('de-AT', 'en-GB'), { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Vienna' });
  let times = [], timer, seq = 0, playing = false, ptimer;
  // Zeiten kommen als 2026-11-22T04:00:00Z (früher ohne Sekunden: 2026-11-22T04:00Z); beides lesbar
  const toDate = (ts) => new Date(/T\d\d:\d\dZ$/.test(ts) ? ts.replace(/Z$/, ':00Z') : ts);
  const keyOf = (i) => `${param.value}/${times[i]}`;
  async function show() {
    const i = Number(slider.value), ts = times[i]; if (!ts) return;
    const n = ++seq, label = fmt.format(toDate(ts));
    out.textContent = label; slider.setAttribute('aria-valuetext', label);
    const e = get(keyOf(i), ts);
    await e.ready; if (n !== seq) return;
    fade(e);
    const nx = (i + 1) % times.length; get(keyOf(nx), times[nx]); // nächste Stunde vorladen
    const pv = (i - 1 + times.length) % times.length;
    prune([keyOf(i), keyOf(nx), keyOf(pv)].filter((k) => cache.has(k)).slice(0, 3));
    c.say(t(`${param.selectedOptions[0].text}, ${label} (Prognose, Ortszeit Wien)`, `${param.selectedOptions[0].text}, ${label} (forecast, Vienna time)`));
  }
  // Abspielen: etwa 1 s je Stunde, der nächste Schritt erst, wenn die Ebene geladen ist (nie mehr als eine Stunde voraus)
  async function tick() {
    if (!playing) return;
    slider.value = String((Number(slider.value) + 1) % times.length);
    const t0 = performance.now(); await show();
    if (playing) ptimer = setTimeout(tick, Math.max(0, 1000 - (performance.now() - t0)));
  }
  function run() { if (!times.length) return; playing = true; play.textContent = t('❚❚ Pause', '❚❚ Pause'); play.setAttribute('aria-pressed', 'true'); ptimer = setTimeout(tick, 1000); }
  function stop() { playing = false; clearTimeout(ptimer); play.textContent = t('▶ Abspielen', '▶ Play'); play.setAttribute('aria-pressed', 'false'); }
  async function load() {
    try {
      times = (await c.api(`/weather/tiles/${param.value}.json`))['mapx:time'].times;
      slider.max = String(times.length - 1); if (Number(slider.value) > times.length - 1) slider.value = '0';
      prune([]); current = null;
      await show();
    } catch (e) { c.fail(e); }
  }
  // Ziehen: Zeit sofort anzeigen, geladen wird gedrosselt erst, wenn der Regler kurz steht
  slider.addEventListener('input', () => { stop(); out.textContent = fmt.format(toDate(times[Number(slider.value)])); clearTimeout(timer); timer = setTimeout(show, 250); });
  param.addEventListener('change', load);
  // Der Demo-Start ist schon ein Antippen; bei prefers-reduced-motion nur von Hand abspielen
  load().then(() => { if (!c.reduce) run(); });
};
