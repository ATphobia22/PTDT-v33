# PTDT v32 Sovereign Hydrodynamic Pipeline

High-performance hydraulic modeling and regulatory package generation for Point Township Section 35 (13101 Bonebank Road, Posey County, Indiana).

## Which process do I run?

| Goal | Command | Port |
|------|---------|------|
| **Regulatory PDFs + BCA + FastAPI** (canonical) | `pip install -r requirements.txt && python archimedes_engine.py` | **8000** |
| **Dashboard UI + Node gateway** | `npm ci && npm run dev` | **3000** |
| **Both via Docker** | `docker compose up --build` | 3000 + 8000 |

Do **not** start `backend/main.py` unless you intentionally need the extended backend stack (SurrealDB, etc.). The LOMA / No-Rise / BCA path is **`archimedes_engine.py` only**.

## Architecture

- **Frontend / API gateway**: React + Node (Vite/Express) on port 3000. Map layers use **MapLibre GL** (no Cesium Ion account). Google Maps / Gemini are **optional** (see `.env.example`).
- **Archimedes engine**: Python FastAPI on port 8000 — Manning velocity, 1.20× compensatory storage (312 IAC 10), PE/LOMA/No-Rise PDFs, FEMA BCA JSON/CSV, SHA-256 manifest.
- **Datum**: **NAVD 88 only**. NGVD 29 inputs are rejected; convert with [NGS NCAT](https://www.ngs.noaa.gov/NCAT/) at the site lat/lon.

## Quick start — Python engine (recommended first test)

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python archimedes_engine.py
```

Expected:

1. Writes artifacts under `05_final_portal_package/` (PDFs, BCA JSON/CSV, manifest).
2. Serves `http://127.0.0.1:8000/api/v1/health` and `POST /api/v1/package/generate`.

NAVD88 file check:

```bash
python python/navd88_hard_check.py 05_final_portal_package/bca_elevation_data.json
```

## Quick start — Node UI

```bash
cp .env.example .env   # optional keys; MapLibre works without them
npm ci
npm run dev
```

Open the URL printed by the dev server (typically port 3000).

## Docker Compose

```bash
docker compose up --build
```

- **web**: Node image from root `Dockerfile` → port 3000  
- **archimedes**: slim Python image from `environment/Dockerfile` → port 8000  

No private Git clones or Databricks base image are required for this path.

## Core components

### `archimedes_engine.py`

Canonical source of truth for:

- Open-channel velocity (Manning)
- IDNR compensatory storage (1.20×)
- PE transmittal / LOMA letter, No-Rise certification, forensic case study PDFs
- BCA elevation + storage export + package manifest

### `python/navd88_hard_check.py`

Blocks NGVD 29 / unlabeled vertical datums on JSON/CSV inputs.

### Dashboard UI

Monitoring, layer toggles, and package generation controls. Prefer MapLibre for flood visualization when API keys are absent.

## CI/CD

GitHub Actions (`.github/workflows/build.yml`):

- **Node**: install + build; lint soft-fails while large TS modules stabilize
- **Python**: install root `requirements.txt`, verify engine BFE, **generate one full regulatory package** as a hard gate, verify reportlab imports

## Property baseline (NAVD 88)

| Parameter | Value |
|-----------|--------|
| BFE | 375.0 ft |
| LAG | 377.2 ft |
| Clearance | +2.2 ft |
| USGS context gage | 03378500 (Wabash at New Harmony) |
