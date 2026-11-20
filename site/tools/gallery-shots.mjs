// Vorschaubilder der Galerie neu erzeugen (site/static/lp/img/gallery/<id>.webp, 960 x 540).
// Echte MapLibre-Darstellung der API-Stile; die Minimalseite wird unter der Herkunft https://mapx.at ausgeliefert,
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
];
const only = (process.env.GALLERY_ONLY || '').split(',').filter(Boolean);
const OUT = join(SITE, 'static/lp/img/gallery');
mkdirSync(OUT, { recursive: true });

const html = (s) => `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@6.18.0/dist/maplibre-gl.css">
<style>html,body,#m{margin:0;width:960px;height:540px;overflow:hidden}.maplibregl-ctrl-attrib{font:11px/1.4 system-ui,sans-serif}</style>
<div id="m"></div>
<script src="https://unpkg.com/pmtiles@4.5.0/dist/pmtiles.js"></script>
<script type="module">
import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.18.0/dist/maplibre-gl.mjs';
const TOKEN = ${JSON.stringify(TOKEN)};
maplibregl.addProtocol('pmtiles', new pmtiles.Protocol().tile);
const map = new maplibregl.Map({ container: 'm', style: 'https://api.mapx.at/v1/styles/${s.id}',
  center: ${JSON.stringify(s.center)}, zoom: ${s.zoom}, bearing: ${s.bearing || 0}, pitch: ${s.pitch || 0},
  attributionControl: false, interactive: false, fadeDuration: 0,
  transformRequest: (url) => ({ url: /^https:\\/\\/([\\w-]+\\.)?mapx\\.at\\//.test(url) ? url + (url.includes('?') ? '&' : '?') + 'access_token=' + TOKEN : url }) });
map.addControl(new maplibregl.AttributionControl({ compact: false }), 'bottom-right');
map.on('error', (e) => { window.__err = String(e.error?.message || e.error || e); });
map.once('load', () => map.once('idle', () => setTimeout(() => { window.__idle = true; }, 1500)));
</script>`;

export default async (page) => {
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
