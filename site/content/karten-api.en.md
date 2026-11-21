---
title: "Maps API Austria: vector tiles, styles, orthophoto"
crumb: "Maps, tiles and styles"
key: karten
layout: topic
translationKey: karten
url: /en/maps-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Maps API for Austria: vector tiles, ready-made map styles for MapLibre, orthophoto and aerial imagery as tiles from official data. Free with a token."
---

# Maps API for Austria: vector tiles, map styles and orthophoto

<p class="mx-lead">mapx delivers the map of Austria as ready-made styles for MapLibre GL JS and as tiles: a vector basemap, orthophoto and aerial imagery, terrain model and contour lines. You can embed a style with one line or build your own map style from the vector tiles. It is meant for developers of web and mobile maps who want to do without a map server of their own.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Get started free" link="https://account.mapx.at/login?lang=en" >}}
{{< hextra/hero-button text="Docs: maps" link="https://docs.mapx.at/guides/maps/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="karten" >}}

## What the API can do

- `GET /v1/styles` and `GET /v1/styles/{id}`: ready-made MapLibre styles `streets`, `streets-dawn`, `streets-dusk`, `streets-night`, `traffic-day`, `traffic-night`, `light`, `dark`, `satellite`, `satellite-streets`, `satellite-current`, `outdoors`, `outdoors-winter`, `relief`, `relief-contours`, `relief-light` and `relief-dark`, plus fonts and sprites.
- `GET /v1/tiles` and `GET /v1/tiles/{tileset}.json`: list of tilesets and TileJSON.
- `GET /v1/tiles/{tileset}/{z}/{x}/{y}.{ext}`: tiles in the XYZ scheme.
- `GET /v1/styles/{id}/tiles/{tilesize}/{z}/{x}/{y}`: rendered raster tiles of a style for clients without vector support.
- Tilesets: `streets` (basemap, zoom 0 to 16), `orthophoto` (aerial imagery, zoom 5 to 18, 20 cm), `contours`, `terrain-rgb` and `dsm`.
- Access through style, TileJSON or `{z}/{x}/{y}`; whole tileset files are not offered for download.

## Example

A map with the `outdoors` style (contour lines, hillshade, trails) in MapLibre. On web pages a public token (`mx_pk_…`) belongs in the URL:

```js
const map = new maplibregl.Map({
  container: "map",
  style: "https://api.mapx.at/v1/styles/outdoors?access_token=YOUR_TOKEN",
  center: [12.694, 47.074], zoom: 12,
});
```

The orthophoto (aerial imagery) with the `satellite` style. The `satellite-streets` style adds roads and labels on top:

```js
const map = new maplibregl.Map({
  container: "map",
  style: "https://api.mapx.at/v1/styles/satellite?access_token=YOUR_TOKEN",
  center: [15.3294, 48.2272], zoom: 16,
});
```

The description of a tileset with curl:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/tiles/streets.json" | jq
```

## Where the data comes from

The basemap combines open data from BEV, GIP.at, Umweltbundesamt and BMLUK in 18 layers and contains no OpenStreetMap data. Its reference date is 01.04.2026. The orthophoto comes from the BEV (reference date 03.10.2025), the tiles have 20 cm resolution, the native resolution of the source. A separate tileset shows which flight supplies which pixel. All data is licensed under CC BY 4.0.

## Limitations

- Austria only. Orthophoto and basemap extend a little into the neighboring countries at the border.
- Each tileset has its own source date. More recent changes in the landscape are only included with a new reference date.
- Raster tiles are 512 pixels, set `tileSize: 512` in your client. A `404` for a tile can mean that it lies outside the data area or zoom range. Treat it as an empty tile.
- Tiles fall into the zone `tiles` with 100 requests per second per token, rendered raster tiles into the zone `static` with 5 per second.
- The source must be shown visibly. MapLibre takes the text from the style or TileJSON automatically.

## Get started

Access is free with an account and a token. Your account creates public tokens for web pages and secret tokens for servers. Continue with the [maps guide](https://docs.mapx.at/guides/maps/), the [map styles reference](https://docs.mapx.at/api/styles/) and the [list of tilesets](https://docs.mapx.at/tilesets/).

<div class="mx-btns">
{{< hextra/hero-button text="Get started free" link="https://account.mapx.at/login?lang=en" >}}
</div>
