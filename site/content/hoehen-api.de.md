---
title: "Höhen-API Österreich: Höhenprofil und Geländemodell"
crumb: "Höhe und Gelände"
key: hoehe
layout: topic
translationKey: hoehe
url: /hoehen-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Höhen-API für Österreich: Höhe für Punkte, Höhenprofil entlang einer Linie, Geländemodell mit 1 m Auflösung und Höhenlinien. BEV-Laserscan, kostenlos mit Token."
---

# Höhen-API für Österreich: Höhenprofil und Geländemodell 1 m

<p class="mx-lead">Die Höhen-API liefert die Höhe über Meer für Punkte und Höhenprofile entlang einer Linie, aus dem Geländemodell oder dem Oberflächenmodell des Laserscans. Dazu gibt es das Gelände als Kacheln für Schummerung und 3D-Ansichten und Höhenlinien als Vektorkacheln. Sie richtet sich an Entwickler von Wander-, Rad-, Planungs- und Standortanwendungen in Österreich.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos registrieren" link="https://account.mapx.at/register?lang=de" >}}
{{< hextra/hero-button text="Doku: Höhen" link="https://docs.mapx.at/de/guides/elevation/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

## Was die Schnittstelle kann

- `GET /v1/elevation`: Höhen für bis zu 512 Punkte (`points`) oder entlang eines Linienzugs (`path`, mit `samples`), wahlweise aus dem Geländemodell `dtm` oder dem Oberflächenmodell `dsm`.
- `GET /v1/elevation/{lon},{lat}`: Gelände- und Oberflächenhöhe an einem Punkt.
- `GET /v1/elevation/profile`: Höhenprofil mit Distanzen, Höhen, Anstieg, Abstieg, Minimum und Maximum.
- Tileset `terrain-rgb`: das Geländemodell als Terrain-RGB-Kacheln für Schummerung und 3D-Gelände in MapLibre.
- Tileset `dsm`: das Oberflächenmodell mit Gebäuden und Bewuchs im gleichen Format.
- Tileset `contours`: Höhenlinien als Vektorkacheln, Zoom 10 bis 16, mit Abständen von 100 m bis 10 m je nach Zoomstufe.

Das Geländemodell ist der nackte Boden und eignet sich für Steigungen und Profile. Das Oberflächenmodell enthält Bäume und Gebäude und eignet sich für Sichtbarkeit und Gebäudehöhen.

## Beispiel

Die Höhe am Großglockner:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/elevation/12.694,47.074" | jq
```

```js
const res = await fetch("https://api.mapx.at/v1/elevation?points=12.694,47.074;15.3294,48.2272&model=dtm", { headers: { Authorization: "Bearer YOUR_TOKEN" } });
const data = await res.json();
```

Ein Höhenprofil entlang einer Linie:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/elevation/profile?coordinates=12.69,47.07;12.72,47.09&samples=20" | jq
```

## Woher die Daten kommen

Die Modelle stammen aus dem Laserscanning des Bundesamts für Eich- und Vermessungswesen (BEV): ALS-DTM und ALS-DOM mit 1 m Auflösung, Stichtag 15.09.2025, Lizenz CC BY 4.0. Die Höhen sind in Schritten von 0,1 m kodiert. Das BEV gibt für das Geländemodell eine Höhengenauigkeit von ± 0,50 m an, im Hochgebirge ist sie größer. Die Höhen beziehen sich auf EVRF2000 Austria (orthometrisch). Die Höhenlinien sind aus dem Geländemodell abgeleitet.

## Einschränkungen

- Nur Österreich. Außerhalb des Datengebiets ist der Höhenwert `null`.
- Der Datenstand ist der 15.09.2025. Spätere Veränderungen im Gelände sind nicht enthalten.
- Die Höhen-API liegt in der Zone `elevation` mit 10 Anfragen pro Sekunde je Token.
- Höhen von Brücken und Tunneln in Routen stammen nicht aus dem Geländemodell.
- Für Massenabfragen lohnt es sich, die Kacheln zu laden und selbst zu dekodieren.
- Die Quelle muss sichtbar genannt werden, zum Beispiel `Relief: BEV – ALS-DTM 1 m (Stichtag 15.09.2025), CC BY 4.0`.

## Loslegen

Der Zugang ist kostenlos mit Konto und Token. Alle Parameter stehen in der [Referenz zur Höhen-API](https://docs.mapx.at/de/api/elevation/), das Datenblatt des Geländemodells in der [Doku zum Tileset](https://docs.mapx.at/de/tilesets/terrain-rgb/).

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos registrieren" link="https://account.mapx.at/register?lang=de" >}}
</div>
