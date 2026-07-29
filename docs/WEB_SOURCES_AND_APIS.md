# Web sources and APIs used (project record)

Inventory of **external** endpoints, portals, and documentation URLs referenced by this repo.  
Local Express routes (`/api/...`) are **proxies** unless noted.

Last reviewed with repo layout as of the README rewrite (2026-07).

---

## 1. Live data APIs (code may call)

| Service | Base URL / endpoint | Used by | Auth | Notes |
|---------|---------------------|---------|------|--------|
| **USGS NWIS Instantaneous Values** | `https://waterservices.usgs.gov/nwis/iv/` | `src/integration/usgs_bridge.py`, telemetry helpers | None (public) | Sites **03378500**, **03322000**; params 00060 (discharge), 00065 (gage height). Optional `dataretrieval` client. Fallback static values if offline. |
| **USDA-NRCS Soil Data Access (SDA)** | `https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest` | `src/api/federalProxies.ts` → `GET /api/nrcs-soil` | None | POST form `query` + `format=json+columnname`. Fallback local Posey soil stub. |
| **OpenFEMA NFIP Claims** | `https://www.fema.gov/api/open/v2/FimaNfipClaims` | `src/api/federalProxies.ts` → `GET /api/openfema-claims` | None | OData `$filter` / `$top`. Fallback empty set if unreachable. |

### Local proxy routes (same-origin for the UI)

| Route | Upstream |
|-------|----------|
| `GET /api/nrcs-soil` | NRCS SDA |
| `GET /api/openfema-claims` | OpenFEMA |
| Archimedes `GET /api/v1/health` | Local FastAPI only |
| Archimedes `POST /api/v1/package/generate` | Local package generation |

---

## 2. Map / basemap sources (frontend)

| Source | Typical use |
|--------|-------------|
| **MapLibre GL JS** | Map renderer (`maplibre-gl`) |
| **Open / free tile styles** (e.g. OpenFreeMap-style hosts as configured in MapComponent) | Basemap without Mapbox token |
| **PMTiles** | Optional offline-capable tile archives (`pmtiles` package) |
| **Three.js / R3F** | 3D valley visualization (not regulatory model-of-record) |

Cesium Ion is **not** required for the default stack (token-gated if ever enabled).

---

## 3. Federal regulatory & data portals (human / browser)

| Portal | URL | Purpose |
|--------|-----|---------|
| FEMA Online LOMC | https://www.fema.gov/flood-maps/change-your-flood-zone/online-lomc | LOMA / LOMC filing |
| FEMA Map Service Center | https://msc.fema.gov/ | Effective FIRM panels |
| FEMA BCA Toolkit hub | https://www.fema.gov/grants/tools/benefit-cost-analysis | Official BCR |
| FEMA HMA Guide | https://www.fema.gov/grants/mitigation/learn/hazard-mitigation-assistance-guidance | HMA policy |
| FEMA BRIC | https://www.fema.gov/grants/mitigation/building-resilient-infrastructure-communities | BRIC program page |
| FEMA HMGP | https://www.fema.gov/grants/mitigation/hazard-mitigation | Post-disaster mitigation |
| OpenFEMA data | https://www.fema.gov/about/openfema | Open datasets |
| NGS NCAT | https://www.ngs.noaa.gov/NCAT/ | Vertical datum transforms |
| USGS Water Data / NWIS | https://waterdata.usgs.gov/ | Gage pages |
| USGS National Map Downloader | https://apps.nationalmap.gov/downloader/ | 3DEP lidar/DEM |
| NRCS Soil Data Access | https://sdmdataaccess.nrcs.usda.gov/ | SDA documentation |

---

## 4. Indiana state portals

| Portal | URL | Purpose |
|--------|-----|---------|
| INFIP (floodplain info) | https://www.in.gov/dnr/water/surface-water/indiana-floodplain-mapping/indiana-floodplain-information-portal | BFE / FARA context |
| IDNR Fish & Wildlife LARE | https://www.in.gov/dnr/fish-and-wildlife/wildlife-resources/lake-and-river-enhancement/ | LARE grants |
| LARE Program Manual | https://www.in.gov/dnr/fish-and-wildlife/wildlife-resources/lake-and-river-enhancement/lare-program-manual | Applications & scopes |
| LARE reports | https://larereports.dnr.in.gov/ | Project reports |
| Clean Water Indiana (ISDA) | https://www.in.gov/isda/divisions/soil-conservation/clean-water-indiana/ | CWI grants / GMS |
| IDEM Section 319(h) | https://www.in.gov/idem/nps/funding/clean-water-act-section-319h-grants | NPS implementation grants |
| IDEM 319/205(j) instructions | https://www.in.gov/idem/nps/progress-evaluation/319205j-grant-application-instructions/ | Forms & match |
| IDEM LARE/CWI pointer | https://www.in.gov/idem/nps/funding/non-idem-funding/lare-cwi-and-additional-information/ | Non-IDEM funding list |
| IGIO Elevation | https://elevation.gio.in.gov/ | Statewide elevation program |
| IndianaMap | https://www.indianamap.org/ | Statewide GIS |
| Purdue LiDAR tiles | https://lidar.digitalforestry.org/ | QL2 county tiles |

---

## 5. USACE / basin context

| Source | URL | Purpose |
|--------|-----|---------|
| USACE national | https://www.usace.army.mil/ | Agency home |
| Great Lakes and Ohio River Division (LRD) | https://www.lrd.usace.army.mil/ | Regional division |
| HEC (HEC-RAS distribution) | USACE Hydrologic Engineering Center site | Official RAS software (install outside repo) |

---

## 6. Documentation-only / standards (no automated filing)

| Topic | Reference |
|-------|-----------|
| OMB Circular A-94 | Cost-effectiveness framework behind FEMA BCA |
| Indiana IC 14-28-1 / 312 IAC 10 | Floodway / Construction in a Floodway |
| Clean Water Act §319 / §205(j) | Federal NPS / planning authorities |
| Build America, Buy America | May apply to some 319 infrastructure awards |

---

## 7. Explicitly **not** used as automated submission APIs

| Claim | Status |
|-------|--------|
| Homemade FEMA GO OAuth “submit package” scripts | **Rejected** (`docs/ANTI_FABRICATION.md`) |
| Software auto-PE / `APPROVED_CERTIFIED_*` | **Rejected** |
| Invented BCR without BCA Toolkit | **Rejected** |

---

## 8. Optional / experimental (not required for LOMA path)

| Component | Notes |
|-----------|--------|
| Google Maps / GenAI packages in `package.json` | Optional; require keys if enabled |
| Databricks workflows | Cloud-only; secrets required |
| Helm / Istio under `deploy/` | Ops experiments |

---

## Maintenance

When adding a new external fetch:

1. Document base URL + auth here.  
2. Prefer same-origin proxy from `server.ts` for browser calls.  
3. Provide offline/fallback behavior.  
4. Never claim the call replaces PE or agency approval.
