// Routing: Start und Ziel antippen, /v1/directions liefert die Route als GeoJSON-Linie samt Länge und Dauer.
window.mxDemo = (c) => {
  const { L, t } = c;
  const map = c.makeMap([48.23, 15.33], 14, 'streets'); // Melk
  const line = L.geoJSON(null, { style: { color: '#2346d8', weight: 5, opacity: 0.9 } }).addTo(map);
  const pins = L.layerGroup().addTo(map);
  const profile = c.select(t('Profil', 'Profile'), [['driving', t('Auto', 'Car')], ['cycling', t('Rad', 'Bike')], ['walking', t('Zu Fuß', 'Walking')]], 'driving');
  let a = null, b = null;
  async function route() {
    if (!a || !b) return;
    c.say(t('Berechne die Route …', 'Calculating the route …'));
    try {
      const r = (await c.api(`/directions/${profile.value}/${a.lng.toFixed(5)},${a.lat.toFixed(5)};${b.lng.toFixed(5)},${b.lat.toFixed(5)}?geometries=geojson&overview=full&steps=false`)).routes[0];
      line.clearLayers();
      if (!r) { c.say(t('Keine Route gefunden.', 'No route found.')); return; }
      line.addData(r.geometry);
      const km = (r.distance / 1000).toLocaleString(t('de-AT', 'en-GB'), { maximumFractionDigits: 1 });
      c.say(t(`${km} km, etwa ${Math.max(1, Math.round(r.duration / 60))} min (${profile.selectedOptions[0].text})`, `${km} km, about ${Math.max(1, Math.round(r.duration / 60))} min (${profile.selectedOptions[0].text})`));
    } catch (e) { c.fail(e); }
  }
  function set(e) {
    if (a && b) { a = b = null; pins.clearLayers(); line.clearLayers(); }
    if (!a) { a = e.latlng; c.dot(a, '#1d7f4e').addTo(pins); c.say(t('Start gesetzt. Jetzt das Ziel antippen.', 'Start set. Now tap the destination.')); return; }
    b = e.latlng; c.dot(b, '#c8372d').addTo(pins); route();
  }
  map.on('click', set);
  profile.addEventListener('change', route);
  c.centerButton(t('Kartenmitte als Punkt', 'Use map centre'), set);
  // Startzustand: eine Beispielroute durch Melk, danach neu antippen
  set({ latlng: L.latLng(48.2275, 15.3245) }); set({ latlng: L.latLng(48.2335, 15.3395) });
  c.stage.querySelector('.mx-demo-hint').textContent = t('Neu: Start antippen, dann Ziel', 'New: tap start, then destination');
};
