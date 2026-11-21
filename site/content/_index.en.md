---
title: "mapx – Maps and geo APIs for Austria from official data"
lastmod: 2026-11-21
images: ["/img/og-image.png"]
description: "mapx: maps and geo APIs for Austria from official data. Geocoding, routing, elevation, maps, transit, traffic, weather. Free with account and token."
layout: hextra-home
# All texts of the home page live here; layouts/hextra-home.html builds the page (see _index.de.md).
home:
  hero:
    h1: "The map of Austria, built from official data."
    p: "Maps, address search, routing, terrain, public transport and weather as APIs for your own applications, free with an account."
    start: "Start for free"
    map: "Open map"
    chips_label: "Choose the map style of the preview"
    style: "Style"
    live: "View live"
    styles:
      - {id: streets-3d, key: city3d, label: "3D city"}
      - {id: relief-3d, key: terrain3d, label: "3D terrain"}
      - {id: satellite-3d, key: aerial3d, label: "3D aerial"}
      - {id: streets, key: streets, label: "Streets"}
      - {id: streets-night, key: streets, label: "Night", alt: "Style streets-night: Vienna city centre at night with bright roads on dark blue"}
      - {id: relief, key: relief, label: "Relief"}
      - {id: traffic-day, key: traffic, label: "Traffic"}
  sources: "<strong>Data sources:</strong> BEV · GIP.at · ASFINAG · GeoSphere Austria · ÖBB · Umweltbundesamt · City of Vienna · Statistik Austria · open licences, mostly CC BY 4.0"
  styles:
    h2: "Map styles"
    p: "Nine maps in 26 styles, all served by the same maps API. A click opens the live map in the gallery."
    all: "All styles in the gallery"
  d3:
    h2: "Austria in 3D"
    p: "Terrain comes from the BEV laser scan at 1 m resolution, and buildings stand as solid shapes at their height. In Vienna the building parts, such as the spire of St. Stephen's, come from the City of Vienna's building model."
    imgs: [streets-3d, relief-3d, satellite-3d]
    link: "Rotate and tilt in the gallery"
  products:
    h2: "What mapx delivers"
    p: "Each product has its own page with an example, the data source and its limitations."
    more: "Learn more"
    items:
      - {key: karten, img: karten, t: "Maps, tiles and styles", p: "Vector basemap, ready-made styles, contours and orthophoto as tiles for MapLibre.", m: "PMTiles · TileJSON"}
      - {key: geocoding, img: geocoding, t: "Geocoding and address search", p: "Find addresses, places and streets, suggest them while typing and validate them.", m: "Address register, as of 01.10.2026"}
      - {key: routing, img: routing, t: "Routing", p: "Routes for car, truck, bike and foot, isochrones, travel-time matrices and tour planning.", m: "GIP.at · CC BY 4.0"}
      - {key: hoehe, img: hoehen, t: "Elevation and terrain", p: "Heights for points and profiles from terrain and surface models at 1 m resolution.", m: "BEV · reference date 15.09.2025"}
      - {key: oev, img: oev, t: "Public transport", p: "Journeys, stops and departures from the scheduled timetable, reachability as an isochrone.", m: "ÖBB-Personenverkehr AG · CC BY 4.0"}
      - {key: verkehr, img: verkehr, t: "Traffic", p: "Traffic reports, roadworks and closures, motorway speed limits and a traffic layer.", m: "ASFINAG / EVIS.AT · CC BY 4.0"}
      - {key: statisch, img: statisch, t: "Static map images", p: "A map as PNG or WebP with pins, paths and GeoJSON, for reports and e-mails.", m: "up to 1280 × 1280 pixels"}
      - {key: wetter, img: wetter, t: "Weather and climate", p: "Observations, hourly forecast, precipitation nowcast, warnings and air quality for a point.", m: "GeoSphere Austria · CC BY 4.0"}
      - {key: mcp, t: "MCP server for AI assistants", p: "21 read-only tools for addresses, routes, weather and more, right inside Claude Code, Cursor and VS Code.", m: "MCP · Streamable HTTP"}
    mcp_label: "Example: a question to an AI assistant that uses the mapx MCP server"
    mcp_q: "How do I get from Melk to Krems at 8 tomorrow morning?"
    mcp_tool: "transit_route"
    mcp_a: "A connection from the timetable with change and arrival time, plus the source."
  dev:
    h2: "For developers"
    p: "A few lines give you a map with MapLibre. The APIs answer with JSON or GeoJSON."
    code_h: "Map with MapLibre"
    code_c1: "public token mx_pk_… from your account"
    code_c2: "adds the token to every request to mapx.at"
    result: "The result: style streets, Melk."
    result_alt: "Result of the example: street map of Melk with the Danube"
    points:
      - "<strong>MapLibre and PMTiles.</strong> Tiles via HTTP range requests, no map server of your own."
      - "<strong>Ready-made styles.</strong> Every style in the gallery is served by <code>/v1/styles</code>."
      - "<strong>Machine-readable.</strong> OpenAPI description and <code>llms.txt</code> for all APIs."
    more_h: "Second example: query an elevation"
    more_c: "summit height from the terrain model (DTM, 1 m)"
    docs: "Developer docs"
    docs_url: "https://docs.mapx.at/"
    first: "First map in five minutes"
    first_url: "https://docs.mapx.at/start/first-map/"
  access:
    h2: "Free, with your own account"
    p: "The APIs need an account with a token. It costs nothing; rate limits per token protect against abuse."
    steps:
      - {t: "Sign in", p: "With your e-mail address and a code we send you. There is no password."}
      - {t: "Create a token", p: "As many as you need, and you can block, renew or delete them at any time."}
      - {t: "See your usage", p: "Per token and product, day by day. Nothing is billed."}
    tokens: "The <strong>public token</strong> (<code>mx_pk_…</code>) is for websites and apps: it can only read and is bound to your domains or your Android app. The <strong>secret token</strong> (<code>mx_sk_…</code>) belongs on your server or in scripts, never in a website or app."
    start: "Start for free"
    details: "Details in the docs"
    details_url: "https://docs.mapx.at/start/access-and-limits/"
  data:
    h2: "A source you can name"
    p: "mapx builds maps only from data published by public authorities under open licences, each dataset with publisher, reference date and licence. We do not use OpenStreetMap; points of interest also come from official sources."
    items:
      - {t: "BEV", p: "Addresses, buildings and land use, terrain, orthophoto"}
      - {t: "GIP.at", p: "Roads, rail, routing"}
      - {t: "Umweltbundesamt", p: "Water bodies"}
      - {t: "ÖBB / transport associations", p: "Timetable"}
      - {t: "ASFINAG / EVIS.AT", p: "Traffic reports"}
      - {t: "GeoSphere Austria", p: "Weather, climate, air quality"}
      - {t: "City of Vienna", p: "Building parts in Vienna"}
  end:
    img: relief
    key: relief
    h2: "Try the map."
    p: "Search for an address, measure a distance or draw an elevation profile."
    docs: "Read the docs"
---
