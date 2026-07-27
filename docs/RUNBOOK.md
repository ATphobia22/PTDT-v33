# Runbook — stop run errors

## Canonical paths only

| Intent | Do this | Do not |
|--------|---------|--------|
| LOMA / No-Rise / BCA PDFs | `make package` or `python archimedes_engine.py` | `backend/main.py` alone |
| UI dashboard | `make ui` or `npm run dev` | Expect Google/Cesium keys |
| Full stack | `make compose-up` | Old Databricks Dockerfile |

## First-time setup

```bash
git pull origin main
cp .env.example .env          # keys optional; MapLibre needs none
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python archimedes_engine.py   # writes 05_final_portal_package/ then :8000
```

In another terminal:

```bash
npm ci && npm run dev
```

## Docker

- **web** → root `Dockerfile` (Node) :3000  
- **archimedes** → `environment/Dockerfile` (Python 3.10-slim) :8000  

```bash
docker compose up --build
curl http://127.0.0.1:8000/api/v1/health
```

Optional Redis/Chroma (not required for LOMA packages):

```bash
docker compose -f workspace/archimedes_console/infra/docker-compose.yml up -d
# Chroma is on host port 8001 to avoid clashing with Archimedes
```

## Datum

- Packages must be **NAVD 88**.  
- NGVD 29 → convert at site lat/lon with [NCAT](https://www.ngs.noaa.gov/NCAT/).  
- File gate: `make check-navd88` after package generation.

## CI hard gate

Python job generates a full package and runs `navd88_hard_check`. Node lint may soft-fail.
