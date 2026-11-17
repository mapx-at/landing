---
title: "Cadastre API Austria: look up parcels"
crumb: "Cadastre and parcels"
key: kataster
layout: topic
translationKey: kataster
url: /en/cadastre-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Cadastre API for Austria: look up the parcel at a point, show parcel boundaries on a map, search parcels. BEV cadastral map data, free with a token."
---

# Cadastre API for Austria: look up parcels

<p class="mx-lead">With the cadastre API you look up the parcel at a coordinate, search parcels by cadastral municipality and number and draw parcel boundaries on a map. It is meant for developers of real estate, planning and municipal applications who need data from the digital cadastral map (DKM) without preparing cadastre data themselves.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Sign up for free" link="https://account.mapx.at/register?lang=en" >}}
{{< hextra/hero-button text="Docs: parcels" link="https://docs.mapx.at/guides/parcels/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

## What the API can do

- `GET /v1/parcel/{lon},{lat}`: the parcel at a point as a polygon, with parcel number, cadastral municipality and area. Buildings return their building parcel.
- `GET /v1/parcels/{id}`: the parcel dossier. It combines what the open data say about a parcel: administrative assignment, land use shares, buildings, terrain statistics, addresses, nearest stop and climate.
- `GET /v1/geocode?types=parcel`: parcel search, for example with `KG 14143 Gst 288/4`.
- `GET /v1/tilequery/cadastre/{lon},{lat}.json`: boundary lines around a point.
- Tileset `cadastre`: parcel boundaries as vector tiles for MapLibre and QGIS.

## Example

The parcel at a point:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/parcel/15.3294,48.2272" | jq
```

```js
const res = await fetch("https://api.mapx.at/v1/parcel/15.3294,48.2272", { headers: { Authorization: "Bearer YOUR_TOKEN" } });
const data = await res.json();
```

Search a parcel by cadastral municipality and number:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/geocode?q=KG+14143+Gst+288/4&types=parcel"
```

Parcel boundaries on a MapLibre map:

```js
map.on("load", () => {
  map.addSource("cadastre", { type: "vector", url: "https://tiles.mapx.at/v1/tiles/cadastre.json" });
  map.addLayer({ id: "parcels", type: "line", source: "cadastre", "source-layer": "parcel_l",
                 paint: { "line-color": "#e11d48", "line-width": 1 } });
});
```

## Where the data comes from

The source is the digital cadastral map (DKM) of the Federal Office of Metrology and Surveying (BEV), licensed under CC BY 4.0. The tileset has the reference date 01.04.2026. The dossier covers about 10.2 million parcels and states the DKM reference date in the field `reference_date`. Only official open data is used.

## Limitations

- The data is for orientation and not legally binding. For boundary questions the cadastre at the surveying office applies.
- Owners are not included.
- The area from the point lookup is computed from the boundary lines and differs from the register value by per mille.
- The tileset has zoom level 16 only. Parcels that extend beyond a tile window of about 2 km around the point are missing from the point lookup. Outside the cadastre data the list is empty.
- Austria only. The number alone is not unique, a parcel always belongs to a cadastral municipality.
- The requests fall into the zone `search` with 10 requests per second per token.
- The source must be named visibly: `Datenquelle: BEV – DKM, CC BY 4.0`.

## Get started

Access is free with an account and a token. All details are in the [docs on parcels](https://docs.mapx.at/guides/parcels/) and in the [Tilequery and Parcel reference](https://docs.mapx.at/api/tilequery/).

<div class="mx-btns">
{{< hextra/hero-button text="Sign up for free" link="https://account.mapx.at/register?lang=en" >}}
</div>
