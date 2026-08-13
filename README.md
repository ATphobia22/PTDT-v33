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

---

## Architecture (presentation vs authority)

```
USGS / NOAA / DEM / HEC-RAS / MODFLOW
              │
              ▼
     PTDT Authoritative State  (NAVD88 · EPSG:2966)
              │
         Redis Streams (optional)
       ┌──────┴──────┐
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
# API health: GET http://localhost:8000/api/v1/health
```

CI: `.github/workflows/sovereign-ci.yml` (datum asserts, TestClient, Docker build).

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

## Frontend stack (OSS only)

| Package | Use |
|---|---|
| `maplibre-gl` | Base map, DEM hillshade, COG tiles |
| `@deck.gl/mapbox` + `@deck.gl/layers` | Interleaved building extrusions |
| WebGPU + `turbovecCompute.wgsl` | Coalesced band math |
| `playcanvas` / `three` | Photoreal / splat paths |
| `3d-tiles-renderer` | Local mesh tiles |

**MapLibre performance knobs** (see `MapLibreDeckHybrid.tsx`):

| Knob | Default | Effect |
|---|---|---|
| `maxTileCacheSize` | 250 | DEM + imagery tile retention |
| `hillshadeMinZoom` | 11 | Cull hillshade below zoom |
| `extrusionMinZoom` | 13 | Cull deck extrusions below zoom |
| `frameBudgetMs` | 16 | `render` event budget callback |

**TurboVec:** workgroup **16×16** (256); AoS `vec4` loads; optional `timestamp-query`.  
Host: `frontend/src/viz/turbovecGpu.ts` · Shader: `frontend/src/shaders/turbovecCompute.wgsl`

---

## Documentation index

| Topic | Path |
|---|---|
| Engineering invariants | `docs/ptdt-v33/ENGINEERING_INVARIANTS.md` |
| MapLibre + deck.gl | `docs/ptdt-v33/MAPLIBRE_DECKGL_INTEGRATION.md` |
| WGSL coalesced access | `docs/ptdt-v33/WGSL_COALESCED_ACCESS.md` |
| Workgroup barriers | `docs/ptdt-v33/WGSL_WORKGROUP_BARRIERS.md` |
| WebGPU compute limits | `docs/ptdt-v33/WEBGPU_COMPUTE_LIMITS.md` |
| Occupancy / bind groups | `docs/ptdt-v33/WEBGPU_OCCUPANCY_AND_BINDGROUPS.md` |
| Timestamps / alignment | `docs/ptdt-v33/WEBGPU_TIMESTAMPS_ALIGNMENT_BENCHMARKS.md` |
| Box3D Unity bridge | `docs/ptdt-v33/BOX3D_UNITY_BRIDGE.md` |
| GDAL COG install | `docs/ptdt-v33/GDAL_COG_INSTALL.md` |
| Indiana GIS | `docs/ptdt-v33/INDIANA_GIS_INTEGRATION.md` |
| Authority matrix | `docs/ptdt-v33/CANONICAL_AUTHORITY_MATRIX.md` |

---

## License posture

Production paths: **MIT / Apache-2.0 / BSD** only.  
Instant-NGP is research-only (NVIDIA NC). No Cesium Ion / Google Photorealistic keys.

**Author:** ATphobia22
