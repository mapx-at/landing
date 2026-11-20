---
title: "mapx – Karten und Geo-APIs für Österreich aus amtlichen Daten"
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "mapx: Karten und Geo-APIs für Österreich aus amtlichen Daten. Kataster, Geocoding, Routing, Höhen, Karten, ÖV, Verkehr, Wetter. Kostenlos mit Konto und Token."
layout: hextra-home
---

<div class="mx-hero"><div class="mx-hero-text">

<div>
{{< hextra/hero-badge link="https://docs.mapx.at" >}}
  Österreich · amtliche Daten
  {{< icon name="arrow-circle-right" attributes="height=14" >}}
{{< /hextra/hero-badge >}}
</div>

<div>
{{< hextra/hero-headline >}}
  Die Karte Österreichs, gebaut aus amtlichen Daten.
{{< /hextra/hero-headline >}}
</div>

<div>
{{< hextra/hero-subtitle >}}
  Grundstücke, Adressen, Routing, Gelände, Orthofoto, öffentlicher Verkehr, Verkehrsmeldungen und Wetter – aus Katastermappe, Laserscan, Verkehrsgraph und Fahrplan der Behörden, als offene Kacheln und APIs für eigene Karten.
{{< /hextra/hero-subtitle >}}
</div>

<div class="mx-btns">
{{< hextra/hero-button text="Karte öffnen" link="https://map.mapx.at" >}}
{{< hextra/hero-button text="Kostenlosen Zugang holen" link="#zugang" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>
</div>

<div class="mx-hero-img"><img src="/lp/img/hero-map.webp" alt="Dunkle mapx-Karte von Innsbruck mit Straßen, Inn und Höhenlinien" width="1600" height="900" fetchpriority="high"><p class="mx-hero-cap">Stil <code>streets-night</code>, Innsbruck. Daten: BEV, GIP.at, CC BY 4.0</p></div>
</div>

<p class="mx-note"><strong>Datenquellen:</strong> BEV · GIP.at · ASFINAG · GeoSphere Austria · ÖBB · Umweltbundesamt (GGN) · Statistik Austria · Offene Lizenzen, überwiegend CC BY 4.0</p>

## Was mapx liefert {#produkte}

Je Produkt ein eigener Datensatz mit Stichtag und Quelle. Jedes Produkt hat eine eigene Seite mit Beispiel, Datenquelle und Einschränkungen. Alles, was auf der Karte zu sehen ist, lässt sich auch direkt einbinden.

{{< hextra/feature-grid cols="3" >}}
  {{< hextra/feature-card title="Karten, Kacheln und Stile" subtitle="Vektor-Basiskarte, fertige Kartenstile, Höhenlinien und Orthofoto als Vektor- und Rasterkacheln für MapLibre. · *PMTiles · TileJSON*" icon="map" link="/karten-api/" >}}
  {{< hextra/feature-card title="Kataster und Grundstücke" subtitle="Grundstücksgrenzen als Kacheln, Grundstück an einem Punkt und Grundstücks-Dossier aus der Digitalen Katastralmappe des BEV. · *BEV DKM · CC BY 4.0*" icon="view-grid" link="/kataster-api/" >}}
  {{< hextra/feature-card title="Geocoding und Adresssuche" subtitle="Adressregister, Orte, Straßen und Grundstücke: Geocoding, Reverse Geocoding, Suche beim Tippen, Autofill und Adressprüfung. · *Adressregister, Stichtag 01.10.2026*" icon="location-marker" link="/geocoding-api/" >}}
  {{< hextra/feature-card title="Routing" subtitle="Routen für Auto, Lkw, Rad und zu Fuß, Isochronen, Fahrzeitmatrix und Tourenplanung auf dem GIP-Straßengraphen. · *GIP.at · CC BY 4.0*" icon="switch-horizontal" link="/routing-api/" >}}
  {{< hextra/feature-card title="Höhe und Gelände" subtitle="Höhen-API für Punkte und Profile, Geländemodell (DTM) und Oberflächenmodell (DSM) mit 1 m Auflösung, Höhenlinien. · *BEV · Stichtag 15.09.2025*" icon="trending-up" link="/hoehen-api/" >}}
  {{< hextra/feature-card title="Öffentlicher Verkehr" subtitle="Verbindungen, Haltestellen und Abfahrten aus dem Soll-Fahrplan, Erreichbarkeit mit öffentlichem Verkehr als Isochrone. · *ÖBB-Personenverkehr AG · CC BY 4.0*" icon="ticket" link="/oev-api/" >}}
  {{< hextra/feature-card title="Verkehr" subtitle="Verkehrsmeldungen, Baustellen und Sperren, Tempolimits auf Wechselverkehrszeichen der Autobahnen und eine Verkehrsebene für die Karte. · *ASFINAG / EVIS.AT · CC BY 4.0*" icon="exclamation-circle" link="/verkehr-api/" >}}
  {{< hextra/feature-card title="Statische Kartenbilder" subtitle="Karte als PNG oder WebP mit Pins, Pfaden und GeoJSON, für Berichte, E-Mails und Exposés. · *bis 1280 × 1280 Pixel*" icon="photograph" link="/statische-karten/" >}}
  {{< hextra/feature-card title="Wetter und Klima" subtitle="Messwerte, Stundenvorhersage, Niederschlags-Nowcast, Warnungen, Luftqualität und Klima für einen Punkt. · *GeoSphere Austria · CC BY 4.0*" icon="cloud" link="/wetter-api/" >}}
  {{< hextra/feature-card title="MCP-Server für KI-Assistenten" subtitle="23 lesende Werkzeuge für Adressen, Routen, Grundstücke, Wetter und mehr, direkt in Claude Code, Cursor und VS Code. · *MCP · Streamable HTTP*" icon="chip" link="/mcp-server/" >}}
{{< /hextra/feature-grid >}}

## Einbinden in fünf Minuten. {#entwickler}

*Für Entwickler* – Kacheln sind PMTiles-Dateien mit HTTP-Range-Zugriff, ohne eigenen Kartenserver. Die APIs antworten mit JSON bzw. GeoJSON.

- **MapLibre und PMTiles.** Fertige Kartenstile kommen über die Karten-API (`/v1/styles`).
- **Ein kostenloses Konto genügt.** Anmelden, Token anlegen, loslegen. Herkunft, Stichtag und Attribution stehen je Produkt in der Doku.
- **Maschinenlesbar.** OpenAPI-Beschreibung und `llms.txt` für alle APIs und die Kacheln.

[Zur Entwicklerdoku](https://docs.mapx.at) · [Demo ansehen](https://map.mapx.at)

**Karte mit MapLibre**

```js
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

const TOKEN = 'YOUR_TOKEN'; // öffentlicher Token mx_pk_… vom Konto
maplibregl.addProtocol('pmtiles', new Protocol().tile);

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.mapx.at/v1/styles/streets',
  // hängt den Token an jede Anfrage an mapx.at (Style, Tiles, Schriften, Sprites)
  transformRequest: (url) => ({ url: /^https:\/\/([\w-]+\.)?mapx\.at\//.test(url)
    ? url + (url.includes('?') ? '&' : '?') + 'access_token=' + TOKEN : url }),
  center: [15.33, 48.23],
  zoom: 13
});
```

**Höhe abfragen**

```js
// Gipfelhöhe aus dem Geländemodell (DTM, 1 m); Token vom Konto
const r = await fetch(
  'https://api.mapx.at/v1/elevation?points=12.694,47.074',
  { headers: { Authorization: `Bearer ${TOKEN}` } }
);
const { features } = await r.json();
console.log(features[0].properties.elevation);
```

## Kostenlos, mit eigenem Konto. {#zugang}

*API-Zugang* – Die mapx-APIs (Kacheln, Suche, Routing, Höhe, ÖV, Verkehr, Bilder, Wetter) brauchen seit dem 08.11.2026 ein Konto mit API-Token. Das kostet nichts: Registrieren, anmelden, Token anlegen.

{{< hextra/feature-grid cols="3" >}}
  {{< hextra/feature-card title="1. Registrieren" subtitle="Mit deiner E-Mail-Adresse. Die Anmeldung läuft über einen 8-stelligen Code, den wir dir per Mail schicken. Ein Passwort gibt es nicht." >}}
  {{< hextra/feature-card title="2. Tokens anlegen" subtitle="Beliebig viele, jeweils mit eigenem Namen. Du kannst sie jederzeit sperren, erneuern oder löschen." >}}
  {{< hextra/feature-card title="3. Nutzung einsehen" subtitle="Für jeden Token siehst du die Nutzung je Produkt und Tag. Abgerechnet wird nichts." >}}
{{< /hextra/feature-grid >}}

### Zwei Arten von Tokens

- **Öffentlicher Token (`mx_pk_…`).** Für Webseiten und Apps. Er darf nur lesen und ist an deine Domains oder an deine Android-App gebunden, so kann ihn niemand sonst verwenden.
- **Geheimer Token (`mx_sk_…`).** Für deinen Server oder Skripte. Nie in eine Webseite oder App einbauen.

Zum Schutz vor Missbrauch gibt es Rate-Limits je Token. Die Nutzung selbst ist kostenlos.

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos registrieren" link="https://account.mapx.at/register?lang=de" >}}
{{< hextra/hero-button text="Anmelden" link="https://account.mapx.at/login?lang=de" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
{{< hextra/hero-button text="Details in der Doku" link="https://docs.mapx.at/de/start/access-and-limits/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

## Eine Quelle, die man benennen kann. {#daten}

*Warum amtliche Daten* – mapx baut Karten ausschließlich aus Daten von Behörden mit klarer offener Lizenz. Jeder Datensatz ist mit Herausgeber, Stichtag und Lizenz dokumentiert.

- **Kataster, Gelände, Orthofoto:** Bundesamt für Eich- und Vermessungswesen (BEV).
- **Straßen, Bahn, Routing:** Graphenintegrations-Plattform GIP.at.
- **Gewässer:** Gesamtgewässernetz des Umweltbundesamts.
- **Fahrplan:** ÖBB-Personenverkehr AG, Datenquelle Mobilitätsverbünde Österreich OG.
- **Verkehrsmeldungen:** ASFINAG / EVIS.AT.
- **Wetter, Klima, Luftqualität:** GeoSphere Austria.
- **Kein OpenStreetMap:** Punkte von Interesse kommen ebenfalls aus amtlichen Quellen.

## Probiere die Karte aus.

Suche eine Adresse, miss eine Strecke oder lass dir ein Höhenprofil zeigen.

<div class="mx-btns">
{{< hextra/hero-button text="Karte öffnen" link="https://map.mapx.at" >}}
{{< hextra/hero-button text="Doku lesen" link="https://docs.mapx.at" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>
