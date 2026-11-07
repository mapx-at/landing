#!/usr/bin/env bash
# Baut die Landing mit Hugo und legt das Ergebnis in die Repo-Wurzel (GitHub Pages liefert den Branch main aus).
# Nur index.html und lp/ werden geschrieben bzw. ersetzt; style.json, styles/, legacy/, tools/, legacy-viewer.html bleiben unberührt.
# Aufruf: site/build.sh [--check]   (--check: nichts schreiben, Abweichung = Exit 1; für CI)
set -euo pipefail
cd "$(dirname "$0")"
HUGO=${HUGO:-hugo}
OUT=$(mktemp -d); trap 'rm -rf "$OUT"' EXIT
"$HUGO" --minify --cleanDestinationDir -d "$OUT" >/dev/null
[ -f "$OUT/index.html" ] && [ -d "$OUT/lp" ]
if [ "${1:-}" = "--check" ]; then
  diff -r "$OUT/lp" ../lp && diff "$OUT/index.html" ../index.html && echo "Landing-Build ist aktuell."
else
  rm -rf ../lp; cp -r "$OUT/lp" ../lp; cp "$OUT/index.html" ../index.html; echo "geschrieben: index.html, lp/"
fi
