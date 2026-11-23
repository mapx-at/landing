// ÖV: Abfahrtstafel laut Fahrplan (/v1/departures) als Bottom-Sheet in der Karte, Start Salzburg Hbf.
// Minuten zählen clientseitig herunter, abgefahrene Zeilen gleiten heraus, Nachladen höchstens einmal pro Minute.
// Haltestellen im Ausschnitt (/v1/stops?bbox) als Punkte; ein Tipp darauf fliegt hin und wechselt die Tafel.
window.mxDemo = (c) => {
  const { L, t, el } = c;
  const HBF = { id: 'at:45:50002', name: 'Salzburg Hauptbahnhof', location: [13.045128, 47.813061] };
  const map = c.makeMap([HBF.location[1], HBF.location[0]], 16, 'streets', t('Blauen Punkt antippen: andere Haltestelle', 'Tap a blue dot for another stop'));
  map.attributionControl.addAttribution('ÖBB-Personenverkehr AG (CC BY 4.0); Datenquelle: Mobilitätsverbünde Österreich OG – data.mobilitaetsverbuende.at');
  const all = L.layerGroup().addTo(map), here = L.layerGroup().addTo(map);
  const RELOAD_MS = 60000, LIMIT = 8;

  // Linienfarbe: die API liefert keine Farbe, daher fest nach Verkehrsmittel, Busse nach Liniennummer gestreut
  const BUS = ['#0a64e8', '#1d7f4e', '#7b3fbf', '#0f8a8a', '#b8560f', '#a3306f', '#3d5a80'];
  function color(line) {
    const m = line.mode, n = line.short_name || line.name || '';
    if (m === 'rail') return /^S\d/.test(n) ? '#0f6cb6' : '#c8102e';
    if (m === 'subway') return '#e2001a';
    if (m === 'tram') return '#d32f2f';
    let h = 0; for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return BUS[h % BUS.length];
  }
  function label(when) {
    const m = Math.floor((when - Date.now()) / 60000);
    return m <= 0 ? t('jetzt', 'now') : `in ${m} min`;
  }

  let stop = HBF, rows = [], lastLoad = 0, seq = 0, list, title;
  function board() {
    const box = c.result({});
    title = el('p', { className: 'mx-demo-res-title mx-dep-title' }, el('span', { textContent: stop.name }), el('small', { textContent: t('laut Fahrplan', 'according to the timetable') }));
    list = el('ol', { className: 'mx-dep' });
    box.append(title, list);
  }
  function row(d) {
    const when = Date.parse(d.time);
    const badge = el('span', { className: 'mx-dep-line', textContent: d.line.short_name || d.line.name });
    badge.style.background = color(d.line);
    const min = el('span', { className: 'mx-dep-min', textContent: label(when) });
    const li = el('li', {}, badge, el('span', { className: 'mx-dep-to', textContent: d.headsign || d.destination?.name || '' }), min);
    li.title = d.time.slice(11, 16) + (d.platform ? t(` · Steig ${d.platform}`, ` · platform ${d.platform}`) : '');
    return { when, li, min, key: d.trip_id + d.time };
  }
  async function load(s, { fly } = {}) {
    const n = ++seq;
    if (s !== stop) { stop = s; rows = []; }
    here.clearLayers();
    c.dot([s.location[1], s.location[0]], '#c8372d').setRadius(10).addTo(here);
    if (fly) c.flyTo([s.location[1], s.location[0]], Math.max(16, map.getZoom()));
    if (!list || fly) board();
    if (!rows.length) c.say(t(`${s.name}: lade Abfahrten …`, `${s.name}: loading departures …`));
    try {
      lastLoad = Date.now();
      const { departures } = await c.api(`/departures?stop=${encodeURIComponent(s.id)}&limit=${LIMIT}`, { key: 'dep' });
      if (n !== seq) return;
      const have = new Set(rows.map((r) => r.key));
      for (const d of departures) {
        const r = row(d);
        if (have.has(r.key) || r.when < Date.now() - 30000) continue;
        rows.push(r); list.append(r.li);
        if (!c.reduce) { r.li.classList.add('mx-in'); requestAnimationFrame(() => requestAnimationFrame(() => r.li.classList.remove('mx-in'))); }
      }
      rows.sort((a, b) => a.when - b.when); for (const r of rows) list.append(r.li);
      list.querySelector('.mx-dep-none')?.remove();
      if (!rows.length) list.append(el('li', { className: 'mx-dep-none', textContent: t('Gerade keine Abfahrten laut Fahrplan. Tipp auf einen anderen blauen Punkt.', 'No departures in the timetable right now. Tap another blue dot.') }));
      c.say(rows.length ? t(`${s.name}: nächste Abfahrten laut Fahrplan`, `${s.name}: next departures according to the timetable`)
        : t(`${s.name}: gerade keine Abfahrten im Fahrplan. Tipp auf einen anderen blauen Punkt.`, `${s.name}: no departures in the timetable right now. Tap another blue dot.`));
    } catch (e) { if (n === seq) c.fail(e); }
  }
  // Jede Sekunde: Minuten nachführen, abgefahrene Zeilen herausgleiten lassen, bei Bedarf (max. 1/min) nachladen
  setInterval(() => {
    const now = Date.now();
    for (const r of [...rows]) {
      if (r.when < now - 30000) {
        rows.splice(rows.indexOf(r), 1);
        if (c.reduce) r.li.remove(); else { r.li.classList.add('mx-out'); setTimeout(() => r.li.remove(), 600); }
      } else { const s = label(r.when); if (r.min.textContent !== s) r.min.textContent = s; }
    }
    if (rows.length < LIMIT - 2 && now - lastLoad >= RELOAD_MS && !document.hidden) load(stop);
  }, 1000);

  // Haltestellen im Ausschnitt als antippbare Punkte
  let sseq = 0;
  async function stops() {
    const b = map.getBounds(), n = ++sseq;
    if (map.getZoom() < 14) { all.clearLayers(); return; }
    try {
      const r = await c.api(`/stops?bbox=${[b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((v) => v.toFixed(5)).join(',')}&limit=150`, { key: 'bbox' });
      if (n !== sseq) return;
      all.clearLayers();
      for (const s of r.stops) {
        const ll = [s.location[1], s.location[0]], pick = (ev) => { L.DomEvent.stopPropagation(ev); c.endStart(); if (s.id !== stop.id) load(s, { fly: true }); };
        L.circleMarker(ll, { radius: 7, color: '#fff', weight: 2, fillColor: '#2346d8', fillOpacity: 0.9 })
          .addTo(all).bindTooltip(c.text(s.name), { direction: 'top', offset: [0, -6] }).on('click', pick);
        // unsichtbare Fangzone mit 44 px Durchmesser für Finger
        if (c.touch) L.circleMarker(ll, { radius: 22, stroke: false, fillOpacity: 0.001, fillColor: '#2346d8' }).addTo(all).on('click', pick);
      }
      here.eachLayer((l) => l.bringToFront()); // gewählte Haltestelle bleibt obenauf
    } catch { /* Punkte sind nur Hilfe, Fehler zeigt die Tafel */ }
  }
  map.on('moveend', c.debounce(stops, 400));
  // Tipp neben die Punkte: nächste Haltestelle im Umkreis
  async function near(e) {
    const at = `${e.latlng.lng.toFixed(6)},${e.latlng.lat.toFixed(6)}`;
    try {
      const s = (await c.api(`/stops?near=${at}&radius=300&limit=1`, { key: 'near' })).stops[0];
      if (!s) { c.say(t('Hier fährt nichts – tipp auf einen blauen Punkt.', 'Nothing runs here – tap a blue dot.')); return; }
      if (s.id !== stop.id) load(s, { fly: true });
    } catch (err) { c.fail(err); }
  }
  map.on('click', near);
  c.centerButton(t('Kartenmitte abfragen', 'Look up map centre'), near);
  // Startzustand: Tafel Salzburg Hbf sofort, Haltestellen ringsum (2 Requests)
  load(HBF); stops();
};
