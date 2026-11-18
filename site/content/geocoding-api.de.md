---
title: "Geocoding-API Österreich: Adresssuche und Autofill"
crumb: "Geocoding und Adresssuche"
key: geocoding
layout: topic
translationKey: geocoding
url: /geocoding-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Geocoding-API für Österreich: Adresssuche, Reverse Geocoding, Adress-Autofill und Adressprüfung gegen das amtliche Adressregister. Kostenlos mit Token."
---

# Geocoding-API für Österreich: Adresssuche, Autofill und Adressprüfung

<p class="mx-lead">Die Geocoding-API wandelt Adressen und Ortsnamen in Koordinaten um und Koordinaten in die nächste Adresse. Dazu kommen Vorschläge beim Tippen, Adress-Autofill für Formulare und eine Adressprüfung. Sie richtet sich an Entwickler, die in Webseiten, Apps und Backends Adressen in Österreich suchen, ergänzen oder prüfen wollen.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos registrieren" link="https://account.mapx.at/register?lang=de" >}}
{{< hextra/hero-button text="Doku: Adresssuche" link="https://docs.mapx.at/de/guides/search/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="geocoding" >}}

## Was die Schnittstelle kann

- `GET /v1/geocode`: Vorwärts-Geocoding von Adressen, Straßen, Orten, Postleitzahlen, Bezirken und Grundstücken. Auch Straßenkilometer wie `A1 km 41` lassen sich suchen.
- `GET /v1/reverse`: Reverse Geocoding, die nächste Adresse, Straße oder der nächste Ort zu einem Punkt.
- `POST /v1/geocode/batch`: bis zu 1000 Anfragen in einem Aufruf.
- `GET /v1/searchbox/suggest` und `/v1/searchbox/retrieve/{id}`: Vorschläge beim Tippen und Details des gewählten Treffers.
- `GET /v1/autofill/suggest` und `/v1/autofill/retrieve/{id}`: Adress-Autofill mit getrennten Feldern für Straße, Hausnummer, Postleitzahl und Ort.
- `GET /v1/address/validate`: Adressprüfung mit Status `match`, `corrected`, `ambiguous` oder `not_found`.

## Beispiel

Eine Adresse in Koordinaten umwandeln:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/geocode?q=Herrengasse%2013%20Wien&limit=3&types=address" | jq
```

```js
const res = await fetch("https://api.mapx.at/v1/geocode?q=Herrengasse%2013%20Wien&limit=3&types=address", { headers: { Authorization: "Bearer YOUR_TOKEN" } });
const data = await res.json();
```

Die nächste Adresse zu einem Punkt (Koordinaten immer als `lon,lat`):

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/reverse?lng=16.3725&lat=48.2085&limit=1&types=address" | jq
```

Eine Adresse prüfen:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/address/validate?q=Herrengasse%2013,%201010%20Wien" | jq
```

## Woher die Daten kommen

Adressen, Geographische Namen, Verwaltungsgrenzen und Kataster stammen vom Bundesamt für Eich- und Vermessungswesen (BEV) und stehen unter CC BY 4.0. Der Autofill verwendet ausschließlich das amtliche Adressregister des BEV. Orte von Interesse in der Suche stammen aus amtlichen Quellen, nicht aus OpenStreetMap.

## Einschränkungen

- Nur Österreich.
- Die Suche liegt in der Zone `search` mit 10 Anfragen pro Sekunde je Token, die Stapelabfrage in der Zone `heavy` mit 30 Anfragen pro Minute. Bei Überschreitung antwortet die API mit `429` und `Retry-After`.
- Die Stapelabfrage nimmt höchstens 512 KB und 1000 Anfragen pro Aufruf.
- Für günstige Abfragen immer `types` angeben.
- Die Adressprüfung vergleicht mit dem amtlichen Register. Bei `ambiguous` liefert sie bis zu 5 Kandidaten statt einer Adresse.
- Die Quelle muss sichtbar genannt werden, JSON-Antworten tragen dafür ein Feld `attribution`.

## Loslegen

Der Zugang ist kostenlos mit Konto und Token. Alle Endpunkte und Parameter stehen in der [Referenz zur Geocoding-API](https://docs.mapx.at/de/api/geocoding/), im [Adresssuche-Guide](https://docs.mapx.at/de/guides/search/) und in der [Referenz zu Autofill und Adressprüfung](https://docs.mapx.at/de/api/address/).

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos registrieren" link="https://account.mapx.at/register?lang=de" >}}
</div>
