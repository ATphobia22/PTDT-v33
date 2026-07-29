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

All elevation numbers below are **project hypotheses** until a PE/survey seals them.

## What to run

| Goal | Command | Port |
|------|---------|------|
| **Archimedes engine** (PDFs, health API) | `pip install -r requirements.txt && python archimedes_engine.py` | **8000** |
| **Dashboard + Node gateway** | `npm install && npm run dev` | **3000** |
| **Both via Compose** | `docker compose up --build` | 3000 + 8000 |

Prefer **`npm install`** (CI does too). `npm ci` only if the lockfile matches `package.json`.

Do **not** start `backend/main.py` unless you need the extended backend stack.  
Do **not** treat `atphobia22-hydro-pipeline` / Databricks workflows as the local regulatory path.

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
- **Datum:** **NAVD 88 only** — convert legacy NGVD 29 via [NGS NCAT](https://www.ngs.noaa.gov/NCAT/)

## Quick start — Python

```bash
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python archimedes_engine.py
# GET  http://127.0.0.1:8000/api/v1/health
# POST http://127.0.0.1:8000/api/v1/package/generate
```

Helpers:

```bash
python python/readiness_export.py
python python/navd88_hard_check.py path/to/bca_elevation_data.json
pytest tests/test_math_gates.py -q   # needs pytest
```

## Quick start — UI

```bash
cp .env.example .env    # optional keys only
npm install
npm run dev             # or: npm run build && npm start
```

## Docker

```bash
docker compose up --build
# web        → :3000  (root Dockerfile)
# archimedes → :8000  (environment/Dockerfile, health ONLINE)
```

## CI (`.github/workflows/build.yml`)

| Job | Gate |
|-----|------|
| node-build | **Hard** `npm run build` (typecheck soft) |
| python-engine | **Hard** package generate + NAVD88 |
| docker-verify | **Hard** Archimedes health; web image soft |

See `docs/BUILD_RUN_DIAGNOSIS.md` if a check is red.

## Property baseline (verify before filing)

| Parameter | Hypothesis |
|-----------|------------|
| BFE | 375.0 ft NAVD 88 |
| LAG | 377.2 ft NAVD 88 |
| Clearance | +2.2 ft |
| Context gages | USGS **03378500**, **03322000** |

## Agency paths (docs)

| Path | Doc |
|------|-----|
| LOMA / Online LOMC | `docs/LOMA_PACKAGE_CHECKLIST.md` |
| IDNR floodway / No-Rise | `docs/IDNR_PERMIT_CHECKLIST.md`, `docs/HEC_RAS_MODELING_REQUIREMENTS.md` |
| HMA / BCA Toolkit | `docs/FEMA_HMA_REQUIREMENTS.md`, `docs/FEMA_BCA_TOOLKIT.md` |
| Readiness gates | `docs/AGENCY_SUBMISSION_READINESS.md` |
| Funding map (LARE, CWI, 319, …) | `docs/INDIANA_WATER_FUNDING_MAP.md` |
| **All web sources & APIs** | **`docs/WEB_SOURCES_AND_APIS.md`** |
| Anti-fabrication | `docs/ANTI_FABRICATION.md` |

## Missing / not-yet-complete (honest inventory)

These are **gaps**, not hidden finished modules:

1. **PE-sealed survey** of LAG/FFE (external; required for real LOMA)  
2. **HEC-RAS model-of-record** existing vs proposed (external PE work)  
3. **Official FEMA BCA Toolkit** run (not invented BCR in repo)  
4. Frontend **typecheck** not a hard CI gate; large TS surface may still warn  
5. `pytest` / `readiness_export` not in CI hard path yet  
6. Full `backend/` stack optional and separate from Archimedes image  
7. Databricks / Istio / Helm under `deploy/` are optional ops experiments  

## License / use

Private engineering-support tooling for the Tucker / Point Township project. Regulatory filings require human PE review and official portals (FEMA Online LOMC, IDNR, IDHS/FEMA GO as applicable).
