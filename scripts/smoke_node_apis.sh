#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://127.0.0.1:3000}"
echo "smoke against $BASE"
for path in \
  /api/usgs-telemetry \
  /api/gis/site \
  /api/terrain/maplibre-config \
  /api/reference-thresholds \
  /api/nld/service
do
  echo "== $path =="
  code=$(curl -sS -o /tmp/ptdt_smoke.json -w "%{http_code}" "$BASE$path" || true)
  echo "HTTP $code"
  head -c 200 /tmp/ptdt_smoke.json; echo
done
echo OK
