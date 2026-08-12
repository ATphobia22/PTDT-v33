# PTDT commit SHA index

## Remote (`ATphobia22/PTDT-v33` main) — connector pushes

| SHA | Message |
|-----|---------|
| `d86857e079e1751e47e6bb784bcc2d9234071e61` | Sovereign constants (`v34_sovereign_constants.py`) |
| `090dc8ae1b88e8e2c5555dc2eec9813bec4a7287` | Flood XS CSV, USGS quads, turbo.json, COG README |
| `837f0cb9abfa066bd3c36d928ebb72d4117db4c2` | TurboVec WGSL compute shader |
| `7d94fe6f7f7cf225ae77c098eb047fbc32c1c259` | siteConstants, bonebank buildings GeoJSON, PUSH_TO_GITHUB |
| `ec9624e24067461244c652cea54bc253d6cc6d20` | COG optimize service |
| `083b78b1775a802842d0b05d2cbc1fbf617b8a48` | HEC-RAS coupler + sealed_extent_geojson |

Tip of remote after these pushes: **`083b78b`** (verify with `git ls-remote`).

## Local workspace (not fully mirrored yet)

| SHA | Message |
|-----|---------|
| `cccd7b9` | PTDT v33: sovereign digital twin — full wired stack |
| `56211bb` | PTDT v34: WebGPU TurboVec, Indiana GIS, COG pipeline, Vulkan docs |
| `657f27a` | docs: Vulkan pipeline cache UUID + descriptor set layout serialization |
| `47bf505` | docs: pipeline cache serialization flow + WebGPU shader compilation stages |

## Still local-only (push from workstation)

- `frontend/src/viz/turbovecGpu.ts` (pipeline cache + profiling + variance)
- `frontend/src/viz/MapLibreDeckHybrid.tsx`
- `frontend/src/components/DashboardViewport.tsx`
- `frontend/src/core/TwinStateManager.ts`
- `backend/main.py` (cinematic + GIS routes)
- `backend/services/building_rasterizer.py`
- `backend/services/cinematic_pipeline.py`
- `backend/services/indiana_gis_bridge.py`
- Full WebGPU/Vulkan docs under `docs/ptdt-v33/`

```bash
git pull origin main --rebase
git push origin main
```
