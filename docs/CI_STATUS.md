# CI status policy

See also `docs/BUILD_RUN_DIAGNOSIS.md`.

## Current workflow policy (`.github/workflows/build.yml`)

| Job | Policy |
|-----|--------|
| **python-engine** | **Hard fail** — engine asserts, regulatory PDF package, NAVD88 check |
| **node-build** | **Hard fail** on `npm run build`; typecheck soft |
| **docker-verify → Archimedes** | **Hard fail** — slim image + `/api/v1/health` ONLINE |
| **docker-verify → web image** | Soft (`continue-on-error`) |
| **databricks-cd.yml** | Separate; needs secrets; not LOMA path |

## Local parity

```bash
pip install -r requirements.txt
npm install && npm run build
docker build -f environment/Dockerfile -t archimedes-engine:local .
```

Optional GIS: `pip install -r requirements-gis.txt`
