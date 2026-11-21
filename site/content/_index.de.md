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
    h1: "Die Karte Österreichs, gebaut aus amtlichen Daten."
    p: "Karten, Adressen, Routen, Gelände, öffentlicher Verkehr und Wetter als API für deine Anwendung. Kostenlos mit Konto."
    start: "Kostenlos starten"
    map: "Karte öffnen"
    chips_label: "Kartenstil der Vorschau wählen"
    style: "Stil"
    live: "Live ansehen"
    move: "Live-Karte öffnen"
    # Stile im Schaufenster: id = Bild in static/lp/img/gallery/, key = Karte in data/gallery.yaml (Ort, Alt-Text); alt nur, wenn der Stil dort keinen eigenen hat
    styles:
      - {id: streets-3d, key: city3d, label: "3D-Stadt"}
      - {id: relief-3d, key: terrain3d, label: "3D-Gelände"}
      - {id: satellite-3d, key: aerial3d, label: "Luftbild 3D"}
      - {id: streets, key: streets, label: "Straßen"}
      - {id: streets-night, key: streets, label: "Nacht", alt: "Stil streets-night: Wiener Innenstadt bei Nacht mit hellen Straßen auf dunklem Blau"}
      - {id: relief, key: relief, label: "Relief"}
      - {id: traffic-day, key: traffic, label: "Verkehr"}
  sources: "<strong>Datenquellen:</strong> BEV · GIP.at · ASFINAG · GeoSphere Austria · ÖBB · Umweltbundesamt · Stadt Wien · Statistik Austria · offene Lizenzen, überwiegend CC BY 4.0"
  styles:
    h2: "26 fertige Kartenstile für deine Anwendung"
    p: "Von der ruhigen Straßenkarte bis zum Luftbild in 3D, alle über dieselbe Karten-API. Tipp auf eine Karte, um sie live zu bewegen."
    all: "Alle Stile in der Galerie"
  d3:
    h2: "Österreich in 3D, mit Gelände in 1 m Auflösung"
    p: "Das Gelände kommt aus dem Laserscan des BEV, die Gebäude stehen als Körper mit ihrer Höhe auf der Karte. In Wien kommen die Gebäudeteile, etwa der Turm des Stephansdoms, aus dem Baukörpermodell der Stadt Wien."
    imgs: [streets-3d, relief-3d, satellite-3d]
    link: "In der Galerie drehen und neigen"
  products:
    h2: "Eine API für Karte, Adresse, Route und Wetter"
    p: "Jedes Produkt hat eine eigene Seite mit Beispiel zum Ausprobieren, Datenquelle und Grenzen."
    more: "Beispiel ansehen"
    items:
      - {key: karten, img: karten, t: "Karten, Kacheln und Stile", p: "Vektor-Basiskarte, fertige Stile, Höhenlinien und Orthofoto als Kacheln für MapLibre.", m: "PMTiles · TileJSON"}
      - {key: geocoding, img: geocoding, t: "Geocoding und Adresssuche", p: "Adressen, Orte und Straßen finden, beim Tippen vorschlagen und prüfen.", m: "Adressregister, Stichtag 01.10.2026"}
      - {key: routing, img: routing, t: "Routing", p: "Routen für Auto, Lkw, Rad und zu Fuß, Isochronen, Fahrzeitmatrix und Tourenplanung.", m: "GIP.at · CC BY 4.0"}
      - {key: hoehe, img: hoehen, t: "Höhe und Gelände", p: "Höhen für Punkte und Profile aus Gelände- und Oberflächenmodell mit 1 m Auflösung.", m: "BEV · Stichtag 15.09.2025"}
      - {key: oev, img: oev, t: "Öffentlicher Verkehr", p: "Verbindungen, Haltestellen und Abfahrten aus dem Soll-Fahrplan, Erreichbarkeit als Isochrone.", m: "ÖBB-Personenverkehr AG · CC BY 4.0"}
      - {key: verkehr, img: verkehr, t: "Verkehr", p: "Verkehrsmeldungen, Baustellen und Sperren, Tempolimits der Autobahnen und eine Verkehrsebene.", m: "ASFINAG / EVIS.AT · CC BY 4.0"}
      - {key: statisch, img: statisch, t: "Statische Kartenbilder", p: "Die Karte als PNG oder WebP mit Pins, Pfaden und GeoJSON, für Berichte und E-Mails.", m: "bis 1280 × 1280 Pixel"}
      - {key: wetter, img: wetter, t: "Wetter und Klima", p: "Messwerte, Stundenvorhersage, Niederschlags-Nowcast, Warnungen und Luftqualität für einen Punkt.", m: "GeoSphere Austria · CC BY 4.0"}
      - {key: mcp, t: "MCP-Server für KI-Assistenten", p: "21 lesende Werkzeuge für Adressen, Routen, Wetter und mehr, direkt in Claude Code, Cursor und VS Code.", m: "MCP · Streamable HTTP"}
    mcp_label: "Beispiel: Frage an einen KI-Assistenten, der den mapx-MCP-Server nutzt"
    mcp_q: "Wie komme ich morgen um 8 Uhr von Melk nach Krems?"
    mcp_tool: "transit_route"
    mcp_a: "Verbindung laut Fahrplan mit Umstieg und Ankunftszeit, dazu die Quellenangabe."
  dev:
    h2: "Deine erste Karte in fünf Minuten"
    p: "Für eine Karte mit MapLibre genügen ein Stil-Link und dein Token. Alle anderen APIs antworten mit JSON oder GeoJSON."
    code_h: "Karte mit MapLibre"
    code_c1: "öffentlicher Token mx_pk_… vom Konto"
    code_c2: "hängt den Token an jede Anfrage an mapx.at"
    result: "Das Ergebnis: Stil streets, Wiener Innenstadt."
    result_alt: "Ergebnis des Beispiels: Straßenkarte der Wiener Innenstadt mit Gebäuden und Namen"
    points:
      - "<strong>MapLibre und PMTiles.</strong> Kacheln mit HTTP-Range-Zugriff, ohne eigenen Kartenserver."
      - "<strong>Fertige Stile.</strong> Alle Stile der Galerie kommen über <code>/v1/styles</code>."
      - "<strong>Maschinenlesbar.</strong> OpenAPI-Beschreibung und <code>llms.txt</code> für alle APIs."
    more_h: "Zweites Beispiel: Höhe abfragen"
    more_c: "Gipfelhöhe aus dem Geländemodell (DTM, 1 m)"
    docs: "Zur Entwicklerdoku"
    docs_url: "https://docs.mapx.at/de/"
    first: "Schritt für Schritt zur ersten Karte"
    first_url: "https://docs.mapx.at/de/start/first-map/"
  access:
    h2: "Kostenlos, mit eigenem Konto und Token"
    p: "Die APIs brauchen ein Konto mit Token. Das kostet nichts, zum Schutz vor Missbrauch gibt es Rate-Limits je Token."
    steps:
      - {t: "Anmelden", p: "Mit deiner E-Mail-Adresse und einem Code, den wir dir schicken. Ein Passwort gibt es nicht."}
      - {t: "Token anlegen", p: "So viele du brauchst, jederzeit sperren, erneuern oder löschen."}
      - {t: "Nutzung einsehen", p: "Je Token und Produkt pro Tag. Abgerechnet wird nichts."}
    tokens: "Der <strong>öffentliche Token</strong> (<code>mx_pk_…</code>) ist für Webseiten und Apps: Er darf nur lesen und ist an deine Domains oder deine Android-App gebunden. Der <strong>geheime Token</strong> (<code>mx_sk_…</code>) gehört auf deinen Server oder in Skripte, nie in eine Webseite oder App."
    start: "Kostenlos starten"
    details: "Details in der Doku"
    details_url: "https://docs.mapx.at/de/start/access-and-limits/"
  data:
    h2: "Jede Angabe mit Quelle und Stichtag"
    p: "mapx nutzt ausschließlich offene Daten österreichischer Behörden. So kannst du in deiner Anwendung für jeden Datensatz Herausgeber, Stichtag und Lizenz nennen. OpenStreetMap verwenden wir nicht."
    items:
      - {t: "BEV", p: "Adressen, Gebäude und Bodennutzung, Gelände, Orthofoto"}
      - {t: "GIP.at", p: "Straßen, Bahn, Routing"}
      - {t: "Umweltbundesamt", p: "Gewässer"}
      - {t: "ÖBB / Mobilitätsverbünde", p: "Fahrplan"}
      - {t: "ASFINAG / EVIS.AT", p: "Verkehrsmeldungen"}
      - {t: "GeoSphere Austria", p: "Wetter, Klima, Luftqualität"}
      - {t: "Stadt Wien", p: "Gebäudeteile in Wien"}
  end:
    img: relief
    key: relief
    h2: "Probier die Karte aus."
    p: "Such eine Adresse, miss eine Strecke oder lass dir ein Höhenprofil zeigen."
    docs: "Doku lesen"
---
