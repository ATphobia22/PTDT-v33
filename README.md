# Tri-State Family Engineering System

**Property focus:** 13101 Bonebank Road, Point Township, Posey County, Indiana (Section 35)  
**Repo:** tools for elevation/datum checks, regulatory **draft** packages, map UI, and agency-path documentation — not automatic PE seals or agency approvals.

## Honest scope

| This repo **does** | This repo **does not** |
|--------------------|-------------------------|
| Screen elevations (NAVD 88 hypotheses) | Replace a licensed survey |
| Generate **DRAFT** LOMA/No-Rise/BCA worksheets | File LOMA, issue No-Rise, or award grants |
| Call public APIs (USGS, NRCS SDA, OpenFEMA) with fallbacks | Guarantee live federal data without network |
| Track A/B/C readiness gates (JSON + SHA-256) | Act as IDNR, FEMA, or a PE |
| Document LARE, CWI, 319, HMA, HEC-RAS requirements | Substitute for HEC-RAS model-of-record |
| Zero-key MapLibre 3D **visualization** (OSM, meshes) | Google/Cesium photoreal tiles without keys |

All elevation numbers below are **project hypotheses** until a PE/survey seals them.

## What to run

| Goal | Command | Port |
|------|---------|------|
| **Archimedes engine** | `pip install -r requirements.txt && python archimedes_engine.py` | **8000** |
| **Dashboard + Node gateway** | `npm install && npm run dev` | **3000** |
| **MapLibre demos** | `python -m http.server 8080` → `/demos/` | **8080** |
| **Compose** | `docker compose up --build` | 3000 + 8000 |

## 3D demos (no Mapbox / Cesium account)

| File | Description |
|------|-------------|
| `demos/ptdt-v33-sovereign.html` | OSM + terrain + stage slider + USGS IV |
| `demos/ptdt-v33-glsl-flow.html` | Custom WebGL flow (noise, viz only) |
| `demos/ptdt-v33-photoreal-path.html` | **OSM 3D buildings + Three.js house + terrain** |

```bash
python -m http.server 8080
# http://localhost:8080/demos/ptdt-v33-photoreal-path.html
```

Photoreal ladder: `docs/PHOTOREAL_3D_PATH.md` · PMTiles: `docs/MAPLIBRE_PMTILES.md`

## Architecture (simplified)

```
┌─────────────────────┐     ┌──────────────────────────┐
│  React + Vite UI    │────▶│  Express gateway (server) │
│  MapLibre / Three   │     │  /api/* proxies           │
└─────────────────────┘     └────────────┬─────────────┘
                                         │
┌─────────────────────┐     ┌────────────▼─────────────┐
│  Archimedes FastAPI │◀───▶│  Optional USGS / NRCS /  │
│  PDFs + BCA JSON    │     │  OpenFEMA (fallbacks OK) │
└─────────────────────┘     └──────────────────────────┘
```

- **Frontend:** React 19, Vite 6, MapLibre GL, Three.js / R3F  
- **Engine:** Python 3.10, FastAPI, ReportLab  
- **Datum:** **NAVD 88 only** — [NGS NCAT](https://www.ngs.noaa.gov/NCAT/) for legacy transforms

## Quick start — Python

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python archimedes_engine.py
```

```bash
python python/readiness_export.py
pytest tests/test_math_gates.py -q
```

## Quick start — UI

```bash
cp .env.example .env
npm install && npm run dev
```

## Docker

```bash
docker compose up --build
```

## CI

| Job | Gate |
|-----|------|
| node-build | Hard `npm run build` (typecheck soft) |
| python-engine | Hard pytest, readiness, package + NAVD88 |
| docker-verify | Hard Archimedes health; web soft |

## Property baseline (verify before filing)

| Parameter | Hypothesis |
|-----------|------------|
| BFE | 375.0 ft NAVD 88 |
| LAG | 377.2 ft NAVD 88 |
| Clearance | +2.2 ft |
| Gages | USGS **03378500**, **03322000** |

## Agency docs

| Path | Doc |
|------|-----|
| LOMA | `docs/LOMA_PACKAGE_CHECKLIST.md` |
| IDNR / No-Rise | `docs/IDNR_PERMIT_CHECKLIST.md` |
| HEC-RAS | `docs/HEC_RAS_MODELING_REQUIREMENTS.md`, `docs/HEC_RAS_SENSITIVITY.md` |
| Funding | `docs/INDIANA_WATER_FUNDING_MAP.md` |
| Web sources | `docs/WEB_SOURCES_AND_APIS.md` |
| Anti-fabrication | `docs/ANTI_FABRICATION.md` |

## Missing / external

1. PE-sealed survey  
2. HEC-RAS model-of-record  
3. Official BCA Toolkit run  
4. Site drone mesh for true photoreal  
5. Typecheck still soft in CI  

Regulatory filings need human PE review and official portals.
