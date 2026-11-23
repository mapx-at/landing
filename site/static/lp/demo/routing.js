// Routing: /v1/directions für Auto, Rad und zu Fuß parallel (3 Requests, Zone route 5/s je IP), Umschalten blendet nur über.
// Start und Ziel sind ziehbare Pins; beim Ziehen wird nur das gewählte Profil debounced neu gerechnet, nach dem Loslassen alle drei.
window.mxDemo = (c) => {
  const { L, t, el } = c;
  const map = c.makeMap([48.2335, 15.3345], 14, 'streets', t('Pins A und B ziehen', 'Drag pins A and B')); // Melk
  const PROF = [['driving', t('Auto', 'Car'), '#0a64e8'], ['cycling', t('Rad', 'Bike'), '#1d7f4e'], ['walking', t('Zu Fuß', 'Walking'), '#b8560f']];
  const lines = {}, data = {};
  for (const [p, , col] of PROF) lines[p] = L.geoJSON(null, { style: { color: col, weight: 6, opacity: 0.95, className: 'mx-rt' } }).addTo(map);
  const pin = (ll, s, cls) => L.marker(ll, { draggable: true, autoPan: true, keyboard: true, title: s,
    icon: L.divIcon({ className: 'mx-pin ' + cls, html: `<span><b>${s}</b></span>`, iconSize: [44, 48], iconAnchor: [22, 47] }) }).addTo(map);
  const a = pin([48.2266, 15.3337], 'A', 'mx-pin-a'), b = pin([48.2412, 15.3378], 'B', 'mx-pin-b');
  const profile = c.toggles(PROF.map(([v, l]) => [v, l]), 'driving', () => show(true), t('Profil', 'Profile'));
  const kmEl = el('span', { className: 'mx-demo-chip' }), minEl = el('span', { className: 'mx-demo-chip' });
  const fmtKm = (v) => `${(v / 1000).toLocaleString(t('de-AT', 'en-GB'), { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
  const fmtMin = (v) => `${Math.max(1, Math.round(v / 60))} min`;
  const pathsOf = (g) => { const o = []; g.eachLayer((l) => l._path && o.push(l._path)); return o; };

  // Linien: gewählte voll, die anderen als Hauch; Wechsel per CSS-Übergang auf opacity
  function paint() {
    for (const [p] of PROF) for (const n of pathsOf(lines[p])) n.classList.toggle('mx-rt-on', p === profile.value);
    if (lines[profile.value]) lines[profile.value].bringToFront();
  }
  let shown = { d: 0, s: 0 };
  function show(anim) {
    const r = data[profile.value];
    paint();
    if (!r) { c.say(t('Berechne die Route …', 'Calculating the route …')); return; }
    if (r === 'none') { c.result(null); c.say(t('Für dieses Profil keine Route. Zieh einen Pin auf eine Straße.', 'No route for this profile. Drag a pin onto a road.')); return; }
    c.result({ chips: [kmEl, minEl, profile.label()] });
    if (anim && !c.reduce) {
      const from = { ...shown };
      countFrom(kmEl, from.d, r.distance, fmtKm); countFrom(minEl, from.s, r.duration, fmtMin);
    } else { kmEl.textContent = fmtKm(r.distance); minEl.textContent = fmtMin(r.duration); }
    shown = { d: r.distance, s: r.duration };
    c.say(t(`${fmtKm(r.distance)}, etwa ${fmtMin(r.duration)} (${profile.label()})`, `${fmtKm(r.distance)}, about ${fmtMin(r.duration)} (${profile.label()})`));
  }
  function countFrom(node, x0, x1, fmt) {
    const t0 = performance.now(), ms = 700;
    (function step(now) { const k = Math.min(1, (now - t0) / ms), e = 1 - (1 - k) ** 3; node.textContent = fmt(x0 + (x1 - x0) * e); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  const q = () => { const A = a.getLatLng(), B = b.getLatLng(); return `${A.lng.toFixed(5)},${A.lat.toFixed(5)};${B.lng.toFixed(5)},${B.lat.toFixed(5)}`; };
  async function calc(p, at) {
    try {
      const r = (await c.api(`/directions/${p}/${at}?geometries=geojson&overview=full&steps=false`, { key: 'route-' + p })).routes[0];
      if (at !== q()) return null;
      lines[p].clearLayers(); data[p] = r || 'none';
      if (r) lines[p].addData(r.geometry);
      return r;
    } catch (e) { c.fail(e); return null; }
  }
  async function all(first) {
    const at = q();
    const done = PROF.map(([p]) => calc(p, at));
    await done[PROF.findIndex(([p]) => p === profile.value)];
    if (at !== q()) return;
    paint();
    if (first) await c.drawLine(lines[profile.value], 800);
    show(true);
    await Promise.all(done); paint();
  }
  const dragOne = c.debounce(async () => { const r = await calc(profile.value, q()); if (r) show(true); }, 600);
  for (const m of [a, b]) {
    m.on('dragstart', c.endStart);
    m.on('drag', dragOne);
    m.on('dragend', () => { for (const [p] of PROF) if (p !== profile.value) delete data[p]; all(false); });
  }
  // Tipp in die Karte: setzt das Ziel dorthin (Start bleibt)
  map.on('click', (e) => { b.setLatLng(e.latlng); all(false); });
  c.centerButton(t('Ziel auf Kartenmitte', 'Destination at map centre'), (e) => { b.setLatLng(e.latlng); all(false); });
  // Startzustand: Route durch Melk baut sich auf, Zeit und Strecke zählen hoch
  all(true);
};
