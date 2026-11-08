---
title: "mapx – Maps of Austria built from official data"
description: "mapx: maps of Austria built from official data. Cadastre, terrain, contours, orthophoto, addresses, routing and an elevation API. Free API access with an account and token."
layout: hextra-home
---

{{< hextra/hero-container >}}
{{< hextra/hero-badge link="https://docs.mapx.at" >}}
  Austria · official data
  {{< icon name="arrow-circle-right" attributes="height=14" >}}
{{< /hextra/hero-badge >}}

<div class="hx-mt-6 hx-mb-6">
{{< hextra/hero-headline >}}
  The map of Austria, built from official data.
{{< /hextra/hero-headline >}}
</div>

<div class="hx-mb-12">
{{< hextra/hero-subtitle >}}
  Parcels, terrain, contours, orthophoto, addresses and routing – from the cadastral map, laser scan and traffic graph of the authorities, as open tiles and APIs for your own maps.
{{< /hextra/hero-subtitle >}}
</div>

<div class="hx-mb-6 hx-flex hx-flex-wrap hx-gap-3">
{{< hextra/hero-button text="Open map" link="https://map.mapx.at" >}}
{{< hextra/hero-button text="Get free access" link="#zugang" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< /hextra/hero-container >}}

<p class="hx-text-sm hx-text-gray-500 dark:hx-text-gray-400 hx-mt-4 hx-mb-0"><strong>Data sources:</strong> BEV · GIP.at · Umweltbundesamt (GGN) · Statistik Austria · Open licences, mostly CC BY 4.0</p>

## What mapx delivers {#produkte}

Each product is its own dataset with a reference date and source. Everything you see on the map can also be embedded directly.

{{< hextra/feature-grid cols="4" >}}
  {{< hextra/feature-card title="Vector basemap" subtitle="Roads, buildings, water, boundaries and labels as vector tiles, styled after basemap.at. · *PMTiles · MapLibre*" icon="map" link="https://docs.mapx.at" >}}
  {{< hextra/feature-card title="Cadastre" subtitle="Parcel boundaries and land-use areas from the BEV digital cadastral map. · *BEV DKM · CC BY 4.0*" icon="view-grid" link="https://docs.mapx.at" >}}
  {{< hextra/feature-card title="Terrain model" subtitle="DTM and DSM from the BEV 1 m laser scan, as Terrain-RGB for hillshade and 3D terrain. · *Reference date 15.09.2025*" icon="trending-up" link="https://docs.mapx.at" >}}
  {{< hextra/feature-card title="Contours" subtitle="Contour lines computed from the terrain model, as vector tiles for hiking and planning maps. · *Zoom 10–16*" icon="chart-square-bar" link="https://docs.mapx.at" >}}
  {{< hextra/feature-card title="Orthophoto" subtitle="BEV aerial imagery as raster tiles, with metadata on survey and flight year. · *BEV · CC BY 4.0*" icon="photograph" link="https://docs.mapx.at" >}}
  {{< hextra/feature-card title="Addresses and search" subtitle="Address register, places, streets and parcels in one search index, for geocoding in your own applications. · *Address register, as of 01.10.2026*" icon="location-marker" link="https://docs.mapx.at" >}}
  {{< hextra/feature-card title="Routing" subtitle="Our own routing engine on the GIP routing export for car, bike and foot, with turn restrictions. · *GIP.at · CC BY 4.0*" icon="switch-horizontal" link="https://docs.mapx.at" >}}
  {{< hextra/feature-card title="Elevation API" subtitle="Elevation for points and profiles along a line, from the terrain or the surface model. · *REST · JSON*" icon="code" link="https://docs.mapx.at" >}}
{{< /hextra/feature-grid >}}

## Embed it in five minutes. {#entwickler}

*For developers* – Tiles are PMTiles files with HTTP range access, no map server of your own needed. The elevation API answers with GeoJSON.

- **MapLibre and PMTiles.** The style of the demo map is public and can be loaded directly.
- **A free account is all you need.** Sign in, create a token, get going. Origin, reference date and attribution are listed per product in the docs.
- **Machine-readable.** OpenAPI description and `llms.txt` for the elevation API and the tiles.

[Go to the developer docs](https://docs.mapx.at) · [See the demo](https://map.mapx.at)

**Map with MapLibre**

```js
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

maplibregl.addProtocol('pmtiles', new Protocol().tile);

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://mapx.at/style.json',
  center: [15.33, 48.23],
  zoom: 13,
  transformRequest: (url) => url.includes('mapx.at')
    ? { url, headers: { Authorization: `Bearer ${TOKEN}` } }
    : undefined
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

*API access* – The mapx APIs (tiles, search, routing, elevation) require an account with an API token as of 8 November 2026. It costs nothing: sign up, sign in, create a token.

{{< hextra/feature-grid cols="3" >}}
  {{< hextra/feature-card title="1. Sign up" subtitle="With your email address. Sign-in uses an 8-digit code we send you by email. There is no password." >}}
  {{< hextra/feature-card title="2. Create tokens" subtitle="As many as you like, each with its own name. Block, renew or delete them at any time." >}}
  {{< hextra/feature-card title="3. See your usage" subtitle="For every token you can see usage per product and day. Nothing is billed." >}}
{{< /hextra/feature-grid >}}

### Two kinds of tokens

- **Public token (`mx_pk_…`).** For websites and apps. It is read-only and bound to your domains or your Android app, so nobody else can use it.
- **Secret token (`mx_sk_…`).** For your server or scripts. Never put it in a web page or an app.

To protect against abuse there are rate limits per token. Usage itself is free of charge.

<div class="hx-mb-6 hx-flex hx-flex-wrap hx-gap-3">
{{< hextra/hero-button text="Sign up for free" link="https://account.mapx.at/register?lang=en" >}}
{{< hextra/hero-button text="Sign in" link="https://account.mapx.at/login?lang=en" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
{{< hextra/hero-button text="Details in the docs" link="https://docs.mapx.at/start/access-and-limits/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

## A source you can name. {#daten}

*Why official data* – mapx builds maps exclusively from data of public authorities under a clear open licence. Every dataset is documented with publisher, reference date and licence.

- **Cadastre, terrain, orthophoto:** Federal Office of Metrology and Surveying (BEV).
- **Roads, rail, routing:** Graph Integration Platform GIP.at.
- **Water:** national water network of the Umweltbundesamt.
- **No OpenStreetMap:** points of interest also come from official sources.

[More on the blog](https://blog.mapx.at)

![Stylised map with contours, parcels, roads and a river](/lp/img/hero-map.svg)

## Try the map.

Search an address, measure a distance or show an elevation profile.

<div class="hx-mb-6 hx-flex hx-flex-wrap hx-gap-3">
{{< hextra/hero-button text="Open map" link="https://map.mapx.at" >}}
{{< hextra/hero-button text="Read the docs" link="https://docs.mapx.at" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>
