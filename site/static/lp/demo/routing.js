// Routing: Start und Ziel antippen, /v1/directions liefert die Route als GeoJSON-Linie samt Länge und Dauer.
window.mxDemo = (c) => {
  const { L, t } = c;
  const map = c.makeMap([48.23, 15.33], 14, 'streets'); // Melk
  const line = L.geoJSON(null, { style: { color: '#2346d8', weight: 5, opacity: 0.9 } }).addTo(map);
  const pins = L.layerGroup().addTo(map);
  const profile = c.toggles([['driving', t('Auto', 'Car')], ['cycling', t('Rad', 'Bike')], ['walking', t('Zu Fuß', 'Walking')]], 'driving', () => route(), t('Profil', 'Profile'));
  let a = null, b = null;
  async function route() {
    if (!a || !b) return;
    c.say(t('Berechne die Route …', 'Calculating the route …'));
    try {
      const r = (await c.api(`/directions/${profile.value}/${a.lng.toFixed(5)},${a.lat.toFixed(5)};${b.lng.toFixed(5)},${b.lat.toFixed(5)}?geometries=geojson&overview=full&steps=false`, { key: 'route' })).routes[0];
      line.clearLayers();
      if (!r) { c.say(t('Keine Route gefunden.', 'No route found.')); return; }
      line.addData(r.geometry);
      const km = (r.distance / 1000).toLocaleString(t('de-AT', 'en-GB'), { maximumFractionDigits: 1 });
      const min = Math.max(1, Math.round(r.duration / 60));
      c.result({ chips: [`${km} km`, `${min} min`, profile.label()] });
      c.say(t(`${km} km, etwa ${min} min (${profile.label()})`, `${km} km, about ${min} min (${profile.label()})`));
    } catch (e) { c.fail(e); }
  }
  function set(e) {
    if (a && b) { a = b = null; pins.clearLayers(); line.clearLayers(); c.result(null); }
    if (!a) { a = e.latlng; c.dot(a, '#1d7f4e').addTo(pins); c.say(t('Start gesetzt. Jetzt das Ziel antippen.', 'Start set. Now tap the destination.')); return; }
    b = e.latlng; c.dot(b, '#c8372d').addTo(pins); route();
  }
  map.on('click', set);
  c.centerButton(t('Kartenmitte als Punkt', 'Use map centre'), set);
  // Startzustand: eine Beispielroute durch Melk, danach neu antippen
  set({ latlng: L.latLng(48.2275, 15.3245) }); set({ latlng: L.latLng(48.2335, 15.3395) });
  c.hint(t('Neu: Start antippen, dann Ziel', 'New: tap start, then destination'));
};
