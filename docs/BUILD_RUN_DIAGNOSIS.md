# Build / run diagnosis — Tri-State Family Engineering System

Snapshot of **what CI expects**, **what can still fail**, and **local parity**. Not a claim that Actions is green on every SHA without checking the Actions tab.

## CI jobs (`.github/workflows/build.yml`)

| Job | Hard / soft | What it runs |
|-----|-------------|--------------|
| **node-build** | **Hard** on `npm run build`; typecheck is soft (`\|\| true`) | Node 20, `npm install`, Vite + esbuild server bundle |
| **python-engine** | **Hard** | `pip install -r requirements.txt`, ArchimedesEngine asserts, `generate_unified_regulatory_package`, NAVD88 hard-check |
| **docker-verify** | **Hard** Archimedes image + `/api/v1/health` ONLINE; web image **soft** (`continue-on-error`) | `environment/Dockerfile` + root `Dockerfile` |

Separate workflow: `.github/workflows/databricks-cd.yml` — will fail or no-op without Databricks secrets; not required for LOMA/No-Rise path.

## Likely remaining failure modes

### 1. Frontend `npm run build` (most common red X risk)

- Large React surface (`MapComponent`, `Dashboard`, twin views) can still throw **Vite/Rollup** resolve errors or esbuild failures even with `strict: false`.
- Dual lockfiles: **`package-lock.json`** and **`bun.lock`** — CI uses **npm**. Prefer npm locally to match CI; regenerate lock after dep changes:
  ```bash
  rm -rf node_modules
  npm install
  npm run build
  ```
- Root `Dockerfile` uses `npm install` (not `npm ci`) intentionally when lock lags `package.json`.

### 2. Python engine package generation

- CI imports `archimedes_engine.generate_unified_regulatory_package` and requires specific PDF/JSON filenames under `ci_package_out/`.
- If that function is renamed or outputs change, **python-engine** fails hard.
- `requirements.txt` is intentionally **slim** (fastapi, uvicorn, reportlab, pydantic, httpx). Heavy GIS (`geopandas`) is **not** in CI — use `requirements-gis.txt` optionally.

### 3. Archimedes Docker image

- `environment/Dockerfile` copies only:
  - `archimedes_engine.py`
  - `python/navd88_hard_check.py`
- If `archimedes_engine` starts importing other local modules at import time, the container will crash before health. Keep engine self-contained for this image.

### 4. Repo clutter (does not fail CI by itself)

Many one-off scripts at repo root (`fix_*.cjs`, `patch_*.cjs`, `fix_*.py`) are historical patches. They are **excluded** from `tsconfig` but increase confusion. Prefer `src/`, `python/`, `backend/` for new work.

### 5. Backend vs root Python

- `backend/requirements.txt` and root `requirements.txt` differ.
- CI **python-engine** only installs **root** `requirements.txt`.
- `backend/main.py` / plugins may need a separate venv for full FastAPI backend — not the Archimedes health image.

### 6. Tests not fully wired into CI

- `tests/test_math_gates.py` and `python/readiness_export.py` are useful locally but **not** hard gates in `build.yml` yet.
- Optional local:
  ```bash
  pip install pytest reportlab numpy
  pytest tests/test_math_gates.py -q
  python python/readiness_export.py
  ```

## Local parity commands

```bash
# Frontend (must match CI hard gate)
npm install
npm run build

# Python regulatory path
pip install -r requirements.txt
python -c "from archimedes_engine import ArchimedesEngine; print(ArchimedesEngine().lowest_adjacent_grade_ft)"
python -c "from archimedes_engine import generate_unified_regulatory_package as g; print(g('ci_package_out'))"
python python/navd88_hard_check.py ci_package_out/bca_elevation_data.json

# Archimedes container
docker build -f environment/Dockerfile -t archimedes-engine:local .
docker run --rm -p 8000:8000 archimedes-engine:local
# curl http://127.0.0.1:8000/api/v1/health

# Compose
docker compose config -q
```

## Docs consistency note

Older `docs/CI_STATUS.md` said node-build was soft; **current `build.yml` hard-fails on `npm run build`**. Typecheck remains soft. Trust the workflow file over stale narrative.

## Recommended next fixes (if Actions is red)

1. Open the failed job log on GitHub Actions for the exact SHA.  
2. If **node-build**: reproduce with `npm run build` and fix the first Vite/Rollup error.  
3. If **python-engine**: ensure `generate_unified_regulatory_package` still writes the asserted files.  
4. If **docker-verify**: `docker logs` on the Archimedes container; confirm `app` is exposed from `archimedes_engine`.  
5. Ignore Databricks CD failures unless you intentionally use that pipeline.
