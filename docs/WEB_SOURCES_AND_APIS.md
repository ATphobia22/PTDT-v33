# Web sources and APIs used (project record)

Inventory of **external** endpoints, portals, and documentation URLs referenced by this repo.  
Local Express routes (`/api/...`) are **proxies** unless noted.

See also: `docs/API_KEY_MANAGEMENT.md`, `docs/MAPLIBRE_PMTILES.md`, `docs/ZERO_KEY_MAP_STACK.md`, `docs/EXTERNAL_WORKSTREAMS.md`.

---

## 1. Live data APIs (code may call)

| Service | Base URL / endpoint | Used by | Auth | Notes |
|---------|---------------------|---------|------|--------|
| **USGS NWIS Instantaneous Values** | `https://waterservices.usgs.gov/nwis/iv/` | `usgs_bridge`, demos, Archimedes bridges | None | Sites **03378500**, **03322000**; 00060 / 00065. Fallback if offline. |
| **USDA-NRCS Soil Data Access (SDA)** | `https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest` | `federalProxies` → `/api/nrcs-soil` | None | POST SQL; local soil fallback. |
| **OpenFEMA NFIP Claims** | `https://www.fema.gov/api/open/v2/FimaNfipClaims` | `federalProxies` → `/api/openfema-claims` | None | OData filter; empty fallback. |

### Local proxy / engine routes

| Route | Upstream |
|-------|----------|
| `GET /api/nrcs-soil` | NRCS SDA |
| `GET /api/openfema-claims` | OpenFEMA |
| Archimedes `GET /api/v1/health` | Local only |
| Archimedes `POST /api/v1/package/generate` | Local only |

---

## 2. Map / basemap (zero-key path)

| Source | URL / package | Auth |
|--------|---------------|------|
| **MapLibre GL JS** | `unpkg.com/maplibre-gl@4.7.1` or npm | None |
| **OSM raster tiles** | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | None (usage policy) |
| **Mapterhorn DEM** | `https://tiles.mapterhorn.com/tilejson.json` | None (global terrain) |
| **MapLibre demotiles** | `https://demotiles.maplibre.org/style.json` | None |
| **PMTiles** | Self-hosted or CDN with Range | None |
| tippecanoe / Planetiler | Build pipeline | N/A |
| Three.js / R3F | npm | None |

Respect [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/). Prefer self-hosted tiles for heavy use.

---

## 3. Federal portals (human / browser)

| Portal | URL |
|--------|-----|
| Online LOMC | https://www.fema.gov/flood-maps/change-your-flood-zone/online-lomc |
| MSC | https://msc.fema.gov/ |
| BCA Toolkit | https://www.fema.gov/grants/tools/benefit-cost-analysis |
| HMA Guide | https://www.fema.gov/grants/mitigation/learn/hazard-mitigation-assistance-guidance |
| OpenFEMA | https://www.fema.gov/about/openfema |
| NGS NCAT | https://www.ngs.noaa.gov/NCAT/ |
| USGS Water Data | https://waterdata.usgs.gov/ |
| National Map Downloader | https://apps.nationalmap.gov/downloader/ |
| NRCS SDA docs | https://sdmdataaccess.nrcs.usda.gov/ |

---

## 4. Indiana portals

| Portal | URL |
|--------|-----|
| INFIP | https://www.in.gov/dnr/water/surface-water/indiana-floodplain-mapping/indiana-floodplain-information-portal |
| LARE | https://www.in.gov/dnr/fish-and-wildlife/wildlife-resources/lake-and-river-enhancement/ |
| LARE Manual | https://www.in.gov/dnr/fish-and-wildlife/wildlife-resources/lake-and-river-enhancement/lare-program-manual |
| LARE reports | https://larereports.dnr.in.gov/ |
| CWI | https://www.in.gov/isda/divisions/soil-conservation/clean-water-indiana/ |
| IDEM 319 | https://www.in.gov/idem/nps/funding/clean-water-act-section-319h-grants |
| IDEM funding index | https://www.in.gov/idem/nps/funding/non-idem-funding/lare-cwi-and-additional-information/ |
| IGIO Elevation | https://elevation.gio.in.gov/ |
| IndianaMap | https://www.indianamap.org/ |
| Purdue LiDAR | https://lidar.digitalforestry.org/ |

---

## 5. USACE / OSS analytics

| Source | URL |
|--------|-----|
| USACE | https://www.usace.army.mil/ |
| LRD | https://www.lrd.usace.army.mil/ |
| HEC-RAS | Install from USACE HEC (outside repo) |
| OSS Insight | https://ossinsight.io/ (discover OSS; not a runtime dependency) |
| MapLibre org | https://maplibre.org/ |

---

## 6. Rejected automated claims

Homemade FEMA GO OAuth submit, auto-PE seals, invented BCR, quantum QEC for USGS, GLSL-as-SWE — see `docs/ANTI_FABRICATION.md`.
