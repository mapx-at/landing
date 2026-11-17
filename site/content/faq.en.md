---
title: "FAQ: token, cost, license and data"
crumb: "FAQ"
key: faq
layout: topic
translationKey: faq
url: /en/faq/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Frequently asked questions about mapx: token and account, cost, commercial use under CC BY 4.0, data freshness, offline maps, cadastre and errors 401, 403, 429."
faq:
  - q: "Do I need a token or an account?"
    a: "Yes, a free account and an API token. Register at [account.mapx.at](https://account.mapx.at/register?lang=en), create a token and send it as `Authorization: Bearer` (servers) or `access_token` (browsers, images). CORS is open. Details: [Access and limits](https://docs.mapx.at/start/access-and-limits/)."
  - q: "What does mapx cost?"
    a: "Nothing. Access is free, rate limits apply per token and zone."
  - q: "May I use it commercially?"
    a: "Yes. The data is licensed under [CC BY 4.0](https://docs.mapx.at/reference/attribution/): you name the source, everything else is free. The attribution must be visible to the users of the map, not only in the imprint."
  - q: "Does mapx use OpenStreetMap?"
    a: "No. mapx is built exclusively on official open data, for example from BEV, GIP.at, ASFINAG and GeoSphere Austria."
  - q: "How current is the data?"
    a: "Each tileset has a source date. It is shown on its page under [Tilesets](https://docs.mapx.at/tilesets/) and in the `stand` field of `GET /v1/tiles`."
  - q: "Does a URL change when there is new data?"
    a: "No. API URLs and TileJSON stay the same. PMTiles file names contain the date, so old files stay valid. Through the TileJSON you always reach the current file."
  - q: "Is there data outside Austria?"
    a: "No, Austria only. Orthophoto and basemap extend a little into the neighboring countries at the border."
  - q: "Can I use the maps offline?"
    a: "Yes. Download a PMTiles file and serve it yourself, see [Self-host PMTiles](https://docs.mapx.at/guides/self-host-pmtiles/) and [QGIS](https://docs.mapx.at/guides/qgis/)."
  - q: "Is the cadastre legally binding?"
    a: "No. It shows parcel boundaries for orientation and replaces neither a land register extract nor a survey. More on the page [Cadastre and parcels](/en/cadastre-api/)."
  - q: "Can I use mapx in an AI assistant?"
    a: "Yes, through the hosted MCP server `https://mcp.mapx.at/mcp` with 23 read-only tools. You need an account and a token of the type \"AI assistant (MCP)\". More on the [MCP server](/en/mcp-server/) page."
  - q: "What is the difference between DTM and DSM?"
    a: "The DTM is bare ground, the DSM includes trees and buildings. Use the DTM for gradients and profiles, the DSM for visibility and building heights. More on the page [Elevation and terrain](/en/elevation-api/)."
  - q: "Why do I get 401 or 403?"
    a: "`401` means the token is missing, invalid or expired. `403` means the token is blocked, or a public token is used from an origin or app that is not allowed (`origin-not-allowed`). The `code` in the error body names the reason."
  - q: "Why do I get 429?"
    a: "You exceeded the rate limit of the zone. Wait the seconds given in `Retry-After` and retry with a growing delay. For heavy loads [PMTiles](https://docs.mapx.at/guides/self-host-pmtiles/) help."
  - q: "My points land in the wrong country."
    a: "Longitude and latitude are swapped. mapx and GeoJSON use `lon,lat`, longitude comes first."
  - q: "My map is blurry."
    a: "Raster tiles are 512 pixels. Set `tileSize: 512` in your client."
  - q: "Where do I report a problem?"
    a: "Write to [support@mapx.at](mailto:support@mapx.at) for technical questions and bugs or to [info@mapx.at](mailto:info@mapx.at) for everything else."
---

# FAQ: frequently asked questions about mapx

<p class="mx-lead">Answers to the most common questions about token, cost, license, data and errors. The detailed version is in the <a href="https://docs.mapx.at/start/faq/">FAQ of the documentation</a>.</p>
