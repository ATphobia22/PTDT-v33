#!/usr/bin/env bash
# git pull + install + start Node twin on :3000
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
bash scripts/bootstrap.sh
exec npm run dev
