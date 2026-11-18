// Statische Karten: Ort, Stil und Größe wählen, daraus entsteht die URL für /v1/static; das Bild wird erst auf Knopfdruck geladen.
window.mxDemo = (c) => {
  const { t, el } = c;
  const places = { melk: ['Melk', 15.3294, 48.2272, 15], innsbruck: ['Innsbruck', 11.3933, 47.2683, 14], hallstatt: ['Hallstatt', 13.6493, 47.5622, 15], graz: ['Graz', 15.4382, 47.0707, 15] };
  const place = c.select(t('Ort', 'Place'), Object.entries(places).map(([k, v]) => [k, v[0]]), 'melk');
  const style = c.select(t('Stil', 'Style'), [['streets', t('Tag', 'Day')], ['streets-night', t('Nacht', 'Night')], ['satellite', t('Luftbild', 'Aerial')], ['outdoors', t('Gelände', 'Terrain')]], 'streets');
  const size = c.select(t('Größe', 'Size'), [['600x300', '600 × 300'], ['400x400', '400 × 400'], ['300x200', '300 × 200']], '600x300');
  const go = c.button(t('Bild erzeugen', 'Create image'), render);
  go.classList.add('mx-demo-primary');
  const code = el('code', {}), img = el('img', { alt: '', className: 'mx-demo-static' });
  c.stage.before(el('pre', { className: 'mx-demo-url' }, code));
  function url() {
    const [, lng, lat, z] = places[place.value];
    return `${c.API}/static/${style.value}/${encodeURIComponent(`pin-l+e11d48(${lng},${lat})`)}/${lng},${lat},${z}/${size.value}@2x.webp`;
  }
  function update() { code.textContent = url() + '?access_token=YOUR_TOKEN'; c.say(t('Die URL ist fertig. „Bild erzeugen“ lädt sie.', 'The URL is ready. “Create image” loads it.')); }
  function render() {
    const u = url(), [w, h] = size.value.split('x');
    img.width = Number(w); img.height = Number(h); img.style.width = w + 'px';
    img.alt = t(`Kartenbild ${places[place.value][0]}, Stil ${style.selectedOptions[0].text}`, `Map image ${places[place.value][0]}, style ${style.selectedOptions[0].text}`);
    c.say(t('Lade das Bild …', 'Loading the image …'));
    img.onload = () => c.say(t(`Fertig: ${w} × ${h} px, doppelte Auflösung (@2x). Quellen: BEV, GIP.at, CC BY 4.0`, `Done: ${w} × ${h} px, double resolution (@2x). Sources: BEV, GIP.at, CC BY 4.0`));
    img.onerror = async () => { try { const r = await fetch(img.src); c.say(r.ok ? t('Das Bild ist nicht lesbar.', 'The image is not readable.') : c.errText(r.status), true); } catch (e) { c.fail(e); } };
    img.src = u + '?access_token=' + encodeURIComponent(c.TOKEN); // Bilder senden keinen Header, der Token steht in der URL
    c.stage.replaceChildren(img);
  }
  for (const s of [place, style, size]) s.addEventListener('change', update);
  update();
};
