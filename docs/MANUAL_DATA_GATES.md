# Manual data gates (not auto-mergeable)

These block LOMA / production hydro until resolved offline.

| Gate | Status | Action |
|------|--------|--------|
| Posey APN dual-ID | `UNVERIFIED_DUAL` | Reconcile via Posey XSoft Engage + deed vs internal `65-09-35…` / public `65-19-08…` |
| Sealed COG under `data/` | Manual | Install GDAL; place NAVD88 DEM/ortho COGs; run cog readiness scripts |
| `bonebank_buildings.geojson` | Placeholder risk | Replace with survey/OSM/local sealed footprints before LOMA exhibits |
| Licensed HEC-RAS `rascmd` on PATH | Soft-fail | Install RAS; without it pipeline returns `SOFT_FAIL_NO_HDF` — never fabricate |

## Code fixed / merged (PTDT-v33)

- `web/shaders/cell_index_compute.wgsl` — storage binding corrected
- `web/src/gpu/HecRasDepthPipeline.ts` — aligned uploads + dispatch
- `engine/cinematic_runtime/hecras_pipeline.py` — soft-fail extractor + rasterize

## PTDT-TriState-Unified-v33 branches

- PR #10 `feature/cinematic-runtime-core-fixes` is **draft** — mark ready + CI green before merge
- PR #2 electron major bump — review separately (breaking risk)
- Multiple `feature/hydraulic-groundwater-authority*` tip the same SHA — consolidate one PR before merge
