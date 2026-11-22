// ÖV: ein Klick sucht die nächste Haltestelle (/v1/stops) und zeigt ihre nächsten Abfahrten laut Soll-Fahrplan (/v1/departures).
window.mxDemo = (c) => {
  const { L, t, el } = c;
  const map = c.makeMap([47.8131, 13.0451], 15, 'streets'); // Salzburg Hauptbahnhof
  map.attributionControl.addAttribution('ÖBB-Personenverkehr AG (CC BY 4.0); Datenquelle: Mobilitätsverbünde Österreich OG – data.mobilitaetsverbuende.at');
  const list = el('ol', { className: 'mx-demo-list mx-demo-dep' });
  c.stage.after(list);
  const here = L.layerGroup().addTo(map);
  let seq = 0;
  async function query(e) {
    const n = ++seq, at = `${e.latlng.lng.toFixed(6)},${e.latlng.lat.toFixed(6)}`;
    c.say(t('Suche die nächste Haltestelle …', 'Finding the nearest stop …'));
    try {
      const stop = (await c.api(`/stops?near=${at}&radius=300&limit=1`)).stops[0];
      if (n !== seq) return;
      here.clearLayers(); list.replaceChildren();
      if (!stop) { c.say(t('Keine Haltestelle im Umkreis von 300 m.', 'No stop within 300 m.')); return; }
      c.dot([stop.location[1], stop.location[0]], '#2346d8').addTo(here).bindTooltip(c.text(stop.name), { permanent: true, direction: 'top', offset: [0, -8] });
      const { departures } = await c.api(`/departures?stop=${encodeURIComponent(stop.id)}&limit=8`);
      if (n !== seq) return;
      for (const d of departures) list.append(el('li', {}, el('b', { textContent: d.time.slice(11, 16) }), ` ${d.line.name} → ${d.headsign}`));
      c.say(departures.length ? t(`${stop.name}: nächste Abfahrten laut Fahrplan`, `${stop.name}: next departures according to the timetable`) : t(`${stop.name}: derzeit keine Abfahrten im Fahrplan`, `${stop.name}: no departures in the timetable right now`));
    } catch (err) { if (n === seq) c.fail(err); }
  }
  map.on('click', query);
  c.centerButton(t('Kartenmitte abfragen', 'Look up map centre'), query);
  c.say(t('Tipp in die Nähe einer Haltestelle.', 'Tap near a stop.'));
};
