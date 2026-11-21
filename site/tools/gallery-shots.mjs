// Vorschaubilder der Galerie neu erzeugen (site/static/lp/img/gallery/<id>.webp mit 1440 x 810, Minikarte <id>-s.webp mit 480 x 270).
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
  { id: 'streets-dawn', center: [16.3725, 48.2085], zoom: 15 },     // wie streets: die Minikarten schalten das große Bild um
  { id: 'streets-dusk', center: [16.3725, 48.2085], zoom: 15 },
  { id: 'streets-night', center: [16.3725, 48.2085], zoom: 15 },
  { id: 'traffic-day', center: [16.37, 48.175], zoom: 11.6 },       // Wien, A23/A2/A4
  { id: 'traffic-night', center: [16.37, 48.175], zoom: 11.6 },
  { id: 'satellite', center: [15.333, 48.228], zoom: 15.6 },        // Melk, wie satellite-streets
  { id: 'satellite-streets', center: [15.333, 48.228], zoom: 15.6 },// Melk
  { id: 'satellite-current', center: [16.77, 47.84], zoom: 10.4 },  // Neusiedler See
  { id: 'outdoors', center: [10.985, 46.958], zoom: 13 },           // Sölden, wie outdoors-winter
  { id: 'outdoors-winter', center: [10.985, 46.958], zoom: 13 },    // Sölden
  { id: 'relief', center: [12.694, 47.074], zoom: 11.5 },           // Großglockner
  { id: 'relief-contours', center: [12.694, 47.074], zoom: 11.5 },
  { id: 'relief-light', center: [12.694, 47.074], zoom: 11.5 },
  { id: 'relief-dark', center: [12.694, 47.074], zoom: 11.5 },
  // 3D-Stile: geneigt, Ausschnitt wie in site/data/gallery.yaml
  { id: 'relief-3d', center: [12.694, 47.074], zoom: 12.8, pitch: 74, bearing: 0 },
  { id: 'outdoors-3d', center: [12.694, 47.074], zoom: 12.8, pitch: 74, bearing: 0 },
  { id: 'outdoors-winter-3d', center: [12.694, 47.074], zoom: 12.8, pitch: 74, bearing: 0 },
  { id: 'satellite-3d', center: [15.5205, 48.3945], zoom: 14.6, pitch: 74, bearing: 300 },
  { id: 'satellite-streets-3d', center: [15.5205, 48.3945], zoom: 14.6, pitch: 74, bearing: 300 },
  { id: 'streets-3d', center: [16.3725, 48.2085], zoom: 15.6, pitch: 60, bearing: -20 },
  { id: 'streets-night-3d', center: [16.3725, 48.2085], zoom: 15.6, pitch: 60, bearing: -20 },
  { id: 'light-3d', center: [16.3725, 48.2085], zoom: 15.6, pitch: 60, bearing: -20 },
  { id: 'dark-3d', center: [16.3725, 48.2085], zoom: 15.6, pitch: 60, bearing: -20 },
  { id: 'light', center: [15.4385, 47.071], zoom: 13.5 },            // Graz
  { id: 'dark', center: [15.4385, 47.071], zoom: 13.5 },
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
  center: ${JSON.stringify(s.center)}, zoom: ${s.zoom}, bearing: ${s.bearing || 0}, pitch: ${s.pitch || 0}, maxPitch: 85,
  attributionControl: false, interactive: false, fadeDuration: 0,
  transformRequest: (url) => ({ url: /^https:\\/\\/([\\w-]+\\.)?mapx\\.at\\//.test(url) ? url + (url.includes('?') ? '&' : '?') + 'access_token=' + TOKEN : url }) });
map.on('error', (e) => { window.__err = String(e.error?.message || e.error || e); });
map.once('load', () => map.once('idle', () => setTimeout(() => { window.__idle = true; }, 3000)));
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
  // doppelte Pixeldichte: die Bilder sind auf Handys und in den Minikarten sonst unscharf
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 960, height: 540, deviceScaleFactor: 2, mobile: false });
  const done = [];
  page.on("pageerror", (e) => console.error("Seitenfehler: " + e.message));
  for (const s of items) {
    if (only.length && !only.includes(s.id)) continue;
    await page.route('https://mapx.at/__vorschau.html', (r) => r.fulfill({ contentType: 'text/html', body: html(s) }));
    await page.goto('https://mapx.at/__vorschau.html', { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => window.__idle === true, null, { timeout: 240000 });
    const png = await page.screenshot({ type: 'png' });   // 1920 x 1080 (doppelte Pixeldichte)
    // PNG im Browser zu WebP umwandeln (keine weiteren Werkzeuge nötig): großes Bild 1440 x 810, Minikarte 480 x 270.
    // Verkleinert wird in Halbierungsschritten, das bleibt schärfer als ein einzelner großer Sprung.
    const conv = (w, h, max) => page.evaluate(async ([b64, w, h, max]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      let src = img, sw = img.naturalWidth, sh = img.naturalHeight;
      const draw = (tw, th) => { const c = Object.assign(document.createElement('canvas'), { width: tw, height: th }); const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, tw, th); src = c; sw = tw; sh = th; };
      while (sw / 2 >= w) draw(sw / 2, sh / 2);
      if (sw !== w) draw(w, h);
      let q = 0.86, out;
      do { out = src.toDataURL('image/webp', q).split(',')[1]; q -= 0.06; } while (out.length * 0.75 > max && q > 0.4);
      return out;
    }, [png.toString('base64'), w, h, max]);
    const buf = Buffer.from(await conv(1440, 810, 230000), 'base64');
    writeFileSync(join(OUT, s.id + '.webp'), buf);
    writeFileSync(join(OUT, s.id + '-s.webp'), Buffer.from(await conv(480, 270, 45000), 'base64'));
    done.push(`${s.id}: ${Math.round(buf.length / 1024)} KB${await page.evaluate(() => window.__err ? ' (Fehler: ' + window.__err + ')' : '')}`);
    await page.unroute('https://mapx.at/__vorschau.html');
  }
  return done.join('\n');
};
