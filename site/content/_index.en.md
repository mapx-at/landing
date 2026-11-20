---
title: "mapx – Maps and geo APIs for Austria from official data"
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "mapx: maps and geo APIs for Austria from official data. Geocoding, routing, elevation, maps, transit, traffic, weather. Free with account and token."
layout: hextra-home
---

<div class="mx-hero"><div class="mx-hero-text">

<div>
{{< hextra/hero-badge link="https://docs.mapx.at" >}}
  Austria · official data
  {{< icon name="arrow-circle-right" attributes="height=14" >}}
{{< /hextra/hero-badge >}}
</div>

<div>
{{< hextra/hero-headline >}}
  The map of Austria, built from official data.
{{< /hextra/hero-headline >}}
</div>

<div>
{{< hextra/hero-subtitle >}}
  Addresses, routing, terrain, orthophoto, public transport, traffic reports and weather – from the cadastral map, laser scan, road graph and timetable of the authorities, as open tiles and APIs for your own maps.
{{< /hextra/hero-subtitle >}}
</div>

<div class="mx-btns">
{{< hextra/hero-button text="Open map" link="https://map.mapx.at" >}}
{{< hextra/hero-button text="Get free access" link="#zugang" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>
</div>

<div class="mx-hero-img"><img src="/lp/img/hero-map.webp" alt="Dark mapx map of Innsbruck with roads, the river Inn and contours" width="1600" height="900" fetchpriority="high"><p class="mx-hero-cap">Style <code>streets-night</code>, Innsbruck. Data: BEV, GIP.at, CC BY 4.0</p></div>
</div>

<p class="mx-note"><strong>Data sources:</strong> BEV · GIP.at · ASFINAG · GeoSphere Austria · ÖBB · Umweltbundesamt (GGN) · Statistik Austria · Open licences, mostly CC BY 4.0</p>

## What mapx delivers {#produkte}

Each product is its own dataset with a reference date and source. Each product has its own page with an example, the data source and limitations. Everything you see on the map can also be embedded directly.

{{< hextra/feature-grid cols="3" >}}
  {{< hextra/feature-card title="Maps, tiles and styles" subtitle="Vector basemap, ready-made map styles, contours and orthophoto as vector and raster tiles for MapLibre. · *PMTiles · TileJSON*" icon="map" link="/en/maps-api/" >}}
  {{< hextra/feature-card title="Geocoding and address search" subtitle="Address register, places and streets: geocoding, reverse geocoding, type-ahead search, autofill and address validation. · *Address register, as of 01.10.2026*" icon="location-marker" link="/en/geocoding-api/" >}}
  {{< hextra/feature-card title="Routing" subtitle="Routes for car, truck, bike and foot, isochrones, travel-time matrices and tour planning on the GIP road graph. · *GIP.at · CC BY 4.0*" icon="switch-horizontal" link="/en/routing-api/" >}}
  {{< hextra/feature-card title="Elevation and terrain" subtitle="Elevation API for points and profiles, terrain model (DTM) and surface model (DSM) at 1 m resolution, contour lines. · *BEV · reference date 15.09.2025*" icon="trending-up" link="/en/elevation-api/" >}}
  {{< hextra/feature-card title="Public transport" subtitle="Journeys, stops and departures from the scheduled timetable, reachability by public transport as an isochrone. · *ÖBB-Personenverkehr AG · CC BY 4.0*" icon="ticket" link="/en/transit-api/" >}}
  {{< hextra/feature-card title="Traffic" subtitle="Traffic reports, roadworks and closures, speed limits on variable message signs on motorways and a traffic layer for the map. · *ASFINAG / EVIS.AT · CC BY 4.0*" icon="exclamation-circle" link="/en/traffic-api/" >}}
  {{< hextra/feature-card title="Static map images" subtitle="A map as PNG or WebP with pins, paths and GeoJSON, for reports, e-mails and property listings. · *up to 1280 × 1280 pixels*" icon="photograph" link="/en/static-maps/" >}}
  {{< hextra/feature-card title="Weather and climate" subtitle="Observations, hourly forecast, precipitation nowcast, warnings, air quality and climate for a point. · *GeoSphere Austria · CC BY 4.0*" icon="cloud" link="/en/weather-api/" >}}
  {{< hextra/feature-card title="MCP server for AI assistants" subtitle="21 read-only tools for addresses, routes, weather and more, directly in Claude Code, Cursor and VS Code. · *MCP · Streamable HTTP*" icon="chip" link="/en/mcp-server/" >}}
{{< /hextra/feature-grid >}}

All ready-made map styles with preview and live map: [map style gallery](/en/gallery/) →

## Embed it in five minutes. {#entwickler}

*For developers* – Tiles are PMTiles files with HTTP range access, no map server of your own needed. The APIs answer with JSON or GeoJSON.

- **MapLibre and PMTiles.** Ready-made map styles come from the maps API (`/v1/styles`).
- **A free account is all you need.** Sign in, create a token, get going. Origin, reference date and attribution are listed per product in the docs.
- **Machine-readable.** OpenAPI description and `llms.txt` for all APIs and the tiles.

[Go to the developer docs](https://docs.mapx.at) · [See the demo](https://map.mapx.at)

**Map with MapLibre**

```js
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

const TOKEN = 'YOUR_TOKEN'; // public token mx_pk_… from your account
maplibregl.addProtocol('pmtiles', new Protocol().tile);

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.mapx.at/v1/styles/streets',
  // appends the token to every request to mapx.at (style, tiles, fonts, sprites)
  transformRequest: (url) => ({ url: /^https:\/\/([\w-]+\.)?mapx\.at\//.test(url)
    ? url + (url.includes('?') ? '&' : '?') + 'access_token=' + TOKEN : url }),
  center: [15.33, 48.23],
  zoom: 13
});
```

**Query elevation**

```js
// Summit elevation from the terrain model (DTM, 1 m); token from your account
const r = await fetch(
  'https://api.mapx.at/v1/elevation?points=12.694,47.074',
  { headers: { Authorization: `Bearer ${TOKEN}` } }
);
const { features } = await r.json();
console.log(features[0].properties.elevation);
```

## Free, with your own account. {#zugang}

*API access* – The mapx APIs (tiles, search, routing, elevation, transit, traffic, images, weather) require an account with an API token as of 8 November 2026. It costs nothing: sign in, create a token, get going.

{{< hextra/feature-grid cols="3" >}}
  {{< hextra/feature-card title="1. Sign in" subtitle="With your email address and an 8-digit code we send you by email. The first time, this creates your account. There is no password." >}}
  {{< hextra/feature-card title="2. Create tokens" subtitle="As many as you like, each with its own name. Block, renew or delete them at any time." >}}
  {{< hextra/feature-card title="3. See your usage" subtitle="For every token you can see usage per product and day. Nothing is billed." >}}
{{< /hextra/feature-grid >}}

### Two kinds of tokens

- **Public token (`mx_pk_…`).** For websites and apps. It is read-only and bound to your domains or your Android app, so nobody else can use it.
- **Secret token (`mx_sk_…`).** For your server or scripts. Never put it in a web page or an app.

To protect against abuse there are rate limits per token. Usage itself is free of charge.

<div class="mx-btns">
{{< hextra/hero-button text="Get started free" link="https://account.mapx.at/login?lang=en" >}}
{{< hextra/hero-button text="Details in the docs" link="https://docs.mapx.at/start/access-and-limits/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

## A source you can name. {#daten}

*Why official data* – mapx builds maps exclusively from data of public authorities under a clear open licence. Every dataset is documented with publisher, reference date and licence.

- **Addresses, cadastral map (buildings, land use), terrain, orthophoto:** Federal Office of Metrology and Surveying (BEV).
- **Roads, rail, routing:** Graph Integration Platform GIP.at.
- **Water:** national water network of the Umweltbundesamt.
- **Timetable:** ÖBB-Personenverkehr AG, data source Mobilitätsverbünde Österreich OG.
- **Traffic reports:** ASFINAG / EVIS.AT.
- **Weather, climate, air quality:** GeoSphere Austria.
- **No OpenStreetMap:** points of interest also come from official sources.

## Try the map.

Search an address, measure a distance or show an elevation profile.

<div class="mx-btns">
{{< hextra/hero-button text="Open map" link="https://map.mapx.at" >}}
{{< hextra/hero-button text="Read the docs" link="https://docs.mapx.at" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>
