#!/bin/bash
# tools/stills.sh "s001,s002" "1.2,1.2" [scale] — render a sheet quickly with error trace
ids="$1"; times="${2:-1.5}"; sc="${3:-0.45}"
node sheet.mjs --shots "$ids" --times "$times" --scale $sc --trace 1 --out projects/truth-ability/build/dev.png 2>&1 | tail -12
