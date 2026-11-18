// Geocoding: Vorschläge beim Tippen (/v1/searchbox/suggest), Lage nach der Auswahl (/v1/searchbox/retrieve). Ein Sitzungs-Token je Suche.
window.mxDemo = (c) => {
  const { L, t, el } = c;
  const map = c.makeMap([47.6, 14.3], 7, 'streets');
  const input = el('input', { type: 'search', placeholder: t('z. B. Hauptplatz Melk', 'e.g. Hauptplatz Melk'), autocomplete: 'off' });
  input.setAttribute('aria-label', t('Adresse oder Ort suchen', 'Search for an address or place'));
  const list = el('ul', { className: 'mx-demo-list' });
  c.panel.append(el('div', { className: 'mx-demo-search' }, input, list));
  let marker, session = crypto.randomUUID(), timer, seq = 0;
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(suggest, 250); }); // nicht bei jedem Tastendruck
  async function suggest() {
    const q = input.value.trim(), n = ++seq;
    if (q.length < 3) { list.replaceChildren(); return; }
    const m = map.getCenter();
    try {
      const { suggestions } = await c.api(`/searchbox/suggest?q=${encodeURIComponent(q)}&session_token=${session}&proximity=${m.lng.toFixed(4)},${m.lat.toFixed(4)}&limit=5&language=${t('de', 'en')}`);
      if (n !== seq) return;
      list.replaceChildren(...suggestions.map((s) => {
        const b = el('button', { type: 'button' }, el('strong', { textContent: s.name }), ' ', el('span', { textContent: s.place_formatted || '' }));
        b.addEventListener('click', () => pick(s));
        return el('li', {}, b);
      }));
      c.say(suggestions.length ? t(`${suggestions.length} Vorschläge`, `${suggestions.length} suggestions`) : t('Keine Vorschläge', 'No suggestions'));
    } catch (e) { c.fail(e); }
  }
  async function pick(s) {
    try {
      const f = (await c.api(`/searchbox/retrieve/${encodeURIComponent(s.mapbox_id)}?session_token=${session}`)).features[0];
      const [lng, lat] = f.geometry.coordinates;
      marker?.remove();
      marker = c.dot([lat, lng], '#2346d8').addTo(map).bindTooltip(c.text(s.name), { permanent: true, direction: 'top', offset: [0, -8] });
      map.setView([lat, lng], Math.min((f.properties.zoom ?? 15) + 1, 18), { animate: !c.reduce });
      list.replaceChildren(); input.value = s.name;
      c.say(`${s.name}${s.place_formatted ? ', ' + s.place_formatted : ''} (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
    } catch (e) { c.fail(e); }
    session = crypto.randomUUID(); // die Sitzung endet mit retrieve
  }
  c.say(t('Gib mindestens drei Zeichen ein.', 'Type at least three characters.'));
  input.focus({ preventScroll: true });
};
