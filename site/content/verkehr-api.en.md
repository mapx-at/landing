---
title: "Traffic API Austria: incidents and roadworks"
crumb: "Traffic"
key: verkehr
layout: topic
translationKey: verkehr
url: /en/traffic-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Traffic API for Austria: traffic reports, roadworks, closures and speed limits on motorway signs from ASFINAG and EVIS.AT. Free with an account and token."
---

# Traffic API for Austria: traffic reports, roadworks and speed limits

<p class="mx-lead">The traffic API returns active traffic reports such as accidents, roadworks and closures, speed limits on motorway signs and a traffic layer for the map. You can query reports for a map extent, a road or along a route. It is meant for developers of route planners, fleet applications and traffic information in Austria.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Sign up for free" link="https://account.mapx.at/register?lang=en" >}}
{{< hextra/hero-button text="Docs: traffic" link="https://docs.mapx.at/guides/traffic/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="verkehr" >}}

## What the API can do

- `GET /v1/traffic/incidents`: reports, filterable by map extent (`bbox`), road (`road`, `road_class`), type (`type`, for example `construction` or `road_closure`), time window and planned or unplanned. Roadworks on motorways and expressways carry lane details.
- `POST /v1/traffic/incidents`: the same query with a JSON body, for example for long routes. Reports along a route are sorted by position on the route.
- `GET /v1/traffic/flow`: speed limits on variable message signs of the motorways in a map extent.
- `GET /v1/traffic/signs`: current state of signs with a position.
- `/v1/traffic/tiles.json`: traffic layer as vector tiles for the map. The `traffic-day` style shows it ready-made.
- Routing with the `driving-traffic` profile avoids binding full closures.

## Example

Active reports in the Vienna area:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/traffic/incidents?bbox=16.0,48.0,16.8,48.5&limit=5" | jq
```

```js
const res = await fetch("https://api.mapx.at/v1/traffic/incidents?bbox=16.0,48.0,16.8,48.5&limit=5", { headers: { Authorization: "Bearer YOUR_TOKEN" } });
const data = await res.json();
```

Speed limits on motorway signs in the same extent:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/traffic/flow?bbox=16.0,48.0,16.8,48.5" | jq
```

## Where the data comes from

The reports come from ASFINAG and EVIS.AT (CC BY 4.0), the road network from GIP.at (CC BY 4.0). Reports with `mandatory: true` are binding, their text is shown unchanged. The data covers the motorway and expressway network and planned roadworks on other roads.

## Limitations

- There is no area-wide traffic state. `flow` shows only speed limits on variable message signs below the free-flow speed, not a measured traffic situation.
- Of roughly 5300 signs only a small part (about 40) has a position in the source, so `signs` shows only these.
- Statutory speed limits of the road network come from `GET /v1/speedlimits` based on GIP.at.
- Austria only.
- Reports and signs fall into the zone `search` with 10 requests per second per token, traffic tiles into the zone `static` with 5 per second.
- The source must be shown visibly: ASFINAG / EVIS.AT, CC BY 4.0, road network GIP.at. With `GET /v1/traffic/status` you can check whether the data is current.

## Get started

Access is free with an account and a token. All parameters are in the [traffic guide](https://docs.mapx.at/guides/traffic/) and the [traffic API reference](https://docs.mapx.at/api/traffic/).

<div class="mx-btns">
{{< hextra/hero-button text="Sign up for free" link="https://account.mapx.at/register?lang=en" >}}
</div>
