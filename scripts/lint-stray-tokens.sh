#!/usr/bin/env bash
# scripts/lint-stray-tokens.sh
# Fail CI if citation-style footnote markers reappear in src/data.ts
set -euo pipefail

TARGET="${1:-src/data.ts}"

if [ ! -f "$TARGET" ]; then
  echo "lint-stray-tokens: $TARGET not found — skip"
  exit 0
fi

# Match [n], [n,m], [n-m], [n, m] style markers left over from doc assembly
if grep -nE '\[([0-9]+([[:space:]]*[,–-][[:space:]]*[0-9]+)*)\]' "$TARGET"; then
  echo "ERROR: stray footnote/citation tokens found in $TARGET"
  echo "Remove markers such as [4, 5] or [7-9] from embedded samples."
  exit 1
fi

echo "lint-stray-tokens: clean — no stray tokens in $TARGET"
