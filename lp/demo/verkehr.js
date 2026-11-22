// Verkehr: die aktiven Meldungen im Kartenausschnitt (/v1/traffic/incidents), Sperren rot; neu geladen erst nach dem Verschieben.
window.mxDemo = (c) => {
  const { L, t, el } = c;
  const map = c.makeMap([48.15, 16.3], 11, 'streets'); // Wien und Umgebung
  map.attributionControl.addAttribution('ASFINAG / EVIS.AT (CC BY 4.0)');
  const list = el('ul', { className: 'mx-demo-list mx-demo-inc' });
  c.stage.after(list);
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
  const show = (f) => { c.say(f.properties.text || kindText(f.properties.kind)); };
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
        const p = f.properties, bt = el('button', { type: 'button' }, el('strong', { textContent: kindText(p.kind) || p.type }), ' ', el('span', { textContent: (p.text || '').slice(0, 140) + ((p.text || '').length > 140 ? ' …' : '') }));
        bt.addEventListener('click', () => show(f));
        return el('li', {}, bt);
      }));
      const nn = fc.features.length >= 50 ? t('Mindestens 50', 'At least 50') : fc.features.length;
      c.say(t(`${nn} aktive Meldung(en) im Ausschnitt${fc.features.length > 6 ? ', die ersten sechs unten' : ''}. Verschieben lädt neu.`, `${nn} active report(s) in view${fc.features.length > 6 ? ', the first six below' : ''}. Panning reloads.`));
    } catch (e) { c.fail(e); }
  }
  map.on('moveend', () => { clearTimeout(timer); timer = setTimeout(load, 400); });
  load();
};
