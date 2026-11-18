---
title: "Kataster-API Österreich: Grundstücke abfragen"
crumb: "Kataster und Grundstücke"
key: kataster
layout: topic
translationKey: kataster
url: /kataster-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Kataster-API für Österreich: Grundstück an einem Punkt abfragen, Grundstücksgrenzen als Karte zeigen, Parzellen suchen. DKM des BEV, kostenlos mit Token."
---

# Kataster-API für Österreich: Grundstücke abfragen

<p class="mx-lead">Mit der Kataster-API fragst du das Grundstück an einer Koordinate ab, suchst Grundstücke nach Katastralgemeinde und Nummer und zeichnest Grundstücksgrenzen auf eine Karte. Sie richtet sich an Entwickler von Immobilien-, Planungs- und Gemeindeanwendungen, die Daten der Digitalen Katastralmappe (DKM) brauchen, ohne selbst Katasterdaten aufzubereiten.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos registrieren" link="https://account.mapx.at/register?lang=de" >}}
{{< hextra/hero-button text="Doku: Grundstücke" link="https://docs.mapx.at/de/guides/parcels/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="kataster" >}}

## Was die Schnittstelle kann

- `GET /v1/parcel/{lon},{lat}`: das Grundstück an einem Punkt als Polygon, mit Grundstücksnummer, Katastralgemeinde und Fläche. Gebäude liefern ihr Baugrundstück.
- `GET /v1/parcels/{id}`: das Grundstücks-Dossier. Es fasst zusammen, was die offenen Daten zu einem Grundstück sagen: Verwaltungszuordnung, Nutzungsanteile, Gebäude, Geländestatistik, Adressen, nächste Haltestelle und Klima.
- `GET /v1/geocode?types=parcel`: Grundstückssuche, etwa mit `KG 14143 Gst 288/4`.
- `GET /v1/tilequery/cadastre/{lon},{lat}.json`: Grenzlinien rund um einen Punkt.
- Tileset `cadastre`: Grundstücksgrenzen als Vektorkacheln für MapLibre und QGIS.

## Beispiel

Grundstück an einem Punkt:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/parcel/15.3294,48.2272" | jq
```

```js
const res = await fetch("https://api.mapx.at/v1/parcel/15.3294,48.2272", { headers: { Authorization: "Bearer YOUR_TOKEN" } });
const data = await res.json();
```

Grundstück nach Katastralgemeinde und Nummer suchen:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/geocode?q=KG+14143+Gst+288/4&types=parcel"
```

Grundstücksgrenzen auf einer MapLibre-Karte:

```js
map.on("load", () => {
  map.addSource("cadastre", { type: "vector", url: "https://tiles.mapx.at/v1/tiles/cadastre.json" });
  map.addLayer({ id: "parcels", type: "line", source: "cadastre", "source-layer": "parcel_l",
                 paint: { "line-color": "#e11d48", "line-width": 1 } });
});
```

## Woher die Daten kommen

Quelle ist die Digitale Katastralmappe (DKM) des Bundesamts für Eich- und Vermessungswesen (BEV), lizenziert unter CC BY 4.0. Das Tileset hat den Stichtag 01.04.2026. Das Dossier deckt rund 10,2 Millionen Grundstücke ab und nennt den Stichtag der DKM im Feld `reference_date`. Es kommen nur amtliche offene Daten zum Einsatz.

## Einschränkungen

- Die Daten dienen der Orientierung und sind nicht rechtsverbindlich. Für Grenzfragen gilt der Kataster beim Vermessungsamt.
- Eigentümer sind nicht enthalten.
- Die Fläche der Punktabfrage wird aus den Grenzlinien berechnet und weicht um Promille vom Registerwert ab.
- Das Tileset hat nur Zoomstufe 16. Grundstücke, die über ein Kachelfenster von etwa 2 km um den Punkt hinausreichen, fehlen in der Punktabfrage. Außerhalb der Katasterdaten ist die Liste leer.
- Nur Österreich. Die Nummer allein ist nicht eindeutig, zu einem Grundstück gehört immer die Katastralgemeinde.
- Die Abfragen liegen in der Zone `search` mit 10 Anfragen pro Sekunde je Token.
- Die Quelle muss sichtbar genannt werden: `Datenquelle: BEV – DKM, CC BY 4.0`.

## Loslegen

Der Zugang ist kostenlos mit Konto und Token. Alle Details stehen in der [Doku zu Grundstücken](https://docs.mapx.at/de/guides/parcels/) und in der [Referenz zu Tilequery und Parcel](https://docs.mapx.at/de/api/tilequery/).

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos registrieren" link="https://account.mapx.at/register?lang=de" >}}
</div>
