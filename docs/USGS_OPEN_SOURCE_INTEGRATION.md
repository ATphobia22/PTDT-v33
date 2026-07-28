# USGS open-source forks under ATphobia22 — integration map

Scanned 2026-07-28. These are mirrors/forks of official USGS / DOI projects. Use upstream packages where possible; keep forks for offline pin or local patches.

## 1. `ATphobia22/dataretrieval-python`

- **Upstream**: DOI-USGS `dataretrieval` — Python client for NWIS / Water Data API, WQP, NGWMN, NLDI, water-use.
- **Use for PTDT**: Live stage/discharge for gages `03378500` (Wabash @ New Harmony) and `03322000` (Ohio @ Uniontown Dam).
- **Wiring**: `src/integration/usgs_bridge.py` tries `dataretrieval.nwis.get_iv` when installed; otherwise stdlib REST to `waterservices.usgs.gov`.
- **Node path**: `server.ts` `GET /api/usgs-telemetry` already hits the same IV endpoint and seals SHA-256 hashes for the dashboard (`DigitalTwinView`).
- **Install (optional)**: `pip install dataretrieval` or `pip install git+https://github.com/ATphobia22/dataretrieval-python.git`

## 2. `ATphobia22/modflow6`

- **Upstream**: MODFLOW-ORG / USGS Modular Hydrologic Model (GWF + GWT).
- **Use for PTDT**: Groundwater seepage toggle in Digital Twin Registry Hub (`modflowActive`). Do **not** compile full Fortran into CI.
- **Recommended path**: Call pre-built `mf6` binary offline, or use **FloPy** to write nam/packages and read heads; expose a thin FastAPI route that returns seepage flux (cms) for the berm footprint.
- **BMI**: `srcbmi` supports model coupling (OpenMI-style time stepping) — align with existing `OpenMITimeHandler` in `src/services/compliance.ts`.

## 3. `ATphobia22/usgs-lidar`

- **Upstream**: AWS Public Dataset / Entwine Point Tiles for USGS 3DEP LiDAR.
- **Use for PTDT**: Public EPT at `s3://usgs-lidar-public` (EPSG:3857). Stream with PDAL `readers.ept` or Potree/Plasio for photoreal ground truth.
- **NAVD88**: Reproject orthometric heights with NCAT (`/api/transform-elevation`) — do not treat EPT Z as NAVD88 without VERTCON/NCAT.
- **Local 5 cm claim**: Keep site-specific LiDAR DTM as sovereign truth; use 3DEP EPT for regional context only.

## 4. `ATphobia22/water-use`

- **Upstream**: USGS vizlab water-use visualization (R + vizlab).
- **Use for PTDT**: County/HUC context for BRIC BCA narrative (public-supply / irrigation withdrawals), not real-time flood stage.
- **Modern alternative**: `dataretrieval.wateruse.get_wateruse(...)` (Python) for HUC12 monthly withdrawals without the R vizlab stack.

## CI / production rules

1. Keep `requirements.txt` slim for the Archimedes hard gate (FastAPI + ReportLab).
2. Optional hydrology packages stay out of the mandatory CI path.
3. Frontend green path: `npm install && npm run build` (Vite 6 + esbuild server).
4. Live telemetry must always degrade to sealed fallback (never fail the UI).
