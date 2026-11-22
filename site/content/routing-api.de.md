---
title: "Routing-API Österreich: Routenplaner und Isochronen"
crumb: "Routing"
key: routing
layout: topic
translationKey: routing
url: /routing-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Routing-API für Österreich: Routen für Auto, Lkw, Rad und zu Fuß, Isochronen, Fahrzeitmatrix und Tourenoptimierung auf GIP-Daten. Kostenlos mit Token."
---

# Routing-API für Österreich: Routenplaner, Isochronen und Fahrzeitmatrix

<p class="mx-lead">Die Routing-API berechnet Routen für Auto, Lkw, Rad und zu Fuß auf dem österreichischen Straßengraphen. Sie liefert außerdem Isochronen, Fahrzeitmatrizen, Map Matching und Tourenoptimierung. Sie richtet sich an Entwickler von Routenplanern, Logistik-, Tourismus- und Standortanwendungen in Österreich.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos starten" link="https://account.mapx.at/login?lang=de" >}}
{{< hextra/hero-button text="Doku: Routing" link="https://docs.mapx.at/de/guides/navigation/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="routing" >}}

## Was die Schnittstelle kann

- `GET /v1/directions/{profile}/{coordinates}`: Routen mit 2 bis 25 Punkten, optional mit Abbiegeschritten, Alternativen sowie Sprach- und Bannerhinweisen. Profile: `driving`, `driving-traffic`, `driving-truck`, `cycling`, `cycling-mtb`, `walking`.
- `GET /v1/isochrone/{profile}/{coordinate}`: Isochronen, also die Fläche, die in 5, 10 oder 15 Minuten erreichbar ist. Das Profil `transit` rechnet zu Fuß plus öffentlicher Verkehr.
- `GET /v1/matrix/{profile}/{coordinates}`: Fahrzeitmatrix und Entfernungen zwischen 2 bis 25 Punkten.
- `GET /v1/matching/{profile}/{coordinates}`: Map Matching, GPS-Punkte auf das Straßennetz legen.
- `GET /v1/optimized-trips/{profile}/{coordinates}`: beste Reihenfolge von bis zu 25 Stopps.
- `POST /v1/optimization`: Tourenplanung für mehrere Fahrzeuge mit Kapazitäten und Zeitfenstern.
- Lkw: Fahrzeuggewicht, Höhe, Breite und Länge werden berücksichtigt. Maut und Autobahnen lassen sich mit `exclude` meiden.

## Beispiel

Eine Route von Wien nach Melk:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/directions/driving/16.3725,48.2085;15.3294,48.2272?steps=false&overview=simplified" | jq
```

```js
const res = await fetch("https://api.mapx.at/v1/directions/driving/16.3725,48.2085;15.3294,48.2272?steps=false&overview=simplified", { headers: { Authorization: "Bearer YOUR_TOKEN" } });
const data = await res.json();
```

Wohin kommt man zu Fuß in 5, 10 und 15 Minuten?

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/isochrone/walking/16.3725,48.2085?contours_minutes=5,10,15" | jq
```

Fahrzeiten zwischen drei Orten:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/matrix/driving/16.3725,48.2085;15.3294,48.2272;14.2858,48.3069?annotations=duration,distance" | jq
```

## Woher die Daten kommen

Das Routing rechnet auf dem Routingexport der Graphenintegrations-Plattform GIP.at (CC BY 4.0). Die Mautdaten stammen von der ASFINAG (CC BY 4.0). Die Quelle sind offene Verwaltungsdaten, OpenStreetMap kommt nicht zum Einsatz.

## Einschränkungen

- Nur Österreich.
- Routen liegen in der Zone `route` mit 5 Anfragen pro Sekunde, Isochronen, Matrix, Map Matching und Optimierung in der Zone `heavy` mit 30 Anfragen pro Minute.
- Bezirksweite Lkw-Verbote aus Freitext-Verordnungen werden nicht geroutet. Betroffene Straßen stehen als Hinweis in den Abbiegeschritten.
- `exclude=toll` meidet auch vignettenfreie Autobahnabschnitte, weil der Straßengraph kein Vignettenmerkmal hat.
- Die Tourenplanung ist begrenzt auf 10 Fahrzeuge, 50 Aufträge und 60 verschiedene Orte.
- Gesetzliche Tempolimits liefert `GET /v1/speedlimits`. Modellierte Geschwindigkeiten im Graphen sind keine Limits.
- Die Quelle muss sichtbar genannt werden, JSON-Antworten tragen dafür ein Feld `attribution`.

## Loslegen

Der Zugang ist kostenlos mit Konto und Token. Parameter und Antworten stehen im [Routing-Guide](https://docs.mapx.at/de/guides/navigation/) und in der [Referenz zur Routing-API](https://docs.mapx.at/de/api/directions/).

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos starten" link="https://account.mapx.at/login?lang=de" >}}
</div>
