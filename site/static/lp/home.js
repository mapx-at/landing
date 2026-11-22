// Startseite (layouts/hextra-home.html). Schaufenster: ohne dieses Skript eine wischbare Reihe (scroll-snap).
// Mit Skript liegen die Bilder übereinander und blenden über (Autoplay alle 6 s), Titel und Satz stehen je Bild auf
// dem Verlauf. Wischen und Pfeiltasten wechseln von Hand. Keine Anfrage an api.mapx.at. Autoplay nur ohne
// prefers-reduced-motion; endet bei Berührung, Wischen, Hover, Fokus oder Tastendruck. Dazu der Kopierknopf im Code-Beispiel.
(function () {
  const show = document.querySelector('.mx-hshow');
  if (show) carousel(show);
  copy();

  function carousel(show) {
    const track = show.querySelector('.mx-htrack');
    const slides = [...track.querySelectorAll('.mx-hslide')];
    const go = show.querySelector('.mx-hgo');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const N = slides.length;
    let cur = -1, timer = null, stopped = reduce, visible = true, ready = false;

    // Bild i laden lassen; vorab nur das jeweils nächste
    function warm(i) { const img = slides[(i + N) % N].querySelector('img'); if (img.dataset.src) { img.srcset = img.dataset.srcset; img.src = img.dataset.src; delete img.dataset.src; } return img; }
    function to(i) {
      i = (i + N) % N;
      if (i === cur) return;
      const img = warm(i);
      const apply = () => {
        cur = i;
        slides.forEach((s, j) => { s.classList.toggle('on', j === i); s.toggleAttribute('aria-hidden', j !== i); });
        go.href = slides[i].querySelector('a').href;
        if (ready) warm(i + 1);
      };
      // erst überblenden, wenn das Bild da ist
      if (img.complete || cur < 0) apply(); else img.addEventListener('load', apply, { once: true });
    }
    function stop() { if (stopped) return; stopped = true; clearTimeout(timer); }
    function tick() {
      if (stopped) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (stopped) return;
        if (!document.hidden && visible) to(cur + 1);
        tick();
      }, 6000);
    }

    // Wischen (waagrecht), senkrechtes Scrollen bleibt der Seite
    let x0 = null, y0 = 0;
    track.addEventListener('touchstart', (e) => { stop(); x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; warm(cur + 1); warm(cur - 1); }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) to(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
    show.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      stop();
      to(cur + (e.key === 'ArrowRight' ? 1 : -1));
    });
    show.addEventListener('focusin', stop);
    show.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') stop(); });

    document.documentElement.classList.add('mx-hjs');
    to(0);
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(track);
    const start = () => { ready = true; warm(cur + 1); tick(); };
    if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
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
