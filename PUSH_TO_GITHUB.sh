#!/usr/bin/env bash
# Run on your machine (has git + credentials for ATphobia22)
# Prefer non-force push unless intentionally replacing remote history.
set -euo pipefail
REPO="${1:-https://github.com/ATphobia22/PTDT-v33.git}"
git config user.name "ATphobia22"
git config user.email "ATphobia22@users.noreply.github.com"
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO"
git branch -M main
if [ "${FORCE_PUSH:-0}" = "1" ]; then
  echo "WARNING: FORCE_PUSH=1 — overwriting remote main"
  git push -u origin main --force
else
  git push -u origin main
fi
echo "Pushed to $REPO as ATphobia22"
