#!/usr/bin/env bash
# Pull latest main, install deps, optional lint/build/smoke.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== git pull =="
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git fetch origin main 2>/dev/null || git fetch origin master 2>/dev/null || true
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  if git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
    git pull --ff-only origin "$BRANCH" || git pull --ff-only
  else
    git pull --ff-only || true
  fi
  git log -1 --oneline
else
  echo "Not a git checkout — skip pull"
fi

echo "== npm install =="
npm install

if [[ "${1:-}" == "--full" ]]; then
  echo "== lint =="
  npm run lint
  echo "== build =="
  npm run build
fi

echo "Bootstrap complete. Start with: npm run dev"
echo "Optional Archimedes: pip install -r services/requirements-archimedes.txt && python services/archimedes_api.py"
