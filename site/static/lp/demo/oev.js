// ÖV: ein Klick sucht die nächste Haltestelle (/v1/stops) und zeigt ihre nächsten Abfahrten laut Soll-Fahrplan (/v1/departures).
window.mxDemo = (c) => {
  const { L, t, el } = c;
  const map = c.makeMap([47.8131, 13.0451], 16, 'streets', t('Blauen Punkt (Haltestelle) antippen', 'Tap a blue dot (stop)')); // Salzburg Hauptbahnhof
  map.attributionControl.addAttribution('ÖBB-Personenverkehr AG (CC BY 4.0); Datenquelle: Mobilitätsverbünde Österreich OG – data.mobilitaetsverbuende.at');
  const list = el('ol', { className: 'mx-demo-list mx-demo-dep' });
  c.stage.after(list);
  const all = L.layerGroup().addTo(map), here = L.layerGroup().addTo(map);
  let seq = 0, sseq = 0, timer;
  // alle Haltestellen im Ausschnitt als antippbare Punkte, damit man nicht raten muss, wo man tippen soll
  async function stops() {
    const b = map.getBounds(), n = ++sseq;
    if (map.getZoom() < 14) { all.clearLayers(); return; }
    try {
      const r = await c.api(`/stops?bbox=${[b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((v) => v.toFixed(5)).join(',')}&limit=150`);
      if (n !== sseq) return;
      all.clearLayers();
      for (const s of r.stops) L.circleMarker([s.location[1], s.location[0]], { radius: 7, color: '#fff', weight: 2, fillColor: '#2346d8', fillOpacity: 0.9 })
        .addTo(all).bindTooltip(c.text(s.name), { direction: 'top', offset: [0, -6] }).on('click', (ev) => { L.DomEvent.stopPropagation(ev); show(s); });
    } catch { /* Punkte sind nur Hilfe, Fehler zeigt die Abfrage */ }
  }
  map.on('moveend', () => { clearTimeout(timer); timer = setTimeout(stops, 300); });
  async function query(e) {
    const n = ++seq, at = `${e.latlng.lng.toFixed(6)},${e.latlng.lat.toFixed(6)}`;
    c.say(t('Suche die nächste Haltestelle …', 'Finding the nearest stop …'));
    try {
      const stop = (await c.api(`/stops?near=${at}&radius=300&limit=1`)).stops[0];
      if (n !== seq) return;
      if (!stop) { here.clearLayers(); list.replaceChildren(); c.say(t('Keine Haltestelle im Umkreis von 300 m.', 'No stop within 300 m.')); return; }
      await show(stop, n);
    } catch (err) { if (n === seq) c.fail(err); }
  }
  async function show(stop, n = ++seq) {
    try {
      here.clearLayers(); list.replaceChildren();
      c.dot([stop.location[1], stop.location[0]], '#c8372d').addTo(here).bindTooltip(c.text(stop.name), { permanent: true, direction: 'top', offset: [0, -8] });
      c.say(t(`${stop.name}: lade Abfahrten …`, `${stop.name}: loading departures …`));
      const { departures } = await c.api(`/departures?stop=${encodeURIComponent(stop.id)}&limit=8`);
      if (n !== seq) return;
      for (const d of departures) list.append(el('li', {}, el('b', { textContent: d.time.slice(11, 16) }), ` ${d.line.name} → ${d.headsign}`));
      c.say(departures.length ? t(`${stop.name}: nächste Abfahrten laut Fahrplan`, `${stop.name}: next departures according to the timetable`) : t(`${stop.name}: derzeit keine Abfahrten im Fahrplan`, `${stop.name}: no departures in the timetable right now`));
    } catch (err) { if (n === seq) c.fail(err); }
  }
  map.on('click', query);
  c.centerButton(t('Kartenmitte abfragen', 'Look up map centre'), query);
  // Startzustand: Abfahrtstafel Salzburg Hbf sofort offen, Haltestellen ringsum sichtbar
  query({ latlng: map.getCenter() }); stops();
};
