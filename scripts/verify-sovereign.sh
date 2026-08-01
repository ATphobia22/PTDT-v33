#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://127.0.0.1:3000}"

echo "=== PTDT sovereign verify against $BASE ==="

fail=0
check() {
  local path="$1"
  local needle="$2"
  echo -n "GET $path ... "
  body=$(curl -fsS "$BASE$path" || true)
  if echo "$body" | grep -q "$needle"; then
    echo "OK"
  else
    echo "FAIL (missing $needle)"
    fail=1
  fi
}

check "/api/health" "free_for_government"
check "/api/usgs-telemetry" "USGS"
check "/api/hazards/summary" "AtmosphericEngine"
check "/api/regulatory/loma-package" "NAVD88"
check "/api/hec-ras/manifest" "sealed"

if [[ "$fail" -ne 0 ]]; then
  echo "VERIFY FAILED — is the server running? npm run assemble && npm run dev"
  exit 1
fi
echo "VERIFY PASSED"
