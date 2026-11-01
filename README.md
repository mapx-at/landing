> **Umgezogen ins Monorepo:** Dieses Repo ist seit 31.10.2026 als `viewer/` (mit Historie, `git subtree`) in
> [mapx-at/vector-tiles](https://github.com/mapx-at/vector-tiles) enthalten. Weiterentwicklung dort; dieses Repo wird nach
> der Umstellung archiviert.

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

### Übersichtszoom z0–7

Darstellung unter z8 wie `basemap-at-farbe` (alle bm-Layer mit minzoom < 8). Regel: **ab z8 ändert sich nichts.**
Dafür gibt es eigene Layer `*-low` mit `maxzoom: 8`; bestehende Layer bekommen höchstens einen höheren minzoom
(≤ 8, Tabelle `LOW_MINZOOM` in `tools/build_style.py`). Prüfen mit
`python3 -I /data1/mapx/research/lowzoom/compare/scripts/style_check.py <alter style.json> style.json`.

| Inhalt | basemap.at | mapx |
|---|---|---|
| Staatsgrenze `state_l` | ab z0, border_state(_outline) | unverändert (Fragment = bm) |
| Bundeslandgrenzen `country_l` | Daten ab z5 | minzoom 5 |
| Nutzung `landuse_a` | Daten ab z4, 25 % über dem Relief, Siedlung deckend #D1D1CF | minzoom 4, gleiche Farben |
| DKM-Gewässer (FIG 59/60) | keine Gewässer in landuse_a | `water-dkm` minzoom 8 |
| Seen `water_a` | z6+ (9 große Seen) | ohne minzoom, Daten bestimmen |
| Flüsse `water_l` namecat 1 | water_l_river1 ab z6, 3 px | `ggn-water-l` minzoom 6, rank 1 = 3 px |
| Autobahn/Schnellstraße | gip_autobahn_z7_11 ab z6, 4,2/5,7 px | `road-low-(casing-)motorway` ab z6 |
| Rampe, B-Straße | gip_ramp, gip_hauptverbindung_z8_11 ab z7 | `road-low-(casing-)motorway_link/primary` ab z7 |
| Tunnel (Straße) | bis z10 wie normale Straße | z6–7 ohne Tunnelunterscheidung |
| Bahn (Hauptbahn 13010) | gip_railway / giptunnel_railway_ ab z6, 1,2 px | `oev-rail(-tunnel)-low` (rail, service main) z6–7, `oev-rail(-tunnel)` ab z8 |
| Autobahnnummern | giplabel_autobahn_nr_ ab z7, 10 px, padding 100 | `road-ref-motorway-low` z7 |
| Landeshauptstädte | Label ab z6 (Roboto Medium 13–15 px), rosa Kreis z6–10, Wien ohne Kreis | `geonamen-hauptstadt-low(-punkt)`, `geonamen-hauptstadt-wien-low` z6–7; ab z8 Icon place_capital |
| Bezirkshauptorte | Label ab z7 (12 px), weißer Kreis z7–11 | `geonamen-bezirkshauptort-low(-punkt)` z7; ab z8 wie bisher |
| Bundeslandnamen | gibt es nicht | `grenzen-label-land` minzoom 5 → 8 (z8 unverändert) |
| Relief | graues Rasterrelief überall | nur Melk (relief-terrainrgb z5–16), nicht nachgebaut |

Hinweis: `index.html` begrenzt den Viewer auf `minZoom: 6`; z0–5 sind erst nach einer Anpassung dort erreichbar.

## Testen

Lokal: `python3 -m http.server` im Repo und `http://localhost:8000/` öffnen. Die Suche erlaubt per CORS nur
den Origin `https://mapx.at` (lokal also „Suche gerade nicht erreichbar“). Quellen per Query-Parameter
überschreibbar: `?dkm=`, `?gip=`, `?ggn=`, `?grenzen=`, `?geonamen=`, `?adr=` (je volle `https://…pmtiles`-URL),
`?style=` (anderes style.json), `?search=` / `?searchKey=` (Suchendpunkt).
