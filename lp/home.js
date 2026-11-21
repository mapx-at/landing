// Startseite: Schaufenster-Umschalter (layouts/hextra-home.html). Tauscht nur vorgerenderte Bilder aus /lp/img/gallery/,
// keine Anfrage an api.mapx.at. Automatischer Wechsel nur ohne prefers-reduced-motion, endet bei Hover, Fokus, Berührung
// oder eigener Auswahl. Ohne dieses Skript bleibt das erste Bild stehen und die Knöpfe sind ausgeblendet.
(function () {
  const show = document.querySelector('.mx-hshow');
  if (!show) return;
  const stage = show.querySelector('.mx-hstage');
  const chips = [...show.querySelectorAll('.mx-hchip')];
  const first = stage.querySelector('.mx-hlayer');
  const cap = { id: show.querySelector('.mx-hid'), place: show.querySelector('.mx-hplace'), link: show.querySelector('.mx-hlive') };
  const base = first.getAttribute('src').replace(/[^/]+$/, '');
  const layers = { [first.dataset.id]: first };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, timer = null, stopped = reduce, token = 0;

  function layer(id) {
    if (layers[id]) return layers[id];
    const img = new Image(1440, 810);
    img.className = 'mx-hlayer';
    img.dataset.id = id;
    img.decoding = 'async';
    img.sizes = first.sizes;
    img.srcset = base + id + '-s.webp 480w, ' + base + id + '.webp 1440w';
    img.src = base + id + '.webp';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    stage.appendChild(img);
    return (layers[id] = img);
  }
  function ready(img) {
    return img.complete && img.naturalWidth ? Promise.resolve() : (img.decode ? img.decode() : new Promise((r) => { img.onload = r; })).catch(() => {});
  }
  function select(i) {
    const c = chips[i], id = c.dataset.id, my = ++token;
    cur = i;
    chips.forEach((o, j) => o.setAttribute('aria-pressed', String(j === i)));
    cap.id.textContent = id;
    cap.place.textContent = c.dataset.place;
    cap.link.href = cap.link.getAttribute('href').replace(/#.*$/, '') + '#' + id;
    const img = layer(id);
    ready(img).then(() => {
      if (my !== token) return;
      for (const k in layers) {
        const l = layers[k], on = l === img;
        l.classList.toggle('mx-hon', on);
        l.alt = on ? c.dataset.alt : '';
        if (on) l.removeAttribute('aria-hidden'); else l.setAttribute('aria-hidden', 'true');
      }
    });
  }
  function stop() { stopped = true; clearTimeout(timer); }
  function tick() {
    if (stopped) return;
    timer = setTimeout(() => {
      if (stopped) return;
      if (document.hidden || !visible) return tick();
      const n = (cur + 1) % chips.length;
      ready(layer(chips[n].dataset.id)).then(() => { if (!stopped) { select(n); tick(); } });
    }, 5000);
  }

  chips.forEach((c, i) => {
    c.disabled = false;
    c.addEventListener('click', () => { stop(); select(i); });
  });
  show.addEventListener('keydown', (e) => {
    const k = chips.indexOf(document.activeElement);
    if (k < 0 || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    e.preventDefault();
    const n = (k + (e.key === 'ArrowRight' ? 1 : chips.length - 1)) % chips.length;
    chips[n].focus();
  });
  for (const ev of ['pointerenter', 'focusin', 'touchstart']) show.addEventListener(ev, stop, { passive: true });
  document.documentElement.classList.add('mx-hjs');

  let visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(stage);
  if (!stopped) {
    // das nächste Bild erst nach dem Laden der Seite holen, nicht vorher
    const go = () => { layer(chips[1].dataset.id); tick(); };
    if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
  }
})();
