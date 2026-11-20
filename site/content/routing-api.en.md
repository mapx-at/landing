---
title: "Routing API Austria: directions and isochrones"
crumb: "Routing"
key: routing
layout: topic
translationKey: routing
url: /en/routing-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Routing API for Austria: routes for car, truck, bike and foot, isochrones, travel-time matrix and tour optimization on the GIP road graph. Free with a token."
---

# Routing API for Austria: directions, isochrones and travel-time matrix

<p class="mx-lead">The routing API calculates routes for car, truck, bike and foot on the Austrian road graph. It also returns isochrones, travel-time matrices, map matching and tour optimization. It is meant for developers of route planners and of logistics, tourism and site-analysis applications in Austria.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Get started free" link="https://account.mapx.at/login?lang=en" >}}
{{< hextra/hero-button text="Docs: routing" link="https://docs.mapx.at/guides/navigation/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="routing" >}}

## What the API can do

- `GET /v1/directions/{profile}/{coordinates}`: routes with 2 to 25 points, optionally with turn-by-turn steps, alternatives and voice and banner instructions. Profiles: `driving`, `driving-traffic`, `driving-truck`, `cycling`, `cycling-mtb`, `walking`.
- `GET /v1/isochrone/{profile}/{coordinate}`: isochrones, the area reachable in 5, 10 or 15 minutes. The profile `transit` calculates walking plus public transport.
- `GET /v1/matrix/{profile}/{coordinates}`: travel-time matrix and distances between 2 to 25 points.
- `GET /v1/matching/{profile}/{coordinates}`: map matching, snapping GPS points to the road network.
- `GET /v1/optimized-trips/{profile}/{coordinates}`: the best order for up to 25 stops.
- `POST /v1/optimization`: tour planning for several vehicles with capacities and time windows.
- Trucks: vehicle weight, height, width and length are taken into account. Tolls and motorways can be avoided with `exclude`.

## Example

A route from Vienna to Melk:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/directions/driving/16.3725,48.2085;15.3294,48.2272?steps=false&overview=simplified" | jq
```

```js
const res = await fetch("https://api.mapx.at/v1/directions/driving/16.3725,48.2085;15.3294,48.2272?steps=false&overview=simplified", { headers: { Authorization: "Bearer YOUR_TOKEN" } });
const data = await res.json();
```

Where can you get on foot in 5, 10 and 15 minutes?

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/isochrone/walking/16.3725,48.2085?contours_minutes=5,10,15" | jq
```

Travel times between three places:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/matrix/driving/16.3725,48.2085;15.3294,48.2272;14.2858,48.3069?annotations=duration,distance" | jq
```

## Where the data comes from

Routing runs on the routing export of the Graph Integration Platform GIP.at (CC BY 4.0). Toll data comes from ASFINAG (CC BY 4.0). The source is official, OpenStreetMap is not used.

## Limitations

- Austria only.
- Routes fall into the zone `route` with 5 requests per second, isochrones, matrix, map matching and optimization into the zone `heavy` with 30 requests per minute.
- District-wide truck bans from free-text ordinances are not routed. Affected roads appear as a notice in the steps.
- `exclude=toll` also avoids motorway sections that need no vignette, because the road graph has no vignette attribute.
- Tour planning is limited to 10 vehicles, 50 jobs and 60 distinct locations.
- Statutory speed limits come from `GET /v1/speedlimits`. Modeled speeds in the graph are not limits.
- The source must be shown visibly, JSON responses carry an `attribution` field for this.

## Get started

Access is free with an account and a token. Parameters and responses are in the [routing guide](https://docs.mapx.at/guides/navigation/) and the [routing API reference](https://docs.mapx.at/api/directions/).

<div class="mx-btns">
{{< hextra/hero-button text="Get started free" link="https://account.mapx.at/login?lang=en" >}}
</div>
