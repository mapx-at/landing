---
title: "Verkehrs-API Österreich: Meldungen und Baustellen"
crumb: "Verkehr"
key: verkehr
layout: topic
translationKey: verkehr
url: /verkehr-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Verkehrs-API für Österreich: Verkehrsmeldungen, Baustellen, Sperren und Tempolimits auf Autobahnanzeigen von ASFINAG und EVIS.AT. Kostenlos mit Token."
---

# Verkehrs-API für Österreich: Verkehrsmeldungen, Baustellen und Tempolimits

<p class="mx-lead">Die Verkehrs-API liefert aktive Verkehrsmeldungen wie Unfälle, Baustellen und Sperren, Tempolimits auf den Anzeigen der Autobahnen und eine Verkehrsebene für die Karte. Du kannst Meldungen für einen Kartenausschnitt, eine Straße oder entlang einer Route abfragen. Sie richtet sich an Entwickler von Routenplanern, Flottenanwendungen und Verkehrsinformation in Österreich.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos starten" link="https://account.mapx.at/login?lang=de" >}}
{{< hextra/hero-button text="Doku: Verkehr" link="https://docs.mapx.at/de/guides/traffic/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="verkehr" >}}

## Was die Schnittstelle kann

- `GET /v1/traffic/incidents`: Meldungen, filterbar nach Kartenausschnitt (`bbox`), Straße (`road`, `road_class`), Art (`type`, zum Beispiel `construction` oder `road_closure`), Zeitfenster und geplant oder ungeplant. Baustellen auf Autobahnen und Schnellstraßen tragen Fahrstreifen-Details.
- `POST /v1/traffic/incidents`: dieselbe Abfrage mit JSON-Body, etwa für lange Routen. Die Meldungen entlang einer Route sind nach der Position auf der Route sortiert.
- `GET /v1/traffic/sign-limits`: Tempolimits auf Wechselverkehrszeichen der Autobahnen in einem Kartenausschnitt.
- `GET /v1/traffic/signs`: aktueller Zustand von Anzeigen mit Position.
- `/v1/traffic/tiles.json`: Verkehrsebene als Vektorkacheln für die Karte. Die Stile `traffic-day` und `traffic-night` zeigen sie fertig.
- Routing mit dem Profil `driving-traffic` umfährt verbindliche Totalsperren.

## Beispiel

Aktive Meldungen im Raum Wien:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/traffic/incidents?bbox=16.0,48.0,16.8,48.5&limit=5" | jq
```

```js
const res = await fetch("https://api.mapx.at/v1/traffic/incidents?bbox=16.0,48.0,16.8,48.5&limit=5", { headers: { Authorization: "Bearer YOUR_TOKEN" } });
const data = await res.json();
```

Tempolimits auf Autobahnanzeigen im selben Ausschnitt:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/traffic/sign-limits?bbox=16.0,48.0,16.8,48.5" | jq
```

## Woher die Daten kommen

Die Meldungen stammen von der ASFINAG und EVIS.AT (CC BY 4.0), das Straßennetz von der GIP.at (CC BY 4.0). Meldungen mit `mandatory: true` sind verbindlich, ihr Text wird unverändert angezeigt. Die Daten decken das Autobahn- und Schnellstraßennetz und geplante Baustellen auf anderen Straßen ab.

## Einschränkungen

- Es gibt keinen flächendeckenden Verkehrszustand. `flow` zeigt nur Tempolimits auf Wechselverkehrszeichen unterhalb der freien Geschwindigkeit, keine gemessene Verkehrslage.
- Von rund 5300 Anzeigen hat nur ein kleiner Teil (etwa 40) eine Position in der Quelle, deshalb zeigt `signs` nur diese.
- Gesetzliche Tempolimits des Straßennetzes liefert `GET /v1/speedlimits` aus der GIP.at.
- Nur Österreich.
- Meldungen und Anzeigen liegen in der Zone `search` mit 10 Anfragen pro Sekunde je Token, die Verkehrskacheln in der Zone `static` mit 5 pro Sekunde.
- Die Quelle muss sichtbar genannt werden: ASFINAG / EVIS.AT, CC BY 4.0, Straßennetz GIP.at. Mit `GET /v1/traffic/status` prüfst du, ob die Daten aktuell sind.

## Loslegen

Der Zugang ist kostenlos mit Konto und Token. Alle Parameter stehen im [Verkehrs-Guide](https://docs.mapx.at/de/guides/traffic/) und in der [Referenz zur Verkehrs-API](https://docs.mapx.at/de/api/traffic/).

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos starten" link="https://account.mapx.at/login?lang=de" >}}
</div>
