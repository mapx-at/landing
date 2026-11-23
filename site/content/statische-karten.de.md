---
title: "Statische Karten API: Karte als Bild (PNG, WebP)"
crumb: "Statische Kartenbilder"
key: statisch
layout: topic
translationKey: statisch
url: /statische-karten/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Statische Karten für Österreich als PNG oder WebP mit Pins, Pfaden und GeoJSON: Kartenbild für Berichte, E-Mails und Exposés. Kostenlos mit Konto und Token."
---

# Statische Karten: Karte als Bild für Berichte, E-Mails und Exposés

<p class="mx-lead">Die Static-Images-API rendert ein Kartenbild für einen Ausschnitt und eine Größe, auf Wunsch mit Pins, Linien und Flächen. Das Ergebnis ist ein PNG oder WebP, das du per URL in PDFs, E-Mails, Exposés oder Vorschauen einbindest. Sie richtet sich an Entwickler, die dort eine Karte brauchen, wo keine interaktive Karte möglich ist.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos starten" link="https://account.mapx.at/login?lang=de" >}}
{{< hextra/hero-button text="Doku: Statische Bilder" link="https://docs.mapx.at/de/guides/static-images/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="statisch" >}}

## Was die Schnittstelle kann

- `GET /v1/static/{style}/{view}/{size}`: Kartenbild ohne Overlay. `view` ist `lng,lat,zoom[,bearing]`, `size` ist Breite mal Höhe, zum Beispiel `600x400`, mit optionalem `@2x` und Endung `.png` oder `.webp`.
- `GET /v1/static/{style}/{overlay}/{view}/{size}`: Kartenbild mit Overlays. Pins (`pin-s+ff0000(lng,lat)`), Pfade (kodierte Polyline) und GeoJSON mit einfachen Stilangaben, bis zu 50 Overlays.
- Mit `auto` statt der Ansicht passt sich der Ausschnitt den Overlays an.
- Stile: `streets`, `streets-dawn`, `streets-dusk`, `streets-night`, `satellite` (Orthofoto), `satellite-streets` und `outdoors` (Höhenlinien mit Schummerung).

## Beispiel

Luftbild von Wien als Bild:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/static/satellite/16.3725,48.2085,15/600x400" -o result.png
```

Straßenkarte mit einem roten Pin:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/static/streets/pin-s%2Bff0000(16.3725,48.2085)/16.3725,48.2085,14/600x400" -o result.png
```

In einer HTML-Seite oder E-Mail steht der Token in der URL (`access_token`), weil Bilder keine Header senden. Dafür einen öffentlichen Token verwenden:

```html
<img alt="Wiener Innenstadt" width="600" height="400"
     src="https://api.mapx.at/v1/static/streets/16.3725,48.2085,14/600x400.png?access_token=YOUR_TOKEN">
```

## Woher die Daten kommen

Die Bilder werden aus denselben offenen Verwaltungsdaten gerendert wie die interaktive Karte: die Straßenstile aus der Vektor-Basiskarte, `satellite` aus dem Orthofoto des BEV, `outdoors` aus dem Geländemodell des BEV. Die Daten stehen unter CC BY 4.0.

## Einschränkungen

- Nur Österreich.
- Höchstens 1280 mal 1280 Pixel, mit `@2x` bis 2560 mal 2560. Die Neigung (Pitch) ist immer 0.
- Zoomstufen: `satellite` von 5 bis 18, `outdoors` von 5 bis 16.
- Bilder liegen in der Zone `heavy` mit 30 Anfragen pro Minute je Token. Bilder sind cachebar (`ETag`, `304`): speichere sie auf deiner Seite zwischen und fordere sie nicht bei jedem Seitenaufruf neu an.
- Die Quelle muss neben dem Bild sichtbar stehen, zum Beispiel als Zeile `Quelle: mapx.at | BEV (CC BY 4.0)`. Den Text je Datensatz findest du in der [Doku zur Quellenangabe](https://docs.mapx.at/de/reference/attribution/).

## Loslegen

Der Zugang ist kostenlos mit Konto und Token. Alle Parameter und Overlay-Formate stehen im [Guide zu statischen Bildern](https://docs.mapx.at/de/guides/static-images/) und in der [Referenz zur Static-Images-API](https://docs.mapx.at/de/api/static-images/).

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos starten" link="https://account.mapx.at/login?lang=de" >}}
</div>
