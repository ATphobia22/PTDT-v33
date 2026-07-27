# Runbook — stop run errors

## Canonical paths

| Intent | Do this | Do not |
|--------|---------|--------|
| LOMA / No-Rise / BCA | `make package` or `python archimedes_engine.py` | `backend/main.py` alone |
| UI | `make ui` / `npm run dev` | Require Google/Cesium keys |
| Full stack | `make compose-up` | Old Databricks Dockerfile |
| DLT hydro pipeline | Databricks only | Local `python src/pipeline_engine.py` |

## First-time setup

```bash
git pull origin main
cp .env.example .env
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python archimedes_engine.py
```

Second terminal: `npm ci && npm run dev`

## Docker

```bash
docker compose up --build
curl http://127.0.0.1:8000/api/v1/health
```

Optional Redis/Chroma (Chroma host port **8001**):

```bash
docker compose -f workspace/archimedes_console/infra/docker-compose.yml up -d
```

## Datum

Packages must be **NAVD 88**. NGVD 29 → [NCAT](https://www.ngs.noaa.gov/NCAT/).  
`make check-navd88` after package generation.

## If compose fails

Confirm `environment/Dockerfile` starts with `FROM python:3.10-slim` — not `databricksruntime`.
