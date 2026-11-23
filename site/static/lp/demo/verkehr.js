// Verkehr: die aktiven Meldungen im Kartenausschnitt (/v1/traffic/incidents), Sperren rot; neu geladen erst nach dem Verschieben.
window.mxDemo = (c) => {
  const { L, t, el } = c;
  const map = c.makeMap([48.15, 16.3], 11, 'streets'); // Wien und Umgebung
  map.attributionControl.addAttribution('ASFINAG / EVIS.AT (CC BY 4.0)');
  const list = el('ul', { className: 'mx-demo-list mx-demo-inc' });
  c.below(list);
  // `kind` ist ein englisches Enum (API seit 22.11.2026); deutsche Anzeige über diese Tabelle, englisch lesbar aus dem Wert
  const KIND_DE = {
    road_closure: 'Straßensperre', winter_closure: 'Wintersperre', tunnel_closure: 'Tunnelsperre', ramp_closure: 'Rampensperre',
    lane_closure: 'Spursperre', roadworks: 'Bauarbeiten', maintenance_works: 'Instandhaltung', repair_works: 'Reparaturarbeiten',
    resurfacing_works: 'Belagsarbeiten', safety_upgrade_works: 'Sicherheitsausbau', grass_cutting: 'Mäharbeiten',
    alternating_traffic: 'Wechselseitige Anhaltung', temporary_traffic_lights: 'Ampelregelung', traffic_management: 'Verkehrsführung',
    speed_restriction: 'Geschwindigkeitsbeschränkung', congestion: 'Überlastung', accident: 'Unfall', obstruction: 'Hindernis',
    hazardous_driving_conditions: 'Gefährliche Fahrbedingungen', weather: 'Wetter', safety_exercise: 'Sicherheitsübung',
    route_recommendation: 'Routenempfehlung', event: 'Veranstaltung', other: 'Meldung',
  };
  const kindText = (k) => (k ? t(KIND_DE[k] || k.replace(/_/g, ' '), k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' ')) : '');
  // Ergebnis-Karte: Art-Badge, Straße als Titel, Text zweizeilig mit „Mehr“, Gültigkeit
  const until = (iso) => (iso ? t('bis ', 'until ') + new Intl.DateTimeFormat(t('de-AT', 'en-GB'), { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'Europe/Vienna' }).format(new Date(iso)) : '');
  const road = (p) => p.road_name || p.road || p.direction || kindText(p.kind);
  // Der Meldungstext beginnt oft mit „Straße von … bis …:“, das steht schon im Titel
  const body = (p) => (p.text || '').replace(/^[^:]{3,120}:\s*/, '');
  const badge = (p) => el('span', { className: 'mx-inc-badge' + (p.closed ? ' mx-closed' : ''), textContent: kindText(p.kind) || p.type || t('Meldung', 'Report') });
  let current;
  const show = (f) => {
    const p = f.properties; current = f;
    const box = c.result({});
    const txt = el('p', { className: 'mx-inc-text', textContent: body(p) });
    box.append(el('p', { className: 'mx-inc-head' }, badge(p), el('span', { className: 'mx-inc-until', textContent: until(p.end) })),
      el('p', { className: 'mx-demo-res-title', textContent: road(p) }), txt);
    requestAnimationFrame(() => {
      if (txt.scrollHeight <= txt.clientHeight + 2) return;
      const more = el('button', { type: 'button', className: 'mx-inc-more', textContent: t('Mehr', 'More') });
      more.addEventListener('click', () => { const o = txt.classList.toggle('mx-open'); more.textContent = o ? t('Weniger', 'Less') : t('Mehr', 'More'); });
      box.append(more);
    });
    for (const b of list.querySelectorAll('button')) b.setAttribute('aria-current', String(b._f === f));
    c.endStart();
  };
  const layer = L.geoJSON(null, {
    style: (f) => ({ color: f.properties.closed ? '#c8372d' : '#e8890c', weight: 6, opacity: 0.85, lineCap: 'round' }),
    pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 7, color: '#fff', weight: 2, fillColor: f.properties.closed ? '#c8372d' : '#e8890c', fillOpacity: 1 }),
    onEachFeature: (f, l) => l.on('click', () => show(f)),
  }).addTo(map);
  let seq = 0;
  async function load() {
    const b = map.getBounds(), n = ++seq;
    try {
      const fc = await c.api(`/traffic/incidents?bbox=${[b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((v) => v.toFixed(4)).join(',')}&active=true&limit=50`, { key: 'inc' });
      if (n !== seq) return;
      layer.clearLayers().addData(fc);
      list.replaceChildren(...fc.features.slice(0, 6).map((f) => {
        const p = f.properties, bt = el('button', { type: 'button' }, badge(p), el('span', { className: 'mx-inc-road', textContent: road(p) }), el('span', { className: 'mx-inc-until', textContent: until(p.end) }));
        bt._f = f; bt.addEventListener('click', () => { show(f); });
        return el('li', {}, bt);
      }));
      if (current && !fc.features.some((f) => (f.id ?? f.properties.text) === (current.id ?? current.properties.text))) { current = null; c.result(null); }
      const nn = fc.features.length >= 50 ? t('Mindestens 50', 'At least 50') : fc.features.length;
      c.say(t(`${nn} aktive Meldungen im Ausschnitt. Linie antippen für Details.`, `${nn} active reports in view. Tap a line for details.`));
    } catch (e) { c.fail(e); }
  }
  map.on('moveend', c.debounce(load, 400));
  load();
};
