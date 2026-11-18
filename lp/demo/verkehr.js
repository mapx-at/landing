// Verkehr: die aktiven Meldungen im Kartenausschnitt (/v1/traffic/incidents), Sperren rot; neu geladen erst nach dem Verschieben.
window.mxDemo = (c) => {
  const { L, t, el } = c;
  const map = c.makeMap([48.15, 16.3], 11, 'streets'); // Wien und Umgebung
  map.attributionControl.addAttribution(t('Verkehr: ASFINAG / EVIS.AT, CC BY 4.0', 'Traffic: ASFINAG / EVIS.AT, CC BY 4.0'));
  const list = el('ul', { className: 'mx-demo-list mx-demo-inc' });
  c.stage.after(list);
  const show = (f) => { c.say(f.properties.text || f.properties.kind || ''); };
  const layer = L.geoJSON(null, {
    style: (f) => ({ color: f.properties.closed ? '#c8372d' : '#e8890c', weight: 6, opacity: 0.85, lineCap: 'round' }),
    pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 7, color: '#fff', weight: 2, fillColor: f.properties.closed ? '#c8372d' : '#e8890c', fillOpacity: 1 }),
    onEachFeature: (f, l) => l.on('click', () => show(f)),
  }).addTo(map);
  let timer, seq = 0;
  async function load() {
    const b = map.getBounds(), n = ++seq;
    try {
      const fc = await c.api(`/traffic/incidents?bbox=${[b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((v) => v.toFixed(4)).join(',')}&active=true&limit=50`);
      if (n !== seq) return;
      layer.clearLayers().addData(fc);
      list.replaceChildren(...fc.features.slice(0, 6).map((f) => {
        const p = f.properties, bt = el('button', { type: 'button' }, el('strong', { textContent: p.category || p.kind || p.type }), ' ', el('span', { textContent: (p.text || '').slice(0, 140) + ((p.text || '').length > 140 ? ' …' : '') }));
        bt.addEventListener('click', () => show(f));
        return el('li', {}, bt);
      }));
      const nn = fc.features.length >= 50 ? t('mindestens 50', 'at least 50') : fc.features.length;
      c.say(t(`${nn} aktive Meldung(en) im Ausschnitt${fc.features.length > 6 ? ', die ersten sechs unten' : ''}. Verschieben lädt neu.`, `${nn} active report(s) in view${fc.features.length > 6 ? ', the first six below' : ''}. Panning reloads.`));
    } catch (e) { c.fail(e); }
  }
  map.on('moveend', () => { clearTimeout(timer); timer = setTimeout(load, 400); });
  load();
};
