// Wetter: Temperatur oder Niederschlag als Rasterkacheln (/v1/weather/tiles), ein Regler wählt die Stunde. Geladen wird nur die gewählte Stunde.
window.mxDemo = (c) => {
  const { L, t, el } = c;
  const map = c.makeMap([47.6, 13.3], 7, 'streets');
  const layer = L.tileLayer('', { tileSize: 512, zoomOffset: -1, maxNativeZoom: 12, maxZoom: 21, opacity: 0.8, attribution: t('Wetter: GeoSphere Austria, CC BY 4.0', 'Weather: GeoSphere Austria, CC BY 4.0') }).addTo(map);
  const param = c.select(t('Größe', 'Variable'), [['temperature', t('Temperatur', 'Temperature')], ['precipitation', t('Niederschlag', 'Precipitation')]], 'temperature');
  const slider = el('input', { type: 'range', min: 0, max: 0, value: 0, step: 1 });
  const out = el('output', { textContent: '' });
  c.panel.append(el('label', { className: 'mx-demo-range' }, el('span', { textContent: t('Stunde', 'Hour') }), slider, out));
  const fmt = new Intl.DateTimeFormat(t('de-AT', 'en-GB'), { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Vienna' });
  let times = [], timer;
  function show() {
    const ts = times[Number(slider.value)]; if (!ts) return;
    const label = fmt.format(new Date(ts.replace(/Z$/, ':00Z')));
    out.textContent = label; slider.setAttribute('aria-valuetext', label);
    layer.setUrl(`${c.API}/weather/tiles/${param.value}/${ts}/{z}/{x}/{y}.png?access_token=${encodeURIComponent(c.TOKEN)}`);
    c.say(t(`${param.selectedOptions[0].text}, ${label} (Prognose, Ortszeit Wien)`, `${param.selectedOptions[0].text}, ${label} (forecast, Vienna time)`));
  }
  async function load() {
    try {
      times = (await c.api(`/weather/tiles/${param.value}.json`))['mapx:time'].times;
      slider.max = String(times.length - 1); if (Number(slider.value) > times.length - 1) slider.value = '0';
      show();
    } catch (e) { c.fail(e); }
  }
  slider.addEventListener('input', () => { out.textContent = fmt.format(new Date(times[Number(slider.value)].replace(/Z$/, ':00Z'))); clearTimeout(timer); timer = setTimeout(show, 300); }); // erst laden, wenn der Regler steht
  param.addEventListener('change', load);
  load();
};
