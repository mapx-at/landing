---
title: "Transit API Austria: journeys and departures"
crumb: "Public transport"
key: oev
layout: topic
translationKey: oev
url: /en/transit-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Transit API for Austria: journeys, stops and departure boards from the scheduled timetable of ÖBB and the regional transport associations. Free with a token."
---

# Transit API for Austria: journeys, departures and stops

<p class="mx-lead">The transit API returns public transport journeys, stops near a point and departure boards, all from the timetable. You can use it to bring stops and next departures into an app or onto a municipal web page, or to calculate how far a place can be reached by rail and bus. It is meant for developers of mobility, site and administration applications in Austria.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Get started free" link="https://account.mapx.at/login?lang=en" >}}
{{< hextra/hero-button text="Docs: transit" link="https://docs.mapx.at/guides/transit/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="oev" >}}

## What the API can do

- `GET /v1/directions/transit/{coordinates}`: journeys from an origin to a destination, with walks on the road network and rides with line, stops and times. Set the time with `depart_at` or `arrive_by`.
- `GET /v1/stops`: stops in a map extent (`bbox`) or around a point (`near`), with modes and lines.
- `GET /v1/departures`: the next departures at a stop or at all stops around a coordinate.
- `GET /v1/isochrone/transit/{coordinate}`: reachability on foot plus public transport as an isochrone. With `access=bike` or `access=car` the way to the first stop is Bike & Ride or Park & Ride.

## Example

Stops within 300 m:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/stops?near=16.3725,48.2085&radius=300&limit=5" | jq
```

The next departures around a point:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/departures?stop=16.3725,48.2085&limit=5&radius=300" | jq
```

```js
const res = await fetch("https://api.mapx.at/v1/departures?stop=16.3725,48.2085&limit=5&radius=300", { headers: { Authorization: "Bearer YOUR_TOKEN" } });
const data = await res.json();
```

A journey from A to B (without `depart_at` the time is now):

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/directions/transit/16.3725,48.2085;16.4202,48.1855" | jq
```

## Where the data comes from

The timetable data comes from ÖBB-Personenverkehr AG (CC BY 4.0), the data source is Mobilitätsverbünde Österreich OG. It covers ÖBB and the regional transport associations. Stops of the same station from different operators are merged.

## Limitations

- This is the scheduled timetable. There is no real-time data, `realtime` is always `false`. Show "scheduled" in your app.
- Outside the timetable period the API answers `422`.
- The timetable data contains no information on carrying bikes on trains.
- Austria only.
- Journeys fall into the zone `route` with 5 requests per second, stops and departures into the zone `search` with 10 per second, isochrones into the zone `heavy` with 30 per minute.
- The source must be shown visibly: ÖBB-Personenverkehr AG (CC BY 4.0), data source Mobilitätsverbünde Österreich OG.

## Get started

Access is free with an account and a token. All parameters are in the [transit guide](https://docs.mapx.at/guides/transit/) and the [transit API reference](https://docs.mapx.at/api/transit/).

<div class="mx-btns">
{{< hextra/hero-button text="Get started free" link="https://account.mapx.at/login?lang=en" >}}
</div>
