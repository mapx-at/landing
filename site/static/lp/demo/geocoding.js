// Geocoding: Vorschläge beim Tippen (/v1/searchbox/suggest), Lage nach der Auswahl (/v1/searchbox/retrieve). Ein Sitzungs-Token je Suche.
// Antwort: GeoJSON-FeatureCollection, je Treffer `id` und `properties.name` / `properties.place_formatted`.
window.mxDemo = (c) => {
  const { L, t, el } = c;
  const map = c.makeMap([48.2272, 15.3326], 15, 'streets') // Melk, die Startsuche zeigt dorthin;
  const input = el('input', { type: 'search', placeholder: t('z. B. Hauptplatz Melk', 'e.g. Hauptplatz Melk'), autocomplete: 'off' });
  input.setAttribute('aria-label', t('Adresse oder Ort suchen', 'Search for an address or place'));
  const list = el('ul', { className: 'mx-demo-list' });
  c.panel.append(el('div', { className: 'mx-demo-search' }, input, list));
  let marker, session = crypto.randomUUID(), seq = 0;
  input.addEventListener('input', c.debounce(suggest, 300)); // nicht bei jedem Tastendruck
  async function suggest() {
    const q = input.value.trim(), n = ++seq;
    if (q.length < 3) { list.replaceChildren(); return; }
    const m = map.getCenter();
    try {
      const { features } = await c.api(`/searchbox/suggest?q=${encodeURIComponent(q)}&session_token=${session}&proximity=${m.lng.toFixed(4)},${m.lat.toFixed(4)}&limit=5`, { key: 'suggest' });
      const suggestions = features.map((f) => ({ id: f.id, name: f.properties.name, place_formatted: f.properties.place_formatted }));
      if (n !== seq) return;
      list.replaceChildren(...suggestions.map((s) => {
        const b = el('button', { type: 'button' }, el('strong', { textContent: s.name }), ' ', el('span', { textContent: s.place_formatted || '' }));
        b.addEventListener('click', () => pick(s));
        return el('li', {}, b);
      }));
      c.say(suggestions.length ? '' : t('Keine Vorschläge', 'No suggestions')); // die Liste selbst ist die Rückmeldung
      if (suggestions.length) c.result(null);
    } catch (e) { c.fail(e); }
  }
  async function pick(s) {
    try {
      const f = (await c.api(`/searchbox/retrieve/${encodeURIComponent(s.id)}?session_token=${session}`)).features[0];
      const [lng, lat] = f.geometry.coordinates;
      marker?.remove();
      marker = c.dot([lat, lng], '#2346d8').addTo(map).bindTooltip(c.text(s.name), { permanent: true, direction: 'top', offset: [0, -8] });
      const z = Math.min((f.properties.zoom ?? 15) + 1, 18), far = map.distance(map.getCenter(), [lat, lng]) > 20000;
      if (far || c.reduce) map.setView([lat, lng], z, { animate: false }); else map.flyTo([lat, lng], z, { duration: 0.6 });
      input.blur(); // schließt die Bildschirmtastatur
      list.replaceChildren(); input.value = s.name;
      c.result({ title: s.name, rows: [[t('Ort', 'Place'), s.place_formatted || '–'], [t('Koordinaten', 'Coordinates'), `lng ${lng.toFixed(5)} · lat ${lat.toFixed(5)}`]] });
      c.say('');
    } catch (e) { c.fail(e); }
    session = crypto.randomUUID(); // die Sitzung endet mit retrieve
  }
  // Startzustand: Beispielsuche schon ausgeführt, Vorschläge sichtbar
  input.value = t('Hauptplatz Melk', 'Hauptplatz Melk'); suggest();
};
