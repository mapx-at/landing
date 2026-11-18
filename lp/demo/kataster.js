// Kataster: ein Klick aufs Luftbild fragt /v1/parcel nach dem Grundstück an dieser Stelle (Umriss, Nummer, Fläche).
window.mxDemo = (c) => {
  const { L, t } = c;
  const map = c.makeMap([48.2275, 15.3306], 18, 'satellite'); // Melk
  const parcel = L.geoJSON(null, { style: { color: '#ffd400', weight: 3, fillOpacity: 0.15 } }).addTo(map);
  let seq = 0;
  async function query(e) {
    const n = ++seq, { lng, lat } = e.latlng;
    c.say(t('Frage das Grundstück ab …', 'Looking up the parcel …'));
    try {
      const f = (await c.api(`/parcel/${lng.toFixed(6)},${lat.toFixed(6)}`)).features[0];
      if (n !== seq) return;
      parcel.clearLayers();
      if (!f) { c.say(t('An dieser Stelle liegt kein Grundstück.', 'No parcel at this point.')); return; }
      parcel.addData(f);
      const p = f.properties, area = Math.round(p.area_m2).toLocaleString(t('de-AT', 'en-GB'));
      c.say(t(`Grundstück ${p.parcel_number}, Katastralgemeinde ${p.cadastral_municipality_id}, ${area} m²`, `Parcel ${p.parcel_number}, cadastral municipality ${p.cadastral_municipality_id}, ${area} m²`));
    } catch (err) { if (n === seq) c.fail(err); }
  }
  map.on('click', query);
  c.centerButton(t('Kartenmitte abfragen', 'Look up map centre'), query);
  c.say(t('Tipp oder klick auf ein Grundstück im Luftbild.', 'Tap or click a parcel in the aerial image.'));
};
