#!/usr/bin/env bash
# Baut die Landing mit Hugo und legt das Ergebnis in die Repo-Wurzel (GitHub Pages liefert den Branch main aus).
# Nur index.html, en/ und lp/ werden geschrieben bzw. ersetzt; style.json, styles/, legacy/, tools/, legacy-viewer.html bleiben unberührt.
# Aufruf: site/build.sh [--check]   (--check: nichts schreiben, Abweichung = Exit 1; für CI)
set -euo pipefail
cd "$(dirname "$0")"
HUGO=${HUGO:-hugo}
OUT=$(mktemp -d); trap 'rm -rf "$OUT"' EXIT
"$HUGO" --minify --cleanDestinationDir -d "$OUT" >/dev/null
[ -f "$OUT/index.html" ] && [ -f "$OUT/en/index.html" ] && [ -d "$OUT/lp" ]
if [ "${1:-}" = "--check" ]; then
  diff -r "$OUT/lp" ../lp && diff "$OUT/index.html" ../index.html && diff "$OUT/en/index.html" ../en/index.html && echo "Landing-Build ist aktuell."
else
  rm -rf ../lp ../en; cp -r "$OUT/lp" ../lp; mkdir ../en; cp "$OUT/en/index.html" ../en/index.html; cp "$OUT/index.html" ../index.html; echo "geschrieben: index.html, en/index.html, lp/"
fi
