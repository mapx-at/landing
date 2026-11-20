> **Umgezogen ins Monorepo:** Dieses Repo ist seit 31.10.2026 als `viewer/` (mit Historie, `git subtree`) in
> [mapx-at/vector-tiles](https://github.com/mapx-at/vector-tiles) enthalten. Weiterentwicklung dort; dieses Repo wird nach
> der Umstellung archiviert.

# mapx.at – Landing

GitHub Pages (`CNAME` = mapx.at). `index.html` ist die Landing (Hugo, Quelle `site/`).
Die frühere Viewer-Seite (zuletzt `legacy-viewer.html`) und die Stil-Dateien `style.json`, `styles/`, `tools/build_style.py`
sind seit 20.11.2026 entfernt: Karte unter https://map.mapx.at, Stile nur über die API (`https://api.mapx.at/v1/styles/<id>`,
mit Token; Generator in mapx-at/vector-tiles, `viewer/tools/`).

## Neue Landing (seit 07.11.2026)

`index.html` ist jetzt die Landing (Hugo, Quelle `site/`).

Pages liefert weiter den Branch `main` aus. Das Build-Ergebnis (`index.html`, `lp/`) ist eingecheckt:
nach Änderungen in `site/` `site/build.sh` ausführen (Hugo extended 0.169.0) und committen
kann man mit `site/build.sh --check` prüfen (keine CI: das öffentliche Repo hat keinen Zugriff auf die self-hosted Runner).

## Zweisprachig und Konto-Links (seit 08.11.2026)

Die Landing gibt es auf Deutsch (`/`) und Englisch (`/en/`). Ein Template (`site/layouts/index.html`), Texte je Sprache in
`site/data/de.yaml` und `site/data/en.yaml`; `site/build.sh` schreibt `index.html`, `en/index.html` und `lp/`.
Navigation und Abschnitt „API-Zugang“ verlinken auf https://account.mapx.at (`/login`, `/register`, `/tokens`, `/usage`, `?lang=`).
Die Seite ruft selbst keine mapx-APIs auf (nur Codebeispiele), ein Token-Platzhalter ist daher nicht nötig.

## Galerie der Kartenstile (seit 21.11.2026)

`/galerie/` bzw. `/en/gallery/`: Raster der API-Stile, Klick öffnet ein Fenster mit Live-Karte (MapLibre 6.19.0 und pmtiles 4.5.0
lokal unter `site/static/lp/vendor/`, erst beim Öffnen geladen). Texte und Varianten: `site/data/gallery.yaml`, Layout
`site/layouts/gallery.html`, Skript `site/static/lp/gallery.js`. Direktlink je Stil: `/galerie/#streets-night`.

Vorschaubilder (`site/static/lp/img/gallery/<id>.webp`, 960 × 540) neu erzeugen, Orte/Zoom stehen im Skript:

    PATH=~/.nvm/versions/node/v24.13.1/bin:$PATH web-browse run site/tools/gallery-shots.mjs   # einzelne: GALLERY_ONLY=streets,outdoors

Das Skript liefert eine Minimalseite unter der Herkunft `https://mapx.at` aus (dafür gilt der öffentliche Token aus `site/hugo.toml`)
und nimmt die echte MapLibre-Darstellung samt Quellenangabe auf. Danach `bash site/build.sh`.
