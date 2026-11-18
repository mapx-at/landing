---
title: "FAQ: Token, Kosten, Lizenz und Daten"
crumb: "FAQ"
key: faq
layout: topic
translationKey: faq
url: /faq/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Häufige Fragen zu mapx: Token und Konto, Kosten, kommerzielle Nutzung unter CC BY 4.0, Aktualität der Daten, Offline-Karten, Kataster und Fehler 401, 403, 429."
faq:
  - q: "Brauche ich einen Token oder ein Konto?"
    a: "Ja, ein kostenloses Konto und einen API-Token. Registriere dich auf [account.mapx.at](https://account.mapx.at/register?lang=de), lege einen Token an und sende ihn als `Authorization: Bearer` (Server) oder als `access_token` (Browser, Bilder) mit. CORS ist offen. Details: [Zugang und Limits](https://docs.mapx.at/de/start/access-and-limits/)."
  - q: "Was kostet mapx?"
    a: "Nichts. Der Zugang ist kostenlos, es gibt Rate-Limits pro Token und Zone."
  - q: "Ist kommerzielle Nutzung erlaubt?"
    a: "Ja. Die Daten stehen unter [CC BY 4.0](https://docs.mapx.at/de/reference/attribution/): Du nennst die Quelle, alles andere ist frei. Die Quellenangabe muss für die Nutzer der Karte sichtbar sein, nicht nur im Impressum."
  - q: "Verwendet mapx OpenStreetMap?"
    a: "Nein. mapx baut ausschließlich auf amtlichen offenen Daten auf, zum Beispiel von BEV, GIP.at, ASFINAG und GeoSphere Austria."
  - q: "Wie aktuell sind die Daten?"
    a: "Jedes Tileset hat ein Quelldatum. Es steht auf seiner Seite unter [Tilesets](https://docs.mapx.at/de/tilesets/) und im Feld `stand` von `GET /v1/tiles`."
  - q: "Ändert sich eine URL, wenn es neue Daten gibt?"
    a: "Nein. API-URLs und TileJSON bleiben gleich. PMTiles-Dateinamen enthalten das Datum, alte Dateien bleiben also gültig. Über das TileJSON erreichst du immer die aktuelle Datei."
  - q: "Gibt es Daten außerhalb Österreichs?"
    a: "Nein, nur Österreich. Orthofoto und Basiskarte reichen an der Grenze ein Stück in die Nachbarländer."
  - q: "Kann ich die Karten offline nutzen?"
    a: "Ja. Lade eine PMTiles-Datei herunter und liefere sie selbst aus, siehe [PMTiles selbst hosten](https://docs.mapx.at/de/guides/self-host-pmtiles/) und [QGIS](https://docs.mapx.at/de/guides/qgis/)."
  - q: "Ist der Kataster rechtsverbindlich?"
    a: "Nein. Er zeigt Grundstücksgrenzen zur Orientierung und ersetzt weder einen Grundbuchauszug noch eine Vermessung. Mehr auf der Seite [Kataster und Grundstücke](/kataster-api/)."
  - q: "Kann ich mapx in einem KI-Assistenten nutzen?"
    a: "Ja, über den gehosteten MCP-Server `https://mcp.mapx.at/mcp` mit 23 nur lesenden Werkzeugen. In claude.ai, ChatGPT und Claude Code trägst du nur die Adresse ein und meldest dich mit deinem Konto an; für andere Clients brauchst du einen Token vom Typ „KI-Assistent (MCP)“. Mehr auf der Seite [MCP-Server](/mcp-server/)."
  - q: "Was ist der Unterschied zwischen DTM und DSM?"
    a: "Das DTM ist der nackte Boden, das DSM enthält Bäume und Gebäude. Nimm das DTM für Steigungen und Profile, das DSM für Sichtbarkeit und Gebäudehöhen. Mehr auf der Seite [Höhe und Gelände](/hoehen-api/)."
  - q: "Warum bekomme ich 401 oder 403?"
    a: "`401` heißt: Der Token fehlt, ist ungültig oder abgelaufen. `403` heißt: Der Token ist gesperrt oder ein öffentlicher Token wird von einer nicht erlaubten Origin oder App verwendet (`origin-not-allowed`). Der `code` im Fehlertext nennt den Grund."
  - q: "Warum bekomme ich 429?"
    a: "Du hast das Rate-Limit der Zone überschritten. Warte die Sekunden aus `Retry-After` ab und versuche es mit wachsender Pause erneut. Bei hoher Last helfen [PMTiles](https://docs.mapx.at/de/guides/self-host-pmtiles/)."
  - q: "Meine Punkte landen im falschen Land."
    a: "Längen- und Breitengrad sind vertauscht. mapx und GeoJSON verwenden `lon,lat`, die Länge kommt zuerst."
  - q: "Meine Karte ist unscharf."
    a: "Rasterkacheln haben 512 Pixel. Setze im Client `tileSize: 512`."
  - q: "Wo melde ich ein Problem?"
    a: "Schreibe an [support@mapx.at](mailto:support@mapx.at) für technische Fragen und Fehler oder an [info@mapx.at](mailto:info@mapx.at) für alles andere."
---

# FAQ: Häufige Fragen zu mapx

<p class="mx-lead">Antworten auf die häufigsten Fragen zu Token, Kosten, Lizenz, Daten und Fehlern. Die ausführliche Fassung steht in der <a href="https://docs.mapx.at/de/start/faq/">FAQ der Dokumentation</a>.</p>
