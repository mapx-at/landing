// Vorschaubilder der Produktbeispiele neu erzeugen (site/static/lp/img/demo/<id>.webp, 1200 x 600). Jedes Bild zeigt das
// ERGEBNIS des Produkts: echte MapLibre-Karte der API-Stile plus echte Antworten der API (Suchtreffer, Route, Profil,
// Abfahrten, Meldungen, Wetter) als Ebenen und Schildchen. Läuft unter der Herkunft https://mapx.at, damit der öffentliche
// Demo-Token aus hugo.toml gilt. Zeitabhängiges (Abfahrten, Meldungen, Wetter) ist der Stand beim Rendern.
// Aufruf (Repo-Wurzel): web-browse run site/tools/demo-shots.mjs   [nur einzelne: DEMO_ONLY=karten,oev]
//
// Anordnung: Startseite am Handy zeigt nur den mittleren Streifen (x 200–600 von 800), auf den Themenseiten liegt mittig
// der Start-Knopf (etwa y 170–230). Schildchen daher waagrecht mittig, oben oder unten, nicht in der Bildmitte.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = /demoToken\s*=\s*"([^"]+)"/.exec(readFileSync(join(SITE, 'hugo.toml'), 'utf8'))[1];

// Je Bild: maps = Karten (Stil, Mitte [lon, lat], Zoom, optional clip), run = Code in der Seite (Datenabruf + Overlay).
// In run stehen zur Verfügung: c.map (erste Karte), c.maps, c.api(pfad) (JSON von api.mapx.at/v1), c.add(html),
// c.pin(lnglat, art), c.line, c.label, c.ring, c.num(zahl, stellen), c.TOKEN, c.note(text) (für den Bericht).
const items = [
  {
    id: 'karten',
    // derselbe Ausschnitt in vier Stilen, schräg in Streifen geteilt
    maps: ['streets', 'outdoors', 'satellite', 'streets-night'].map((style, i) => ({ style, center: [11.395, 47.268], zoom: 13.2,
      clip: `polygon(${[i * 200 - 60 - (i === 0 ? 400 : 0), (i + 1) * 200 - 60 + (i === 3 ? 400 : 0), (i + 1) * 200 + 60 + (i === 3 ? 400 : 0), i * 200 + 60 - (i === 0 ? 400 : 0)].map((x, k) => `${x}px ${k < 2 ? 400 : 0}px`).join(',')})` })),
    run: async (c) => {
      const names = ['streets', 'outdoors', 'satellite', 'streets-night'];
      await c.hideNear([], 0, [[[0, 310], [800, 400]]]);
      c.add(`<div class="seams"><svg width="800" height="400">${[1, 2, 3].map((i) => `<line x1="${i * 200 - 60}" y1="400" x2="${i * 200 + 60}" y2="0" stroke="#fff" stroke-width="3"/>`).join('')}</svg></div>`);
      c.add(names.map((n, i) => `<div class="chip ${i === 2 || i === 3 ? 'dark' : ''}" style="left:${i * 200 + 78}px;top:326px;transform:translateX(-50%)">${n}</div>`).join(''));
    },
  },
  {
    id: 'geocoding',
    maps: [{ style: 'streets', center: [14.2858, 48.3059], zoom: 16.4 }],
    run: async (c) => {
      const q = 'Hauptplatz 1, Li', s = 'shots' + Date.now();
      const { suggestions } = await c.api(`/searchbox/suggest?q=${encodeURIComponent(q)}&session_token=${s}&proximity=14.2858,48.3059&limit=3&language=de`);
      const hit = (await c.api(`/searchbox/retrieve/${encodeURIComponent(suggestions[0].mapbox_id)}?session_token=${s}`)).features[0];
      const ll = hit.geometry.coordinates;
      c.map.jumpTo({ center: ll, zoom: 16.6, padding: { top: 170, bottom: 0 } });
      c.pin(ll, 'pin');
      c.note(`suggest „${q}“: ${suggestions.map((x) => x.name + ', ' + x.place_formatted).join(' | ')}; Treffer ${ll.map((v) => v.toFixed(5))}`);
      c.add(`<div class="card search" style="left:50%;top:22px;transform:translateX(-50%);width:420px">
        <div class="q"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.6" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg><span>${q}</span><i></i></div>
        ${suggestions.slice(0, 2).map((x, i) => `<div class="sg ${i ? '' : 'on'}"><b>${x.name}</b> <span>${x.place_formatted}</span></div>`).join('')}
      </div>`);
    },
  },
  {
    id: 'routing',
    maps: [{ style: 'streets', center: [15.48, 48.215], zoom: 10.6 }],
    run: async (c) => {
      const a = [15.3317, 48.2276], b = [15.6246, 48.2083]; // Stift Melk -> St. Pölten Hbf
      const r = (await c.api(`/directions/driving/${a.join(',')};${b.join(',')}?geometries=geojson&overview=full&steps=false`)).routes[0];
      c.line(r.geometry, '#0a64e8', 7);
      c.map.fitBounds(c.bbox(r.geometry.coordinates), { padding: { top: 110, bottom: 120, left: 110, right: 110 }, duration: 0 });
      c.pin(a, 'start'); c.pin(b, 'pin');
      // eigene Ortsschilder; gleichnamige Kartenbeschriftungen unter den Schildern ausblenden
      await c.hideNear([a, b], 60, [[[230, 330], [570, 400]]]);
      c.label(a, 'Melk', 'up'); c.label(b, 'St. Pölten', 'upPin');
      const km = c.num(r.distance / 1000, 1), min = Math.round(r.duration / 60);
      c.note(`directions/driving Stift Melk -> St. Pölten Hbf: ${km} km, ${min} min`);
      c.add(`<div class="card big" style="left:50%;bottom:26px;transform:translateX(-50%)">${c.icon('car')}<b>${min} min</b><span class="sep"></span><span>${km} km</span></div>`);
    },
  },
  {
    id: 'hoehen',
    maps: [{ style: 'outdoors', center: [12.80, 47.06], zoom: 11.5 }],
    run: async (c) => {
      // echte Strecke aus der Routing-API: Großglockner-Hochalpenstraße, Heiligenblut -> Kaiser-Franz-Josefs-Höhe (Gletscherstraße).
      // Nicht über das Hochtor: dort führt die Straße durch einen Tunnel, das Geländemodell liefert darüber den Berg statt der Straße.
      const a = [12.8420, 47.0420], b = [12.7517, 47.0757];
      const r = (await c.api(`/directions/driving/${a.join(',')};${b.join(',')}?geometries=geojson&overview=full&steps=false`)).routes[0];
      const g = r.geometry.coordinates, step = Math.ceil(g.length / 150);
      const pts = g.filter((_, i) => i % step === 0 || i === g.length - 1).map((q) => q.map((v) => +v.toFixed(5)));
      const p = await c.api(`/elevation/profile?coordinates=${pts.map((q) => q.join(',')).join(';')}&samples=160`);
      const { distances: d, elevations: e } = p.properties;
      c.line(r.geometry, '#0a64e8', 6);
      c.map.fitBounds(c.bbox(g), { padding: { top: 40, bottom: 175, left: 250, right: 250 }, duration: 0 });
      const end = g[g.length - 1];
      c.pin(g[0], 'start'); c.pin(end, 'pin');
      await c.hideNear([g[0], end], 80, [[[170, 245], [630, 400]]]);
      c.label(g[0], 'Heiligenblut', 'left'); c.label(end, 'Franz-Josefs-Höhe', 'left');
      let up = 0, im = 0; e.forEach((h, i) => { if (i && h > e[i - 1]) up += h - e[i - 1]; if (h > e[im]) im = i; });
      const W = 440, H = 74, lo = Math.min(...e), hi = Math.max(...e), X = (v) => (v / d[d.length - 1]) * W, Y = (h) => H - ((h - lo) / (hi - lo)) * (H - 10);
      const path = e.map((h, i) => `${i ? 'L' : 'M'}${X(d[i]).toFixed(1)},${Y(h).toFixed(1)}`).join('');
      c.note(`directions/driving Heiligenblut -> Kaiser-Franz-Josefs-Höhe: ${c.num(r.distance / 1000, 1)} km, ${Math.round(r.duration / 60)} min; elevation/profile ${pts.length} Punkte: ${c.num(d[d.length - 1] / 1000, 1)} km, ${Math.round(lo)} -> ${Math.round(hi)} m, auf ${Math.round(up)} m`);
      c.add(`<div class="card prof" style="left:50%;bottom:12px;transform:translateX(-50%)">
        <div class="ph"><b>▲ ${c.num(Math.round(hi), 0)} m</b><span>↑ ${c.num(Math.round(up), 0)} m</span><span>${c.num(r.distance / 1000, 1)} km</span></div>
        <svg width="${W}" height="${H}" style="overflow:visible"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a64e8" stop-opacity=".40"/><stop offset="1" stop-color="#0a64e8" stop-opacity=".04"/></linearGradient></defs>
        <path d="${path}L${W},${H}L0,${H}Z" fill="url(#g)"/><path d="${path}" fill="none" stroke="#0a64e8" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="${X(d[im])}" cy="${Y(e[im])}" r="5.5" fill="#fff" stroke="#0a64e8" stroke-width="3"/></svg></div>`);
    },
  },
  {
    id: 'oev',
    maps: [{ style: 'streets', center: [13.0451, 47.8131], zoom: 15.6 }],
    run: async (c) => {
      const stop = (await c.api(`/stops?near=13.0457,47.8130&radius=300&limit=1`)).stops[0];
      const { departures } = await c.api(`/departures?stop=${encodeURIComponent(stop.id)}&limit=40`);
      // je Linie nur einmal
      const seen = new Set(), rows = [];
      const rail = departures.find((x) => x.line.mode === 'rail'); if (rail) { seen.add(rail.line.short_name); rows.push(rail); }
      for (const x of departures) { const k = x.line.short_name || x.line.name; if (!seen.has(k)) { seen.add(k); rows.push(x); } if (rows.length === 3) break; }
      rows.sort((x, y) => Date.parse(x.scheduled) - Date.parse(y.scheduled));
      c.map.jumpTo({ center: stop.location, zoom: 15.8, padding: { top: 215, bottom: 0 } });
      c.pin(stop.location, 'stop');
      await c.hideNear([stop.location], 34, [[[180, 10], [620, 215]]]);
      const hm = (t) => new Intl.DateTimeFormat('de-AT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Vienna' }).format(new Date(t));
      c.note(`stops near Salzburg Hbf -> ${stop.name} (${stop.id}); departures: ${rows.map((x) => `${hm(x.scheduled)} ${x.line.short_name} ${x.headsign}`).join(' | ')} (Soll-Fahrplan)`);
      c.add(`<div class="card dark board" style="left:50%;top:18px;transform:translateX(-50%)">
        <div class="bh">${c.icon('stop')}<b>${stop.name}</b></div>
        ${rows.map((x) => `<div class="br"><span class="t">${hm(x.scheduled)}</span><span class="ln ${x.line.mode}">${x.line.short_name || x.line.name}</span><span class="hs">${x.headsign.split(' via ')[0]}</span><span class="pl">${x.platform || ''}</span></div>`).join('')}
      </div>`);
    },
  },
  {
    id: 'verkehr',
    maps: [{ style: 'traffic-day', center: [16.352, 48.2], zoom: 12.6 }],
    run: async (c) => {
      const b = c.map.getBounds();
      const fc = await c.api(`/traffic/incidents?bbox=${[b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((v) => v.toFixed(4)).join(',')}&active=true&limit=50`);
      fc.features.forEach((f) => { f.properties.col = f.properties.closed ? '#d92d20' : '#f08c00'; });
      c.map.addSource('inc', { type: 'geojson', data: fc });
      c.map.addLayer({ id: 'inc-c', type: 'line', source: 'inc', paint: { 'line-color': '#fff', 'line-width': 11, 'line-opacity': 0.9 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
      c.map.addLayer({ id: 'inc', type: 'line', source: 'inc', paint: { 'line-color': ['get', 'col'], 'line-width': 7 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
      c.map.addLayer({ id: 'inc-p', type: 'circle', source: 'inc', filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-radius': 8, 'circle-color': ['get', 'col'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 3 } });
      // Schild: eine echte Sperre nahe der Bildmitte
      const mid = (f) => { const g = f.geometry, cs = g.type === 'Point' ? [g.coordinates] : g.type === 'LineString' ? g.coordinates : g.coordinates.flat(); return cs[Math.floor(cs.length / 2)]; };
      const ctr = c.map.getCenter(), dist = (q) => Math.hypot(q[0] - ctr.lng, (q[1] - ctr.lat) * 1.5);
      const pick = fc.features.filter((f) => f.properties.closed && /\S/.test(f.properties.text || '')).sort((x, y) => dist(mid(x)) - dist(mid(y)))[0];
      const street = pick.properties.text.split(/:| von | zwischen | bei /)[0].trim();
      c.ring(mid(pick)); c.map.jumpTo({ center: mid(pick), padding: { bottom: 130, top: 0 } });
      await c.hideNear([], 0, [[[150, 300], [650, 400]]]);
      const nC = fc.features.filter((f) => f.properties.closed).length, nO = fc.features.length - nC;
      c.note(`traffic/incidents im Ausschnitt: ${fc.features.length} (${nC} Sperren, ${nO} sonstige); Schild: ${pick.properties.category}: ${street}`);
      c.add(`<div class="card big" style="left:50%;bottom:26px;transform:translateX(-50%)">${c.icon('closed')}<span><b>${street}</b><small>${pick.properties.category}</small></span></div>`);
    },
  },
  {
    id: 'statisch',
    maps: [],
    run: async (c) => {
      const a = [15.3317, 48.2276]; // Stift Melk
      const r = (await c.api(`/directions/walking/15.3285,48.2322;${a.join(',')}?geometries=geojson&overview=full&steps=false`)).routes[0];
      const cs = r.geometry.coordinates.filter((_, i, l) => i % Math.ceil(l.length / 60) === 0 || i === l.length - 1).map((q) => q.map((v) => +v.toFixed(5)));
      const gj = { type: 'Feature', geometry: { type: 'LineString', coordinates: cs }, properties: { stroke: '#0a64e8', 'stroke-width': 5 } };
      const path = `/v1/static/streets/${encodeURIComponent(`geojson(${JSON.stringify(gj)}),pin-l+0a64e8(${a.join(',')})`)}/auto/600x300@2x.webp`;
      const res = await fetch('https://api.mapx.at' + path, { headers: { Authorization: 'Bearer ' + c.TOKEN } });
      if (!res.ok) throw new Error('static: HTTP ' + res.status);
      const blob = await res.blob();
      c.note(`/v1/static/streets/geojson(Fußweg Bahnhof -> Stift Melk, ${cs.length} Punkte),pin-l/auto/600x300@2x.webp: ${Math.round(blob.size / 1024)} KB`);
      document.body.classList.add('desk');
      c.add(`<div class="photo"><img src="${URL.createObjectURL(blob)}"><div class="tag">600×300@2x.webp</div></div>
        <div class="url"><span>GET</span> /v1/static/streets/pin-l…/auto/600x300@2x.webp</div>`);
      await document.querySelector('.photo img').decode();
    },
  },
  {
    id: 'wetter',
    maps: [{ style: 'light', center: [13.33, 47.62], zoom: 6.15 }],
    run: async (c) => {
      const tj = await c.api('/weather/tiles/temperature.json');
      const times = tj['mapx:time'].times, now = Date.now(), T = (t) => Date.parse(t.replace(/Z$/, ':00Z'));
      const ts = times.reduce((best, t) => Math.abs(T(t) - now) < Math.abs(T(best) - now) ? t : best, times[0]);
      c.map.addSource('wx', { type: 'raster', tileSize: 512, maxzoom: 12, tiles: [`https://api.mapx.at/v1/weather/tiles/temperature/${ts}/{z}/{x}/{y}.png?access_token=${encodeURIComponent(c.TOKEN)}`] });
      const first = c.map.getStyle().layers.find((l) => l.type === 'symbol' || /boundary|admin/.test(l.id))?.id;
      c.map.addLayer({ id: 'wx', type: 'raster', source: 'wx', paint: { 'raster-opacity': 0.85, 'raster-resampling': 'linear' } }, first);
      const st = [];
      for (const [name, lon, lat] of [['Wien', 16.3738, 48.2082], ['Innsbruck', 11.3933, 47.2692]]) {
        const f = (await c.api(`/weather/current?lng=${lon}&lat=${lat}&limit=1`)).features[0];
        st.push(`${name} ${f.properties.temperature_c} °C (${f.properties.name}, ${f.properties.time})`);
        await c.hideNear([f.geometry.coordinates], 36, [[[180, 310], [620, 400]]]);
        c.label(f.geometry.coordinates, `${name} <b>${c.num(f.properties.temperature_c, 1)} °C</b>`, 'up', true);
      }
      const L = tj['mapx:legend'].stops.filter((s) => s.value >= -15 && s.value <= 30), lo = L[0].value, hi = L[L.length - 1].value;
      const grad = L.map((s) => `${s.color.replace(/,\s*0?\.\d+\)$/, ',1)')} ${((s.value - lo) / (hi - lo) * 100).toFixed(1)}%`).join(',');
      const fmt = new Intl.DateTimeFormat('de-AT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Vienna' }).format(new Date(T(ts)));
      c.note(`weather/tiles/temperature/${ts} (${fmt} Ortszeit); weather/current: ${st.join(' | ')}`);
      c.add(`<div class="card legend" style="left:50%;bottom:22px;transform:translateX(-50%)"><div class="bar" style="background:linear-gradient(90deg,${grad})"></div>
        <div class="ticks">${[-15, -5, 0, 5, 10, 20, 30].map((v) => `<span style="left:${(v - lo) / (hi - lo) * 100}%">${v < 0 ? '−' + -v : v}</span>`).join('')}<em>°C</em></div></div>`);
    },
  },
];
// Ergebnisbild des Code-Beispiels der Startseite (Abschnitt Entwickler): genau der Stil und Ausschnitt aus dem Code
items.push({ id: 'erste-karte', maps: [{ style: 'light', center: [13.0455, 47.7990], zoom: 14.2 }], run: async () => {} });
const only = (process.env.DEMO_ONLY || '').split(',').filter(Boolean);
const OUT = join(SITE, 'static/lp/img/demo');
mkdirSync(OUT, { recursive: true });

const CSS = `
@font-face{font-family:Inter;font-weight:100 900;src:url(/fonts/inter-latin-wght-normal.woff2) format("woff2");unicode-range:U+0000-00FF,U+2000-206F,U+2190-2199,U+2212,U+20AC}
@font-face{font-family:Inter;font-weight:100 900;src:url(/fonts/inter-latin-ext-wght-normal.woff2) format("woff2");unicode-range:U+0100-02BA}
html,body{margin:0;width:800px;height:400px;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased}
body.desk{background:radial-gradient(120% 120% at 50% 0%,#f4f8ff 0%,#dfe8f7 100%)}
.m{position:absolute;inset:0}
#ov{position:absolute;inset:0;pointer-events:none}
.card{position:absolute;background:#fff;border-radius:12px;box-shadow:0 1px 2px rgb(15 23 42/.10),0 8px 28px rgb(15 23 42/.20);font-size:22px;line-height:1.25;white-space:nowrap}
.card.dark{background:#0f172a;color:#fff}
.big{display:flex;align-items:center;gap:14px;padding:14px 22px;font-size:28px}
.big b{font-weight:700}.big small{display:block;font-size:18px;color:#64748b;font-weight:500;margin-top:2px}
.big .sep{width:2px;height:28px;background:#e2e8f0}
.chip{position:absolute;white-space:nowrap;background:#fff;border-radius:10px;padding:7px 14px;font-size:20px;font-weight:600;box-shadow:0 1px 2px rgb(15 23 42/.10),0 6px 18px rgb(15 23 42/.22);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.chip.dark{background:#0f172a;color:#fff}
.seams{position:absolute;inset:0}
.search{padding:8px}
.search .q{display:flex;align-items:center;gap:12px;padding:10px 14px;border:2px solid #0a64e8;border-radius:9px;font-size:24px;font-weight:500}
.search .q i{display:inline-block;width:2px;height:26px;background:#0a64e8;margin-left:-8px}
.search .sg{padding:10px 14px;font-size:21px;border-radius:8px;margin-top:4px;overflow:hidden;text-overflow:ellipsis}
.search .sg.on{background:#eaf2fe}.search .sg b{font-weight:650}.search .sg span{color:#64748b}
.lbl{position:absolute;background:#fff;border-radius:10px;padding:6px 12px;font-size:21px;font-weight:600;box-shadow:0 1px 2px rgb(15 23 42/.10),0 6px 18px rgb(15 23 42/.22);white-space:nowrap}
.lbl b{color:#0a64e8;font-weight:700}
.prof{padding:10px 20px 12px}
.prof .ph{display:flex;gap:20px;align-items:baseline;font-size:22px;margin-bottom:6px;color:#475569;font-weight:500}
.prof .ph b{color:#0f172a;font-weight:700}
.board{padding:12px 18px 10px;min-width:400px}
.board .bh{display:flex;align-items:center;gap:10px;font-size:23px;padding-bottom:8px;border-bottom:1px solid rgb(255 255 255/.16);margin-bottom:4px}
.board .br{display:flex;align-items:center;gap:14px;font-size:22px;padding:6px 0}
.board .t{font-variant-numeric:tabular-nums;font-weight:700;color:#fcd34d;width:64px}
.board .ln{min-width:58px;text-align:center;border-radius:6px;padding:2px 8px;font-weight:700;font-size:19px;background:#0a64e8}
.board .ln.rail{background:#e11d48}
.board .hs{flex:1}.board .pl{color:#94a3b8;font-size:19px;min-width:20px;text-align:right}
.legend{padding:12px 18px 10px;width:400px}
.legend .bar{height:16px;border-radius:8px}
.legend .ticks{position:relative;height:28px;font-size:18px;font-weight:600;color:#334155;margin-right:44px}
.legend .ticks span{position:absolute;top:6px;transform:translateX(-50%)}
.legend .ticks em{position:absolute;right:-44px;top:6px;font-style:normal;color:#64748b}
.photo{position:absolute;left:50%;top:44%;width:460px;transform:translate(-50%,-50%) rotate(-3deg);background:#fff;padding:10px;border-radius:12px;box-shadow:0 2px 4px rgb(15 23 42/.10),0 22px 50px rgb(15 23 42/.30)}
.photo img{display:block;width:460px;height:230px;border-radius:6px}
.photo .tag{position:absolute;right:-18px;top:-16px;background:#0a64e8;color:#fff;font-weight:700;font-size:19px;padding:6px 12px;border-radius:10px;box-shadow:0 6px 16px rgb(10 100 232/.35);transform:rotate(3deg)}
.url{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);background:#0f172a;color:#e2e8f0;border-radius:10px;padding:8px 14px;font:500 17px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap}
.url span{color:#7dd3fc;font-weight:700;margin-right:6px}
`;

const html = (s) => `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="/lp/vendor/maplibre-gl-6.19.0/maplibre-gl.css">
<style>${CSS}</style>
${s.maps.map((m, i) => `<div class="m" id="m${i}" style="${m.clip ? 'clip-path:' + m.clip : ''}"></div>`).join('')}
<div id="ov"></div>
<script src="/lp/vendor/pmtiles-4.5.0/pmtiles.js"></script>
<script type="module">
import * as maplibregl from '/lp/vendor/maplibre-gl-6.19.0/maplibre-gl.mjs';
const TOKEN = ${JSON.stringify(TOKEN)}, API = 'https://api.mapx.at/v1';
maplibregl.addProtocol('pmtiles', new pmtiles.Protocol().tile);
const specs = ${JSON.stringify(s.maps)};
const maps = specs.map((m, i) => new maplibregl.Map({ container: 'm' + i, style: API + '/styles/' + m.style,
  center: m.center, zoom: m.zoom, bearing: m.bearing || 0, pitch: m.pitch || 0, maxPitch: 85,
  attributionControl: false, interactive: false, fadeDuration: 0,
  transformRequest: (url) => ({ url: /^https:\\/\\/([\\w-]+\\.)?mapx\\.at\\//.test(url) && !url.includes('access_token=') ? url + (url.includes('?') ? '&' : '?') + 'access_token=' + TOKEN : url }) }));
maps.forEach((m) => m.on('error', (e) => { window.__err = String(e.error?.message || e.error || e); }));
const ov = document.getElementById('ov'), notes = [];
const ICON = {
  car: '<svg width="34" height="34" viewBox="0 0 24 24" fill="#0a64e8"><path d="M5 11l1.6-4.2A2 2 0 0 1 8.5 5.5h7a2 2 0 0 1 1.9 1.3L19 11a2 2 0 0 1 1.5 1.9V17a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1h-11v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-4.1A2 2 0 0 1 5 11zm2.2-.2h9.6l-1.1-3a.8.8 0 0 0-.7-.5H9a.8.8 0 0 0-.7.5zM7 14.6a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4zm10 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z"/></svg>',
  stop: '<svg width="30" height="30" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#0a64e8"/><path d="M8 17V7h5a3 3 0 0 1 0 6H8" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/></svg>',
  closed: '<svg width="36" height="36" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#d92d20"/><rect x="5.5" y="10" width="13" height="4" rx="1" fill="#fff"/></svg>',
};
const c = {
  map: maps[0], maps, ml: maplibregl, TOKEN, ov, icon: (k) => ICON[k],
  api: async (p) => { const r = await fetch(API + p, { headers: { Authorization: 'Bearer ' + TOKEN } }); if (!r.ok) throw new Error(p.split('?')[0] + ': HTTP ' + r.status); return r.json(); },
  add: (h) => ov.insertAdjacentHTML('beforeend', h),
  note: (t) => notes.push(t),
  num: (v, d) => new Intl.NumberFormat('de-AT', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v),
  bbox: (cs) => cs.reduce((b, q) => [[Math.min(b[0][0], q[0]), Math.min(b[0][1], q[1])], [Math.max(b[1][0], q[0]), Math.max(b[1][1], q[1])]], [[180, 90], [-180, -90]]),
  line: (g, col, w) => { const id = 'l' + Math.random().toString(36).slice(2); c.map.addSource(id, { type: 'geojson', data: g });
    c.map.addLayer({ id: id + 'c', type: 'line', source: id, paint: { 'line-color': '#fff', 'line-width': w + 5 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
    c.map.addLayer({ id, type: 'line', source: id, paint: { 'line-color': col, 'line-width': w }, layout: { 'line-cap': 'round', 'line-join': 'round' } }); },
  pin: (ll, kind) => { const e = document.createElement('div');
    e.innerHTML = kind === 'start' ? '<svg width="26" height="26"><circle cx="13" cy="13" r="9" fill="#fff" stroke="#0a64e8" stroke-width="5"/></svg>'
      : kind === 'stop' ? '<svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="#0a64e8" fill-opacity=".18"/><rect x="10" y="10" width="24" height="24" rx="7" fill="#0a64e8" stroke="#fff" stroke-width="3"/><path d="M18 28V16h5a3.5 3.5 0 0 1 0 7h-5" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>'
      : '<svg width="40" height="52" viewBox="0 0 40 52" style="filter:drop-shadow(0 3px 4px rgb(15 23 42/.35))"><path d="M20 50C20 50 37 31 37 19A17 17 0 0 0 3 19C3 31 20 50 20 50Z" fill="#0a64e8" stroke="#fff" stroke-width="3"/><circle cx="20" cy="19" r="6.5" fill="#fff"/></svg>';
    new maplibregl.Marker({ element: e, anchor: kind === 'pin' ? 'bottom' : 'center' }).setLngLat(ll).addTo(c.map); },
  ring: (ll) => { const e = document.createElement('div'); e.innerHTML = '<svg width="64" height="64"><circle cx="32" cy="32" r="26" fill="#d92d20" fill-opacity=".12" stroke="#d92d20" stroke-width="4"/></svg>';
    new maplibregl.Marker({ element: e }).setLngLat(ll).addTo(c.map); },
  label: (ll, text, side, dot) => { const e = document.createElement('div'); e.className = 'lbl'; e.innerHTML = text;
    const off = { left: [-22, 0], right: [22, 0], up: [0, -16], upPin: [0, -58], down: [0, 16] }[side];
    if (dot) { const d = document.createElement('div'); d.innerHTML = '<svg width="16" height="16"><circle cx="8" cy="8" r="5.5" fill="#0f172a" stroke="#fff" stroke-width="2.5"/></svg>'; new maplibregl.Marker({ element: d }).setLngLat(ll).addTo(c.map); }
    new maplibregl.Marker({ element: e, anchor: { left: 'right', right: 'left', up: 'bottom', upPin: 'bottom', down: 'top' }[side], offset: off }).setLngLat(ll).addTo(c.map); },
  // Kartenbeschriftungen (alle Symbolebenen) im Umkreis r px um die Punkte ausblenden, damit eigene Schilder nichts doppeln
  hideNear: async (lls, r, boxes = []) => { const m = c.map; await new Promise((ok) => { m.once('idle', ok); m.triggerRepaint(); });
    const ids = m.getStyle().layers.filter((l) => l.type === 'symbol').map((l) => l.id), names = new Set();
    for (const ll of lls) { const p = m.project(ll);
      m.queryRenderedFeatures([[p.x - r, p.y - r], [p.x + r, p.y + r]], { layers: ids }).forEach((f) => { const n = f.properties.name; if (n) names.add(n); }); }
    // zusätzlich Kartenbeschriftungen unter Karten (Schildern) ausblenden: boxes in Bildpunkten [[x0, y0], [x1, y1]]
    for (const bx of boxes) m.queryRenderedFeatures(bx, { layers: ids }).forEach((f) => { const n = f.properties.name; if (n) names.add(n); });
    const ex = ['!', ['in', ['coalesce', ['get', 'name'], ''], ['literal', [...names]]]];
    for (const id of ids) { const f = m.getFilter(id); m.setFilter(id, f ? ['all', f, ex] : ex); }
    notes.push('ausgeblendet: ' + [...names].join(', ')); },
};
const run = ${s.run.toString()};
const loaded = Promise.all(maps.map((m) => new Promise((ok) => m.loaded() ? ok() : m.once('load', ok))));
loaded.then(() => run(c)).then(() => document.fonts.ready).then(() => Promise.all(maps.map((m) => new Promise((ok) => { m.once('idle', ok); m.triggerRepaint(); }))))
  .then(() => setTimeout(() => { window.__notes = notes; window.__idle = true; }, 3000))
  .catch((e) => { window.__err = String(e.message || e); window.__notes = notes; window.__idle = true; });
</script>`;

const STATIC = join(SITE, 'static');
const TYPES = { mjs: 'text/javascript', js: 'text/javascript', css: 'text/css', woff2: 'font/woff2' };
export default async (page) => {
  // MapLibre, pmtiles und Inter lokal aus site/static (wie die Seite selbst)
  for (const pat of ['https://mapx.at/lp/vendor/**', 'https://mapx.at/fonts/**']) await page.route(pat, (r) => {
    const p = join(STATIC, new URL(r.request().url()).pathname);
    r.fulfill({ contentType: TYPES[p.split('.').pop()] || 'application/octet-stream', body: readFileSync(p) });
  });
  await page.setViewportSize({ width: 800, height: 400 });
  // doppelte Pixeldichte: die Bilder sind auf Handys sonst unscharf
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 800, height: 400, deviceScaleFactor: 2, mobile: false });
  const done = [];
  page.on('pageerror', (e) => console.error('Seitenfehler: ' + e.message));
  for (const s of items) {
    if (only.length && !only.includes(s.id)) continue;
    await page.route('https://mapx.at/__vorschau.html', (r) => r.fulfill({ contentType: 'text/html', body: html(s) }));
    await page.goto('https://mapx.at/__vorschau.html', { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => window.__idle === true, null, { timeout: 240000 });
    const png = await page.screenshot({ type: 'png' });   // 1600 x 800
    // PNG im Browser zu WebP umwandeln (keine weiteren Werkzeuge nötig), in Halbierungsschritten verkleinert.
    const conv = (w, h, max) => page.evaluate(async ([b64, w, h, max]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      let src = img, sw = img.naturalWidth, sh = img.naturalHeight;
      const draw = (tw, th) => { const c = Object.assign(document.createElement('canvas'), { width: tw, height: th }); const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, tw, th); src = c; sw = tw; sh = th; };
      while (sw / 2 >= w) draw(sw / 2, sh / 2);
      if (sw !== w) draw(w, h);
      let q = 0.86, out;
      do { out = src.toDataURL('image/webp', q).split(',')[1]; q -= 0.04; } while (out.length * 0.75 > max && q > 0.4);
      return out;
    }, [png.toString('base64'), w, h, max]);
    const buf = Buffer.from(await conv(1200, 600, 128000), 'base64');
    writeFileSync(join(OUT, s.id + '.webp'), buf);
    const info = await page.evaluate(() => ({ err: window.__err || '', notes: window.__notes || [] }));
    done.push(`${s.id}: ${Math.round(buf.length / 1024)} KB${info.err ? ' (Fehler: ' + info.err + ')' : ''}\n  ${info.notes.join('\n  ')}`);
    await page.unroute('https://mapx.at/__vorschau.html');
  }
  return `Stand ${new Date().toISOString()}\n` + done.join('\n');
};
