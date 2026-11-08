#!/usr/bin/env bash
# Baut die Landing mit Hugo (Theme Hextra, Submodul site/themes/hextra) und legt das Ergebnis in die Repo-Wurzel
# (GitHub Pages liefert den Branch main aus). Geschrieben bzw. ersetzt werden nur: index.html, en/, impressum/, lp/, css/, js/, img/, fonts/, favicon.svg.
# style.json, styles/, legacy/, tools/, legacy-viewer.html, CNAME bleiben unberührt.
# Aufruf: site/build.sh [--check]   (--check: nichts schreiben, Abweichung = Exit 1; für CI)
# Voraussetzung: git submodule update --init; Hugo extended >= 0.134.
set -euo pipefail
cd "$(dirname "$0")"
HUGO=${HUGO:-hugo}
OUT=$(mktemp -d); trap 'rm -rf "$OUT"' EXIT
"$HUGO" --minify --cleanDestinationDir -d "$OUT" >/dev/null
[ -f "$OUT/index.html" ] && [ -f "$OUT/en/index.html" ] && [ -f "$OUT/impressum/index.html" ] && [ -d "$OUT/lp" ] && [ -d "$OUT/css" ]
if [ "${1:-}" = "--check" ]; then
  for d in lp css js img fonts; do diff -r "$OUT/$d" "../$d"; done
  diff "$OUT/impressum/index.html" ../impressum/index.html && diff "$OUT/index.html" ../index.html && diff "$OUT/en/index.html" ../en/index.html && diff "$OUT/favicon.svg" ../favicon.svg && echo "Landing-Build ist aktuell."
else
  rm -rf ../lp ../impressum ../en ../css ../js ../img ../fonts; mkdir ../en ../impressum
  for d in lp css js img fonts; do cp -r "$OUT/$d" "../$d"; done
  cp "$OUT/en/index.html" ../en/index.html; cp "$OUT/impressum/index.html" ../impressum/index.html; cp "$OUT/index.html" ../index.html; cp "$OUT/favicon.svg" ../favicon.svg
  echo "geschrieben: index.html, en/index.html, impressum/index.html, lp/, css/, js/, img/, fonts/, favicon.svg"
fi
