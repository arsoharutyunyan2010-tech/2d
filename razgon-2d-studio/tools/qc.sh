#!/bin/bash
# qc.sh "s001,s002,..." [time] [scale] [cols] [out]
set -e
cd "$(dirname "$0")/.."
SHOTS="$1"; T="${2:-1.3}"; SC="${3:-0.32}"; COLS="${4:-6}"; OUT="${5:-projects/truth-ability/build/sheets/qc.png}"
node sheet.mjs --project projects/truth-ability --shots "$SHOTS" --times "$T" --scale "$SC" --cols "$COLS" --trace 1 --out "$OUT"
