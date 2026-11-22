---
title: "FAQ: token, cost, license and data"
crumb: "FAQ"
key: faq
layout: topic
translationKey: faq
url: /en/faq/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Frequently asked questions about mapx: token and account, cost, commercial use under CC BY 4.0, data freshness, tile downloads and errors 401, 403, 429."
faq:
  - q: "Do I need a token or an account?"
    a: "Yes, a free account and an API token. Sign in at [account.mapx.at](https://account.mapx.at/login?lang=en) with your email address (the first time, this creates the account), create a token and send it as `Authorization: Bearer` (servers) or `access_token` (browsers, images). CORS is open. Details: [Access and limits](https://docs.mapx.at/start/access-and-limits/)."
  - q: "What does mapx cost?"
    a: "Nothing. Access is free, rate limits apply per token and zone."
  - q: "May I use it commercially?"
    a: "Yes. The data is licensed under [CC BY 4.0](https://docs.mapx.at/reference/attribution/): you name the source, everything else is free. The attribution must be visible to the users of the map, not only in the imprint."
  - q: "Does mapx use OpenStreetMap?"
    a: "No. mapx is built exclusively on open government data, for example from BEV, GIP.at, ASFINAG and GeoSphere Austria."
  - q: "How current is the data?"
    a: "Each tileset has a source date. It is shown on its page under [Tilesets](https://docs.mapx.at/tilesets/) and in the `stand` field of `GET /v1/tiles`."
  - q: "Does a URL change when there is new data?"
    a: "No. API URLs and TileJSON stay the same. Styles and TileJSON always give you the current data."
  - q: "Is there data outside Austria?"
    a: "No, Austria only. Orthophoto and basemap extend a little into the neighboring countries at the border."
  - q: "Can I download the tiles?"
    a: "No. You get maps and tiles through the API: style, TileJSON or `{z}/{x}/{y}`, see [Maps](https://docs.mapx.at/guides/maps/) and [QGIS](https://docs.mapx.at/guides/qgis/)."
  - q: "Can I use mapx in an AI assistant?"
    a: "Yes, through the hosted MCP server `https://mcp.mapx.at/mcp` with 22 read-only tools. In claude.ai, ChatGPT and Claude Code you only enter the address and sign in with your account; other clients need a token of the type \"AI assistant (MCP)\". More on the [MCP server](/en/mcp-server/) page."
  - q: "What is the difference between DTM and DSM?"
    a: "The DTM is bare ground, the DSM includes trees and buildings. Use the DTM for gradients and profiles, the DSM for visibility and building heights. More on the page [Elevation and terrain](/en/elevation-api/)."
  - q: "Why do I get 401 or 403?"
    a: "`401` means the token is missing, invalid or expired. `403` means the token is blocked, or a public token is used from an origin or app that is not allowed (`origin-not-allowed`). The `code` in the error body names the reason."
  - q: "Why do I get 429?"
    a: "You exceeded the rate limit of the zone. Wait the seconds given in `Retry-After` and retry with a growing delay. For heavy loads, cache tiles in the client."
  - q: "My points land in the wrong country."
    a: "Longitude and latitude are swapped. mapx and GeoJSON use `lon,lat`, longitude comes first."
  - q: "My map is blurry."
    a: "Raster tiles are 512 pixels. Set `tileSize: 512` in your client."
  - q: "Where do I report a problem?"
    a: "Write to [support@mapx.at](mailto:support@mapx.at) for technical questions and bugs or to [info@mapx.at](mailto:info@mapx.at) for everything else."
  - q: "Is mapx liable for wrong results?"
    a: "No, to the extent permitted by law. mapx is a free service under development; all information is provided without guarantee and use is at your own risk. Check results yourself, especially for addresses, routes, departures and weather. Details: [Terms of use](/en/terms/)."
---

# FAQ: frequently asked questions about mapx

<p class="mx-lead">Answers to the most common questions about token, cost, license, data and errors. The detailed version is in the <a href="https://docs.mapx.at/start/faq/">FAQ of the documentation</a>.</p>
