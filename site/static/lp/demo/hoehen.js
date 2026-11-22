// Höhen: Punkte antippen ergibt eine Linie, /v1/elevation/profile liefert die Höhen dazu (BEV ALS-DTM 1 m).
window.mxDemo = (c) => {
  const { L, t, el } = c;
  const map = c.makeMap([47.077, 12.69], 13, 'outdoors'); // Großglockner-Gebiet
  let pts = [[47.065, 12.67], [47.09, 12.71]];
  const line = L.polyline([], { color: '#2346d8', weight: 4 }).addTo(map);
  const canvas = el('canvas', { className: 'mx-demo-chart', width: 720, height: 160 });
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', t('Höhenprofil', 'Elevation profile'));
  c.below(canvas);
  c.button(t('Neue Linie', 'New line'), () => { pts = []; c.result(null); draw(); });
  c.centerButton(t('Kartenmitte als Punkt', 'Use map centre'), (e) => add(e));
  function add(e) { pts.push([e.latlng.lat, e.latlng.lng]); draw(); }
  map.on('click', add);
  let seq = 0;
  async function draw() {
    line.setLatLngs(pts);
    const g = canvas.getContext('2d'), W = canvas.width, H = canvas.height, n = ++seq;
    g.clearRect(0, 0, W, H);
    if (pts.length < 2) { c.say(t('Mindestens zwei Punkte antippen.', 'Tap at least two points.')); return; }
    try {
      const path = pts.map(([la, lo]) => `${lo.toFixed(5)},${la.toFixed(5)}`).join(';');
      const { distances, elevations } = (await c.api(`/elevation/profile?coordinates=${path}&samples=120`, { key: 'profile' })).properties;
      if (n !== seq) return;
      const p = distances.map((d, i) => ({ d, h: elevations[i] })).filter((q) => q.h != null);
      if (p.length < 2) { c.say(t('Für diese Linie gibt es keine Höhen.', 'No elevations for this line.')); return; }
      const dMax = p.at(-1).d, hs = p.map((q) => q.h), lo = Math.min(...hs), hi = Math.max(...hs);
      const x = (d) => 56 + (d / dMax) * (W - 66), y = (h) => H - 22 - ((h - lo) / (hi - lo || 1)) * (H - 38);
      const cs = getComputedStyle(canvas);
      g.beginPath(); p.forEach((q, i) => (i ? g.lineTo(x(q.d), y(q.h)) : g.moveTo(x(q.d), y(q.h))));
      g.strokeStyle = cs.getPropertyValue('--mx-line').trim() || '#2346d8'; g.lineWidth = 2; g.stroke();
      g.fillStyle = cs.color; g.font = '12px Inter, sans-serif';
      g.fillText(`${Math.round(hi)} m`, 4, 18); g.fillText(`${Math.round(lo)} m`, 4, H - 24); g.fillText(`${(dMax / 1000).toFixed(2)} km`, W - 64, H - 4);
      let up = 0, down = 0; p.forEach((q, i) => { if (i) { const dh = q.h - p[i - 1].h; dh > 0 ? (up += dh) : (down -= dh); } });
      c.result({ chips: [`${(dMax / 1000).toFixed(2)} km`, `↑ ${Math.round(up)} m`, `↓ ${Math.round(down)} m`, t(`höchster Punkt ${Math.round(hi)} m`, `highest point ${Math.round(hi)} m`)] });
      c.say(t(`${(dMax / 1000).toFixed(2)} km, Aufstieg ${Math.round(up)} m, Abstieg ${Math.round(down)} m, höchster Punkt ${Math.round(hi)} m`, `${(dMax / 1000).toFixed(2)} km, ascent ${Math.round(up)} m, descent ${Math.round(down)} m, highest point ${Math.round(hi)} m`));
    } catch (e) { c.fail(e); }
  }
  draw();
};
