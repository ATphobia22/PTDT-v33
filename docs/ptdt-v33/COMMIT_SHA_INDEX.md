# PTDT commit SHA index

## Remote (`ATphobia22/PTDT-v33` main)

| Short | Full SHA | Message |
|-------|----------|---------|
| `d86857e` | `d86857e079e1751e47e6bb784bcc2d9234071e61` | Sovereign constants |
| `090dc8a` | `090dc8ae1b88e8e2c5555dc2eec9813bec4a7287` | Flood XS, quads, turbo.json |
| `837f0cb` | `837f0cb9abfa066bd3c36d928ebb72d4117db4c2` | TurboVec WGSL |
| `7d94fe6` | `7d94fe6f7f7cf225ae77c098eb047fbc32c1c259` | siteConstants, buildings GeoJSON |
| `ec9624e` | `ec9624e24067461244c652cea54bc253d6cc6d20` | COG optimize |
| `083b78b` | `083b78b1775a802842d0b05d2cbc1fbf617b8a48` | HEC-RAS coupler |
| `693519c` | `693519cf39faddf4e70373f4b03c6ffe601ccf94` | COMMIT_SHA_INDEX initial |
| `42a25ff` | `42a25ff8da8b34ff1de570e86ebdb82767200941` | Authority matrix |
| `6752e3b` | `6752e3bd558643fc8561608829cec58368b85b4e` | UUID + descriptor layouts |

## Feature branch `feature/cinematic-runtime-core-fixes`

| Short | Message |
|-------|---------|
| `62b75da` | package, asmdef, Python contract, BOX3D_UNITY_BRIDGE |
| `5044f64` | PTDTBox3DStateSynchronizer |
| `9805d04` | PTDTBox3DWorld (tip before multithread doc) |

## Box3D + WebGPU commit status (2026-08-13)

| Ref | Tip / note |
|-----|------------|
| `feature/cinematic-runtime-core-fixes` | Box3D Unity bridge + Python contract complete |
| `main` | TurboVec WGSL + partial docs; **not** full Box3D |

### On feature branch (Box3D complete)

| Artifact | Status |
|----------|--------|
| `integrations/box3d-unity/**` | Pushed |
| `engine/cinematic_runtime/box3d_contract.py` | Pushed |
| `docs/ptdt-v33/BOX3D_UNITY_BRIDGE.md` | Pushed |

### Pending (local workspace)

| Artifact | Target |
|----------|--------|
| `frontend/src/viz/turbovecGpu.ts` | main or feature |
| `frontend/src/viz/MapLibreDeckHybrid.tsx` | main or feature |
| `frontend/src/core/TwinStateManager.ts` | main or feature |
| `docs/ptdt-v33/BOX3D_MULTITHREAD_AND_WEBGPU.md` | feature then main |
| Full `docs/ptdt-v33/WEBGPU_*.md` suite | main |

```bash
git fetch origin
git checkout feature/cinematic-runtime-core-fixes
git pull
# merge to main only when reviewed — no force-push
```
