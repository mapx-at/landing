// Startseite (layouts/hextra-home.html). Schaufenster: wischbare Reihe (scroll-snap), die ohne dieses Skript von Hand
// wischbar bleibt. Das Skript ergänzt Chips, Punkte mit Fortschritt, Bildunterschrift und den automatischen Wechsel.
// Keine Anfrage an api.mapx.at. Der Wechsel läuft nur ohne prefers-reduced-motion und endet bei Berührung, Wischen,
// Mausrad, Hover, Fokus oder eigener Auswahl. Dazu der Kopierknopf im Code-Beispiel.
(function () {
  const show = document.querySelector('.mx-hshow');
  if (show) carousel(show);
  copy();

  function carousel(show) {
    const track = show.querySelector('.mx-htrack');
    const slides = [...track.querySelectorAll('.mx-hslide')];
    const chips = [...show.querySelectorAll('.mx-hchip')];
    const dots = show.querySelector('.mx-hdots');
    const dot = dots ? [...dots.children] : [];
    const go = show.querySelector('.mx-hgo');
    const cap = { id: show.querySelector('.mx-hid'), place: show.querySelector('.mx-hplace') };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const N = slides.length;
    let cur = -1, timer = null, stopped = reduce, visible = true, ready = false;

    // Bild i laden lassen (lazy -> eager); vorab nur das jeweils nächste
    function warm(i) { const img = slides[i % N].querySelector('img'); if (img.dataset.src) { img.srcset = img.dataset.srcset; img.src = img.dataset.src; delete img.dataset.src; } return img; }
    function active(i) {
      if (i === cur) return;
      cur = i;
      const c = chips[i];
      chips.forEach((o, j) => o.setAttribute('aria-pressed', String(j === i)));
      dot.forEach((d, j) => d.classList.toggle('on', j === i));
      slides.forEach((s, j) => s.toggleAttribute('aria-hidden', j !== i));
      if (c) {
        cap.id.textContent = c.dataset.id;
        cap.place.textContent = c.dataset.place;
        go.href = slides[i].querySelector('a').href;
        reveal(c);
      }
      if (ready) warm(i + 1);
      restart();
    }
    function to(i, smooth) {
      warm(i);
      track.scrollTo({ left: i * track.clientWidth, behavior: smooth && !reduce ? 'smooth' : 'auto' });
      active(i);
    }
    // aktiven Chip in den sichtbaren Teil seiner Reihe schieben; nur die Reihe scrollt, nie die Seite
    function reveal(c) {
      const row = c.parentElement, l = c.offsetLeft - row.offsetLeft, pad = 40;
      let x = row.scrollLeft;
      if (l - pad < x) x = l - pad;
      else if (l + c.offsetWidth + pad > x + row.clientWidth) x = l + c.offsetWidth + pad - row.clientWidth;
      if (x !== row.scrollLeft) row.scrollTo({ left: Math.max(0, x), behavior: reduce ? 'auto' : 'smooth' });
    }
    // Fortschrittsstrich im aktiven Punkt neu starten
    function restart() {
      if (!dots) return;
      dots.classList.remove('run');
      if (!stopped) { void dots.offsetWidth; dots.classList.add('run'); }
    }
    function stop() { if (stopped) return; stopped = true; clearTimeout(timer); if (dots) dots.classList.remove('run'); }
    function tick() {
      if (stopped) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (stopped) return;
        if (document.hidden || !visible) return tick();
        to((cur + 1) % N, true);
        tick();
      }, 5000);
    }

    let raf = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => active(Math.max(0, Math.min(N - 1, Math.round(track.scrollLeft / track.clientWidth)))));
    }, { passive: true });
    chips.forEach((c, i) => { c.disabled = false; c.addEventListener('click', () => { stop(); to(i, true); }); });
    show.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const k = chips.indexOf(document.activeElement);
      if (k < 0 && document.activeElement !== track) return;
      const step = e.key === 'ArrowRight' ? 1 : N - 1;
      e.preventDefault();
      stop();
      const n = ((k >= 0 ? k : cur) + step) % N;
      if (k >= 0) chips[n].focus();
      to(n, true);
    });
    // Benutzer greift ein: Wechsel endet
    for (const ev of ['touchstart', 'wheel', 'focusin']) show.addEventListener(ev, stop, { passive: true });
    show.addEventListener('pointerdown', stop);
    show.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') stop(); });
    addEventListener('resize', () => track.scrollTo({ left: cur * track.clientWidth }), { passive: true });

    document.documentElement.classList.add('mx-hjs');
    active(0);
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(track);
    // erst nach dem Laden der Seite das nächste Bild holen und weiterschalten
    const start = () => { ready = true; warm(cur + 1); if (!stopped) { restart(); tick(); } };
    if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
    // wer zu wischen beginnt, bekommt die Nachbarn sofort
    for (const ev of ['touchstart', 'pointerdown']) track.addEventListener(ev, () => { warm(cur + 1); warm(cur + N - 1); }, { passive: true });
  }

  function copy() {
    document.querySelectorAll('.mx-hcopy').forEach((b) => {
      const label = b.querySelector('span'), text = label.textContent;
      b.hidden = false;
      b.setAttribute('aria-live', 'polite');
      b.addEventListener('click', async () => {
        const pre = b.closest('.mx-hcodebox').querySelector('pre');
        let ok = false;
        try { await navigator.clipboard.writeText(pre.innerText.replace(/\n+$/, '')); ok = true; } catch (e) { ok = false; }
        label.textContent = ok ? b.dataset.ok : b.dataset.fail;
        if (!ok) { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
        setTimeout(() => { label.textContent = text; }, 2000);
      });
    });
  }
})();
