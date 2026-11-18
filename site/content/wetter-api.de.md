---
title: "Wetter-API Österreich: Vorhersage, Nowcast, Klima"
crumb: "Wetter und Klima"
key: wetter
layout: topic
translationKey: wetter
url: /wetter-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Wetter-API für Österreich: Messwerte, Stundenvorhersage, Niederschlags-Nowcast, Warnungen, Luftqualität und Klima von GeoSphere Austria. Kostenlos mit Token."
---

# Wetter-API für Österreich: Vorhersage, Nowcast, Luftqualität und Klima

<p class="mx-lead">Die Wetter-API liefert aktuelle Messwerte, die Stundenvorhersage und den Niederschlags-Nowcast für einen Punkt, dazu amtliche Wetterwarnungen, die Luftqualität und Klimakennwerte. Wetterkacheln lassen sich als Ebene auf die Karte legen. Sie richtet sich an Entwickler von Wetter-, Tourismus-, Logistik- und Standortanwendungen in Österreich.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos registrieren" link="https://account.mapx.at/register?lang=de" >}}
{{< hextra/hero-button text="Doku: Wetter" link="https://docs.mapx.at/de/api/weather/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="wetter" >}}

## Was die Schnittstelle kann

- `GET /v1/weather/current`: Messwerte der nächsten Stationen im 10-Minuten-Raster (Temperatur, Feuchte, Wind, Böen, Niederschlag, Luftdruck).
- `GET /v1/weather/forecast`: Stundenvorhersage für einen Punkt, bis zu 60 Stunden, auf Wunsch mit Unsicherheitsbereich.
- `GET /v1/weather/nowcast/{lon},{lat}`: Niederschlags-Nowcast in 15-Minuten-Schritten für 3 Stunden, mit Beginn und Ende des Niederschlags in Minuten.
- `GET /v1/weather/warnings`: aktuelle und kommende amtliche Warnungen bis 4 Tage voraus als GeoJSON, Stufen 1 (gelb) bis 3 (rot).
- `GET /v1/air-quality/{lon},{lat}`: Luftqualitätsindex, Stickstoffdioxid, Ozon, PM10, PM2.5 und Saharastaub.
- `GET /v1/climate/{lon},{lat}`: Sonnenpotenzial, Temperatur- und Niederschlagsnormale, Hitze- und Schneetage, Dürreindex.
- `GET /v1/weather/tiles/{param}.json`: Wetterkacheln wie Temperatur, Niederschlag, Wind oder Radar-Nowcast für die Karte.

## Beispiel

Der Niederschlags-Nowcast für Wien:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/weather/nowcast/16.3725,48.2085" | jq
```

Die Stundenvorhersage für die nächsten 6 Stunden:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/weather/forecast?lon=16.3725&lat=48.2085&hours=6&ensemble=true" | jq
```

```js
const res = await fetch("https://api.mapx.at/v1/weather/forecast?lon=16.3725&lat=48.2085&hours=6&ensemble=true", { headers: { Authorization: "Bearer YOUR_TOKEN" } });
const data = await res.json();
```

Aktive Warnungen für ganz Österreich:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/weather/warnings?bbox=9.4,46.3,17.3,49.1&min_level=1" | jq
```

## Woher die Daten kommen

Alle Wetter-, Luftqualitäts- und Klimadaten stammen von GeoSphere Austria (CC BY 4.0). Die Vorhersage nutzt das Modell AROME mit 1 km Raster, der Nowcast das Modell INCA, die Messwerte das Stationsnetz TAWES, die Luftqualität das Chemiewettermodell mit 3 km Raster. Der Luftqualitätsindex folgt dem Europäischen Luftqualitätsindex der EEA (1 gut bis 6 sehr schlecht). Das Klima beruht auf APOLIS, SPARTACUS, SNOWGRID-CL und WINFORE.

## Einschränkungen

- Österreich und ein Randbereich. Die Klima-Abfrage antwortet außerhalb von Österreich mit `404`.
- Die Werte kommen aus einem Zwischenspeicher und werden nicht pro Anfrage von der Quelle geholt. Warnungen werden alle 5 Minuten aktualisiert.
- Die erste Klima-Abfrage für ein neues Gebiet kann 10 bis 20 Sekunden dauern, spätere kommen aus dem Zwischenspeicher. Ist die Quelle nicht erreichbar, antwortet die API mit `503`.
- Das Luftqualitätsmodell liefert kein SO2.
- Die Abfragen liegen in der Zone `search` mit 10 Anfragen pro Sekunde je Token.
- Die Quelle muss sichtbar genannt werden: GeoSphere Austria, CC BY 4.0.

## Loslegen

Der Zugang ist kostenlos mit Konto und Token. Alle Parameter stehen in der [Referenz zur Wetter-API](https://docs.mapx.at/de/api/weather/), der [Luftqualitäts-API](https://docs.mapx.at/de/api/air-quality/) und der [Klima-API](https://docs.mapx.at/de/api/climate/).

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos registrieren" link="https://account.mapx.at/register?lang=de" >}}
</div>
