# PTDT engineering invariants

Fail-closed. Presentation never creates hydraulic or regulatory evidence.

| Invariant | Value / rule |
|-----------|----------------|
| Vertical datum | **NAVD88** only for authoritative elevations |
| Horizontal CRS | **EPSG:2966** project meters |
| Hydro authority | Archimedes + HEC-RAS exclusive |
| Groundwater | MODFLOW6 exclusive |
| Geotech | Bishop exclusive |
| Visualization | Derived projection only (WebGPU, MapLibre, Box3D, USD/Hydra) |
| Unknown datum | `NOT_EVALUATED` — never silent NGVD29 mix |
| Non-finite elevation | `REJECTED` |
| Cryptographic seals | SHA-256 of canonical JSON for plates / physics envelopes |

## API surface (sovereign)

| Method | Path | Role |
|--------|------|------|
| GET | `/api/v1/health` | Liveness + locked constants |
| GET | `/api/v1/invariants` | Datum, CRS, authority |
| POST | `/api/v1/spatial/to-local` | EPSG:2966 → render-origin local |
| POST | `/api/v1/datum/to-navd88` | Explicit datum conversion |
| POST | `/api/v1/datum/freeboard-check` | Stage vs LAG/berm/floor |
| GET | `/api/v1/cinematic/status` | USD/Hydra/WebGPU readiness |
| POST | `/api/v1/twin/simulation` | Full twin path |
| POST | `/api/v1/governance/evaluate` | Tri-State governor |

## Deploy

```bash
docker compose up --build -d
curl -s localhost:8000/api/v1/invariants
```

CI: `.github/workflows/sovereign-ci.yml`
