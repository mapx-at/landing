---
title: "Karten-API Österreich: Kacheln, Stile, Orthofoto"
crumb: "Karten, Kacheln und Stile"
key: karten
layout: topic
translationKey: karten
url: /karten-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Karten-API für Österreich: Vektorkacheln, fertige Kartenstile für MapLibre, Orthofoto und Luftbild als Kacheln aus amtlichen Daten. Kostenlos mit Token."
---

# Karten-API für Österreich: Vektorkacheln, Kartenstile und Orthofoto

<p class="mx-lead">mapx liefert die Karte Österreichs als fertige Kartenstile für MapLibre GL JS und als Kacheln: eine Vektor-Basiskarte, Orthofoto und Luftbild, Geländemodell und Höhenlinien. Du kannst einen Stil mit einer Zeile einbinden oder aus den Vektorkacheln einen eigenen Kartenstil bauen. Das richtet sich an Entwickler von Web- und Mobil-Karten, die ohne eigenen Kartenserver auskommen wollen.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos starten" link="https://account.mapx.at/login?lang=de" >}}
{{< hextra/hero-button text="Doku: Karten" link="https://docs.mapx.at/de/guides/maps/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="karten" >}}

## Was die Schnittstelle kann

- `GET /v1/styles` und `GET /v1/styles/{id}`: fertige MapLibre-Stile `streets`, `streets-dawn`, `streets-dusk`, `streets-night`, `traffic-day`, `satellite`, `satellite-streets` und `outdoors`, dazu Schriften und Sprites.
- `GET /v1/tiles` und `GET /v1/tiles/{tileset}.json`: Liste der Tilesets und TileJSON.
- `GET /v1/tiles/{tileset}/{z}/{x}/{y}.{ext}`: Kacheln im XYZ-Schema.
- `GET /v1/styles/{id}/tiles/{tilesize}/{z}/{x}/{y}`: gerenderte Rasterkacheln eines Stils für Clients ohne Vektorunterstützung.
- Tilesets: `streets` (Basiskarte, Zoom 0 bis 16), `orthophoto` (Luftbild, Zoom 5 bis 18, 20 cm), `contours`, `terrain-rgb` und `dsm`.
- Zugriff über Stil, TileJSON oder `{z}/{x}/{y}`; ganze Tileset-Dateien zum Herunterladen gibt es nicht.

## Beispiel

Eine Karte mit dem Stil `outdoors` (Höhenlinien, Schummerung, Wege) in MapLibre. Auf Webseiten gehört ein öffentlicher Token (`mx_pk_…`) in die URL:

```js
const map = new maplibregl.Map({
  container: "map",
  style: "https://api.mapx.at/v1/styles/outdoors?access_token=YOUR_TOKEN",
  center: [12.694, 47.074], zoom: 12,
});
```

Das Orthofoto (Luftbild) mit dem Stil `satellite`. Der Stil `satellite-streets` legt Straßen und Beschriftung darüber:

```js
const map = new maplibregl.Map({
  container: "map",
  style: "https://api.mapx.at/v1/styles/satellite?access_token=YOUR_TOKEN",
  center: [15.3294, 48.2272], zoom: 16,
});
```

Die Beschreibung eines Tilesets per curl:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/tiles/streets.json" | jq
```

## Woher die Daten kommen

Die Basiskarte vereint offene Daten von BEV, GIP.at, Umweltbundesamt und BMLUK in 18 Layern und enthält keine OpenStreetMap-Daten. Ihr Stichtag ist der 01.04.2026. Das Orthofoto stammt vom BEV (Stichtag 03.10.2025), die Kacheln haben 20 cm Auflösung, die native Auflösung der Quelle. Ein eigenes Tileset zeigt, welcher Flug welchen Pixel liefert. Alle Daten stehen unter CC BY 4.0.

## Einschränkungen

- Nur Österreich. Orthofoto und Basiskarte reichen an der Grenze ein Stück in die Nachbarländer.
- Jedes Tileset hat ein eigenes Quelldatum. Aktuellere Veränderungen in der Landschaft sind erst mit einem neuen Stichtag enthalten.
- Rasterkacheln haben 512 Pixel, im Client `tileSize: 512` setzen. Ein `404` für eine Kachel kann heißen, dass sie außerhalb von Datengebiet oder Zoombereich liegt. Behandle sie als leere Kachel.
- Kacheln liegen in der Zone `tiles` mit 100 Anfragen pro Sekunde je Token, gerenderte Rasterkacheln in der Zone `static` mit 5 pro Sekunde.
- Die Quelle muss sichtbar genannt werden. MapLibre übernimmt den Text automatisch aus Stil oder TileJSON.

## Loslegen

Der Zugang ist kostenlos mit Konto und Token. Dein Konto erzeugt öffentliche Tokens für Webseiten und geheime Tokens für Server. Weiter geht es im [Karten-Guide](https://docs.mapx.at/de/guides/maps/), in der [Referenz zu Kartenstilen](https://docs.mapx.at/de/api/styles/) und in der [Liste der Tilesets](https://docs.mapx.at/de/tilesets/).

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos starten" link="https://account.mapx.at/login?lang=de" >}}
</div>
