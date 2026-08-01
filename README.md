# PTDT Sovereign Hydrodynamic Pipeline

Point Township Digital Twin — **13101 Bonebank Road**, Posey County, Indiana.

**Zero-key by design.** Government employees and the public can run the full core stack with no API keys, no paid map tiles, and no SaaS accounts.

## Free for public agencies

See **[docs/GOVERNMENT_FREE_STACK.md](docs/GOVERNMENT_FREE_STACK.md)** for the full inventory of free data sources and owned ATphobia22 assets.

| Layer | Source | Key required? |
|---|---|---|
| Map + 3D buildings | MapLibre + OSM + local GeoJSON | No |
| Vertical datum | NGS NCAT public API | No |
| Parcels / BAFM | IndianaMap public REST | No |
| Flood zones | FEMA NFHL (+ offline FC) | No |
| Stage | USGS NWIS (+ offline) | No |
| Hydraulics / No-Rise | ArchimedesEngine (local Python) | No |
| Chat persona | Gemini (optional offline) | Optional |

License: **Apache-2.0** (`LICENSE`).

## Architecture

- **Frontend/API**: React + Express (Vite) — port 3000
- **Archimedes Engine**: Python FastAPI-ready core — BFE 375.0 ft NAVD88, LAG 377.2 ft (+2.2 ft clearance), 1.20× compensatory storage (IN 312 IAC 10)
- **GIS routes**: `src/server-gis-routes.ts` — NCAT, parcels, BAFM, buildings, site constants

## Quick start (no secrets)

```bash
npm install
npm run dev
# optional Python check:
pip install fastapi uvicorn reportlab requests pydantic
python -c "from archimedes_engine import ArchimedesEngine; print(ArchimedesEngine().base_flood_elevation_ft)"
```

Wire GIS once in `server.ts`:

```ts
import { registerGisRoutes } from "./src/server-gis-routes";
registerGisRoutes(app);
```

## Site anchors

- Owner (Think GIS): TUCKER
- Acreage: 2.0
- BFE 375.0 ft / LAG 377.2 ft NAVD88
- USGS gauge 03378500 (Wabash at New Harmony)

## CI

- **Build and Deploy**: Node + lexical soft-gate + Archimedes verify
- **Databricks CD**: skipped automatically when secrets/bundle are absent (no failure noise)

## Sister repos (ATphobia22)

- [Point-Township-Digital-Twin](https://github.com/ATphobia22/Point-Township-Digital-Twin) — Python twin utilities
- [godfirst-llm-ml-protocol](https://github.com/ATphobia22/godfirst-llm-ml-protocol) — open AI governance (G1P)
