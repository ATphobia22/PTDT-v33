# Project completion — FINAL

**Status: COMPLETE** for zero-key government core (2026-08-01).

## Last suggestions delivered

| Item | Delivery |
|------|----------|
| MapLibre Bonebank extrusions | `src/lib/mapBonebankLayers.ts` + `/api/gis/buildings` |
| HEC-RAS mesh path | `data/hec-ras/*` + `GET /api/hec-ras/mesh` + `/manifest` (`sealed: false`) |
| Cesium | Optional only — `docs/CESIUM_OPTIONAL.md` |
| Cross-section HUD | BFE/LAG/FFE schematic from siteConstants |
| Assemble safety | Never overwrites live dual-USGS server-main |

## PE still required for

- Sealing HEC-RAS 2D (`MANIFEST.sealed = true`)
- Signed LOMA / No-Rise package filing

## Start

```bash
npm install && npm run assemble && npm run dev
bash scripts/verify-sovereign.sh
```

Apache-2.0 · no mandatory keys.
