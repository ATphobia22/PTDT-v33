# PTDT v32 Sovereign Hydrodynamic Pipeline

High-performance hydraulic modeling and regulatory package generation for Point Township Section 35 (13101 Bonebank Road, Posey County, Indiana).

## Which process do I run?

| Goal | Command | Port |
|------|---------|------|
| **Regulatory PDFs + BCA + FastAPI** (canonical) | `pip install -r requirements.txt && python archimedes_engine.py` | **8000** |
| **Dashboard UI + Node gateway** | `npm ci && npm run dev` | **3000** |
| **Both via Docker** | `docker compose up --build` | 3000 + 8000 |

Do **not** start `backend/main.py` unless you need the extended backend (SurrealDB, etc.).  
Do **not** run `src/pipeline_engine.py` / `atphobia22-hydro-pipeline` locally — those are **Databricks DLT** pipelines (Spark + cloud mounts).

## Architecture

- **Frontend**: React + Node (Vite/Express) on 3000. **MapLibre GL** + OpenFreeMap (no Cesium Ion / no required API keys).
- **Archimedes engine**: Python FastAPI on 8000 — Manning velocity, 1.20× compensatory storage (312 IAC 10), PE/LOMA/No-Rise PDFs, FEMA BCA JSON/CSV, SHA-256 manifest.
- **Datum**: **NAVD 88 only**. NGVD 29 rejected; convert with [NGS NCAT](https://www.ngs.noaa.gov/NCAT/).

## Quick start — Python engine

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python archimedes_engine.py
```

Writes `05_final_portal_package/`, serves `GET /api/v1/health` and `POST /api/v1/package/generate`.

```bash
python python/navd88_hard_check.py 05_final_portal_package/bca_elevation_data.json
make package   # if Makefile present
```

## Quick start — Node UI

```bash
cp .env.example .env   # optional keys
npm ci && npm run dev
```

## Docker Compose

```bash
docker compose up --build
```

- **web**: root `Dockerfile` → :3000  
- **archimedes**: `environment/Dockerfile` (Python 3.10-slim) → :8000  

Optional Redis/Chroma: `workspace/archimedes_console/infra/docker-compose.yml` (Chroma on host **8001**).

## CI

- Node: install + build; lint soft-fails  
- Python: install root requirements, verify engine, **generate full regulatory package** (hard gate), NAVD88 check  

## Property baseline (NAVD 88)

| Parameter | Value |
|-----------|--------|
| BFE | 375.0 ft |
| LAG | 377.2 ft |
| Clearance | +2.2 ft |
| USGS context | 03378500 |

See `docs/RUNBOOK.md` for troubleshooting.
