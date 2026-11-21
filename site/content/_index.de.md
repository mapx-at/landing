---
title: "mapx – Karten und Geo-APIs für Österreich aus amtlichen Daten"
lastmod: 2026-11-21
images: ["/img/og-image.png"]
description: "mapx: Karten und Geo-APIs für Österreich aus amtlichen Daten. Geocoding, Routing, Höhen, Karten, ÖV, Verkehr, Wetter. Kostenlos mit Konto und Token."
layout: hextra-home
# Alle Texte der Startseite stehen hier, das Layout (layouts/hextra-home.html) baut daraus die Seite.
# Kartenstile und 3D-Bilder kommen aus data/gallery.yaml, Produktbilder aus data/demos.yaml, Pfade aus data/topics.yaml.
home:
  hero:
    h1: "Österreich als Karte, aus amtlichen Daten."
    p: "Karten, Adressen, Routen, Höhen, Fahrplan und Wetter als API für deine Anwendung. Kostenlos mit Konto."
    start: "Kostenlos starten"
    map: "Karte öffnen"
    trust: "Amtliche offene Daten von BEV, GIP.at, GeoSphere Austria, ASFINAG und ÖBB"
    chips_label: "Kartenstil der Vorschau wählen"
    style: "Stil"
    move: "Live-Karte öffnen"
    # Schaufenster: id = Bild in static/lp/img/gallery/ (bewusst andere Bilder als im Stile-Raster darunter, kein Motiv doppelt)
    styles:
      - {id: relief-dark, label: "Relief", place: "Großglockner", alt: "Stil relief-dark: Schummerung der Glocknergruppe in Grautönen auf Schwarz, mit Gipfeln und Gletschern"}
      - {id: streets-night, label: "Nacht", place: "Wien Innenstadt", alt: "Stil streets-night: Wiener Innenstadt bei Nacht mit hellen Straßen auf dunklem Blau"}
      - {id: outdoors-winter, label: "Winter", place: "Sölden", alt: "Stil outdoors-winter: verschneites Gelände um Sölden mit Höhenlinien und Liften"}
      - {id: traffic-night, label: "Verkehr", place: "Wien", alt: "Stil traffic-night: Straßennetz von Wien auf Dunkel, Verkehrsmeldungen farbig hervorgehoben"}
      - {id: satellite-streets-3d, label: "3D-Luftbild", place: "Wachau bei Dürnstein", alt: "Stil satellite-streets-3d: geneigter Blick über die Donau in der Wachau bei Dürnstein, Luftbild mit Straßen"}
  styles:
    eye: "Kartenstile"
    h2: "26 fertige Kartenstile für deine Anwendung"
    p: "Von der ruhigen Straßenkarte bis zum Luftbild, alle über dieselbe Karten-API. Tipp auf eine Karte, um sie live zu bewegen."
    all: "Alle Stile in der Galerie"
  d3:
    eye: "3D"
    h2: "Österreich in 3D"
    p: "Gelände aus dem Laserscan des BEV, Gebäude als Körper."
    img: dark-3d
    key: city3d
    alt: "Stil dark-3d: Wiener Innenstadt in 3D, dunkle Gebäudekörper und der Donaukanal"
    stats:
      - {v: "1 m", t: "Auflösung des Geländemodells"}
      - {v: "9", t: "Kartenstile in 3D"}
      - {v: "26", t: "Kartenstile insgesamt"}
    link: "In der Galerie drehen und neigen"
  products:
    eye: "Produkte"
    h2: "Eine API für Karte, Adresse, Route und Wetter"
    p: "Jedes Produkt mit eigener Seite: Beispiel zum Ausprobieren, Datenquelle, Grenzen."
    more: "Beispiel ansehen"
    items:
      - {key: karten, img: karten, size: l, t: "Karten, Kacheln und Stile", p: "Vektor-Basiskarte, fertige Stile, Höhenlinien und Orthofoto als Kacheln für MapLibre.", m: "PMTiles · TileJSON"}
      - {key: routing, img: routing, size: l, t: "Routing", p: "Routen für Auto, Lkw, Rad und zu Fuß, Isochronen, Fahrzeitmatrix und Tourenplanung.", m: "GIP.at · CC BY 4.0"}
      - {key: geocoding, img: geocoding, t: "Geocoding und Adresssuche", p: "Adressen, Orte und Straßen finden, beim Tippen vorschlagen und prüfen.", m: "Adressregister, Stichtag 01.10.2026"}
      - {key: hoehe, img: hoehen, t: "Höhe und Gelände", p: "Höhen für Punkte und Profile aus Gelände- und Oberflächenmodell mit 1 m Auflösung.", m: "BEV · Stichtag 15.09.2025"}
      - {key: oev, img: oev, t: "Öffentlicher Verkehr", p: "Verbindungen, Haltestellen und Abfahrten aus dem Soll-Fahrplan, Erreichbarkeit als Isochrone.", m: "ÖBB-Personenverkehr AG · CC BY 4.0"}
      - {key: verkehr, img: verkehr, t: "Verkehr", p: "Verkehrsmeldungen, Baustellen und Sperren, Tempolimits der Autobahnen und eine Verkehrsebene.", m: "ASFINAG / EVIS.AT · CC BY 4.0"}
      - {key: statisch, img: statisch, t: "Statische Kartenbilder", p: "Die Karte als PNG oder WebP mit Pins, Pfaden und GeoJSON, für Berichte und E-Mails.", m: "bis 1280 × 1280 Pixel"}
      - {key: wetter, img: wetter, t: "Wetter und Klima", p: "Messwerte, Stundenvorhersage, Niederschlags-Nowcast, Warnungen und Luftqualität für einen Punkt.", m: "GeoSphere Austria · CC BY 4.0"}
      - {key: mcp, size: w, t: "MCP-Server für KI-Assistenten", p: "21 lesende Werkzeuge für Adressen, Routen, Wetter und mehr, direkt in Claude Code, Cursor und VS Code.", m: "MCP · Streamable HTTP"}
    mcp_label: "Beispiel: Frage an einen KI-Assistenten, der den mapx-MCP-Server nutzt"
    mcp_q: "Wie komme ich morgen um 8 Uhr von Melk nach Krems?"
    mcp_tool: "transit_route"
    mcp_a: "Verbindung laut Fahrplan mit Umstieg und Ankunftszeit, dazu die Quellenangabe."
  dev:
    eye: "Für Entwickler"
    h2: "Deine erste Karte in fünf Minuten"
    p: "Für eine Karte mit MapLibre genügen ein Stil-Link und dein Token. Alle anderen APIs antworten mit JSON oder GeoJSON."
    code_h: "Karte mit MapLibre"
    code_c1: "öffentlicher Token mx_pk_… vom Konto"
    code_c2: "hängt den Token an jede Anfrage an mapx.at"
    copy: "Kopieren"
    copied: "Kopiert"
    copy_fail: "Bitte von Hand kopieren"
    result: "Ergebnis: Stil light, Salzburger Altstadt"
    result_alt: "Ergebnis des Beispiels: ruhige helle Karte der Salzburger Altstadt mit Salzach, Straßen und Gebäuden"
    points:
      - "Kacheln als PMTiles, ohne eigenen Kartenserver"
      - "Alle Stile der Galerie über <code>/v1/styles</code>"
      - "OpenAPI und <code>llms.txt</code> für alle APIs"
    more_h: "Zweites Beispiel: Höhe abfragen"
    more_c: "Gipfelhöhe aus dem Geländemodell (DTM, 1 m)"
    docs: "Zur Entwicklerdoku"
    docs_url: "https://docs.mapx.at/de/"
    first: "Zur Anleitung"
    first_url: "https://docs.mapx.at/de/start/first-map/"
  access:
    eye: "Zugang"
    h2: "Kostenlos, mit eigenem Konto und Token"
    p: "Die APIs brauchen ein Konto mit Token. Das kostet nichts, zum Schutz vor Missbrauch gibt es Rate-Limits je Token."
    steps:
      - {t: "Anmelden", p: "Mit deiner E-Mail-Adresse und einem Code, den wir dir schicken. Ein Passwort gibt es nicht."}
      - {t: "Token anlegen", p: "So viele du brauchst, jederzeit sperren, erneuern oder löschen."}
      - {t: "Nutzung einsehen", p: "Je Token und Produkt pro Tag. Abgerechnet wird nichts."}
    tokens:
      - {c: "mx_pk_…", t: "Öffentlicher Token", p: "Für Webseiten und Apps. Darf nur lesen, gebunden an deine Domains oder deine Android-App."}
      - {c: "mx_sk_…", t: "Geheimer Token", p: "Für deinen Server und Skripte, nie in eine Webseite oder App."}
    start: "Kostenlos starten"
    details: "Details in der Doku"
    details_url: "https://docs.mapx.at/de/start/access-and-limits/"
  data:
    eye: "Daten"
    h2: "Jede Angabe mit Quelle und Stichtag"
    p: "Ausschließlich offene Daten österreichischer Behörden, kein OpenStreetMap. So nennst du für jeden Datensatz Herausgeber, Stichtag und Lizenz."
    items:
      - {t: "BEV", p: "Adressen, Gebäude und Bodennutzung, Gelände, Orthofoto"}
      - {t: "GIP.at", p: "Straßen, Bahn, Routing"}
      - {t: "Umweltbundesamt", p: "Gewässer"}
      - {t: "ÖBB / Mobilitätsverbünde", p: "Fahrplan"}
      - {t: "ASFINAG / EVIS.AT", p: "Verkehrsmeldungen"}
      - {t: "GeoSphere Austria", p: "Wetter, Klima, Luftqualität"}
      - {t: "Stadt Wien", p: "Gebäudeteile in Wien"}
  end:
    img: relief-contours
    alt: "Stil relief-contours: Schummerung der Glocknergruppe in warmen Tönen mit Höhenlinien"
    h2: "Probier die Karte aus."
    p: "Such eine Adresse, miss eine Strecke oder lass dir ein Höhenprofil zeigen."
    docs: "Doku lesen"
---
