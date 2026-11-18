#!/usr/bin/env bash
# Baut die Landing mit Hugo (Theme Hextra, Submodul site/themes/hextra) und legt das Ergebnis in die Repo-Wurzel
# (GitHub Pages liefert den Branch main aus). Geschrieben bzw. ersetzt werden nur: index.html, en/, impressum/, die Themenseiten (PAGES_DE, unter en/ PAGES_EN), lp/, css/, js/, img/, fonts/, favicon.svg, sitemap.xml, robots.txt, llms.txt.
# style.json, styles/, legacy/, tools/, legacy-viewer.html, CNAME bleiben unberührt.
# Aufruf: site/build.sh [--check]   (--check: nichts schreiben, Abweichung = Exit 1; für CI)
# Voraussetzung: git submodule update --init; Hugo extended >= 0.134.
set -euo pipefail
cd "$(dirname "$0")"
HUGO=${HUGO:-hugo}
# Themenseiten (Verzeichnisse; Quelle content/<key>.<lang>.md, Liste in data/topics.yaml, plus faq)
PAGES_DE="kataster-api geocoding-api routing-api hoehen-api karten-api oev-api verkehr-api statische-karten wetter-api mcp-server faq"
PAGES_EN="cadastre-api geocoding-api routing-api elevation-api maps-api transit-api traffic-api static-maps weather-api mcp-server faq"
OUT=$(mktemp -d); trap 'rm -rf "$OUT"' EXIT
"$HUGO" --minify --cleanDestinationDir -d "$OUT" >/dev/null
for p in $PAGES_DE; do [ -f "$OUT/$p/index.html" ]; done
for p in $PAGES_EN; do [ -f "$OUT/en/$p/index.html" ]; done
[ -f "$OUT/index.html" ] && [ -f "$OUT/en/index.html" ] && [ -f "$OUT/impressum/index.html" ] && [ -d "$OUT/lp" ] && [ -d "$OUT/css" ] && [ -f "$OUT/sitemap.xml" ] && [ -f "$OUT/robots.txt" ] && [ -f "$OUT/llms.txt" ]
if [ "${1:-}" = "--check" ]; then
  for d in lp css js img fonts; do diff -r "$OUT/$d" "../$d"; done
  for p in $PAGES_DE; do diff "$OUT/$p/index.html" "../$p/index.html"; done
  for p in $PAGES_EN; do diff "$OUT/en/$p/index.html" "../en/$p/index.html"; done
  diff "$OUT/impressum/index.html" ../impressum/index.html && diff "$OUT/index.html" ../index.html && diff "$OUT/en/index.html" ../en/index.html && diff "$OUT/favicon.svg" ../favicon.svg && for f in sitemap.xml robots.txt llms.txt; do diff "$OUT/$f" "../$f"; done && echo "Landing-Build ist aktuell."
else
  rm -rf ../lp ../impressum ../en ../css ../js ../img ../fonts; mkdir ../en ../impressum
  for p in $PAGES_DE; do rm -rf "../$p"; mkdir "../$p"; cp "$OUT/$p/index.html" "../$p/index.html"; done
  for p in $PAGES_EN; do mkdir "../en/$p"; cp "$OUT/en/$p/index.html" "../en/$p/index.html"; done
  for d in lp css js img fonts; do cp -r "$OUT/$d" "../$d"; done
  cp "$OUT/en/index.html" ../en/index.html; cp "$OUT/impressum/index.html" ../impressum/index.html; cp "$OUT/index.html" ../index.html; cp "$OUT/favicon.svg" ../favicon.svg
  for f in sitemap.xml robots.txt llms.txt; do cp "$OUT/$f" "../$f"; done
  echo "geschrieben: index.html, en/index.html, impressum/index.html, Themenseiten, lp/, css/, js/, img/, fonts/, favicon.svg, sitemap.xml, robots.txt, llms.txt"
fi
