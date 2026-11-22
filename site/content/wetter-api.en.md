---
title: "Weather API Austria: forecast, nowcast, climate"
crumb: "Weather and climate"
key: wetter
layout: topic
translationKey: wetter
url: /en/weather-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Weather API for Austria: observations, hourly forecast, precipitation nowcast, warnings, air quality and climate from GeoSphere Austria. Free with a token."
---

# Weather API for Austria: forecast, nowcast, air quality and climate

<p class="mx-lead">The weather API returns current observations, the hourly forecast and the precipitation nowcast for a point, plus weather warnings from GeoSphere Austria, air quality and climate figures. Weather tiles can be laid over the map as a layer. It is meant for developers of weather, tourism, logistics and site-analysis applications in Austria.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Get started free" link="https://account.mapx.at/login?lang=en" >}}
{{< hextra/hero-button text="Docs: weather" link="https://docs.mapx.at/api/weather/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="wetter" >}}

## What the API can do

- `GET /v1/weather/current`: observations of the nearest stations in a 10-minute grid (temperature, humidity, wind, gusts, precipitation, pressure).
- `GET /v1/weather/forecast`: hourly forecast for a point, up to 60 hours, optionally with an uncertainty range.
- `GET /v1/weather/nowcast/{lon},{lat}`: precipitation nowcast in 15-minute steps for 3 hours, with the start and end of precipitation in minutes.
- `GET /v1/weather/warnings`: current and upcoming warnings from GeoSphere Austria up to 4 days ahead as GeoJSON, levels 1 (yellow) to 3 (red).
- `GET /v1/air-quality/{lon},{lat}`: air quality index, nitrogen dioxide, ozone, PM10, PM2.5 and Saharan dust.
- `GET /v1/climate/{lon},{lat}`: solar potential, temperature and precipitation normals, hot and snow days, drought index.
- `GET /v1/weather/tiles/{param}.json`: weather tiles such as temperature, precipitation, wind or radar nowcast for the map.

## Example

The precipitation nowcast for Vienna:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/weather/nowcast/16.3725,48.2085" | jq
```

The hourly forecast for the next 6 hours:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/weather/forecast?lng=16.3725&lat=48.2085&hours=6&ensemble=true" | jq
```

```js
const res = await fetch("https://api.mapx.at/v1/weather/forecast?lng=16.3725&lat=48.2085&hours=6&ensemble=true", { headers: { Authorization: "Bearer YOUR_TOKEN" } });
const data = await res.json();
```

Active warnings for all of Austria:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/weather/warnings?bbox=9.4,46.3,17.3,49.1&min_level=1" | jq
```

## Where the data comes from

All weather, air quality and climate data comes from GeoSphere Austria (CC BY 4.0). The forecast uses the AROME model on a 1 km grid, the nowcast the INCA model, the observations the TAWES station network and the air quality the chemical weather model on a 3 km grid. The air quality index follows the European Air Quality Index of the EEA (1 good to 6 very poor). The climate data is based on APOLIS, SPARTACUS, SNOWGRID-CL and WINFORE.

## Limitations

- Austria and a margin around it. The climate query answers `404` outside Austria.
- The values come from a cache and are not fetched from the source per request. Warnings are refreshed every 5 minutes.
- The first climate query for a new area can take 10 to 20 seconds, later ones come from the cache. If the source is unavailable the API answers `503`.
- The air quality model provides no SO2.
- The queries fall into the zone `search` with 10 requests per second per token.
- The source must be shown visibly: GeoSphere Austria, CC BY 4.0.

## Get started

Access is free with an account and a token. All parameters are in the [weather API reference](https://docs.mapx.at/api/weather/), the [air quality API](https://docs.mapx.at/api/air-quality/) and the [climate API](https://docs.mapx.at/api/climate/).

<div class="mx-btns">
{{< hextra/hero-button text="Get started free" link="https://account.mapx.at/login?lang=en" >}}
</div>
