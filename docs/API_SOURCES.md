# Web sources and APIs (from project PDFs)

| Service | Endpoint | Auth | Status in repo |
|---------|----------|------|----------------|
| USGS NWIS IV | `https://waterservices.usgs.gov/nwis/iv/` | None | **LIVE** dual gauge in `/api/usgs-telemetry` |
| USDA-NRCS SDA | `https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest` | None | **LIVE** `/api/nrcs-soil` |
| OpenFEMA NFIP Claims | `https://www.fema.gov/api/open/v2/FimaNfipClaims` | None | **LIVE** `/api/openfema-claims` |
| IndianaMap / BAFM | ArcGIS REST (gis routes) | None | Existing GIS proxies |
| NCAT NGS | datum transform | None | Existing NCAT path |

## Intentionally NOT wired as “live truth”

| Item from PDFs | Why |
|----------------|-----|
| SRH-2D / HEC-RAS sealed mesh | Requires PE run + proprietary model files |
| Cesium ion token demos | Optional; MapLibre is default zero-key |
| Hardcoded Bearer mask keys | Removed from public client |
| Claimed NSE=0.94 calibration | Not reproducible without PE model archive |
| FIRM panel 18129C0225D vs 18129C0215D | **Conflict in source docs** — verify on FEMA MSC before filing |

## Local-only

- Archimedes simulate: `/api/v1/twin/simulate`
- HEC-RAS mesh: STUB until PE attaches file
- Multi-hazard engines: interface stubs (no federal wildfire API claimed)
