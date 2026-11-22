---
title: "mapx – Maps and geo APIs for Austria from open government data"
lastmod: 2026-11-21
images: ["/img/og-image.png"]
description: "mapx: maps and geo APIs for Austria from open government data. Geocoding, routing, elevation, maps, transit, traffic, weather. Free with account and token."
layout: hextra-home
# All texts of the home page live here; layouts/hextra-home.html builds the page (see _index.de.md).
home:
  hero:
    h1: "The map of Austria, from open government data."
    p: "Maps, addresses, routes, elevation, timetables and weather as an API for your application. Free with an account."
    start: "Start for free"
    map: "Open map"
    trust: "Open government data from BEV, GIP.at, GeoSphere Austria, ASFINAG and ÖBB"
    chips_label: "Map styles in rotation"
    dot: "View"
    move: "Open live map"
    styles:
      - {id: relief-dark, label: "Relief", place: "Grossglockner", p: "Terrain from the BEV 1 m elevation model, here the Glockner group.", alt: "Style relief-dark: hillshade of the Glockner group in greys on black, with peaks and glaciers"}
      - {id: streets-night, label: "Night", place: "Vienna city centre", p: "A dark street map for the evening, here Vienna's city centre.", alt: "Style streets-night: Vienna city centre at night with bright roads on dark blue"}
      - {id: outdoors-winter, label: "Winter", place: "Sölden", p: "Snow, contours and lifts, here around Sölden.", alt: "Style outdoors-winter: snowy terrain around Sölden with contours and lifts"}
      - {id: traffic-night, label: "Traffic", place: "Vienna", p: "Reports from ASFINAG and EVIS.AT on a dark map, here Vienna.", alt: "Style traffic-night: Vienna's road network on dark, traffic reports highlighted in colour"}
      - {id: satellite-streets-3d, label: "3D aerial", place: "Wachau near Dürnstein", p: "Aerial imagery on the terrain, tilted and rotatable, here the Wachau near Dürnstein.", alt: "Style satellite-streets-3d: tilted view over the Danube in the Wachau near Dürnstein, aerial imagery with roads"}
  styles:
    eye: "Map styles"
    h2: "26 ready-made map styles for your application"
    p: "From a calm street map to aerial imagery, all served by the same maps API. Tap a map to move it live."
    all: "All styles in the gallery"
  d3:
    eye: "3D"
    h2: "Austria in 3D"
    p: "Terrain from the BEV laser scan, buildings as solid shapes."
    img: dark-3d
    key: city3d
    alt: "Style dark-3d: Vienna city centre in 3D, dark building blocks and the Danube Canal"
    stats:
      - {v: "1 m", t: "terrain model resolution"}
      - {v: "9", t: "map styles in 3D"}
      - {v: "26", t: "map styles in total"}
    link: "Rotate and tilt in the gallery"
  products:
    eye: "Products"
    h2: "One API for maps, addresses, routes and weather"
    p: "Every product has its own page: an example to try, the data source, the limits."
    more: "See the example"
    items:
      - {key: karten, img: karten, size: l, t: "Maps, tiles and styles", p: "Vector basemap, ready-made styles, contours and orthophoto as tiles for MapLibre.", m: "PMTiles · TileJSON"}
      - {key: routing, img: routing, size: l, t: "Routing", p: "Routes for car, truck, bike and foot, isochrones, travel-time matrices and tour planning.", m: "GIP.at · CC BY 4.0"}
      - {key: geocoding, img: geocoding, t: "Geocoding and address search", p: "Find addresses, places and streets, suggest them while typing and validate them.", m: "Address register, as of 01.10.2026"}
      - {key: hoehe, img: hoehen, t: "Elevation and terrain", p: "Heights for points and profiles from terrain and surface models at 1 m resolution.", m: "BEV · reference date 15.09.2025"}
      - {key: oev, img: oev, t: "Public transport", p: "Journeys, stops and departures from the scheduled timetable, reachability as an isochrone.", m: "ÖBB-Personenverkehr AG · CC BY 4.0"}
      - {key: verkehr, img: verkehr, t: "Traffic", p: "Traffic reports, roadworks and closures, motorway speed limits and a traffic layer.", m: "ASFINAG / EVIS.AT · CC BY 4.0"}
      - {key: statisch, img: statisch, t: "Static map images", p: "A map as PNG or WebP with pins, paths and GeoJSON, for reports and e-mails.", m: "up to 1280 × 1280 pixels"}
      - {key: wetter, img: wetter, t: "Weather and climate", p: "Observations, hourly forecast, precipitation nowcast, warnings and air quality for a point.", m: "GeoSphere Austria · CC BY 4.0"}
      - {key: mcp, size: w, t: "MCP server for AI assistants", p: "22 read-only tools for addresses, routes, weather and more, right inside Claude Code, Cursor and VS Code.", m: "MCP · Streamable HTTP"}
    mcp_label: "Example: a question to an AI assistant that uses the mapx MCP server"
    mcp_q: "How do I get from Melk to Krems at 8 tomorrow morning?"
    mcp_tool: "transit_route"
    mcp_a: "From the timetable: CJX5 from Melk station at 08:40 to St. Pölten Hbf (arr. 08:58), change to the R44 at 09:06, arriving at Krems station at 09:41. Source: mapx.at | ÖBB-Personenverkehr AG (CC BY 4.0); Datenquelle: Mobilitätsverbünde Österreich OG – data.mobilitaetsverbuende.at; GIP.at (CC BY 4.0)"
  dev:
    eye: "For developers"
    h2: "Your first map in five minutes"
    p: "A style URL and your token are all MapLibre needs. All other APIs answer with JSON or GeoJSON."
    code_h: "Map with MapLibre"
    code_c1: "public token mx_pk_… from your account"
    code_c2: "adds the token to every request to mapx.at"
    copy: "Copy"
    copied: "Copied"
    copy_fail: "Please copy by hand"
    result: "Result: style light, Salzburg old town"
    result_alt: "Result of the example: calm light map of Salzburg's old town with the Salzach, streets and buildings"
    points:
      - "Tiles as PMTiles, no map server of your own"
      - "Every gallery style via <code>/v1/styles</code>"
      - "OpenAPI and <code>llms.txt</code> for all APIs"
    more_h: "Second example: query an elevation"
    more_c: "summit height from the terrain model (DTM, 1 m)"
    docs: "Developer docs"
    docs_url: "https://docs.mapx.at/"
    first: "Read the guide"
    first_url: "https://docs.mapx.at/start/first-map/"
  access:
    eye: "Access"
    h2: "Free, with your own account and token"
    p: "The APIs need an account with a token. It costs nothing; rate limits per token protect against abuse."
    steps:
      - {t: "Sign in", p: "With your e-mail address and a code we send you. There is no password."}
      - {t: "Create a token", p: "As many as you need, and you can block, renew or delete them at any time."}
      - {t: "See your usage", p: "Per token and product, day by day. Nothing is billed."}
    tokens:
      - {c: "mx_pk_…", t: "Public token", p: "For websites and apps. Read-only, bound to your domains or your Android app."}
      - {c: "mx_sk_…", t: "Secret token", p: "For your server and scripts, never in a website or app."}
    start: "Start for free"
    details: "Details in the docs"
    details_url: "https://docs.mapx.at/start/access-and-limits/"
  data:
    eye: "Data"
    h2: "Every dataset with its source and reference date"
    p: "Only Austrian open government data, no OpenStreetMap. So you can name the publisher, reference date and licence of every dataset."
    items:
      - {t: "BEV", p: "Addresses, buildings and land use, terrain, orthophoto"}
      - {t: "GIP.at", p: "Roads, rail, routing"}
      - {t: "Umweltbundesamt", p: "Water bodies"}
      - {t: "ÖBB / transport associations", p: "Timetable"}
      - {t: "ASFINAG / EVIS.AT", p: "Traffic reports"}
      - {t: "GeoSphere Austria", p: "Weather, climate, air quality"}
      - {t: "City of Vienna", p: "Building parts in Vienna"}
  end:
    img: relief-contours
    alt: "Style relief-contours: hillshade of the Glockner group in warm tones with contour lines"
    h2: "Try the map."
    p: "Search for an address, measure a distance or draw an elevation profile."
    docs: "Read the docs"
---
