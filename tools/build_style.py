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
    "basemap": a("https://basemap.at", "basemap.at") + ", " + CCBY,
}

# Quellen-ID im Style -> (PMTiles-Datei, Query-Parameter in index.html)
SOURCES = {
    "dkm": "dkm-nutzung.pmtiles",
    "gip": "gip-strassen.pmtiles",
    "ggn": "ggn-gewaesser.pmtiles",
    "grenzen": "grenzen.pmtiles",
    "geonamen": "geonamen.pmtiles",
    "adr": "adr-hausnummern.pmtiles",
    "oev": "oev.pmtiles",
}

FRAGMENTS = {
    "ggn": "ggn/style/ggn-layers.json",
    "grenzen": "grenzen/style/grenzen-layers.json",
    "geonamen": "geonamen/style/geonamen-layers.json",
    "adr": "adressen/style/housenumber-layers.json",
    "oev": "oev/style/oev-layers.json",
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
WATER = "#b3d9ff"                     # basemap.at water_a, deckend
WATER_USAGE = [59, 60]                # FIG: fliessende / stehende Gewaesser (namecat 9)
BUILDING, BUILDING_LINE, FALLBACK = "#a8968a", "#7d6d62", "#ecebe6"
BACKGROUND = "#f6f4ee"

# ------------------------------------------------------------------ Basis: GIP-Strassen
# [Klasse, Fuellung, Casing, Breite der Fuellung je Zoom, Legendentext]
ROADS = [
    ["motorway", "#ffd37f", "#cd8966", [[8, 1.4], [10, 2.2], [12, 3], [14, 5], [16, 9], [18, 16]], "Autobahn, Schnellstraße"],
    ["motorway_link", "#ffebaf", "#cdaa66", [[10, 0.8], [12, 1.4], [14, 2.5], [16, 4.5], [18, 8]], "Rampe"],
    ["primary", "#ffff99", "#cdaa66", [[8, 1], [10, 1.6], [12, 2.5], [14, 4.5], [16, 8], [18, 14]], "Landesstraße B"],
    ["secondary", "#ffffff", "#a8a8a8", [[10, 1], [12, 2], [14, 3.8], [16, 7], [18, 12]], "Landesstraße L, Verbindungsstraße"],
    ["minor", "#ffffff", "#b2b2b2", [[12, 0.8], [13, 1.2], [14, 2.4], [16, 5], [18, 10]], "Gemeindestraße"],
    ["service", "#ffffff", "#c4c4c4", [[14, 0.8], [16, 2.2], [18, 5]], "Zufahrt, Parkplatz"],
    ["pedestrian", "#f1ece6", "#b2b2b2", [[14, 1.5], [16, 4.5], [18, 9]], "Fußgängerzone"],
]
# Wege ohne Casing: [Klasse, Farbe, Breiten, Strichmuster|None, Legendentext]
WAYS = [
    ["track", "#a89f91", [[14, 0.8], [16, 1.6], [18, 3]], [4, 1.5], "Güter-, Forst-, Feldweg"],
    ["path", "#8f8f8f", [[15, 0.7], [16, 1.1], [18, 2]], [2, 1.5], "Fußweg, Geh- und Radweg"],
    ["cycleway", "#4f7fc0", [[15, 0.8], [16, 1.2], [18, 2.2]], [2, 1.5], "Radweg"],
    ["steps", "#7f7f7f", [[15, 1.5], [16, 2.5], [18, 4]], [0.4, 0.4], "Stiege"],
    ["trail", "#9b6b43", [[15, 0.7], [16, 1.1], [18, 2]], [3, 2], "Wanderweg, Steig"],
]


def width_expr(stops, add=0, mul=1):
    e = ["interpolate", ["exponential", 1.4], ["zoom"]]
    for z, w in stops:
        e += [z, round(w * mul + add, 3)]
    return e


def gip(lid, cls, brunnel_filter, minzoom, layout, paint):
    lyr = {"id": lid, "type": "line", "source": "gip", "source-layer": "gip_l", "minzoom": minzoom,
           "filter": ["all", ["==", ["get", "draw_class"], cls], brunnel_filter]}
    if layout:
        lyr["layout"] = layout
    lyr["paint"] = paint
    return lyr


def road_layers():
    L = []
    isb = lambda b: ["==", ["get", "brunnel"], b]
    # 1. Tunnel unter allem: Casing gestrichelt, Fuellung blass
    for c, fill, casing, w, _ in ROADS:
        L.append(gip("road-tunnel-casing-" + c, c, isb("tunnel"), w[0][0], None,
                     {"line-color": casing, "line-width": width_expr(w, 1.5), "line-dasharray": [1.5, 1], "line-opacity": 0.8}))
        L.append(gip("road-tunnel-" + c, c, isb("tunnel"), w[0][0], {"line-cap": "butt"},
                     {"line-color": fill, "line-width": width_expr(w), "line-opacity": 0.55}))
    for c, col, w, _, _ in WAYS:
        L.append(gip("way-tunnel-" + c, c, isb("tunnel"), w[0][0], None,
                     {"line-color": col, "line-width": width_expr(w), "line-dasharray": [1, 1.5], "line-opacity": 0.5}))
    # 2. Wege (ebenerdig und Bruecke)
    for c, col, w, dash, _ in WAYS:
        p = {"line-color": col, "line-width": width_expr(w)}
        if dash:
            p["line-dasharray"] = dash
        L.append(gip("way-" + c, c, ["!=", ["get", "brunnel"], "tunnel"], w[0][0],
                     {"line-cap": "butt", "line-join": "round"}, p))
    # 3. Ebenerdig: erst alle Casings (niedrige Klassen zuerst), dann alle Fuellungen
    for c, fill, casing, w, _ in reversed(ROADS):
        L.append(gip("road-casing-" + c, c, isb("none"), w[0][0], {"line-cap": "round", "line-join": "round"},
                     {"line-color": casing, "line-width": width_expr(w, 1.5)}))
    for c, fill, casing, w, _ in reversed(ROADS):
        L.append(gip("road-" + c, c, isb("none"), w[0][0], {"line-cap": "round", "line-join": "round"},
                     {"line-color": fill, "line-width": width_expr(w)}))
    # 4. Bruecken obenauf: dunkleres, breiteres Casing mit flachen Enden
    for c, fill, casing, w, _ in reversed(ROADS):
        L.append(gip("road-bridge-casing-" + c, c, isb("bridge"), w[0][0], {"line-cap": "butt", "line-join": "round"},
                     {"line-color": "#5f5850", "line-width": width_expr(w, 4)}))
        L.append(gip("road-bridge-" + c, c, isb("bridge"), w[0][0], {"line-cap": "round", "line-join": "round"},
                     {"line-color": fill, "line-width": width_expr(w)}))
    return L


ROAD_LABELS = [
    {"id": "road-ref", "type": "symbol", "source": "gip", "source-layer": "gip_l", "minzoom": 11,
     "filter": ["all", ["has", "ref"], ["match", ["get", "draw_class"], ["motorway", "primary", "secondary"], True, False]],
     "layout": {"symbol-placement": "line", "symbol-spacing": 350, "text-field": ["get", "ref"],
                "text-font": ["Noto Sans Regular"], "text-size": 10.5, "text-rotation-alignment": "viewport",
                "text-keep-upright": True},
     "paint": {"text-color": "#5a1a00", "text-halo-color": "rgba(255,255,255,.95)", "text-halo-width": 1.6}},
    {"id": "road-name", "type": "symbol", "source": "gip", "source-layer": "gip_l", "minzoom": 15,
     "filter": ["all", ["has", "name"], ["!=", ["get", "brunnel"], "tunnel"],
                ["match", ["get", "draw_class"], ["motorway_link", "track", "path", "cycleway", "steps", "trail"], False, True]],
     "layout": {"symbol-placement": "line", "symbol-spacing": 250, "text-field": ["get", "name"],
                "text-font": ["Noto Sans Regular"], "text-size": ["interpolate", ["linear"], ["zoom"], 15, 10.5, 18, 13],
                "text-max-angle": 30, "text-padding": 2},
     "paint": {"text-color": "#3f3f3f", "text-halo-color": "rgba(255,255,255,.9)", "text-halo-width": 1.4}},
]


def base_bottom():
    color = ["match", ["get", "namecat"]]
    for n, c, _ in CATS:
        color += [n, c]
    color.append(FALLBACK)
    return [
        {"id": "bg", "type": "background", "paint": {"background-color": BACKGROUND}},
        {"id": "basemap", "type": "raster", "source": "basemap", "layout": {"visibility": "none"},
         "paint": {"raster-opacity": 0.6}},
        {"id": "landuse", "type": "fill", "source": "dkm", "source-layer": "landuse_a",
         "paint": {"fill-color": color, "fill-opacity": 0.85, "fill-antialias": False}},
        {"id": "landuse-line", "type": "line", "source": "dkm", "source-layer": "landuse_a", "minzoom": 14,
         "paint": {"line-color": "rgba(90,80,70,.25)",
                   "line-width": ["interpolate", ["linear"], ["zoom"], 14, 0.2, 18, 0.8]}},
        # Gewaesserflaechen der DKM (FIG 59/60) in basemap.at-Blau ueber namecat 9; GGN water_a folgt darueber
        {"id": "water-dkm", "type": "fill", "source": "dkm", "source-layer": "landuse_a",
         "filter": ["in", ["get", "usage"], ["literal", WATER_USAGE]],
         "paint": {"fill-color": WATER, "fill-antialias": False}},
    ]


def base_buildings():
    return [
        {"id": "building", "type": "fill", "source": "dkm", "source-layer": "building_a", "minzoom": 13,
         "paint": {"fill-color": BUILDING, "fill-opacity": 0.95}},
        {"id": "building-line", "type": "line", "source": "dkm", "source-layer": "building_a", "minzoom": 15,
         "paint": {"line-color": BUILDING_LINE, "line-width": 0.6}},
        {"id": "parcel", "type": "line", "source": "dkm", "source-layer": "parcel_l", "minzoom": 15,
         "paint": {"line-color": "rgba(110,95,85,.45)",
                   "line-width": ["interpolate", ["linear"], ["zoom"], 15, 0.3, 18, 0.9]}},
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


# ------------------------------------------------------------------ Zusammenbau
def build(vt, tiles):
    log = []
    fonts = load_fonts(vt)
    icons, by_class = load_icons(vt)
    frag = {k: load_fragment(vt, k) for k in FRAGMENTS}
    frag["geonamen"] = geonamen_icons(frag["geonamen"], by_class, icons, log)

    def split(layers):
        return [l for l in layers if l["type"] != "symbol"], [l for l in layers if l["type"] == "symbol"]

    ggn_geom, ggn_lab = split(frag["ggn"])
    gr_geom, gr_lab = split(frag["grenzen"])
    oev_geom, oev_lab = split(frag["oev"])
    roads = road_layers()

    groups = {
        "water": ["water-dkm"] + [l["id"] for l in ggn_geom],
        "buildings": ["building", "building-line"],
        "parcels": ["parcel"],
        "roads": [l["id"] for l in roads] + [l["id"] for l in ROAD_LABELS]
                 + [l["id"] for l in oev_geom + oev_lab],
        "boundaries": [l["id"] for l in gr_geom + gr_lab],
        "housenumbers": [l["id"] for l in frag["adr"]],
        "labels": [l["id"] for l in ggn_lab + frag["geonamen"]],
    }
    # Zeichenreihenfolge (unten -> oben)
    layers = (base_bottom()               # Hintergrund, Raster, landuse, DKM-Gewaesser
              + ggn_geom                   # water_a, water_l
              + base_buildings()           # Gebaeude, Grundstuecke
              + roads                      # Tunnel, Wege, Casing, Fuellung, Bruecken
              + oev_geom                   # Bahn, U-Bahn, Strassenbahn, Seilbahn
              + gr_geom                    # Grenzen
              + frag["adr"]                # Hausnummern
              + ROAD_LABELS                # Strassennummern/-namen
              + ggn_lab                    # Gewaessernamen
              + gr_lab                     # Grenz-/Verwaltungsnamen
              + oev_lab                    # Bahnhoefe, Flugplaetze
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
