---
title: "ÖV-API Österreich: Verbindungen und Abfahrten"
crumb: "Öffentlicher Verkehr"
key: oev
layout: topic
translationKey: oev
url: /oev-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "ÖV-API für Österreich: Verbindungen, Haltestellen und Abfahrtstafeln aus dem Soll-Fahrplan von ÖBB und Verkehrsverbünden. Kostenlos mit Konto und Token."
---

# ÖV-API für Österreich: Verbindungen, Abfahrten und Haltestellen

<p class="mx-lead">Die ÖV-API liefert Verbindungen mit öffentlichem Verkehr, Haltestellen in der Nähe eines Punkts und Abfahrtstafeln, jeweils aus dem Fahrplan. Du kannst damit Haltestellen und nächste Abfahrten in eine App oder auf eine Gemeindeseite bringen oder die Erreichbarkeit eines Orts mit Bahn und Bus berechnen. Sie richtet sich an Entwickler von Mobilitäts-, Standort- und Verwaltungsanwendungen in Österreich.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos registrieren" link="https://account.mapx.at/register?lang=de" >}}
{{< hextra/hero-button text="Doku: ÖV" link="https://docs.mapx.at/de/guides/transit/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="oev" >}}

## Was die Schnittstelle kann

- `GET /v1/directions/transit/{coordinates}`: Verbindungen von einem Start zu einem Ziel, mit Fußwegen auf dem Straßennetz und Fahrten mit Linie, Haltestellen und Zeiten. Mit `depart_at` oder `arrive_by` legst du die Zeit fest.
- `GET /v1/stops`: Haltestellen in einem Kartenausschnitt (`bbox`) oder rund um einen Punkt (`near`), mit Verkehrsmitteln und Linien.
- `GET /v1/departures`: die nächsten Abfahrten an einer Haltestelle oder an allen Haltestellen rund um eine Koordinate.
- `GET /v1/isochrone/transit/{coordinate}`: Erreichbarkeit zu Fuß plus öffentlichem Verkehr als Isochrone. Mit `access=bike` oder `access=car` ist der Weg zur ersten Haltestelle Bike & Ride oder Park & Ride.

## Beispiel

Haltestellen im Umkreis von 300 m:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/stops?near=16.3725,48.2085&radius=300&limit=5" | jq
```

Die nächsten Abfahrten rund um einen Punkt:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/departures?stop=16.3725,48.2085&limit=5&radius=300" | jq
```

```js
const res = await fetch("https://api.mapx.at/v1/departures?stop=16.3725,48.2085&limit=5&radius=300", { headers: { Authorization: "Bearer YOUR_TOKEN" } });
const data = await res.json();
```

Eine Verbindung von A nach B (ohne `depart_at` gilt: jetzt):

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/directions/transit/16.3725,48.2085;16.4202,48.1855" | jq
```

## Woher die Daten kommen

Die Fahrplandaten stammen von der ÖBB-Personenverkehr AG (CC BY 4.0), Datenquelle ist die Mobilitätsverbünde Österreich OG. Sie decken die ÖBB und die regionalen Verkehrsverbünde ab. Haltestellen derselben Station von verschiedenen Betreibern werden zusammengeführt.

## Einschränkungen

- Es ist der Soll-Fahrplan. Echtzeitdaten gibt es nicht, `realtime` ist immer `false`. Zeige in deiner App „planmäßig“ an.
- Außerhalb des Fahrplanzeitraums antwortet die API mit `422`.
- Die Fahrplandaten enthalten keine Information zur Fahrradmitnahme im Zug.
- Nur Österreich.
- Verbindungen liegen in der Zone `route` mit 5 Anfragen pro Sekunde, Haltestellen und Abfahrten in der Zone `search` mit 10 pro Sekunde, Isochronen in der Zone `heavy` mit 30 pro Minute.
- Die Quelle muss sichtbar genannt werden: ÖBB-Personenverkehr AG (CC BY 4.0), Datenquelle Mobilitätsverbünde Österreich OG.

## Loslegen

Der Zugang ist kostenlos mit Konto und Token. Alle Parameter stehen im [ÖV-Guide](https://docs.mapx.at/de/guides/transit/) und in der [Referenz zur ÖV-API](https://docs.mapx.at/de/api/transit/).

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos registrieren" link="https://account.mapx.at/register?lang=de" >}}
</div>
