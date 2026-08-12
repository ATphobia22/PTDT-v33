# PTDT commit SHA index

## Remote (`ATphobia22/PTDT-v33` main)

| Short | Full SHA | Message |
|-------|----------|---------|
| `d86857e` | `d86857e079e1751e47e6bb784bcc2d9234071e61` | Sovereign constants (`v34_sovereign_constants.py`) |
| `090dc8a` | `090dc8ae1b88e8e2c5555dc2eec9813bec4a7287` | Flood XS CSV, USGS quads, turbo.json, COG README |
| `837f0cb` | `837f0cb9abfa066bd3c36d928ebb72d4117db4c2` | TurboVec WGSL compute shader |
| `7d94fe6` | `7d94fe6f7f7cf225ae77c098eb047fbc32c1c259` | siteConstants, bonebank buildings GeoJSON, PUSH_TO_GITHUB |
| `ec9624e` | `ec9624e24067461244c652cea54bc253d6cc6d20` | COG optimize service |
| `083b78b` | `083b78b1775a802842d0b05d2cbc1fbf617b8a48` | HEC-RAS coupler + sealed_extent_geojson |
| `693519c` | `693519cf39faddf4e70373f4b03c6ffe601ccf94` | COMMIT_SHA_INDEX (initial) |

**Remote tip:** verify with `git ls-remote origin refs/heads/main`.

## Local workspace commits

| Short | Message |
|-------|---------|
| `cccd7b9` | PTDT v33: sovereign digital twin — full wired stack |
| `56211bb` | PTDT v34: WebGPU TurboVec, Indiana GIS, COG pipeline, Vulkan docs |
| `657f27a` | docs: Vulkan pipeline cache UUID + descriptor set layout serialization |
| `47bf505` | docs: pipeline cache serialization flow + WebGPU shader compilation stages |
| `4f033d3` | docs: UUID validation, descriptor layouts, authority matrix import |
| `34f1c61` | docs: fix SHA tables; UUID validation; descriptor layouts; authority matrix |

## Cross-repo sources (connector search)

| Repository | Role | Key docs found |
|------------|------|----------------|
| `PTDT-TriState-Unified-v33` | Unified twin + PostGIS + RAS | `CANONICAL_AUTHORITY_MATRIX.md`, `HEC_RAS_Integration.md`, EnKF/Bishop plans |
| `Tri-State-River-Valley-Engineering-System` | Engineering system shell | `DOCS.md`, Archimedes, server |
| `Tri-County-River-Valley-Digital-Twin` | Photoreal twin | README, docs/, src/ |
| `Point-Township-Digital-Twin` | PTDT lineage | `V23_ARCHITECTURE.md`, `DATA_SOURCES.md`, HEC-RAS coupler |
| `PTDT-v33` | Sovereign core (this repo) | WebGPU TurboVec, COG, sealed GIS |

## Still local-only (push from workstation)

| Path | Notes |
|------|-------|
| `frontend/src/viz/turbovecGpu.ts` | Pipeline cache + profiling + variance |
| `frontend/src/viz/MapLibreDeckHybrid.tsx` | MapLibre + deck.gl hybrid |
| `frontend/src/core/TwinStateManager.ts` | Fail-closed FSM |
| `backend/main.py` | Cinematic + GIS routes |
| `backend/services/building_rasterizer.py` | Scan-line occlusion |
| `docs/ptdt-v33/WEBGPU_*.md` | Occupancy, timestamps, tuning |

```bash
git pull origin main --rebase
git push origin main
```
