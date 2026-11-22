---
title: "MCP server for Austrian geodata"
crumb: "MCP server for AI assistants"
key: mcp
layout: topic
translationKey: mcp
url: /en/mcp-server/
lastmod: 2026-11-18
images: ["/img/og-image.png"]
description: "MCP server for Austrian geodata: AI assistants such as Claude Code, Cursor and VS Code use mapx addresses, routes, weather and traffic directly."
faq:
  - q: "What is an MCP server?"
    a: "MCP stands for Model Context Protocol, an open standard through which AI assistants call external tools. The mapx MCP server provides 22 tools for Austrian geodata. The assistant picks them itself and fills them in from your question."
  - q: "Can the assistant change anything?"
    a: "No. All 22 tools are read-only. The assistant can query data, but cannot create, change or delete anything."
  - q: "Which assistants work?"
    a: "claude.ai, ChatGPT and Claude Code sign in directly through your mapx account, without a token. Cursor, VS Code, Gemini CLI and other clients, as well as the Anthropic and OpenAI APIs, use a token."
  - q: "What does it cost?"
    a: "Access goes through your mapx account. Calls count like API calls and are visible in your account under usage. You can disconnect a connection or block a token at any time in your account."
  - q: "Are there real-time departures?"
    a: "No. The public transport tools work with the timetable, not with real-time data."
  - q: "Does the MCP server cover places outside Austria?"
    a: "No, Austria only. Every answer names its source."
---

# MCP server for Austrian geodata

<p class="mx-lead">With the hosted mapx MCP server your AI assistant can look up addresses, calculate routes, look up departures and check the weather without you writing API calls. It is meant for anyone who wants to answer questions about Austria directly in an assistant (claude.ai, ChatGPT, Claude Code, Cursor, VS Code, Gemini CLI), and for developers who give an assistant geodata. The endpoint is https://mcp.mapx.at/mcp (Model Context Protocol, Streamable HTTP).</p>

<div class="mx-btns">
{{< hextra/hero-button text="Get started free" link="https://account.mapx.at/login?lang=en" >}}
{{< hextra/hero-button text="Docs: MCP" link="https://docs.mapx.at/guides/mcp/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

## Example questions

- "How long does it take to cycle from Krems to Melk, and how much climbing is that?"
- "How high is the main square of Melk, and what does the elevation profile up to the abbey look like?"
- "Which places can I reach from Linz Hauptbahnhof by train in 30 minutes?"
- "Are there traffic reports on the A1 between Salzburg and Vienna today?"
- "How is the air quality in Graz, and what will the weather be like tomorrow in Styria?"

The assistant picks the matching tools itself and combines the results into an answer.

## The tools

There are 22 tools, all read-only, in seven groups:

- **Addresses and places:** `geocode`, `reverse_geocode`, `validate_address`, `search_places`, `list_place_categories`.
- **Routes and reachability:** `route` for car, truck, bike and foot, `isochrone`, `travel_matrix`, `optimize_stops`.
- **Public transport:** `transit_route`, `departures`, `find_stops`. Based on the timetable, not real time.
- **Elevation:** `elevation`, `elevation_profile`.
- **Traffic:** `traffic_incidents`, `speed_limits`, `sign_limits`.
- **Weather and climate:** `weather`, `weather_warnings`, `climate`, `air_quality`.
- **Map image:** `static_map`.

## Set up in three steps

The simplest way is to sign in with your mapx account, without a token:

1. Add `https://mcp.mapx.at/mcp` as an MCP server in your assistant: in claude.ai as a custom connector, in Claude Code with `claude mcp add --transport http mapx https://mcp.mapx.at/mcp` and then `/mcp`, in ChatGPT as a connector or app with your own MCP address (available depending on plan and settings).
2. Sign in at [account.mapx.at](https://account.mapx.at/login?lang=en). If you have no account yet, one is created the first time you sign in.
3. On the consent page, check what the access allows (read-only tools, no access to your account or other tokens) and confirm.

The connection appears in your account under Tokens and can be disconnected there at any time. This sign-in applies to known applications; the support can enable further ones on request.

**Alternative with a token:** Create a token of the type "AI assistant (MCP)" in your account (it starts with `mx_mcp_`) and enter it in the assistant. In Claude Code:

```bash
claude mcp add --transport http mapx https://mcp.mapx.at/mcp --header "Authorization: Bearer YOUR_MCP_TOKEN"
```

The token way works with any MCP client, including Cursor, VS Code and Gemini CLI, as well as through the Anthropic and OpenAI APIs. The steps for each assistant are in the [MCP server docs](https://docs.mapx.at/guides/mcp/).

## Where the data comes from

The tools use the same datasets as the mapx APIs: addresses and elevation from the BEV, road graph from GIP.at, timetable from ÖBB-Personenverkehr AG, traffic reports from ASFINAG / EVIS.AT, weather, climate and air quality from GeoSphere Austria. Only official open data is used, no OpenStreetMap. Every answer names its source; pass it on when you publish results.

## Limitations

- Austria only.
- All tools are read-only, the assistant changes nothing.
- Public transport is based on the timetable, not on real-time data.
- Calls count like API calls and are visible in your account under usage. You can disconnect a connection or block a token at any time in your account.
- The assistant words the answers itself. Check important details against the named source.

## Get started

Access goes through your account, by signing in or with a token. All details are in the [MCP server docs](https://docs.mapx.at/guides/mcp/).

<div class="mx-btns">
{{< hextra/hero-button text="Get started free" link="https://account.mapx.at/login?lang=en" >}}
</div>
