// Startseite (layouts/hextra-home.html). Schaufenster: ohne dieses Skript eine wischbare Reihe (scroll-snap).
// Mit Skript liegen die Bilder übereinander und blenden über (600 ms), Autoplay alle 5 s, Titel und Satz je Bild auf
// dem Verlauf, darunter Punkte (aktive Ansicht als Pille, die sich während der Anzeigedauer füllt; antippbar).
// Wischen, Pfeiltasten, Punkte, Hover und Fokus pausieren den Wechsel nur (nach der letzten Interaktion 10 s), danach
// läuft er weiter. Kein Autoplay bei prefers-reduced-motion, keiner in einem verdeckten Tab oder außerhalb des Bildschirms.
// Keine Anfrage an api.mapx.at. Dazu der Kopierknopf im Code-Beispiel.
(function () {
  const show = document.querySelector('.mx-hshow');
  if (show) carousel(show);
  copy();

  function carousel(show) {
    const track = show.querySelector('.mx-htrack');
    const slides = [...track.querySelectorAll('.mx-hslide')];
    const go = show.querySelector('.mx-hgo');
    const dots = show.querySelector('.mx-hdots');
    const dot = dots ? [...dots.querySelectorAll('.mx-hdot')] : [];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const N = slides.length, STEP = 5000, PAUSE = 10000;
    let cur = -1, timer = null, visible = true, ready = false, hover = false, pausedUntil = 0;
    if (dots) dots.style.setProperty('--mx-hdur', STEP + 'ms');

    // Bild i laden lassen; vorab nur das jeweils nächste
    function warm(i) { const img = slides[(i + N) % N].querySelector('img'); if (img.dataset.src) { img.srcset = img.dataset.srcset; img.src = img.dataset.src; delete img.dataset.src; } return img; }
    function to(i) {
      i = (i + N) % N;
      if (i === cur) return;
      const img = warm(i);
      const apply = () => {
        cur = i;
        slides.forEach((s, j) => { s.classList.toggle('on', j === i); s.toggleAttribute('aria-hidden', j !== i); });
        dot.forEach((d, j) => { if (j === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
        go.href = slides[i].querySelector('a').href;
        if (ready) warm(i + 1);
        progress();
      };
      // erst überblenden, wenn das Bild da ist
      if (img.complete || cur < 0) apply(); else img.addEventListener('load', apply, { once: true });
    }
    const running = () => !reduce && ready && !hover && visible && !document.hidden && Date.now() >= pausedUntil;
    // Fortschritt der Pille neu starten (nur, wenn der Wechsel gerade läuft)
    function progress() {
      if (!dots) return;
      dots.classList.remove('run');
      if (running()) { void dots.offsetWidth; dots.classList.add('run'); }
    }
    function schedule() {
      clearTimeout(timer);
      if (reduce) return;
      // läuft der Wechsel: nach STEP weiter; sonst nach der Pause erst die Pille neu füllen, dann wechseln
      const was = running();
      timer = setTimeout(() => {
        if (was && running()) to(cur + 1); else progress();
        schedule();
      }, was ? STEP : Math.max(1000, pausedUntil - Date.now()));
    }
    // Interaktion: kurz anhalten, dann weiter
    function pause() { pausedUntil = Date.now() + PAUSE; progress(); schedule(); }
    function resume() { progress(); schedule(); }

    // Wischen (waagrecht), senkrechtes Scrollen bleibt der Seite und hält nichts an
    let x0 = null, y0 = 0;
    track.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; warm(cur + 1); warm(cur - 1); }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { to(cur + (dx < 0 ? 1 : -1)); pause(); }
    }, { passive: true });
    show.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      to(cur + (e.key === 'ArrowRight' ? 1 : -1));
      pause();
    });
    dot.forEach((d, i) => { d.disabled = false; d.addEventListener('click', () => { to(i); pause(); }); });
    show.addEventListener('focusin', pause);
    show.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hover = true; progress(); } });
    show.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hover = false; pause(); } });
    document.addEventListener('visibilitychange', resume);

    document.documentElement.classList.add('mx-hjs');
    to(0);
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; resume(); }).observe(track);
    const start = () => { ready = true; warm(cur + 1); resume(); };
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
