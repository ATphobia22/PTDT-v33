# Tri-State River Valley — government data verification matrix

**Site context:** 13101 Bonebank Road, Point Township, Posey County, IN (Ohio–Wabash confluence region).  
**Authoritative vertical datum for PTDT:** **NAVD88**. Horizontal: **EPSG:2966** (Indiana East) for local engineering; agency GIS often NAD83 UTM 16N.

**Rule:** Presentation layers never invent BFE/freeboard. Site BFE must be sealed from IDNR FARA / effective study / sealed HEC-RAS — not from a distant gage stage alone.

---

## Agency source status (live public systems)

| Agency | Product / endpoint | Region relevance | Datum / CRS notes | PTDT use |
|---|---|---|---|---|
| **USGS** | NWIS gages; inundation libraries | Ohio @ J.T. Myers `03322420`; Wabash @ Mt. Carmel `03377500`; New Harmony `03378500` inundation maps | Stage + **NAVD88** elev where published | Telemetry; not site BFE |
| **NOAA / NWS AHPS** | https://water.noaa.gov | `UNWK2` J.T. Myers L&D; Mt. Carmel; OHRFC forecasts | NAVD88 + NGVD29 columns on many pages | Operational stage / forecast HUD |
| **USACE** | Louisville District (LRL) lake/ops tables | Mid-Wabash reservoirs, Ohio mainstem ops | Project datums; convert explicitly | Reservoir boundary conditions only |
| **FEMA** | NFHL / MSC; Posey Co FIS | Effective FIRM **2014-11-05** (Posey); SFHA / Zone AE–A | NAVD88 on modern products | NFIP zone reference; LOMA path |
| **IDNR (IN)** | INFIP; Best Available floodplain; FARA | Statewide + Posey county extracts | **BFE points NAVD88**; shapefiles NAD83 UTM 16N | **Primary regulatory BFE / floodway** for IN parcels |
| **IGIC / IndianaMap** | Imagery, elevation services | Statewide | Service-defined | Ortho / DEM tiles (presentation) |
| **IL / KY counterparts** | IEMA / KY DOW flood tools | Opposite banks of Wabash/Ohio | State-specific; always label datum | Cross-border situational awareness only |

---

## Key gages near Tri-State confluence

| Site | ID | AHPS | Notes |
|---|---|---|---|
| Ohio River at J.T. Myers L&D | USGS **03322420** | **UNWK2** | Posey County; flood categories published with **NAVD88** (e.g. gauge zero ~311.31 ft NAVD88) |
| Wabash River at Mt. Carmel, IL | USGS **03377500** | Mt. Carmel | Major lower-Wabash reference; NAVD88 table on AHPS |
| Wabash at New Harmony | USGS **03378500** | NHRI3 | USGS flood-inundation map library (depth grids) |
| Wabash at Vincennes (Memorial Br.) | USGS **03343010** | VCNI3 | Upstream inundation library |

**Do not** equate Myers pool stage (ft) with Bonebank structure BFE without datum + rating + reach hydraulics.

---

## PTDT locked constants vs agency data

| PTDT constant | Value | Verification posture |
|---|---|---|
| Site BFE | **375.0 ft NAVD88** | Must match sealed IDNR FARA / detailed study / RAS for **this parcel** — re-verify in INFIP before regulatory package export |
| LAG | 377.2 ft NAVD88 | Survey / sealed topo |
| Berm crest | 379.8 ft (+4.8 freeboard vector) | Design; not an agency product |
| CRS | EPSG:2966 | Indiana East ft for site engineering |

**Myers major flood ~371.31 ft NAVD88** (AHPS vertical table) is a **river** elevation class, not a substitute for structure BFE at Bonebank. Coexistence of both numbers is expected.

---

## Regulatory / mapping truth stack (Indiana parcel)

1. **IDNR Best Available + INFIP FARA** → site BFE / floodway for permitting  
2. **FEMA effective NFHL** → insurance SFHA / LOMA  
3. **USGS stage + NOAA forecast** → operations / twin HUD  
4. **Sealed HEC-RAS / compensatory storage** → PTDT hydro authority  
5. **MapLibre / TurboVec / Box3D** → presentation only  

---

## Availability checklist (engineering)

| Dataset | Available publicly? | Action for PTDT |
|---|---|---|
| Posey Best Available flood hazard (IDNR) | Yes (county zip / REST) | Ingest under `data/flood_xs/` with NAVD88 attribute check |
| FEMA NFHL Posey | Yes (MSC / NFHL viewer) | Reference layer; never overwrite IDNR best-available without governance |
| Myers / Mt. Carmel real-time | Yes (USGS + AHPS) | `usgs_telemetry_bridge` + air-gap fallback |
| Indiana Current Imagery | Yes (IndianaMap) | MapLibre raster source (already wired) |
| USGS inundation depth grids (New Harmony / Vincennes) | Yes (data.gov / USGS FIM) | Optional plate library — label as USGS product |
| USACE LRL daily ops | Yes | Optional boundary condition feed |

---

## Accuracy posture

| Claim | Status |
|---|---|
| Agencies publish **live** Tri-State relevant hydro + floodplain products | **Confirmed** (USGS, NOAA, USACE LRL, FEMA NFHL, IDNR INFIP) |
| Bone Bank / Posey County is a real mapped place (GNIS levee feature) | **Confirmed** |
| PTDT site BFE 375.0 is agency-published as a national constant | **No** — it is a **site engineering seal**; must be reconciled to current INFIP/FARA before regulatory filing |
| Presentation stack may invent freeboard | **Forbidden** (`ENGINEERING_INVARIANTS.md`) |

---

## Related

- `docs/ptdt-v33/ENGINEERING_INVARIANTS.md`
- `docs/ptdt-v33/INDIANA_GIS_INTEGRATION.md`
- `backend/services/indiana_gis_bridge.py`
- `backend/usgs_telemetry_bridge.py`
