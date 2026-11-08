---
title: "mapx – Karten für Österreich aus amtlichen Daten"
description: "mapx: Karten für Österreich aus amtlichen Daten. Kataster, Gelände, Höhenlinien, Orthofoto, Adressen, Routing und Höhen-API. Kostenloser API-Zugang mit Konto und Token."
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
  Grundstücke, Gelände, Höhenlinien, Orthofoto, Adressen und Routing – aus Katastermappe, Laserscan und Verkehrsgraph der Behörden, als offene Kacheln und APIs für eigene Karten.
{{< /hextra/hero-subtitle >}}
</div>

<div class="mx-btns">
{{< hextra/hero-button text="Karte öffnen" link="https://map.mapx.at" >}}
{{< hextra/hero-button text="Kostenlosen Zugang holen" link="#zugang" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>
</div>

<div class="mx-hero-img"><img src="/lp/img/hero-map.svg" alt="Stilisierte Karte mit Höhenlinien, Parzellen, Straßen und Fluss" width="1600" height="900"></div>
</div>

<p class="mx-note"><strong>Datenquellen:</strong> BEV · GIP.at · Umweltbundesamt (GGN) · Statistik Austria · Offene Lizenzen, überwiegend CC BY 4.0</p>

## Was mapx liefert {#produkte}

Je Produkt ein eigener Datensatz mit Stichtag und Quelle. Alles, was auf der Karte zu sehen ist, lässt sich auch direkt einbinden.

{{< hextra/feature-grid cols="4" >}}
  {{< hextra/feature-card title="Vektor-Basiskarte" subtitle="Straßen, Gebäude, Gewässer, Grenzen und Beschriftung als Vektorkacheln, gestaltet nach dem Vorbild von basemap.at. · *PMTiles · MapLibre*" icon="map" link="https://docs.mapx.at" >}}
  {{< hextra/feature-card title="Kataster" subtitle="Grundstücksgrenzen und Nutzungsflächen aus der Digitalen Katastralmappe des BEV. · *BEV DKM · CC BY 4.0*" icon="view-grid" link="https://docs.mapx.at" >}}
  {{< hextra/feature-card title="Geländemodell" subtitle="DTM und DSM aus dem 1-m-Laserscan des BEV, als Terrain-RGB für Schummerung und 3D-Gelände. · *Stichtag 15.09.2025*" icon="trending-up" link="https://docs.mapx.at" >}}
  {{< hextra/feature-card title="Höhenlinien" subtitle="Höhenlinien, aus dem Geländemodell gerechnet, als Vektorkacheln für Wander- und Planungskarten. · *Zoom 10–16*" icon="chart-square-bar" link="https://docs.mapx.at" >}}
  {{< hextra/feature-card title="Orthofoto" subtitle="Luftbilder des BEV als Rasterkacheln, mit Metadaten zu Befliegung und Flugjahr. · *BEV · CC BY 4.0*" icon="photograph" link="https://docs.mapx.at" >}}
  {{< hextra/feature-card title="Adressen und Suche" subtitle="Adressregister, Orte, Straßen und Grundstücke in einem Suchindex, für Geocoding in eigenen Anwendungen. · *Adressregister, Stichtag 01.10.2026*" icon="location-marker" link="https://docs.mapx.at" >}}
  {{< hextra/feature-card title="Routing" subtitle="Eigene Routing-Engine auf dem GIP-Routingexport für Auto, Rad und zu Fuß, mit Abbiegeverboten. · *GIP.at · CC BY 4.0*" icon="switch-horizontal" link="https://docs.mapx.at" >}}
  {{< hextra/feature-card title="Höhen-API" subtitle="Höhe für Punkte und Profile entlang einer Linie, wahlweise aus Gelände- oder Oberflächenmodell. · *REST · JSON*" icon="code" link="https://docs.mapx.at" >}}
{{< /hextra/feature-grid >}}

## Einbinden in fünf Minuten. {#entwickler}

*Für Entwickler* – Kacheln sind PMTiles-Dateien mit HTTP-Range-Zugriff, ohne eigenen Kartenserver. Die Höhen-API antwortet mit GeoJSON.

- **MapLibre und PMTiles.** Der Stil der Demo-Karte ist öffentlich und lässt sich direkt laden.
- **Ein kostenloses Konto genügt.** Anmelden, Token anlegen, loslegen. Herkunft, Stichtag und Attribution stehen je Produkt in der Doku.
- **Maschinenlesbar.** OpenAPI-Beschreibung und `llms.txt` für die Höhen-API und die Kacheln.

[Zur Entwicklerdoku](https://docs.mapx.at) · [Demo ansehen](https://map.mapx.at)

**Karte mit MapLibre**

```js
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

maplibregl.addProtocol('pmtiles', new Protocol().tile);

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://mapx.at/style.json',
  center: [15.33, 48.23],
  zoom: 13,
  transformRequest: (url) => url.includes('mapx.at')
    ? { url, headers: { Authorization: `Bearer ${TOKEN}` } }
    : undefined
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

*API-Zugang* – Die mapx-APIs (Kacheln, Suche, Routing, Höhe) brauchen seit dem 08.11.2026 ein Konto mit API-Token. Das kostet nichts: Registrieren, anmelden, Token anlegen.

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
- **Kein OpenStreetMap:** Punkte von Interesse kommen ebenfalls aus amtlichen Quellen.

[Mehr im Blog](https://blog.mapx.at)

## Probiere die Karte aus.

Suche eine Adresse, miss eine Strecke oder lass dir ein Höhenprofil zeigen.

<div class="mx-btns">
{{< hextra/hero-button text="Karte öffnen" link="https://map.mapx.at" >}}
{{< hextra/hero-button text="Doku lesen" link="https://docs.mapx.at" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>
