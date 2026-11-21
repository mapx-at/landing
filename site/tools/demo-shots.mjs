// Vorschaubilder der Produktbeispiele neu erzeugen (site/static/lp/img/demo/<id>.webp, 1200 x 600): echte MapLibre-Darstellung
// der API-Stile wie in gallery-shots.mjs. Ausschnitte wie die Startansicht der Beispiele (site/static/lp/demo/<id>.js).
// Aufruf (Repo-Wurzel): web-browse run site/tools/demo-shots.mjs   [nur einzelne: DEMO_ONLY=karten,oev]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = /demoToken\s*=\s*"([^"]+)"/.exec(readFileSync(join(SITE, 'hugo.toml'), 'utf8'))[1];
// Ausschnitt je Stil (Mitte [lon, lat], Zoom). Die Texte der Galerie stehen in site/data/gallery.yaml.
const items = [
  { id: 'karten', style: 'streets', center: [11.4, 47.27], zoom: 11.3 },
  { id: 'geocoding', style: 'streets', center: [13.4, 47.65], zoom: 6.3 },
  { id: 'routing', style: 'streets', center: [15.33, 48.23], zoom: 13.4 },
  { id: 'hoehen', style: 'outdoors', center: [12.69, 47.077], zoom: 12 },
  { id: 'oev', style: 'streets', center: [13.0451, 47.8131], zoom: 14.4 },
  { id: 'verkehr', style: 'traffic-day', center: [16.3, 48.15], zoom: 10.3 },
  { id: 'statisch', style: 'streets', center: [15.3319, 48.2273], zoom: 14.2, pin: true },
  { id: 'wetter', style: 'streets', center: [13.4, 47.65], zoom: 6.3 },
];
const only = (process.env.DEMO_ONLY || '').split(',').filter(Boolean);
const OUT = join(SITE, 'static/lp/img/demo');
mkdirSync(OUT, { recursive: true });

const html = (s) => `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="/lp/vendor/maplibre-gl-6.19.0/maplibre-gl.css">
<style>html,body,#m{margin:0;width:800px;height:400px;overflow:hidden}.maplibregl-ctrl-attrib{font:11px/1.4 system-ui,sans-serif}</style>
<div id="m"></div>
<script src="/lp/vendor/pmtiles-4.5.0/pmtiles.js"></script>
<script type="module">
import * as maplibregl from '/lp/vendor/maplibre-gl-6.19.0/maplibre-gl.mjs';
const TOKEN = ${JSON.stringify(TOKEN)};
maplibregl.addProtocol('pmtiles', new pmtiles.Protocol().tile);
const map = new maplibregl.Map({ container: 'm', style: 'https://api.mapx.at/v1/styles/${s.style}',
  center: ${JSON.stringify(s.center)}, zoom: ${s.zoom}, bearing: ${s.bearing || 0}, pitch: ${s.pitch || 0}, maxPitch: 85,
  attributionControl: false, interactive: false, fadeDuration: 0,
  transformRequest: (url) => ({ url: /^https:\\/\\/([\\w-]+\\.)?mapx\\.at\\//.test(url) ? url + (url.includes('?') ? '&' : '?') + 'access_token=' + TOKEN : url }) });
if (${JSON.stringify(s.lod || null)}) map.on('style.load', () => map.setSourceTileLodParams(...${JSON.stringify(s.lod || [4, 3])}));
if (${!!s.pin}) new maplibregl.Marker({ color: '#e11d48' }).setLngLat(${JSON.stringify(s.center)}).addTo(map);
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
  await page.setViewportSize({ width: 800, height: 400 });
  // doppelte Pixeldichte: die Bilder sind auf Handys und in den Minikarten sonst unscharf
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 800, height: 400, deviceScaleFactor: 2, mobile: false });
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
    const buf = Buffer.from(await conv(1200, 600, 120000), 'base64');
    writeFileSync(join(OUT, s.id + '.webp'), buf);
    done.push(`${s.id}: ${Math.round(buf.length / 1024)} KB${await page.evaluate(() => window.__err ? ' (Fehler: ' + window.__err + ')' : '')}`);
    await page.unroute('https://mapx.at/__vorschau.html');
  }
  return done.join('\n');
};
