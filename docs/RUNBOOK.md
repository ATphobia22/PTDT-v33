# Runbook — stop run errors

## Canonical paths

| Intent | Do this | Do not |
|--------|---------|--------|
| LOMA / No-Rise / BCA | `make package` or `python archimedes_engine.py` | `backend/main.py` alone |
| UI | `make ui` / `npm run dev` | Require Google/Cesium keys |
| Full stack | `make compose-up` | Old Databricks Dockerfile |
| DLT hydro pipeline | Databricks only | Local `python src/pipeline_engine.py` |
| Docker verify | `make docker-verify` | Skip health check |

## First-time setup

```bash
git pull origin main
cp .env.example .env
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python archimedes_engine.py
```

Second terminal: `npm ci && npm run dev`

## Docker verification (local)

```bash
# Fails if environment/Dockerfile uses Databricks base
make docker-build

# Build Archimedes image, run container, assert /api/v1/health returns ONLINE
make docker-verify-archimedes

# + validate docker-compose.yml
make docker-verify

docker compose up --build
curl http://127.0.0.1:8000/api/v1/health
```

CI job **Docker Build Verification** does the same on every push to main: slim Dockerfile check, hard-fail Archimedes image build, container health, optional web image build, `docker compose config`.

Optional Redis/Chroma (Chroma host port **8001**):

```bash
docker compose -f workspace/archimedes_console/infra/docker-compose.yml up -d
```

## Datum

Packages must be **NAVD 88**. NGVD 29 → [NCAT](https://www.ngs.noaa.gov/NCAT/).  
`make check-navd88` after package generation.

## If compose fails

Confirm `environment/Dockerfile` starts with `FROM python:3.10-slim` — not `databricksruntime`.
