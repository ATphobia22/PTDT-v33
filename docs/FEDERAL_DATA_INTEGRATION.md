# Federal & state data integration map (PTDT / Tri-State)

Last updated 2026-07-28.

## Regulatory spine (always authoritative)

| Source | Endpoint / path | Role |
|--------|-----------------|------|
| USGS NWIS | `GET /api/usgs-telemetry` | Live stage/discharge 03378500, 03322000 |
| NGS NCAT | `GET /api/transform-elevation` | NGVD29 → NAVD88 |
| FEMA NFHL | `GET /api/fema-flood-zones` | Flood zones GeoJSON |
| IDNR BAF | `GET /api/dnr-floodplain` | Best Available Floodplain |
| IndianaMap | `GET /api/historic-sites` | Historic sites |

## Added from recent scans

### USDA NRCS Soil Data Access (SSURGO)

- Catalog: [api-evangelist/natural-resources-conservation-service](https://github.com/api-evangelist/natural-resources-conservation-service)
- Live host: `https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest`
- **Our proxy:** `GET /api/nrcs-soil?state=IN&county=Posey&limit=25`
- Use: hydrologic group / drainage class → Manning context & BCA narrative
- **Not** a substitute for BFE / LAG / No-Rise math

### OpenFEMA (NFIP claims)

- Inspired by rOpenSci `rfema` / [ATphobia22/rfema](https://github.com/ATphobia22/rfema) — implemented in Node without R
- Live: `https://www.fema.gov/api/open/v2/FimaNfipClaims`
- **Our proxy:** `GET /api/openfema-claims?state=IN&yearFrom=2000&top=50`
- Use: BRIC / BCA loss history; fields may include LAG/BFE when present on claims

### USGS Python forks

See `docs/USGS_OPEN_SOURCE_INTEGRATION.md` (dataretrieval, modflow6, usgs-lidar, water-use).

## ATphobia22/indiana — not state GIS

Repo [https://github.com/ATphobia22/indiana](https://github.com/ATphobia22/indiana) is a **Racket/Scheme port of the Indiana University “match” pattern-matching library** (`imatch.rkt`, `match.ss`). It is **not** Indiana DNR, IndianaMap, or floodplain data. No wiring into PTDT.

## CI rules

1. Slim `requirements.txt` for Archimedes hard gate.
2. Optional soil / OpenFEMA / dataretrieval never block CI.
3. Every external proxy degrades to sealed local fallback.
4. Frontend: `npm install && npm run build`.
