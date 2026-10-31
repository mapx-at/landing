#!/usr/bin/env python3
"""Erzeugt style.json (MapLibre-Style) fuer den Viewer auf mapx.at.

Aufruf (aus dem landing-Repo):
    python3 -I tools/build_style.py --vt /data1/mapx/src/vector-tiles [--out style.json]

Quellen:
  * Basis (in diesem Skript): Hintergrund, basemap.at-Raster (aus), DKM-Nutzung (landuse_a),
    Gebaeude (building_a), Grundstuecksgrenzen (parcel_l), GIP-Strassen (gip_l) samt Beschriftung.
  * Style-Fragmente aus dem Repo mapx-at/vector-tiles (--vt):
      ggn/style/ggn-layers.json, grenzen/style/grenzen-layers.json,
      geonamen/style/geonamen-layers.json, adressen/style/housenumber-layers.json
    Sie werden unveraendert uebernommen und nur nachbearbeitet:
      - text-font auf vorhandene Fontstacks (assets/fonts/fontstacks.csv) pruefen/vereinheitlichen
        (Open Sans -> Noto Sans), Glyphs/Sprites auf tiles.mapx.at,
      - Geonamen: Kreis-Signaturen durch Sprite-Icons ersetzen (assets/sprites/mapping.csv),
        Kirche/Kapelle/Stift nur als Icon, Gipfel Icon + Name + Hoehe, Hauptorte mit Ortspunkt,
      - Attribution je Quelle vereinheitlicht.
  * Legende und Layergruppen fuer die Bedienung stehen in metadata["mapx:legend"] / ["mapx:groups"],
    index.html liest sie von dort (keine doppelte Pflege).

Nur Standardbibliothek. Beendet sich mit Fehler, wenn ein Fragment fehlt, ein Fontstack unbekannt ist
oder ein Icon nicht im Sprite (mapping.csv) steht.
"""
import argparse
import copy
import csv
import json
import os
import re
import sys

TILES = "https://tiles.mapx.at"
CCBY = '<a href="https://creativecommons.org/licenses/by/4.0/deed.de" target="_blank" rel="noopener">CC BY 4.0</a>'


def a(href, text):
    return '<a href="%s" target="_blank" rel="noopener">%s</a>' % (href, text)


# Attribution je Quelle (ersetzt die Texte der Fragmente)
ATTRIBUTION = {
    "dkm": a("https://www.bev.gv.at", "BEV – DKM") + ", " + CCBY,
    "gip": a("https://www.gip.gv.at", "GIP.at") + ", " + CCBY,
    "ggn": a("https://www.data.gv.at/katalog/datasets/c2287ccb-f44c-48cd-bf7c-ac107b771246", "BMLUK – GGN v19") + ", " + CCBY,
    "grenzen": a("https://www.bev.gv.at", "BEV – Verwaltungsgrenzen") + ", " + CCBY,
    "geonamen": a("https://www.bev.gv.at", "BEV – Geographische Namen") + " (Gipfelauswahl: "
                + a("https://basemap.at", "basemap.at") + "), " + CCBY,
    "adr": a("https://www.bev.gv.at", "BEV – Adressregister") + ", " + CCBY
           + ", © Österreichisches Adressregister, Stichtagsdaten vom 01.10.2026",
    "oev": a("https://www.gip.gv.at", "GIP.at") + " (Bahn), " + CCBY + "; Flugplätze: "
           + a("https://www.wikidata.org", "Wikidata") + ", CC0",
    "relief": a("https://data.bev.gv.at/geonetwork/srv/ger/catalog.search#/metadata/5ce253fc-b7c5-4362-97af-6556c18a45d9",
                "BEV – ALS-DTM 1 m") + " (Stichtag 15.09.2025), " + CCBY,
    "basemap": a("https://basemap.at", "basemap.at") + ", " + CCBY,
}
ATTRIBUTION["hoehenlinien"] = ATTRIBUTION["relief"]

# Quellen-ID im Style -> (PMTiles-Datei, Query-Parameter in index.html)
SOURCES = {
    "dkm": "dkm-nutzung.pmtiles",
    "gip": "gip-strassen.pmtiles",
    "ggn": "ggn-gewaesser.pmtiles",
    "grenzen": "grenzen.pmtiles",
    "geonamen": "geonamen.pmtiles",
    "adr": "adr-hausnummern.pmtiles",
    "oev": "oev.pmtiles",
    "relief": "relief-terrainrgb.pmtiles",
    "hoehenlinien": "hoehenlinien.pmtiles",
}

FRAGMENTS = {
    "ggn": "ggn/style/ggn-layers.json",
    "grenzen": "grenzen/style/grenzen-layers.json",
    "geonamen": "geonamen/style/geonamen-layers.json",
    "adr": "adressen/style/housenumber-layers.json",
    "oev": "oev/style/oev-layers.json",
    "relief": "relief/style/relief-layers.json",
}

# Fontstack-Ersatz: Open Sans -> Noto Sans (einheitliche Schrift)
FONT_REPLACE = {
    "Open Sans Regular": "Noto Sans Regular", "Open Sans Italic": "Noto Sans Italic",
    "Open Sans Semibold": "Noto Sans SemiBold", "Open Sans Semibold Italic": "Noto Sans SemiBold Italic",
    "Open Sans Bold": "Noto Sans Bold", "Open Sans Bold Italic": "Noto Sans Bold Italic",
}
# Schnitte wie basemap.at (dort Roboto): Gelaende-/Gebietsnamen Medium Italic
FONT_OVERRIDE = {
    "geonamen-gelaende": ["Noto Sans Medium Italic"],
    "geonamen-gebiet": ["Noto Sans Medium Italic"],
}

# ------------------------------------------------------------------ Basis: DKM-Nutzung
# namecat = basemap.at-Klasse (int 1-12). Farben = basemap.at-Farbe mit Deckkraft 0,25 ueber dem
# Hintergrund vorgemischt (basemap.at legt sie ueber ein Relief), Siedlung deckend.
CATS = [
    [1, "#e0e0de", "Siedlung"],
    [2, "#daeacc", "Grünfläche"],
    [3, "#f3f7dd", "Landwirtschaft"],
    [5, "#cae4b7", "Wald"],
    [6, "#d5f3f2", "Gletscher"],
    [7, "#f8f7f2", "Verkehr, Sonstiges"],
    [8, "#f0f0ec", "Fels, Geröll"],
    [9, "#e2f7cf", "Gewässerrand, Feuchtgebiet"],
    [10, "#dfd6c6", "Friedhof"],
    [11, "#d2ddc6", "Freizeitfläche"],
    [12, "#e8e7c8", "Weingarten"],
]
# Originalfarben basemap.at (fill-opacity 0,25 ueber dem Relief), Siedlung deckend mit Zoomverlauf
RAW = {2: "#88CC66", 3: "#EBFFAA", 5: "#47B312", 6: "#73F0FF", 7: "#FFFFFF", 8: "#DCE4E4",
       9: "#A4FF73", 10: "#997D4D", 11: "#66994D", 12: "#BFBF57"}
LANDUSE_OPACITY = 0.25
WATER = "#b3d9ff"                     # basemap.at water_a, deckend
WATER_USAGE = [59, 60]                # FIG: fliessende / stehende Gewaesser (namecat 9)
BUILDING, BUILDING_LINE, FALLBACK = "#EDCACA", "#CC8F8F", "#ecebe6"   # basemap.at building_a_fill/_outline
BACKGROUND = "#efefee"               # Flachland-Ton des grauen basemap.at-Reliefs

# ------------------------------------------------------------------ Basis: GIP-Strassen
# Farben, Breiten, Zoomstufen und Zeichenreihenfolge wie der basemap.at-Vektorstyle "basemap-at-farbe"
# (https://basemap.wien.gv.at/basemap-download/webapp/api/styles/basemap-at-farbe, Layer gip_* / giptunnel_* /
# gipbruecke_*). basemap.at interpoliert linear ("stops"), Casing-Breite = Gesamtbreite (nicht Fuellung + x).
# [Klasse, Fuellung, Casing, Breite Fuellung je Zoom, Legendentext, Breite Casing je Zoom, Deckkraft je Zoom|None,
#  Tunnel-Fuellung]
ROADS = [
    ["motorway", "#FFD37F", "#CD8966",
     [[8, 4.2], [10, 4.8], [11, 5], [12, 5.5], [13, 6], [14, 6.5], [15, 7.5], [16, 9.5], [17, 11.5], [18, 13.5]],
     "Autobahn, Schnellstraße",
     [[8, 5.7], [10, 6], [11, 6.5], [12, 7], [13, 7.5], [14, 8], [15, 9], [16, 11], [17, 13], [18, 15]], None, "#FFF2D9"],
    ["motorway_link", "#FFEBAF", "#CDAA66",
     [[8, 1.5], [10, 1.5], [11, 2.5], [12, 2], [13, 2.5], [14, 3], [15, 4.5], [16, 4.75], [17, 5.5], [18, 6.5]],
     "Rampe",
     [[8, 3], [10, 3], [12, 3.5], [13, 4], [14, 4.5], [15, 6], [16, 6], [17, 7], [18, 8]], None, "#FFF2D9"],
    ["primary", "#FFFF99", "#CDAA66",
     [[8, 3.1], [9, 3.2], [10, 3.8], [11, 3.5], [12, 5], [13, 5.5], [14, 6], [15, 7.5], [16, 9], [17, 11], [18, 13]],
     "Landesstraße B",
     [[8, 5.2], [9, 5.7], [10, 6], [12, 6.5], [13, 7], [14, 7.5], [15, 9], [16, 10.5], [17, 12.5], [18, 14.5]], None, "#FFFFD9"],
    ["secondary", "#FFFFFF", "#B2B2B2",
     [[10, 3.4], [12, 3.5], [13, 4.5], [14, 5], [15, 7], [16, 8], [17, 10], [18, 12]],
     "Landesstraße L, Verbindungsstraße",
     [[10, 4.5], [11, 4.5], [12, 5], [13, 6], [14, 6.5], [15, 8.5], [16, 9.5], [17, 11.5], [18, 13.5]], None, "#F2F2F2"],
    ["minor", "#FFFFFF", "#B2B2B2",
     [[12, 1.5], [13, 2], [14, 3.5], [15, 5], [16, 6], [17, 8.5], [18, 10.5]],
     "Gemeindestraße",
     [[12, 3], [13, 3.5], [14, 5], [15, 6.5], [16, 7.5], [17, 10], [18, 11]], [[11, 0.2], [13, 1]], "#F2F2F2"],
    ["pedestrian", "#FFDCF0", "#B2B2B2",
     [[16, 4.75], [17, 5.5], [18, 6.5]], "Fußgängerzone",
     [[16, 6], [17, 7], [18, 8]], None, "#EBEBEB"],
]
# Wege ohne Casing: [Klasse, Farbe, Breiten, Strichmuster|None, Legendentext]
# basemap.at: Zufahrt/Güterweg (12010 "beschränkt befahrbar") grau durchgezogen ab z15, Fuß-/Rad-/Wanderwege
# und Stiegen einheitlich grau gestrichelt ab z15 (gip_footpath)
WAY_W = [[15, 1], [16, 1.5], [17, 2], [18, 2.5]]
WAYS = [
    ["service", "#B9B9B9", [[15, 2], [16, 2], [17, 3], [18, 4]], None, "Zufahrt, Parkplatz"],
    ["track", "#B9B9B9", [[15, 2], [16, 2], [17, 3], [18, 4]], None, "Güter-, Forst-, Feldweg"],
    ["path", "#9C9C9C", WAY_W, [0.7, 1.2], "Fußweg, Geh- und Radweg"],
    ["cycleway", "#9C9C9C", WAY_W, [0.7, 1.2], "Radweg"],
    ["steps", "#9C9C9C", WAY_W, [0.7, 1.2], "Stiege"],
    ["trail", "#9C9C9C", WAY_W, [0.7, 1.2], "Wanderweg, Steig"],
]
BRIDGE_CASING = "#4D3D25"             # basemap.at gipbruecke_*_outline
BRIDGE_MINZOOM = 16                   # basemap.at zeichnet Bruecken erst ab z16 gesondert


def width_expr(stops, add=0, mul=1):
    """lineare Interpolation wie die basemap.at-"stops" (base 1)"""
    e = ["interpolate", ["linear"], ["zoom"]]
    for z, w in stops:
        e += [z, round(w * mul + add, 3)]
    return e


def opacity_expr(stops):
    return width_expr(stops) if stops else 1


def gip(lid, cls, brunnel_filter, minzoom, layout, paint):
    lyr = {"id": lid, "type": "line", "source": "gip", "source-layer": "gip_l", "minzoom": minzoom,
           "filter": ["all", ["==", ["get", "draw_class"], cls], brunnel_filter]}
    if layout:
        lyr["layout"] = layout
    lyr["paint"] = paint
    return lyr


def road_layers():
    """-> (tunnel, ebenerdig, bruecken): basemap.at-Reihenfolge Tunnel < Grenzen < Strassen < Bahn < Gebaeude < Bruecken"""
    T, G, B = [], [], []
    isb = lambda b: ["==", ["get", "brunnel"], b]
    notunnel = ["!=", ["get", "brunnel"], "tunnel"]
    # 1. Tunnel: Casing in Klassenfarbe gestrichelt [0.7, 0.3], Fuellung blass, volle Deckkraft
    for c, fill, casing, w, _, cw, op, tfill in ROADS:
        T.append(gip("road-tunnel-casing-" + c, c, isb("tunnel"), cw[0][0], None,
                     {"line-color": casing, "line-width": width_expr(cw), "line-dasharray": [0.7, 0.3],
                      "line-opacity": opacity_expr(op)}))
    for c, fill, casing, w, _, cw, op, tfill in ROADS:
        T.append(gip("road-tunnel-" + c, c, isb("tunnel"), w[0][0], {"line-cap": "butt"},
                     {"line-color": tfill, "line-width": width_expr(w), "line-opacity": opacity_expr(op)}))
    for c, col, w, _, _ in WAYS:
        T.append(gip("way-tunnel-" + c, c, isb("tunnel"), w[0][0], None,
                     {"line-color": "#B2B2B2", "line-width": width_expr(w), "line-dasharray": [0.7, 0.3]}))
    # 2. Wege (ebenerdig und Bruecke; basemap.at hebt Wege-Bruecken nicht hervor)
    for c, col, w, dash, _ in WAYS:
        p = {"line-color": col, "line-width": width_expr(w)}
        if dash:
            p["line-dasharray"] = dash
        G.append(gip("way-" + c, c, notunnel, w[0][0], {"line-cap": "butt", "line-join": "round"}, p))
    # 3. Ebenerdig inkl. Bruecken (unter z16 sehen Bruecken wie Strassen aus): erst alle Casings, dann Fuellungen
    for c, fill, casing, w, _, cw, op, _t in reversed(ROADS):
        G.append(gip("road-casing-" + c, c, notunnel, cw[0][0], {"line-cap": "round", "line-join": "round"},
                     {"line-color": casing, "line-width": width_expr(cw), "line-opacity": opacity_expr(op)}))
    for c, fill, casing, w, _, cw, op, _t in reversed(ROADS):
        G.append(gip("road-" + c, c, notunnel, w[0][0], {"line-cap": "round", "line-join": "round"},
                     {"line-color": fill, "line-width": width_expr(w), "line-opacity": opacity_expr(op)}))
    # 4. Bruecken ab z16 ueber den Gebaeuden: dunkles Casing (+2,5 px), Fuellung +1 px (gipbruecke_*)
    for c, fill, casing, w, _, cw, op, _t in reversed(ROADS):
        bz = [[z, v] for z, v in w if z >= BRIDGE_MINZOOM] or [[BRIDGE_MINZOOM, w[-1][1]]]
        B.append(gip("road-bridge-casing-" + c, c, isb("bridge"), BRIDGE_MINZOOM, {"line-cap": "butt", "line-join": "round"},
                     {"line-color": BRIDGE_CASING, "line-width": width_expr(bz, 3.5)}))
        B.append(gip("road-bridge-" + c, c, isb("bridge"), BRIDGE_MINZOOM, {"line-cap": "butt", "line-join": "round"},
                     {"line-color": fill, "line-width": width_expr(bz, 1)}))
    return T, G, B


# Strassenbeschriftung wie basemap.at (giplabel_*): Nummern als Punktbeschriftung mit breitem Halo ("Schild"),
# Namen entlang der Linie in Roboto Medium (hier Noto Sans Medium), Halo in Strassenfarbe bzw. weiss
def _ref(lid, classes, minzoom, color, halo):
    return {"id": lid, "type": "symbol", "source": "gip", "source-layer": "gip_l", "minzoom": minzoom,
            "filter": ["all", ["has", "ref"], ["in", ["get", "draw_class"], ["literal", classes]]],
            # basemap.at: symbol-placement point (MapLibre setzt dabei auf GIP-Linien kaum Labels) -> entlang der
            # Linie mit grossem Abstand, aber waagrecht (viewport) wie ein Schild
            "layout": {"symbol-placement": "line", "symbol-spacing": 400, "text-rotation-alignment": "viewport",
                       "text-field": ["get", "ref"], "text-font": ["Noto Sans Bold"],
                       "text-size": ["interpolate", ["linear"], ["zoom"], 15, 10, 16, 12], "text-padding": 30,
                       "symbol-sort-key": 100},
            "paint": {"text-color": color, "text-halo-color": halo, "text-halo-width": 6}}


def _name(lid, classes, minzoom, color, halo, sizes, spacing):
    return {"id": lid, "type": "symbol", "source": "gip", "source-layer": "gip_l", "minzoom": minzoom,
            "filter": ["all", ["has", "name"], ["==", ["get", "brunnel"], "none"],
                       ["in", ["get", "draw_class"], ["literal", classes]]],
            "layout": {"symbol-placement": "line", "symbol-spacing": spacing, "text-field": ["get", "name"],
                       "text-font": ["Noto Sans Medium"], "text-size": width_expr(sizes), "text-padding": 1},
            "paint": {"text-color": color, "text-halo-color": halo, "text-halo-width": 0.8}}


ROAD_LABELS = [
    _name("road-name-minor", ["secondary", "minor", "pedestrian", "service"], 12, "#4E4E4E", "#FFFFFF",
          [[12, 9], [15, 9], [16, 11.5], [18, 13]], 300),
    _name("road-name-primary", ["primary"], 11, "#730000", "#FFFF99", [[11, 9], [14, 10], [16, 12]], 450),
    _name("road-name-motorway", ["motorway"], 10, "#730000", "#FFD37F", [[10, 9], [14, 10], [16, 12]], 850),
    _ref("road-ref-secondary", ["secondary"], 11, "#000000", "#FFFFFF"),
    _ref("road-ref-primary", ["primary"], 9, "#730000", "#FFFF73"),
    _ref("road-ref-motorway", ["motorway"], 8, "#FFFFFF", "#0064C8"),
]


def base_bottom(relief):
    color = ["match", ["get", "namecat"]]
    for n, c in RAW.items():
        color += [n, c]
    color.append(FALLBACK)
    return [
        {"id": "bg", "type": "background", "paint": {"background-color": BACKGROUND}},
    ] + relief + [
        {"id": "basemap", "type": "raster", "source": "basemap", "layout": {"visibility": "none"},
         "paint": {"raster-opacity": 0.6}},
        # wie basemap.at: alle Klassen ausser Siedlung mit 25 % Deckkraft ueber dem Relief
        {"id": "landuse", "type": "fill", "source": "dkm", "source-layer": "landuse_a",
         "filter": ["!=", ["get", "namecat"], 1],
         "paint": {"fill-color": color, "fill-opacity": LANDUSE_OPACITY, "fill-antialias": False}},
        # Gewaesserflaechen der DKM (FIG 59/60) in basemap.at-Blau ueber namecat 9; GGN water_a folgt darueber
        {"id": "water-dkm", "type": "fill", "source": "dkm", "source-layer": "landuse_a",
         "filter": ["in", ["get", "usage"], ["literal", WATER_USAGE]],
         "paint": {"fill-color": WATER, "fill-antialias": False}},
    ]


def base_settlement():
    # Siedlung deckend, nach dem Wasser gezeichnet (basemap.at), Farbe z10 #D1D1CF -> z14 #F2F2F0
    return [
        {"id": "landuse-siedlung", "type": "fill", "source": "dkm", "source-layer": "landuse_a",
         "filter": ["==", ["get", "namecat"], 1],
         "paint": {"fill-color": ["interpolate", ["linear"], ["zoom"], 10, "#D1D1CF", 14, "#F2F2F0"],
                   "fill-opacity": 1, "fill-antialias": False}},
        # basemap.at landuse_settlement_outline: Umriss der Siedlungsflaechen ab z15 (einzige Nutzungsgrenze)
        {"id": "landuse-siedlung-line", "type": "line", "source": "dkm", "source-layer": "landuse_a", "minzoom": 15,
         "filter": ["==", ["get", "namecat"], 1],
         "paint": {"line-color": ["interpolate", ["linear"], ["zoom"], 15, "#C7C7C4", 17, "#D9D9D6"], "line-width": 0.7}},
    ]


def base_buildings():
    return [
        # basemap.at: Gebaeude ab z13 rosa, Umriss erst ab z16 (0,09 px) bzw. z17 (0,4 px), ueber Strassen und Bahn
        {"id": "building", "type": "fill", "source": "dkm", "source-layer": "building_a", "minzoom": 13,
         "paint": {"fill-color": BUILDING, "fill-antialias": True}},
        {"id": "building-line", "type": "line", "source": "dkm", "source-layer": "building_a", "minzoom": 16,
         "paint": {"line-color": BUILDING_LINE,
                   "line-width": ["interpolate", ["linear"], ["zoom"], 16, 0.09, 17, 0.4, 19, 2.5]}},
    ]


def base_parcels():
    # Grundstuecksgrenzen gibt es bei basemap.at nicht: nur ab z16, zart unter den Strassen
    return [
        {"id": "parcel", "type": "line", "source": "dkm", "source-layer": "parcel_l", "minzoom": 16,
         "paint": {"line-color": "rgba(110,95,85,.3)",
                   "line-width": ["interpolate", ["linear"], ["zoom"], 16, 0.3, 18, 0.8]}},
    ]


# ------------------------------------------------------------------ Fragmente
def load_fragment(vt, key):
    path = os.path.join(vt, FRAGMENTS[key])
    if not os.path.isfile(path):
        sys.exit("Fragment fehlt: " + path)
    with open(path, encoding="utf-8") as f:
        frag = json.load(f)
    layers = frag["layers"]
    srcs = list(frag.get("sources", {}).keys())
    if len(srcs) > 1:
        return layers  # mehrere Quellen (relief + hoehenlinien): IDs beibehalten
    for lyr in layers:
        if lyr.get("source") in srcs:
            lyr["source"] = key  # Quellen-ID vereinheitlichen (z. B. adr-hausnummern -> adr)
    return layers


def load_fonts(vt):
    path = os.path.join(vt, "assets/fonts/fontstacks.csv")
    with open(path, encoding="utf-8") as f:
        return {r["fontstack"] for r in csv.DictReader(f, delimiter=";")}


def load_icons(vt):
    """mapping.csv -> (Menge der Icons, Standard-Icon je Klasse in Dateireihenfolge)"""
    path = os.path.join(vt, "assets/sprites/mapping.csv")
    icons, by_class = set(), {}
    with open(path, encoding="utf-8") as f:
        for r in csv.DictReader(f, delimiter=";"):
            icons.add(r["icon"])
            for c in r["class"].split("/"):
                if c and c != "-":
                    by_class.setdefault((r["layer"], c), r["icon"])
    return icons, by_class


def fix_fonts(layers, fonts, log):
    def walk(v):
        if isinstance(v, list):
            if v and all(isinstance(s, str) for s in v) and any(s in fonts or s in FONT_REPLACE or " Sans " in s for s in v):
                out = []
                for s in v:
                    s2 = FONT_REPLACE.get(s, s)
                    if s2 not in fonts:
                        sys.exit("Unbekannter Fontstack '%s' (vorhanden: %s)" % (s, ", ".join(sorted(fonts))))
                    if s2 != s:
                        log.append("Font %s -> %s" % (s, s2))
                    out.append(s2)
                return out
            return [walk(x) for x in v]
        return v

    for lyr in layers:
        lay = lyr.get("layout", {})
        if lyr["id"] in FONT_OVERRIDE and "text-font" in lay:
            lay["text-font"] = FONT_OVERRIDE[lyr["id"]]
        if "text-font" in lay:
            lay["text-font"] = walk(lay["text-font"])


TERRAIN = ["ried", "gebiet", "gebirge", "tal", "bergteil", "pass", "gletscher"]
ICON_ONLY = ["kirche", "kapelle"]  # wie basemap.at: nur Symbol, kein Text
# Namensabhaengige Feinzuordnung innerhalb einer Klasse (Teilstring im Namen -> Icon)
NAME_ICONS = {
    "kirche": [("Stift", "monastery"), ("Kloster", "monastery")],
    "turm": [("warte", "observation_tower"), ("Warte", "observation_tower")],
    "forst": [("Jagd", "hunting_lodge")],
    "huette": [("Biwak", "bivouac")],
    "kleindenkmal": [("kreuz", "wayside_cross"), ("Kreuz", "wayside_cross")],
    "sport": [("Stadion", "stadium")],
    "kultur": [("museum", "museum"), ("Museum", "museum"), ("bühne", "theatre"), ("Bühne", "theatre")],
}
CLASS_ICON_OVERRIDE = {"sport": "sports", "kultur": "archaeological_site"}


def icon_expr(classes, by_class, icons, log):
    """match-Ausdruck class -> Icon (mit Namensregeln)"""
    expr = ["match", ["get", "class"]]
    for c in classes:
        default = CLASS_ICON_OVERRIDE.get(c) or by_class[("geoname_p", c)]
        rules = NAME_ICONS.get(c, [])
        val = default
        if rules:
            val = ["case"]
            for sub, ic in rules:
                val += [["in", sub, ["get", "name"]], ic]
            val.append(default)
        for ic in [default] + [r[1] for r in rules]:
            if ic not in icons:
                sys.exit("Icon '%s' fehlt in mapping.csv" % ic)
        expr += [c, val]
    expr.append(by_class[("geoname_p", classes[0])])
    return expr


def geonamen_icons(layers, by_class, icons, log):
    """Kreis-Signaturen der Geonamen durch Sprite-Icons ersetzen. Idempotent: Fragmente, die schon
    icon-image setzen, bleiben unveraendert."""
    if any("icon-image" in l.get("layout", {}) for l in layers):
        log.append("Geonamen-Fragment hat schon Icons, keine Nachbearbeitung")
        return layers
    punkt_maxzoom = {}
    out = []
    for l in layers:
        if l["type"] == "circle" and l.get("source-layer") in ("geoname_p", "summit_p", "district_capital_p", "country_capital"):
            punkt_maxzoom[l["source-layer"]] = l.get("maxzoom")
            log.append("Kreis %s entfernt (-> Icon)" % l["id"])
            continue
        out.append(l)
    poi_classes = [c for (lay, c) in by_class if lay == "geoname_p" and c not in TERRAIN]
    res = []
    for l in out:
        sl, lay = l.get("source-layer"), l.get("layout", {})
        if l["id"] == "geonamen-objekt":
            # a) Kirche/Kapelle/Stift: nur Icon
            only = copy.deepcopy(l)
            only["id"] = "geonamen-kirche"
            only["filter"] = ["in", ["get", "class"], ["literal", ICON_ONLY]]
            only["minzoom"] = max(l.get("minzoom", 0), 14)
            only["layout"] = {"icon-image": icon_expr(ICON_ONLY, by_class, icons, log),
                              "icon-size": ["interpolate", ["linear"], ["zoom"], 14, 0.9, 17, 1.15],
                              "icon-padding": 1, "symbol-sort-key": lay.get("symbol-sort-key", ["get", "rank"])}
            only["paint"] = {}
            res.append(only)
            # b) Objekte mit Icon + Name
            with_icon = [c for c in poi_classes if c not in ICON_ONLY]
            obj = copy.deepcopy(l)
            obj["filter"] = ["in", ["get", "class"], ["literal", with_icon]]
            obj["layout"].update({"icon-image": icon_expr(with_icon, by_class, icons, log),
                                  "icon-size": 0.9, "text-optional": True, "text-radial-offset": 0.95})
            res.append(obj)
            # c) Objekte ohne passendes Icon (sonstiges ...): nur Text
            rest = copy.deepcopy(l)
            rest["id"] = "geonamen-objekt-text"
            rest["filter"] = ["!", ["in", ["get", "class"], ["literal", TERRAIN + poi_classes]]]
            for k in ("text-variable-anchor", "text-radial-offset", "text-justify"):
                rest["layout"].pop(k, None)
            res.append(rest)
            log.append("geonamen-objekt -> geonamen-kirche (nur Icon), geonamen-objekt (Icon+Text), geonamen-objekt-text")
        elif sl == "summit_p" and l["type"] == "symbol":
            lay.update({"icon-image": "summit", "icon-size": 0.9})  # Icon nur mit Name (+ Hoehe)
            if lay.get("text-anchor") == "bottom":
                lay["text-offset"] = [0, -0.55]
            res.append(l)
            log.append("%s: Icon summit" % l["id"])
        elif sl in ("district_capital_p", "country_capital") and l["type"] == "symbol":
            # Ortspunkt bis zum maxzoom der Kreis-Signatur (sonst z12), danach nur der Name zentriert
            mz = punkt_maxzoom.get(sl) or 12
            low = copy.deepcopy(l)
            low["id"] = l["id"] + "-punkt"
            low["maxzoom"] = mz
            low["layout"].update({"icon-image": "place_capital", "icon-size": 0.9, "icon-allow-overlap": True,
                                  "text-anchor": "bottom", "text-offset": [0, -0.45]})
            high = copy.deepcopy(l)
            high["minzoom"] = max(l.get("minzoom", 0), mz)
            high["layout"].pop("text-anchor", None)
            high["layout"].pop("text-offset", None)
            res += [low, high]
            log.append("%s: Ortspunkt place_capital bis z%s" % (l["id"], mz))
        else:
            res.append(l)
    return res


# ------------------------------------------------------------------ Angleichung der Fragmente an basemap.at
BM_WATER = "rgba(179, 217, 255, 1)"   # basemap.at water_a/water_l: Linien in Flaechenfarbe, ohne Umriss
# GGN rank entspricht basemap.at water_l.namecat (1 Donau/Inn ... 7 Bach): [ab Zoom, Breiten]
WATER_RANK = {1: (6, [[6, 3], [18, 3]]), 2: (8, [[8, 3], [14, 4], [18, 5]]), 3: (8, [[8, 3], [14, 3.5], [18, 5]]),
              4: (10, [[10, 3], [14, 3.2], [18, 4.7]]), 5: (10, [[10, 3], [14, 3], [18, 4.5]]),
              6: (12, [[12, 3], [14, 3], [18, 4.2]]), 7: (15, [[15, 2], [16, 2.5], [18, 3]])}


def align_ggn(layers):
    """GGN-Gewaesser wie basemap.at: Linienfarbe = Flaechenfarbe, Breite/Mindestzoom je Rang (water_l_river1-7)"""
    width = ["interpolate", ["linear"], ["zoom"]]
    for z in range(6, 19):
        m = ["match", ["get", "rank"]]
        for r, (mz, st) in WATER_RANK.items():
            v = st[0][1] if z <= st[0][0] else st[-1][1]
            for (z0, v0), (z1, v1) in zip(st, st[1:]):
                if z0 <= z <= z1:
                    v = round(v0 + (z - z0) / (z1 - z0) * (v1 - v0), 2)
            m += [r, v if z >= mz else 0]
        m.append(0)
        width += [z, m]
    for l in layers:
        p = l.setdefault("paint", {})
        if l["id"] == "ggn-water-a":
            p["fill-color"] = BM_WATER
            p.pop("fill-outline-color", None)
        elif l["type"] == "line" and l.get("source-layer") == "water_l":
            p["line-color"] = BM_WATER
            p["line-width"] = width
            p.pop("line-opacity", None)
            if "tunnel" not in l["id"]:
                l.setdefault("layout", {})["line-cap"] = "round"
            else:
                p["line-dasharray"] = [1, 1]
    return layers


def align_oev(layers):
    """Bahn wie basemap.at gip_railway: durchgehend braun, ohne weisse Striche, Breite 1,2 (z8) .. 5 (z15);
    Bruecken erst ab z16 (dunkles Casing 14 px, weiss 10 px, Bahn 5 px obenauf)."""
    rail = [[6, 0.8], [8, 1.2], [9, 1.3], [10, 1.6], [11, 1.8], [12, 2.2], [12.7, 2.2], [13, 4.5], [14, 4.5],
            [15, 5], [16, 5], [17, 6], [18, 7]]
    siding = lambda z: round(0.3 + max(0, min(z, 16) - 12) / 4 * 1.7, 2)   # Abstellgleise 0,3 (z12) .. 2 px (z16)
    rail_w = ["interpolate", ["linear"], ["zoom"]]
    for z, v in rail:
        rail_w += [z, ["match", ["get", "service"], "siding", siding(z), v]]
    out = []
    for l in layers:
        if l["id"] == "oev-rail-dash":
            continue  # basemap.at hat keine weissen Striche
        p = l.setdefault("paint", {})
        if l["id"] in ("oev-rail", "oev-rail-tunnel"):
            p["line-width"] = rail_w
            if l["id"] == "oev-rail-tunnel":
                p["line-color"] = "rgba(217, 195, 173, 1)"
                p.pop("line-dasharray", None)
                p.pop("line-opacity", None)
        elif l["id"] == "oev-rail-bridge-casing":
            l["minzoom"] = 16
            p["line-width"] = ["interpolate", ["linear"], ["zoom"], 16, 14, 17, 15, 18, 16]
        elif l["id"] == "oev-rail-bridge-fill":
            l["minzoom"] = 16
            p["line-width"] = ["interpolate", ["linear"], ["zoom"], 16, 10, 17, 11, 18, 12]
        out.append(l)
    # Bahn auf der Bruecke obenauf (basemap.at gipbruecke_railway)
    rail = next((l for l in out if l["id"] == "oev-rail"), None)
    fill = next((l for l in out if l["id"] == "oev-rail-bridge-fill"), None)
    if rail and fill:
        top = copy.deepcopy(rail)
        top["id"] = "oev-rail-bridge-line"
        top["minzoom"] = 16
        top["filter"] = fill["filter"]
        out.insert(out.index(fill) + 1, top)
    return out


# ------------------------------------------------------------------ Zusammenbau
def build(vt, tiles):
    log = []
    fonts = load_fonts(vt)
    icons, by_class = load_icons(vt)
    frag = {k: load_fragment(vt, k) for k in FRAGMENTS}
    frag["geonamen"] = geonamen_icons(frag["geonamen"], by_class, icons, log)
    for l in frag["geonamen"]:   # basemap.at label_*_stadtteil: normale Schreibung, schwarz, 13 px (Roboto Light)
        if l["id"] == "geonamen-stadtteil":
            l["layout"].pop("text-transform", None)
            l["layout"].pop("text-letter-spacing", None)
            l["layout"]["text-size"] = ["interpolate", ["linear"], ["zoom"], 12, 12, 14, 13, 16, 15]
            l.setdefault("paint", {})["text-color"] = "#000000"
    for l in frag["adr"]:   # basemap.at label_housenumber_*: rotbraun, Roboto Medium
        if l["type"] == "symbol":
            l.setdefault("paint", {}).update({"text-color": "rgba(128, 51, 51, 1)", "text-halo-color": "rgba(250, 250, 250, 1)"})
            l.setdefault("layout", {})["text-font"] = ["Noto Sans Medium"]

    def split(layers):
        return [l for l in layers if l["type"] != "symbol"], [l for l in layers if l["type"] == "symbol"]

    ggn_geom, ggn_lab = split(frag["ggn"])
    gr_geom, gr_lab = split(frag["grenzen"])
    oev_geom, oev_lab = split(frag["oev"])
    # Relief: eigener Hintergrund entfaellt (bg uebernimmt den Flachland-Ton), Hillshade ganz unten,
    # Hoehenlinien ueber Nutzung/Wasser, Hoehenzahlen bei den Beschriftungen
    rel = [l for l in frag["relief"] if l["type"] != "background"]
    rel_shade = [l for l in rel if l["type"] == "hillshade"]
    rel_lines = [l for l in rel if l["type"] == "line"]
    rel_lab = [l for l in rel if l["type"] == "symbol"]
    road_t, road_g, road_b = road_layers()
    roads = road_t + road_g + road_b
    oev_geom = align_oev(oev_geom)
    # Bezirks-/Gemeindenamen als Flaechenbeschriftung gibt es bei basemap.at nicht: ausgeblendet (schaltbar)
    for l in gr_lab:
        if l["id"] in ("grenzen-label-bezirk", "grenzen-label-gemeinde"):
            l.setdefault("layout", {})["visibility"] = "none"
    ggn_geom = align_ggn(ggn_geom)
    oev_t = [l for l in oev_geom if "tunnel" in l["id"]]
    oev_b = [l for l in oev_geom if "bridge" in l["id"]]
    oev_g = [l for l in oev_geom if l not in oev_t and l not in oev_b]

    groups = {
        "water": ["water-dkm"] + [l["id"] for l in ggn_geom],
        "buildings": ["building", "building-line"],
        "parcels": ["parcel"],
        "roads": [l["id"] for l in roads] + [l["id"] for l in ROAD_LABELS]
                 + [l["id"] for l in oev_geom + oev_lab],
        "boundaries": [l["id"] for l in gr_geom + gr_lab],
        "housenumbers": [l["id"] for l in frag["adr"]],
        "labels": [l["id"] for l in ggn_lab + frag["geonamen"]],
        "relief": [l["id"] for l in rel],
    }
    # Zeichenreihenfolge (unten -> oben) wie basemap.at-farbe: Nutzung < Wasser < Siedlung < Tunnel < Grenzen
    # < Strassen < Bahn < Gebaeude < Bruecken < Beschriftung
    layers = (base_bottom(rel_shade)      # Hintergrund, Hillshade, Raster, landuse, DKM-Gewaesser
              + ggn_geom                   # water_a, water_l
              + base_settlement()          # Siedlung deckend (nach dem Wasser, wie basemap.at)
              + rel_lines                  # Hoehenlinien (gibt es bei basemap-at-farbe nicht)
              + base_parcels()             # Grundstuecke (nur mapx)
              + road_t + oev_t             # Tunnel (Strasse, Bahn)
              + gr_geom                    # Grenzen unter den Strassen (basemap.at border_* vor gip_*)
              + road_g                     # Wege, Casing, Fuellung (inkl. Bruecken unter z16)
              + oev_g                      # Bahn, Seilbahn ...
              + base_buildings()           # Gebaeude ueber Strassen/Bahn (basemap.at building_a nach gip_*)
              + road_b + oev_b             # Bruecken ab z16 obenauf
              + frag["adr"]                # Hausnummern
              + ROAD_LABELS                # Strassennummern/-namen
              + ggn_lab                    # Gewaessernamen
              + gr_lab                     # Grenz-/Verwaltungsnamen
              + oev_lab                    # Bahnhoefe, Flugplaetze
              + rel_lab                    # Hoehenzahlen
              + frag["geonamen"])          # Gelaende, Objekte, Gipfel, Orte, Hauptorte zuletzt

    fix_fonts(layers, fonts, log)
    ids = [l["id"] for l in layers]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup:
        sys.exit("Doppelte Layer-IDs: %s" % ", ".join(sorted(dup)))
    used = {l.get("source") for l in layers} - {None}

    sources = {
        "basemap": {"type": "raster",
                    "tiles": ["https://mapsneu.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png"],
                    "tileSize": 256, "maxzoom": 19, "attribution": ATTRIBUTION["basemap"]},
    }
    for sid, fn in SOURCES.items():
        if sid in used:
            sources[sid] = {"type": "vector", "url": "pmtiles://%s/%s" % (tiles, fn), "attribution": ATTRIBUTION[sid]}
            if sid == "relief":
                sources[sid].update({"type": "raster-dem", "encoding": "mapbox", "tileSize": 512})

    style = {
        "version": 8,
        "name": "mapx.at Vektor-Basemap",
        "metadata": {
            "mapx:generator": "landing/tools/build_style.py – nicht von Hand bearbeiten",
            "mapx:groups": groups,
            "mapx:legend": {
                "landuse": [[c, t] for _, c, t in CATS] + [[WATER, "Gewässer"]],
                "namecat": {str(n): t for n, _, t in CATS},
                "building": [BUILDING, BUILDING_LINE, "Gebäude"],
                "roads": [[r[4], r[1], r[2], False] for r in ROADS if r[0] not in ("motorway_link", "pedestrian")]
                         + [[w[4], None, w[1], True] for w in WAYS if w[0] != "steps"],
                "roadLabels": dict([(r[0], r[4]) for r in ROADS] + [(w[0], w[4]) for w in WAYS]),
            },
        },
        "glyphs": tiles + "/fonts/{fontstack}/{range}.pbf",
        "sprite": [{"id": "default", "url": tiles + "/sprites/sprite"},
                   {"id": "sdf", "url": tiles + "/sprites/sprite-sdf"}],
        "sources": sources,
        "layers": layers,
    }
    return style, log


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--vt", default=os.path.join(here, "..", "..", "vector-tiles"),
                    help="Pfad zum Repo mapx-at/vector-tiles (Standard: ../vector-tiles neben landing)")
    ap.add_argument("--out", default=os.path.join(here, "..", "style.json"))
    ap.add_argument("--tiles", default=TILES, help="Basis-URL fuer PMTiles, Fonts, Sprites")
    ap.add_argument("-v", "--verbose", action="store_true")
    args = ap.parse_args()
    style, log = build(os.path.abspath(args.vt), args.tiles.rstrip("/"))
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(style, f, ensure_ascii=False, indent=1)
        f.write("\n")
    if args.verbose:
        print("\n".join(sorted(set(log))), file=sys.stderr)
    print("%s: %d Layer, %d Quellen" % (os.path.relpath(args.out), len(style["layers"]), len(style["sources"])),
          file=sys.stderr)


if __name__ == "__main__":
    main()
