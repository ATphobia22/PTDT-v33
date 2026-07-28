# Runbook — stop run errors

## Canonical paths

| Intent | Do this | Do not |
|--------|---------|--------|
| LOMA / No-Rise / BCA | `make package` or `python archimedes_engine.py` | Rely on Docker startup alone |
| UI | `make ui` / `npm run dev` | Require Google/Cesium keys |
| Full stack | `make compose-up` | Old Databricks Dockerfile |
| DLT hydro pipeline | Databricks only | Local `python src/pipeline_engine.py` |
| Docker verify | `make docker-verify` | Skip health check |

## Docker behavior (updated)

1. **Archimedes container** starts **uvicorn only** → `/api/v1/health` is fast.  
   Package PDFs: `make package` or `POST /api/v1/package/generate`.
2. **Compose** waits until Archimedes is **healthy** before starting `web`.
3. **Web image** uses `node:22-bookworm-slim` (more reliable than alpine).

## First-time setup

```bash
git pull origin main
cp .env.example .env
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python archimedes_engine.py   # local: package + server
# or Docker: uvicorn only, then POST /api/v1/package/generate
```

Second terminal: `npm ci && npm run dev`

## Docker verification (local)

```bash
make docker-build
make docker-verify-archimedes
make docker-verify

docker compose up --build
curl http://127.0.0.1:8000/api/v1/health
curl -X POST http://127.0.0.1:8000/api/v1/package/generate -H 'Content-Type: application/json' -d '{}'
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
