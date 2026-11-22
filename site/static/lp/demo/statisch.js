// Statische Karten: Ort, Stil und Größe wählen, daraus entsteht die URL für /v1/static; das Bild wird erst auf Knopfdruck geladen.
window.mxDemo = (c) => {
  const { t, el } = c;
  const places = { melk: ['Melk', 15.3294, 48.2272, 15], innsbruck: ['Innsbruck', 11.3933, 47.2683, 14], hallstatt: ['Hallstatt', 13.6493, 47.5622, 15], graz: ['Graz', 15.4382, 47.0707, 15] };
  // Kein Kartenrahmen mit festem Seitenverhältnis: das Bild zeigt sich unbeschnitten, die Chips stehen deshalb über dem Rahmen
  c.frame.classList.add('mx-demo-frame-free'); c.frame.before(c.panel); c.panel.classList.add('mx-demo-panel-out');
  const place = c.toggles(Object.entries(places).map(([k, v]) => [k, v[0]]), 'melk', update, t('Ort', 'Place'));
  const style = c.toggles([['streets', t('Tag', 'Day')], ['streets-night', t('Nacht', 'Night')], ['satellite', t('Luftbild', 'Aerial')], ['outdoors', t('Gelände', 'Terrain')]], 'streets', update, t('Stil', 'Style'));
  const size = c.toggles([['600x300', '600 × 300'], ['400x400', '400 × 400'], ['300x200', '300 × 200']], '600x300', update, t('Größe', 'Size'));
  const go = c.button(t('Bild erzeugen', 'Create image'), render);
  go.classList.add('mx-demo-primary');
  const code = el('code', {}), img = el('img', { alt: '', className: 'mx-demo-static' });
  c.frame.before(el('pre', { className: 'mx-demo-url' }, code));
  function url() {
    const [, lng, lat, z] = places[place.value];
    return `${c.API}/static/${style.value}/${encodeURIComponent(`pin-l+e11d48(${lng},${lat})`)}/${lng},${lat},${z}/${size.value}@2x.webp`;
  }
  function update() { code.textContent = url() + '?access_token=YOUR_TOKEN'; c.say(t('Die URL ist fertig. „Bild erzeugen“ lädt sie.', 'The URL is ready. “Create image” loads it.')); }
  function render() {
    const u = url(), [w, h] = size.value.split('x');
    img.width = Number(w); img.height = Number(h); img.style.width = w + 'px'; img.style.aspectRatio = w + ' / ' + h; // unbeschnitten im echten Seitenverhältnis
    img.alt = t(`Kartenbild ${places[place.value][0]}, Stil ${style.label()}`, `Map image ${places[place.value][0]}, style ${style.label()}`);
    c.say(t('Lade das Bild …', 'Loading the image …'));
    img.onload = () => { c.done(); c.say(t(`Fertig: ${w} × ${h} px, doppelte Auflösung (@2x). Quellen: BEV, GIP.at, CC BY 4.0`, `Done: ${w} × ${h} px, double resolution (@2x). Sources: BEV, GIP.at, CC BY 4.0`)); };
    img.onerror = async () => { c.done(); try { const r = await fetch(img.src); c.say(r.ok ? t('Das Bild ist nicht lesbar.', 'The image is not readable.') : c.errText(r.status), true); } catch (e) { c.fail(e); } };
    c.logReq(u, false);
    img.src = u + '?access_token=' + encodeURIComponent(c.TOKEN); // Bilder senden keinen Header, der Token steht in der URL
    c.stage.replaceChildren(img);
  }
  update(); c.done();
};
