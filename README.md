# PTDT v33 — Point Township Digital Twin / Tri-State Family Engineering System

Sovereign flood-resilience digital twin for **13101 Bonebank Road, Point Township, IN**.

## Locked constants

| Quantity | Value |
|----------|-------|
| BFE | 375.0 ft NAVD88 |
| LAG | 377.2 ft |
| Berm crest | 379.8 ft (+4.8 ft freeboard vector) |
| Compensatory storage factor | 1.20× |
| BCR (BCA export) | 1.41 |

## Quick start (backend)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## Frontend (photoreal + maps)

```bash
cd frontend && npm install && npm run dev
```

Free OSS only (no API keys): `playcanvas`, `3d-tiles-renderer`, `maplibre-gl`, `three`.

## Author

ATphobia22
