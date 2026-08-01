#!/usr/bin/env bash
# Smoke-check zero-key sovereign stack markers
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
fail=0

check() {
  local file="$1" needle="$2"
  if grep -q "$needle" "$ROOT/$file" 2>/dev/null; then
    echo "OK  $file :: $needle"
  else
    echo "FAIL $file missing: $needle"
    fail=1
  fi
}

check src/lib/siteConstants.ts "18129C0215D"
check src/lib/siteConstants.ts "compensatory_storage_factor: 1.2"
check src/lib/siteConstants.ts "03378500"
check src/lib/siteConstants.ts "03322000"
check src/server-main.ts "USGS_NWIS_LIVE"
check src/server-main.ts "registerGisRoutes"
check src/server-main.ts "/api/regulatory/loma-package"
check src/components/hud/FloodStageHUD.tsx "BONEBANK_SITE"
check src/components/Dashboard.tsx "FloodScenarioStrip"
check LICENSE "Apache"

if [[ $fail -ne 0 ]]; then
  echo "verify-sovereign: FAILED"
  exit 1
fi
echo "verify-sovereign: PASSED"
