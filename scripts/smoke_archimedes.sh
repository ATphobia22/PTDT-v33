#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://127.0.0.1:8000}"
echo "== health =="
curl -fsS "$BASE/api/v1/health" | head -c 400
echo
echo "== usgs =="
curl -fsS "$BASE/api/v1/usgs" | head -c 600
echo
echo "== simulate =="
curl -fsS -X POST "$BASE/api/v1/twin/simulate" -H 'Content-Type: application/json' -d '{}' | head -c 800
echo
echo "OK"
