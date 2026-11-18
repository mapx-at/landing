---
title: "Elevation API Austria: height profile and terrain"
crumb: "Elevation and terrain"
key: hoehe
layout: topic
translationKey: hoehe
url: /en/elevation-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Elevation API for Austria: height for points, elevation profile along a line, 1 m terrain model and contour lines. BEV laser scan data, free with a token."
---

# Elevation API for Austria: elevation profile and 1 m terrain model

<p class="mx-lead">The elevation API returns the height above sea level for points and elevation profiles along a line, from the terrain model or the surface model of the laser scan. The terrain is also available as tiles for hillshade and 3D views, and contour lines as vector tiles. It is meant for developers of hiking, cycling, planning and site-analysis applications in Austria.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Sign up for free" link="https://account.mapx.at/register?lang=en" >}}
{{< hextra/hero-button text="Docs: elevation" link="https://docs.mapx.at/guides/elevation/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="hoehe" >}}

## What the API can do

- `GET /v1/elevation`: heights for up to 512 points (`points`) or along a polyline (`path`, with `samples`), from the terrain model `dtm` or the surface model `dsm`.
- `GET /v1/elevation/{lon},{lat}`: terrain and surface height at one point.
- `GET /v1/elevation/profile`: elevation profile with distances, heights, ascent, descent, minimum and maximum.
- Tileset `terrain-rgb`: the terrain model as Terrain-RGB tiles for hillshade and 3D terrain in MapLibre.
- Tileset `dsm`: the surface model with buildings and vegetation in the same format.
- Tileset `contours`: contour lines as vector tiles, zoom 10 to 16, with intervals from 100 m to 10 m depending on the zoom level.

The terrain model is bare ground and suits gradients and profiles. The surface model includes trees and buildings and suits visibility and building heights.

## Example

The height at the Grossglockner:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/elevation/12.694,47.074" | jq
```

```js
const res = await fetch("https://api.mapx.at/v1/elevation?points=12.694,47.074;15.3294,48.2272&model=dtm", { headers: { Authorization: "Bearer YOUR_TOKEN" } });
const data = await res.json();
```

An elevation profile along a line:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/elevation/profile?coordinates=12.69,47.07;12.72,47.09&samples=20" | jq
```

## Where the data comes from

The models come from the laser scanning of the Federal Office of Metrology and Surveying (BEV): ALS-DTM and ALS-DOM at 1 m resolution, reference date 15.09.2025, license CC BY 4.0. Heights are encoded in steps of 0.1 m. The BEV states a height accuracy of ± 0.50 m for the terrain model, larger in high mountains. Heights refer to EVRF2000 Austria (orthometric). The contour lines are derived from the terrain model.

## Limitations

- Austria only. Outside the data area the height value is `null`.
- The data is as of 15.09.2025. Later changes in the terrain are not included.
- The elevation API falls into the zone `elevation` with 10 requests per second per token.
- Heights of bridges and tunnels in routes do not come from the terrain model.
- For bulk queries it pays to download the tiles and decode them yourself.
- The source must be shown visibly, for example `Relief: BEV – ALS-DTM 1 m (Stichtag 15.09.2025), CC BY 4.0`.

## Get started

Access is free with an account and a token. All parameters are in the [elevation API reference](https://docs.mapx.at/api/elevation/), the data sheet of the terrain model is in the [tileset docs](https://docs.mapx.at/tilesets/terrain-rgb/).

<div class="mx-btns">
{{< hextra/hero-button text="Sign up for free" link="https://account.mapx.at/register?lang=en" >}}
</div>
