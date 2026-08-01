#!/usr/bin/env bash
# scripts/run_pipelines.sh

set -euo pipefail

# --- ANSI Color Codes for HUD Output ---
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}===================================================================${NC}"
echo -e "${CYAN} PTDT PIPELINE RUNNER: FRONT-END TESTING ECOSYSTEM (${var.environment:-dev})${NC}"
echo -e "${CYAN}===================================================================${NC}"

# Ensure we are in the root directory containing package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}[ERROR] package.json not found in current directory. Execute from project root.${NC}"
    exit 1
fi

# Verify dependencies are synchronized
echo -e "[PIPELINE] Validating project dependency tree..."
if [ ! -d "node_modules" ]; then
    echo -e "[WARN] node_modules folder absent. Executing clean installation..."
    npm ci || npm install
fi

# --- 1. JEST RUNNER (Standard UI Units & Utilities) ---
echo -e "\n${CYAN}[1/2] Initiating Jest Pipeline (Core HUD Hooks & Site Constants)...${NC}"

if npx jest --config=jest.config.js --passWithNoTests; then
    echo -e "${GREEN}[SUCCESS] Jest test suite completed nominal passes.${NC}"
else
    echo -e "${RED}[FAILURE] Jest test regression found in core hooks.${NC}"
    exit 1
fi

# --- 2. VITEST RUNNER (WebGL, Mapbox GL & Svelte 5 Layers Components) ---
echo -e "\n${CYAN}[2/2] Initiating Vitest Pipeline (Reactive Layers & Canvas Runtimes)...${NC}"

if npx vitest run; then
    echo -e "${GREEN}[SUCCESS] Vitest execution loop verified high-performance canvas layers.${NC}"
else
    echo -e "${RED}[FAILURE] Vitest found compilation or reactive evaluation breaks.${NC}"
    exit 1
fi

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN} ALL FRONT-END VALIDATION PIPES SUCESSFULLY PASSED.${NC}"
echo -e "${GREEN}====================================================================${NC}"
