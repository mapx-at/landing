---
title: "MCP-Server für Österreich-Geodaten"
crumb: "MCP-Server für KI-Assistenten"
key: mcp
layout: topic
translationKey: mcp
url: /mcp-server/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "MCP-Server für Österreich-Geodaten: KI-Assistenten wie Claude Code, Cursor und VS Code nutzen Adressen, Routen, Grundstücke, Wetter und Verkehr von mapx direkt."
faq:
  - q: "Was ist ein MCP-Server?"
    a: "MCP steht für Model Context Protocol, einen offenen Standard, über den KI-Assistenten externe Werkzeuge aufrufen. Der mapx-MCP-Server stellt 23 Werkzeuge für Österreich-Geodaten bereit, die der Assistent selbst auswählt und mit den Angaben aus deiner Frage füllt."
  - q: "Kann der Assistent etwas verändern?"
    a: "Nein. Alle 23 Werkzeuge lesen nur. Der Assistent kann Daten abfragen, aber nichts anlegen, ändern oder löschen."
  - q: "Welche Assistenten funktionieren?"
    a: "Claude Code, Cursor, VS Code und Gemini CLI sowie die APIs von Anthropic und OpenAI. Die Anmeldung für claude.ai und ChatGPT ohne Token, über dein Konto, folgt."
  - q: "Was kostet die Nutzung?"
    a: "Der Zugang läuft über dein mapx-Konto. Aufrufe zählen wie API-Aufrufe und sind im Konto unter Nutzung sichtbar. Einen Token sperrst du jederzeit."
  - q: "Gibt es Echtzeit-Abfahrten?"
    a: "Nein. Die Werkzeuge für den öffentlichen Verkehr arbeiten mit dem Fahrplan, nicht mit Echtzeitdaten."
  - q: "Gilt der MCP-Server außerhalb Österreichs?"
    a: "Nein, nur Österreich. Jede Antwort nennt ihre Quelle."
---

# MCP-Server für Österreich-Geodaten

<p class="mx-lead">Mit dem gehosteten MCP-Server von mapx kann dein KI-Assistent Adressen suchen, Routen berechnen, Grundstücke abfragen und das Wetter nachsehen, ohne dass du selbst API-Aufrufe schreibst. Er richtet sich an alle, die Fragen zu Österreich direkt im Assistenten (Claude Code, Cursor, VS Code, Gemini CLI) beantworten wollen, und an Entwickler, die einen Assistenten mit Geodaten ausstatten. Der Endpunkt ist https://mcp.mapx.at/mcp (Model Context Protocol, Streamable HTTP).</p>

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos registrieren" link="https://account.mapx.at/register?lang=de" >}}
{{< hextra/hero-button text="Doku: MCP" link="https://docs.mapx.at/de/guides/mcp/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

## Beispielfragen

- „Wie lange fahre ich mit dem Rad von Krems nach Melk, und wie viele Höhenmeter sind das?“
- „Welches Grundstück liegt bei 15.3294, 48.2272, und zu welcher Katastralgemeinde gehört es?“
- „Welche Orte erreiche ich von Linz Hauptbahnhof in 30 Minuten mit dem Zug?“
- „Gibt es heute Verkehrsmeldungen auf der A1 zwischen Salzburg und Wien?“
- „Wie ist die Luftqualität in Graz, und gibt es Wetterwarnungen für die Steiermark?“

Der Assistent wählt dazu selbst die passenden Werkzeuge und verbindet die Ergebnisse zu einer Antwort.

## Die Werkzeuge

Es sind 23 Werkzeuge, alle nur lesend, in acht Gruppen:

- **Adressen und Orte:** `geocode`, `reverse_geocode`, `validate_address`, `search_places`.
- **Routen und Erreichbarkeit:** `route` für Auto, Lkw, Rad und zu Fuß, `isochrone`, `travel_matrix`, `optimize_stops`.
- **Öffentlicher Verkehr:** `transit_route`, `departures`, `find_stops`. Grundlage ist der Fahrplan, keine Echtzeit.
- **Höhe:** `elevation`, `elevation_profile`.
- **Grundstücke:** `parcel_at_point`, `parcel_details` aus dem Kataster des BEV.
- **Verkehr:** `traffic_incidents`, `speed_limits`.
- **Wetter und Klima:** `weather`, `weather_warnings`, `climate`, `air_quality`.
- **Kartenbild:** `static_map`.

## Einrichtung in drei Schritten

1. Lege ein Konto auf [account.mapx.at](https://account.mapx.at/register?lang=de) an.
2. Lege dort einen Token vom Typ „KI-Assistent (MCP)“ an. Er beginnt mit `mx_mcp_`.
3. Trage den Server in deinem Assistenten ein. In Claude Code:

```bash
claude mcp add --transport http mapx https://mcp.mapx.at/mcp --header "Authorization: Bearer YOUR_MCP_TOKEN"
```

Das funktioniert mit Claude Code, Cursor, VS Code und Gemini CLI sowie über die APIs von Anthropic und OpenAI. Die Anmeldung für claude.ai und ChatGPT ohne Token, über dein Konto, folgt. Die Schritte für jeden Assistenten stehen in der [Doku zum MCP-Server](https://docs.mapx.at/de/guides/mcp/).

## Woher die Daten kommen

Die Werkzeuge greifen auf dieselben Datensätze zu wie die mapx-APIs: Kataster und Höhen vom BEV, Straßengraph von GIP.at, Fahrplan der ÖBB-Personenverkehr AG, Verkehrsmeldungen von ASFINAG / EVIS.AT, Wetter, Klima und Luftqualität von GeoSphere Austria. Es kommen nur amtliche offene Daten zum Einsatz, kein OpenStreetMap. Jede Antwort nennt ihre Quelle, gib sie weiter, wenn du Ergebnisse veröffentlichst.

## Einschränkungen

- Nur Österreich.
- Alle Werkzeuge lesen nur, der Assistent ändert nichts.
- Der öffentliche Verkehr beruht auf dem Fahrplan, nicht auf Echtzeitdaten.
- Grundstücksdaten dienen der Orientierung und sind nicht rechtsverbindlich.
- Aufrufe zählen wie API-Aufrufe und sind im Konto unter Nutzung sichtbar. Einen Token kannst du jederzeit sperren.
- Der Assistent formuliert die Antworten selbst. Prüfe wichtige Angaben an der genannten Quelle.

## Loslegen

Der Zugang läuft über ein Konto mit Token. Alle Details stehen in der [Doku zum MCP-Server](https://docs.mapx.at/de/guides/mcp/).

<div class="mx-btns">
{{< hextra/hero-button text="Kostenlos registrieren" link="https://account.mapx.at/register?lang=de" >}}
</div>
