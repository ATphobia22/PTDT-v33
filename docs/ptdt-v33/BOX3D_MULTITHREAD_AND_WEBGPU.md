# Box3D multithreaded performance & WebGPU compute integration

Authority: **derived** physics/VFX only. Does not mutate HEC-RAS, MODFLOW, Archimedes, or regulatory evidence.

Pinned: `ATphobia22/box3d-unity@9501a404` (com.suvitruf.box3d lineage).

---

## 1. Box3D multithreaded simulation

### 1.1 Scheduler model

| Mechanism | Behavior |
|-----------|----------|
| Internal scheduler | Box3D native worker pool per `World` |
| `WorldDef.WorkerCount` | PTDT exposes as `workerCount` (0 = engine default) |
| Scaling regime | Independent **simulation islands** (debris, piles, crowds) |
| Weak regime | One large coupled constraint graph (e.g. dense joint cloth) |
| Determinism | Bit-identical replay **across worker counts** (engine claim) |

PTDT bridge (`PTDTBox3DWorld`):

```csharp
definition.WorkerCount = workerCount;  // only if > 0
world.Step(fixedTimeStep, subStepCount);  // default 1/60 s, 4 substeps
```

Safety clamps: `workerCount ≤ 256`, `subStepCount ∈ [1, 32]`.

### 1.2 Published benchmark band (package README)

Editor, same machine; Box3D **4 sub-steps**, 16 workers vs PhysX defaults:

| Scene | PhysX | Box3D (16 workers) | Ratio |
|-------|-------|--------------------|-------|
| 10,000 spheres raining | 6.70 ms | **1.84 ms** | ~3.6× |
| Destroyed city ~10k bodies | 10.94 ms | **7.67 ms** | ~1.4× |
| 64 piles, 1,024 bodies (sleep off) | 1.15 ms | **0.54 ms** | ~2.1× |
| Joint-grid cloth, 930 joints | **0.54 ms** | 0.71 ms | PhysX ahead |

Stress: ~16k-box pyramid — single-digit ms; halves when asleep.

### 1.3 PTDT cost model (bridge layer)

| Phase | Complexity | Notes |
|-------|------------|-------|
| `World.Step` | O(P + C) | Bodies + contacts; parallelized by islands |
| `GetBodyMoveEvents` consume | O(M) | Span valid until next step |
| Entity lookup | O(1) avg | Dictionary entityId / bodyId |
| Transform sync | O(M) | No O(N²) full-body scan |

### 1.4 PTDT workload guidance

| Workload | Workers | Why |
|----------|---------|-----|
| Debris / flood props / sparse piles | 4–16 | Many islands |
| Few large kinematic constraints | 1–4 | Limited parallel islands |
| Deterministic sealed replay | Fixed worker count | Record `WorkerCount` in seal metadata |
| WebGL / mobile | 0 (default) or 1–2 | Cap threads |

---

## 2. WebGPU compute integration (PTDT)

### 2.1 Parallel paths (do not merge authorities)

```
PTDT SceneState
    ├─► WebGPU TurboVec (browser) — NDVI/mix, floodWater.wgsl
    └─► Unity Box3D — rigid bodies, GPU particle water (engine compute)
```

| Layer | GPU role | Authority |
|-------|----------|-----------|
| TurboVec | Band math → packed f16 | Visualization |
| floodWater.wgsl | Surface shading | Visualization |
| Box3D GPU water | Particle fluid + buoyancy | Derived VFX |
| HEC-RAS / MODFLOW | — | Authoritative hydro |

### 2.2 TurboVec (existing)

| Item | Value |
|------|-------|
| Workgroup | 16×16 (256) |
| Layout | Interleaved `array<vec4<f32>>` |
| Pipeline | Cached bind group layout + pipeline |
| Host | `turbovecGpu.ts` (pending push) |

Shared with Box3D only via SceneState / sealed envelopes — **not** shared GPU buffers.

### 2.3 Forbidden

- Box3D contact force as No-Rise proof
- Box3D water depth written into HydroLayer
- TurboVec f16 mixed into HEC-RAS inputs

---

## 3. Commit status (2026-08-13)

| Ref | Tip |
|-----|-----|
| `feature/cinematic-runtime-core-fixes` | `9805d04` — full Box3D bridge |
| `main` | TurboVec WGSL + partial docs; no Box3D tree |

### Pending (local)

| Artifact | Target |
|----------|--------|
| `frontend/src/viz/turbovecGpu.ts` | main or feature |
| `frontend/src/viz/MapLibreDeckHybrid.tsx` | main or feature |
| `frontend/src/core/TwinStateManager.ts` | main or feature |
| This doc | feature then main |
| Full `docs/ptdt-v33/WEBGPU_*.md` | main |
