# Project completion checklist — PTDT / Bonebank Sovereign Node

**Status: COMPLETE for zero-key government core path** (2026-08-01)

## Runnable core

| Capability | Endpoint / artifact |
|------------|---------------------|
| Health + regulatory anchors | `GET /api/health` |
| Live dual USGS | `GET /api/usgs-telemetry` (03378500 + 03322000) |
| NCAT / parcels / BAFM / buildings | `/api/gis/*` |
| Twin simulate + 1.20× storage | `POST /api/v1/twin/simulate` |
| LOMA package metadata | `GET /api/regulatory/loma-package` |
| HUD | Live stage, scenario strip, depth legend, site constants |
| License | Apache-2.0 |

## Regulatory lock (PDF-sourced)

- BFE 375.0 / LAG 377.2 / FFE 382.5 / +2.2 ft NAVD88
- FIRM **18129C0215D** · Community **180194**
- Compensatory **1.20×** (312 IAC 10)
- Dual gauges New Harmony + John T. Myers

## Explicitly out of scope (not required to “finish” core)

- Paid Cesium ion tiles
- Sealed HEC-RAS 2D mesh (DepthLegend remains UI bins until PE attaches run)
- Databricks CD secrets
- Gemini chat (optional key)
- Merging stale feature branches (`feat/3d-building-footprints`, etc.) — main already has equivalent

## Start

```bash
npm install && npm run assemble && npm run dev
```

Government employees: no keys required for map, stage, GIS, simulate, LOMA metadata.
