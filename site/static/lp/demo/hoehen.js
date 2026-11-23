// Höhen: Linie in den Hohen Tauern, /v1/elevation/profile liefert Höhen (BEV ALS-DTM 1 m) samt Koordinaten je Stützpunkt.
// Scharfes Canvas (devicePixelRatio, Containerbreite), Flächenprofil, Gipfel/Tal, Kennzahl-Chips; Scrubbing koppelt Profil und Karte.
window.mxDemo = (c) => {
  const { L, t, el } = c;
  const map = c.makeMap([47.077, 12.69], 13, 'outdoors', t('Übers Profil fahren oder Punkte antippen', 'Scrub the profile or tap points'));
  let pts = [[47.065, 12.67], [47.09, 12.71]];
  const line = L.polyline([], { color: '#2346d8', weight: 4 }).addTo(map);
  const hit = L.polyline([], { weight: 22, opacity: 0, interactive: true }).addTo(map); // breite unsichtbare Fangzone
  const cursor = L.circleMarker([0, 0], { radius: 7, color: '#fff', weight: 2, fillColor: '#e8890c', fillOpacity: 1, interactive: false });
  const wrap = c.below(el('div', { className: 'mx-prof' }));
  const canvas = el('canvas', { className: 'mx-demo-chart' });
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', t('Höhenprofil', 'Elevation profile'));
  wrap.append(canvas);
  c.button(t('Neue Linie', 'New line'), () => { pts = []; prof = null; c.result(null); cursor.remove(); load(); });
  c.centerButton(t('Kartenmitte als Punkt', 'Use map centre'), (e) => add(e));
  function add(e) { pts.push([e.latlng.lat, e.latlng.lng]); load(); }
  map.on('click', add);
  const nf = (v) => Math.round(v).toLocaleString(t('de-AT', 'en-GB'));
  const km = (m) => (m / 1000).toLocaleString(t('de-AT', 'en-GB'), { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let prof = null, at = -1; // prof: {p:[{d,h,ll}], dMax, lo, hi, iHi, iLo}
  const PAD = { l: 44, r: 10, t: 22, b: 20 };
  function size() {
    const dpr = Math.min(3, window.devicePixelRatio || 1), w = Math.max(240, wrap.clientWidth), h = w < 520 ? 140 : 170;
    canvas.style.height = h + 'px';
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    return { w, h, dpr };
  }
  function draw() {
    const { w, h, dpr } = size(), g = canvas.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    if (!prof) return;
    const { p, dMax, lo, hi, iHi, iLo } = prof, cs = getComputedStyle(canvas);
    let accent = cs.getPropertyValue('--mx-line').trim(); if (!/^#[0-9a-f]{6}$/i.test(accent)) accent = '#2346d8'; const fg = cs.color;
    const x = (d) => PAD.l + (d / dMax) * (w - PAD.l - PAD.r), y = (v) => h - PAD.b - ((v - lo) / (hi - lo || 1)) * (h - PAD.t - PAD.b);
    prof.x = x; prof.w = w;
    g.font = '11px Inter, system-ui, sans-serif'; g.fillStyle = fg; g.globalAlpha = 0.65;
    g.fillText(`${nf(hi)} m`, 2, PAD.t + 4); g.fillText(`${nf(lo)} m`, 2, h - PAD.b); g.textAlign = 'right'; g.fillText(`${km(dMax)} km`, w - PAD.r, h - 4); g.textAlign = 'left';
    g.globalAlpha = 0.18; g.fillRect(PAD.l, h - PAD.b, w - PAD.l - PAD.r, 1); g.globalAlpha = 1;
    const path = () => { g.beginPath(); p.forEach((q, i) => (i ? g.lineTo(x(q.d), y(q.h)) : g.moveTo(x(q.d), y(q.h)))); };
    path(); g.lineTo(x(dMax), h - PAD.b); g.lineTo(x(0), h - PAD.b); g.closePath();
    const grad = g.createLinearGradient(0, PAD.t, 0, h - PAD.b); grad.addColorStop(0, accent + '66'); grad.addColorStop(1, accent + '08');
    g.fillStyle = grad; g.fill();
    path(); g.strokeStyle = accent; g.lineWidth = 2; g.lineJoin = 'round'; g.stroke();
    // Gipfel und Tal
    const mark = (i, up) => {
      const X = x(p[i].d), Y = y(p[i].h); g.fillStyle = up ? '#c8372d' : '#1d7f4e'; g.beginPath();
      if (up) { g.moveTo(X, Y - 3); g.lineTo(X - 5, Y - 11); g.lineTo(X + 5, Y - 11); } else { g.moveTo(X, Y + 3); g.lineTo(X - 5, Y + 11); g.lineTo(X + 5, Y + 11); }
      g.fill(); g.fillStyle = fg; g.textAlign = X > w - 70 ? 'right' : X < PAD.l + 30 ? 'left' : 'center';
      if (up) g.fillText(`${nf(p[i].h)} m`, X, Y - 14);
      else { g.textAlign = X > w / 2 ? 'right' : 'left'; g.fillText(`${nf(p[i].h)} m`, X + (X > w / 2 ? -9 : 9), Math.min(Y + 4, h - PAD.b - 4)); }
      g.textAlign = 'left';
    };
    mark(iHi, true); if (iLo !== iHi) mark(iLo, false);
    // Scrub-Position
    if (at >= 0) {
      const q = p[at], X = x(q.d), Y = y(q.h);
      g.strokeStyle = fg; g.globalAlpha = 0.35; g.lineWidth = 1; g.beginPath(); g.moveTo(X, PAD.t - 6); g.lineTo(X, h - PAD.b); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = '#e8890c'; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(X, Y, 5, 0, Math.PI * 2); g.fill(); g.stroke();
      const s = `${nf(q.h)} m · ${km(q.d)} km`; g.font = '600 12px Inter, system-ui, sans-serif';
      const tw = g.measureText(s).width, bx = Math.min(Math.max(PAD.l, X - tw / 2 - 6), w - PAD.r - tw - 12);
      g.fillStyle = cs.getPropertyValue('--mx-ov').trim() || '#fff'; g.globalAlpha = 0.92; g.fillRect(bx, 2, tw + 12, 18); g.globalAlpha = 1;
      g.fillStyle = fg; g.fillText(s, bx + 6, 15);
    }
  }
  // Scrub auf Index setzen: Punkt auf Karte und Profil
  function scrub(i) {
    if (!prof) return;
    at = Math.max(0, Math.min(prof.p.length - 1, i));
    cursor.setLatLng(prof.p[at].ll); if (!map.hasLayer(cursor)) cursor.addTo(map);
    draw();
  }
  function fromX(clientX) {
    const r = canvas.getBoundingClientRect(), d = ((clientX - r.left - PAD.l) / (prof.w - PAD.l - PAD.r)) * prof.dMax;
    let best = 0; prof.p.forEach((q, i) => { if (Math.abs(q.d - d) < Math.abs(prof.p[best].d - d)) best = i; }); return best;
  }
  canvas.addEventListener('pointerdown', (e) => { if (!prof) return; c.endStart(); stopRun(); canvas.setPointerCapture(e.pointerId); scrub(fromX(e.clientX)); });
  canvas.addEventListener('pointermove', (e) => { if (!prof || (e.pointerType !== 'mouse' && !e.buttons)) return; stopRun(); scrub(fromX(e.clientX)); });
  canvas.style.touchAction = 'pan-y';
  // Karte → Profil: nächster Stützpunkt zur Maus/zum Finger auf der Linie
  const nearest = (ll) => { let best = 0, bd = Infinity; prof.p.forEach((q, i) => { const dd = map.distance(ll, q.ll); if (dd < bd) { bd = dd; best = i; } }); return best; };
  hit.on('mousemove', (e) => { if (prof) { stopRun(); scrub(nearest(e.latlng)); } });
  hit.on('click', (e) => { L.DomEvent.stopPropagation(e); if (prof) { c.endStart(); stopRun(); scrub(nearest(e.latlng)); } });
  if (window.ResizeObserver) new ResizeObserver(() => draw()).observe(wrap);

  let run = 0; const stopRun = () => { run++; };
  function ride() { // einmal die Linie abfahren (2 s)
    if (c.reduce || !prof) return;
    const id = ++run, t0 = performance.now(), n = prof.p.length;
    (function step(now) { if (id !== run) return; const k = Math.min(1, (now - t0) / 800); scrub(Math.round(k * (n - 1))); if (k < 1) requestAnimationFrame(step); })(t0);
  }

  let seq = 0;
  async function load() {
    line.setLatLngs(pts); hit.setLatLngs(pts); const n = ++seq;
    if (pts.length < 2) { prof = null; at = -1; draw(); c.say(t('Mindestens zwei Punkte antippen.', 'Tap at least two points.')); return; }
    try {
      const path = pts.map(([la, lo]) => `${lo.toFixed(5)},${la.toFixed(5)}`).join(';');
      const f = await c.api(`/elevation/profile?coordinates=${path}&samples=120`, { key: 'profile' });
      if (n !== seq) return;
      const { distances, elevations } = f.properties, co = f.geometry?.coordinates || [];
      const p = distances.map((d, i) => ({ d, h: elevations[i], ll: co[i] ? [co[i][1], co[i][0]] : null })).filter((q) => q.h != null && q.ll);
      if (p.length < 2) { prof = null; draw(); c.say(t('Für diese Linie gibt es keine Höhen.', 'No elevations for this line.')); return; }
      const hs = p.map((q) => q.h), lo = Math.min(...hs), hi = Math.max(...hs);
      let up = 0, down = 0, slope = 0;
      p.forEach((q, i) => { if (i) { const dh = q.h - p[i - 1].h; dh > 0 ? (up += dh) : (down -= dh); } });
      // max. Steigung über mindestens 200 m Strecke (glättet Rauschen zwischen Stützpunkten)
      for (let i = 0, j = 0; i < p.length; i++) { while (j < p.length && p[j].d - p[i].d < 200) j++; if (j < p.length) slope = Math.max(slope, Math.abs(p[j].h - p[i].h) / (p[j].d - p[i].d)); }
      prof = { p, dMax: p.at(-1).d, lo, hi, iHi: hs.indexOf(hi), iLo: hs.indexOf(lo) }; at = -1;
      line.setLatLngs(p.map((q) => q.ll)); hit.setLatLngs(p.map((q) => q.ll));
      draw();
      c.result({ chips: [`${nf(lo)}–${nf(hi)} m`, `↑ ${nf(up)} m`, `↓ ${nf(down)} m`, t(`max. ${Math.round(slope * 100)} % Steigung`, `max. ${Math.round(slope * 100)} % grade`)] });
      c.say(t(`${km(prof.dMax)} km, Höhe ${nf(lo)} bis ${nf(hi)} m, Aufstieg ${nf(up)} m, Abstieg ${nf(down)} m, maximale Steigung ${Math.round(slope * 100)} %`,
        `${km(prof.dMax)} km, elevation ${nf(lo)} to ${nf(hi)} m, ascent ${nf(up)} m, descent ${nf(down)} m, max. grade ${Math.round(slope * 100)} %`));
      ride();
    } catch (e) { c.fail(e); }
  }
  load();
};
