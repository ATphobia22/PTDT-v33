# PTDT v33 — Point Township Digital Twin

**Tri-State Family Engineering System** · Sovereign flood-resilience digital twin  
**Site:** 13101 Bonebank Road, Point Township, Indiana

Authority rule: **presentation / Box3D / TurboVec never mutate hydro or regulatory evidence.**  
Vertical datum: **NAVD88**. Horizontal CRS: **EPSG:2966** (Indiana East).

---

## v35 Photorealistic Spatial Scene Core

PTDT treats spatial visualization as a **multi-representation derived product** while keeping PostGIS/evidence and canonical SceneState authoritative.

```text
Evidence/PostGIS → SceneState → PTDT SpatialTile
                                  │
       ┌──────────────┬───────────┼───────────────┐
       ▼              ▼           ▼               ▼
      MVT            I3S       OpenUSD        Reality Capture
       │              │           │          Photo-SLAM / 3DGS / 4DGS
   MapLibre        3D GIS    Houdini/Unity/      Open3D
                               Unreal
                                  │
                                WebGPU
```

Every derived tile records CRS, vertical datum, epoch, provenance, confidence, and a deterministic content hash. Procedural assets are explicitly derived/procedural and cannot silently replace authoritative survey or engineering geometry.

**Routing correction:** OSRM remains a path solver; route safety is driven by dynamic road hazard state (elevation, water surface, depth, velocity, closure state, road class, uncertainty). BFE remains an engineering attribute and is not a universal road-closure threshold.

See `docs/architecture/PTDT_V35_PHOTOREALISTIC_SCENE.md`, `schemas/ptdt_spatial_tile.schema.json`, and `docs/integration/OPEN_SOURCE_3D_STACK.md`.

---

## Locked engineering constants

| Quantity | Value | Notes |
|---|---|---|
| BFE | 375.0 ft NAVD88 | Base flood elevation |
| LAG | 377.2 ft NAVD88 | Lowest adjacent grade |
| FFE | 382.5 ft NAVD88 | First floor elevation |
| Berm crest (design) | 379.8 ft | +4.8 ft freeboard vector vs BFE |
| Compensatory storage | 1.20× | Volume factor |
| BCR (BCA export) | 1.41 (eng) / 2.45 (legal PDF) | **PE FEMA Toolkit only** seals final |
| LOMA clearance | +2.2 ft | LAG − BFE (natural high ground) |

**Operations:** J.T. Myers **stage** triggers (dock 54.93 → house 58.45–58.75 ft) are gage-datum — see `data/property_flood_triggers.json`.

---

## Keyless runtime defaults

PTDT starts without commercial credentials. Core capabilities use:

- **Maps:** MapLibre
- **Raster:** COG/OGC
- **Tiles:** PMTiles/self-hosted tile server
- **Spatial:** PROJ/GDAL/PostGIS-compatible processing
- **Object storage:** MinIO/S3-compatible
- **Realtime:** gRPC/WebSocket
- **Inference:** local llama.cpp-compatible runtime
- **Scene interchange:** OpenUSD

Optional hosted providers are adapters only. If credentials are absent, the provider registry retains the OSS implementation and the sovereign core remains operational.

See `docs/integration/KEYLESS_PROVIDER_MATRIX.md` and `core/providers.py`.

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
Security/SBOM: `.github/workflows/security-supply-chain.yml`  
Spatial scene verification: `.github/workflows/ptdt-v35-spatial-verification.yml`

---

## Architecture (presentation vs authority)

```text
USGS / NOAA / DEM / HEC-RAS / MODFLOW / Tucker heritage
              │
              ▼
     PTDT Authoritative State  (NAVD88 · EPSG:2966)
              │
          Canonical SceneState
       ┌──────┬──────┬──────────┐
       ▼      ▼      ▼          ▼
   MapLibre  WebGPU OpenUSD   Engine Adapters
       │      │      │          │
       └──────┴──────┴──────────┘
                    │
              gRPC/WebSocket
               + local fixture
```

| Layer | Role | Mutates hydro? |
|---|---|---|
| Sovereign API | Datum, spatial, invariants, RAS extent | No (read + seal) |
| MapLibre + deck.gl | Presentation map / extrusions | **No** |
| TurboVec WebGPU | Band indices (NDVI/NDWI/EVI/SAVI) | **No** |
| Box3D Unity | Derived physics / VFX | **No** |
| Unity / Unreal adapters | Validated SceneState consumers | **No** |

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
| Keyless architecture | `docs/superpowers/specs/2026-08-16-keyless-open-source-ptdt-design.md` |
| Keyless provider matrix | `docs/integration/KEYLESS_PROVIDER_MATRIX.md` |
| Photorealistic spatial architecture | `docs/architecture/PTDT_V35_PHOTOREALISTIC_SCENE.md` |
| Open-source 3D stack | `docs/integration/OPEN_SOURCE_3D_STACK.md` |
| Spatial tile schema | `schemas/ptdt_spatial_tile.schema.json` |
| Photorealistic spatial design | `docs/superpowers/specs/2026-08-16-photorealistic-spatial-scene-core-design.md` |
| Photorealistic spatial implementation plan | `docs/superpowers/plans/2026-08-16-photorealistic-spatial-scene-core.md` |
| Precision lock & inconsistencies | `docs/ptdt-v33/PRECISION_LOCK_AND_INCONSISTENCIES.md` |
| Material Truth package | `docs/ptdt-v33/MATERIAL_TRUTH_PACKAGE.md` |
| Engineering invariants | `docs/ptdt-v33/ENGINEERING_INVARIANTS.md` |
| Daubert & solver authority | `docs/ptdt-v33/DAUBERT_AND_SOLVER_AUTHORITY.md` |
| USGS HEC-RAS model inventory | `docs/ptdt-v33/USGS_HEC_RAS_MODEL_INVENTORY.md` |
| IDNR flood zones / BAFL | `docs/ptdt-v33/IDNR_FLOOD_ZONES_BAFL.md` |
| OSM / Overture → Unity buildings | `docs/ptdt-v33/OSM_OVERTURE_UNITY_BUILDINGS.md` |
| Tri-State agency data verification | `docs/ptdt-v33/TRI_STATE_AGENCY_DATA_VERIFICATION.md` |
| MapLibre + deck.gl | `docs/ptdt-v33/MAPLIBRE_DECKGL_INTEGRATION.md` |
| Authority matrix | `docs/ptdt-v33/CANONICAL_AUTHORITY_MATRIX.md` |

**Runtime triggers:** `data/property_flood_triggers.json`

---

## License posture

Production paths: **MIT / Apache-2.0 / BSD** only.  
Instant-NGP is research-only (NVIDIA NC). No Cesium Ion / Google Photorealistic keys.

**Author:** ATphobia22
