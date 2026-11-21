// Vorschaubilder der Galerie neu erzeugen (site/static/lp/img/gallery/<id>.webp, 960 x 540).
// Echte MapLibre-Darstellung der API-Stile, ohne Bedienelemente und ohne Quellenangabe im Bild (die steht als Zeile unter dem Raster
// der Galerie, die Live-Karte im Fenster trägt die volle Angabe); die Minimalseite wird unter der Herkunft https://mapx.at ausgeliefert,
// damit der öffentliche Token aus site/hugo.toml gilt. Orte und Zoomstufen: Liste items unten.
// Aufruf (Repo-Wurzel): web-browse run site/tools/gallery-shots.mjs   [nur einzelne Stile: GALLERY_ONLY=streets,outdoors]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = /demoToken\s*=\s*"([^"]+)"/.exec(readFileSync(join(SITE, 'hugo.toml'), 'utf8'))[1];
// Ausschnitt je Stil (Mitte [lon, lat], Zoom). Die Texte der Galerie stehen in site/data/gallery.yaml.
const items = [
  { id: 'streets', center: [16.3725, 48.2085], zoom: 15 },          // Wien Innenstadt
  { id: 'streets-dawn', center: [13.0445, 47.7995], zoom: 14.6 },   // Salzburg
  { id: 'streets-dusk', center: [15.4385, 47.071], zoom: 14.4 },    // Graz
  { id: 'streets-night', center: [11.394, 47.266], zoom: 13.2 },    // Innsbruck
  { id: 'traffic-day', center: [16.37, 48.175], zoom: 11.6 },       // Wien, A23/A2/A4
  { id: 'satellite', center: [13.649, 47.5615], zoom: 15.4 },       // Hallstatt
  { id: 'satellite-streets', center: [15.333, 48.228], zoom: 15.6 },// Melk
  { id: 'satellite-current', center: [16.77, 47.84], zoom: 10.4 },  // Neusiedler See
  { id: 'outdoors', center: [12.694, 47.074], zoom: 13 },           // Großglockner
  { id: 'outdoors-winter', center: [10.985, 46.958], zoom: 13 },    // Sölden
  { id: 'light', center: [15.4385, 47.071], zoom: 13.5, sample: ['#0a64e8', '#e8542f'] }, // Graz, mit Beispieldaten
  { id: 'dark', center: [15.4385, 47.071], zoom: 13.5, sample: ['#4cc3ff', '#ffb020'] },
];
const only = (process.env.GALLERY_ONLY || '').split(',').filter(Boolean);
const OUT = join(SITE, 'static/lp/img/gallery');
mkdirSync(OUT, { recursive: true });

const html = (s) => `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="/lp/vendor/maplibre-gl-6.19.0/maplibre-gl.css">
<style>html,body,#m{margin:0;width:960px;height:540px;overflow:hidden}.maplibregl-ctrl-attrib{font:11px/1.4 system-ui,sans-serif}</style>
<div id="m"></div>
<script src="/lp/vendor/pmtiles-4.5.0/pmtiles.js"></script>
<script type="module">
import * as maplibregl from '/lp/vendor/maplibre-gl-6.19.0/maplibre-gl.mjs';
const TOKEN = ${JSON.stringify(TOKEN)};
maplibregl.addProtocol('pmtiles', new pmtiles.Protocol().tile);
const map = new maplibregl.Map({ container: 'm', style: 'https://api.mapx.at/v1/styles/${s.id}',
  center: ${JSON.stringify(s.center)}, zoom: ${s.zoom}, bearing: ${s.bearing || 0}, pitch: ${s.pitch || 0},
  attributionControl: false, interactive: false, fadeDuration: 0,
  transformRequest: (url) => ({ url: /^https:\\/\\/([\\w-]+\\.)?mapx\\.at\\//.test(url) ? url + (url.includes('?') ? '&' : '?') + 'access_token=' + TOKEN : url }) });
map.on('error', (e) => { window.__err = String(e.error?.message || e.error || e); });
// Neutrale Beispieldaten (keine Bedeutung): ein paar Punkte und eine Linie, zeigen den Zweck von light/dark
const SAMPLE = ${JSON.stringify(s.sample || null)};
if (SAMPLE) map.once('load', () => {
  const c = ${JSON.stringify(s.center)}, d = (x, y) => [c[0] + x * 0.004, c[1] + y * 0.0027];
  const pts = [[-3, 2], [-1.5, -1.8], [0.8, 1.2], [2.6, -0.6], [3.4, 2.4], [-2.8, -3.1], [1.2, -3.4], [-0.4, 3.6]].map(([x, y]) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: d(x, y) } }));
  const line = { type: 'Feature', geometry: { type: 'LineString', coordinates: [[-5, -2.5], [-3, -0.8], [-1, -0.2], [1, 0.6], [2.8, 0.3], [5, 1.8]].map(([x, y]) => d(x, y)) } };
  map.addSource('beispiel', { type: 'geojson', data: { type: 'FeatureCollection', features: [line, ...pts] } });
  map.addLayer({ id: 'beispiel-linie', type: 'line', source: 'beispiel', filter: ['==', ['geometry-type'], 'LineString'], paint: { 'line-color': SAMPLE[1], 'line-width': 4, 'line-opacity': .9 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
  map.addLayer({ id: 'beispiel-punkte', type: 'circle', source: 'beispiel', filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-color': SAMPLE[0], 'circle-radius': 8, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } });
});
map.once('load', () => map.once('idle', () => setTimeout(() => { window.__idle = true; }, 1500)));
</script>`;

const VENDOR = join(SITE, 'static');
const TYPES = { mjs: 'text/javascript', js: 'text/javascript', css: 'text/css' };
export default async (page) => {
  // MapLibre und pmtiles lokal aus site/static/lp/vendor (wie die Galerie selbst)
  await page.route('https://mapx.at/lp/vendor/**', (r) => {
    const p = join(VENDOR, new URL(r.request().url()).pathname);
    r.fulfill({ contentType: TYPES[p.split('.').pop()] || 'application/octet-stream', body: readFileSync(p) });
  });
  await page.setViewportSize({ width: 960, height: 540 });
  const done = [];
  page.on("pageerror", (e) => console.error("Seitenfehler: " + e.message));
  for (const s of items) {
    if (only.length && !only.includes(s.id)) continue;
    await page.route('https://mapx.at/__vorschau.html', (r) => r.fulfill({ contentType: 'text/html', body: html(s) }));
    await page.goto('https://mapx.at/__vorschau.html', { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => window.__idle === true, null, { timeout: 90000 });
    const png = await page.screenshot({ type: 'png' });
    // PNG im Browser zu WebP umwandeln (keine weiteren Werkzeuge nötig); Qualität senken, bis das Bild unter 120 KB liegt
    let q = 0.8, webp;
    do {
      webp = await page.evaluate(async ([b64, q]) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
        const c = Object.assign(document.createElement('canvas'), { width: 960, height: 540 });
        c.getContext('2d').drawImage(img, 0, 0);
        return c.toDataURL('image/webp', q).split(',')[1];
      }, [png.toString('base64'), q]);
      q -= 0.08;
    } while (Buffer.byteLength(webp, 'base64') > 120000 && q > 0.4);
    const buf = Buffer.from(webp, 'base64');
    writeFileSync(join(OUT, s.id + '.webp'), buf);
    done.push(`${s.id}: ${Math.round(buf.length / 1024)} KB${await page.evaluate(() => window.__err ? ' (Fehler: ' + window.__err + ')' : '')}`);
    await page.unroute('https://mapx.at/__vorschau.html');
  }
  return done.join('\n');
};
