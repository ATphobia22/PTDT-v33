# PTDT v33 — Point Township Digital Twin

**Tri-State Family Engineering System** · Sovereign flood-resilience digital twin  
**Site:** 13101 Bonebank Road, Point Township, Indiana

Authority rule: **presentation / Box3D / TurboVec never mutate hydro or regulatory evidence.**  
Vertical datum: **NAVD88**. Horizontal CRS: **EPSG:2966** (Indiana East).

---

## Locked engineering constants

| Quantity | Value | Notes |
|---|---|---|
| BFE | 375.0 ft NAVD88 | Base flood elevation |
| LAG | 377.2 ft NAVD88 | Lowest adjacent grade |
| Berm crest | 379.8 ft | +4.8 ft freeboard vector |
| Compensatory storage | 1.20× | Volume factor |
| BCR (BCA export) | 1.41 | Benefit–cost ratio |
| LOMA clearance | +2.2 ft | LAG − BFE (natural high ground) |

**Operations:** J.T. Myers **stage** triggers (dock 54.93 → house 58.45–58.75 ft) are gage-datum — see `data/property_flood_triggers.json`.

---

## Architecture (presentation vs authority)

```
USGS / NOAA / DEM / HEC-RAS / MODFLOW / Tucker heritage
              │
              ▼
     PTDT Authoritative State  (NAVD88 · EPSG:2966)
              │
         Redis Streams (optional)
       ┌──────┬──────┐
       ▼             ▼
  WebGPU Runtime   Unity Runtime
  TurboVec WGSL      Box3D 0.8.1 (derived only)
  MapLibre+deck      render-origin relative
```

| Layer | Role | Mutates hydro? |
|---|---|---|
| Sovereign API | Datum, spatial, invariants, RAS extent | No (read + seal) |
| MapLibre + deck.gl | Presentation map / extrusions | **No** |
| TurboVec WebGPU | Band indices (NDVI/NDWI/EVI/SAVI) | **No** |
| Box3D Unity | Derived physics / VFX | **No** |

---

## Quick start

### Backend

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend && npm install && npm run dev
```

### Docker

```bash
docker compose up --build
```

CI: `.github/workflows/sovereign-ci.yml`

---

## Key API routes

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Heartbeat |
| GET | `/api/v1/invariants` | NAVD88 / EPSG:2966 contract |
| POST | `/api/v1/spatial/to-local` | EPSG:2966 → render origin |
| POST | `/api/v1/datum/*` | Vertical-datum enforcement |
| GET | `/api/v1/ras/extent` | Sealed flood extent (presentation) |
| GET | `/api/v1/cinematic/status` | USD/Hydra / plate seal status |
| POST | `/api/v1/governance/evaluate` | Tri-State No-Rise gate |
| POST | `/api/v1/package/generate` | LOMA / No-Rise / BCA artefacts |

---

## Documentation index

| Topic | Path |
|---|---|
| Engineering invariants | `docs/ptdt-v33/ENGINEERING_INVARIANTS.md` |
| Tucker family flood heritage | `docs/ptdt-v33/TUCKER_FAMILY_FLOOD_HERITAGE.md` |
| USGS FIM New Harmony (SIR 2016-5119) | `docs/ptdt-v33/USGS_FIM_NEW_HARMONY_SIR2016-5119.md` |
| Caborn-Welborn archaeology | `docs/ptdt-v33/CABORN_WELBORN_ARCHAEOLOGY.md` |
| Posey / Indiana mapping sources | `docs/ptdt-v33/POSEY_INDIANA_MAPPING_SOURCES.md` |
| OSM / Overture → Unity buildings | `docs/ptdt-v33/OSM_OVERTURE_UNITY_BUILDINGS.md` |
| USGS FIM (overview) | `docs/ptdt-v33/USGS_FLOOD_INUNDATION_MAPPING.md` |
| Berm placement & historical flood | `docs/ptdt-v33/BERM_PLACEMENT_AND_HISTORICAL_FLOOD.md` |
| Tri-State agency data verification | `docs/ptdt-v33/TRI_STATE_AGENCY_DATA_VERIFICATION.md` |
| WebGPU dispatch | `docs/ptdt-v33/WEBGPU_DISPATCH.md` |
| storageBarrier semantics | `docs/ptdt-v33/STORAGE_BARRIER_SEMANTICS.md` |
| Workgroup barriers | `docs/ptdt-v33/WGSL_WORKGROUP_BARRIERS.md` |
| WebGPU bind groups | `docs/ptdt-v33/WEBGPU_BIND_GROUPS.md` |
| WebGPU compute limits | `docs/ptdt-v33/WEBGPU_COMPUTE_LIMITS.md` |
| MapLibre + deck.gl | `docs/ptdt-v33/MAPLIBRE_DECKGL_INTEGRATION.md` |
| Indiana GIS | `docs/ptdt-v33/INDIANA_GIS_INTEGRATION.md` |
| Authority matrix | `docs/ptdt-v33/CANONICAL_AUTHORITY_MATRIX.md` |

**Runtime triggers:** `data/property_flood_triggers.json`

---

## License posture

Production paths: **MIT / Apache-2.0 / BSD** only.  
Instant-NGP is research-only (NVIDIA NC). No Cesium Ion / Google Photorealistic keys.

**Author:** ATphobia22
