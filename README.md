# mapx.at – Landing/Viewer

GitHub Pages (`CNAME` = mapx.at). Eine statische Seite: `index.html` (MapLibre GL JS 4.7.1 + pmtiles 3.2.1)
lädt den Kartenstil `style.json`. Kacheln, Glyphs und Sprites kommen von `https://tiles.mapx.at/`,
die Suche von `https://search.mapx.at` (Meilisearch, öffentlicher Search-only-Key).

## style.json erzeugen

`style.json` wird **nicht von Hand bearbeitet**, sondern mit `tools/build_style.py` erzeugt (nur
Python-Standardbibliothek):

```sh
git -C ../vector-tiles pull            # Style-Fragmente auf Stand main
python3 -I tools/build_style.py --vt ../vector-tiles [--out style.json] [--tiles https://tiles.mapx.at] [-v]
```

Das Skript

- definiert die Basis selbst: Hintergrund, basemap.at-Raster (ausgeschaltet), DKM-Nutzung `landuse_a`
  (basemap.at-Farben je `namecat`, Gewässer FIG 59/60 in #B3D9FF), Gebäude, Grundstücksgrenzen (`parcel_l`,
  ab z15), GIP-Straßen mit Straßennamen/-nummern,
- liest die Fragmente aus `mapx-at/vector-tiles` (`ggn/style/ggn-layers.json`,
  `grenzen/style/grenzen-layers.json`, `geonamen/style/geonamen-layers.json`,
  `adressen/style/housenumber-layers.json`) und übernimmt deren Layer unverändert, außer:
  - `text-font` wird gegen `assets/fonts/fontstacks.csv` geprüft, Open Sans → Noto Sans,
    Gelände-/Gebietsnamen in Noto Sans Medium Italic (wie basemap.at),
  - Geonamen: Kreis-Signaturen werden durch Sprite-Icons (`assets/sprites/mapping.csv`) ersetzt –
    Kirche/Kapelle/Stift nur als Icon, Gipfel Icon + Name + Höhe, Hauptorte mit Ortspunkt, übrige
    Objekte (Burg, Schloss, Ruine, Hütte, Bildstock …) mit Icon und Name,
  - Attribution je Quelle einheitlich (Pflichtvermerk Adressregister),
- setzt Glyphs (`/fonts/{fontstack}/{range}.pbf`) und Sprites (`default` + `sdf`) auf tiles.mapx.at,
- schreibt Legende und Layergruppen der Checkboxen nach `metadata["mapx:legend"]` / `["mapx:groups"]`;
  `index.html` liest sie von dort.

Es bricht ab bei fehlendem Fragment, unbekanntem Fontstack, fehlendem Icon oder doppelter Layer-ID.
Nach Änderungen an den Fragmenten in vector-tiles: neu generieren, `style.json` committen.

Zeichenreihenfolge (unten → oben): Hintergrund → landuse → Gewässerflächen → water_l → Gebäude →
Grundstücke → Straßen (Tunnel, Wege, Casing, Füllung, Brücken) → Grenzen → Hausnummern →
Straßennummern/-namen → Gewässernamen → Grenz-/Verwaltungsnamen → Geonamen (Gelände, Objekte, Gipfel,
Orte, Hauptorte zuletzt).

## Testen

Lokal: `python3 -m http.server` im Repo und `http://localhost:8000/` öffnen. Die Suche erlaubt per CORS nur
den Origin `https://mapx.at` (lokal also „Suche gerade nicht erreichbar“). Quellen per Query-Parameter
überschreibbar: `?dkm=`, `?gip=`, `?ggn=`, `?grenzen=`, `?geonamen=`, `?adr=` (je volle `https://…pmtiles`-URL),
`?style=` (anderes style.json), `?search=` / `?searchKey=` (Suchendpunkt).
