# WGSL workgroup memory barriers

## Scope

TurboVec (`turbovecCompute.wgsl`) is **embarrassingly parallel**: one thread per pixel, no cross-thread data. It does **not** use `var<workgroup>` or barriers today. This note covers barrier APIs, **control-flow divergence**, and **texture barriers** for future shared-memory or compute-to-texture paths.

---

## Barrier primitives

| Statement | Orders | Scope | Minimal example |
|---|---|---|---|
| `workgroupBarrier()` | `var<workgroup>` writes → later reads | Single workgroup | `tile[li] = v; workgroupBarrier(); let x = tile[j];` |
| `storageBarrier()` | Storage buffer accesses | Single workgroup | `data[i] = v; storageBarrier(); let x = data[j];` |
| `textureBarrier()` | Texture read/write in compute | Single workgroup | `textureStore(t, p, c); textureBarrier(); let c2 = textureLoad(t, p);` |

After `workgroupBarrier()`, every workgroup-local write before the barrier is visible to every thread in that workgroup after the barrier.

---

## Barrier divergence (uniform control flow)

**Rule:** Every thread in the workgroup must execute the **same** barrier instance. Divergence → validation failure, hang, or undefined behavior on some backends.

| Pattern | Legal? | Code |
|---|---|---|
| Barrier on common path | Yes | `tile[li] = load(); workgroupBarrier(); use(tile[li]);` |
| Barrier inside uniform `if` (same for all) | Yes | `if (uniformFlag) { workgroupBarrier(); }` |
| Barrier in only one branch of divergent `if` | **No** | `if (li < 128u) { workgroupBarrier(); }` |
| Barrier in loop with non-uniform trip count | **No** | `for (var k = 0u; k < li; k++) { workgroupBarrier(); }` |
| Early `return` before barrier on some threads | **No** | `if (gid.x >= width) { return; } workgroupBarrier();` |

### Illegal (divergent)

```wgsl
@compute @workgroup_size(16, 16, 1)
fn bad_divergent(@builtin(local_invocation_index) li: u32) {
  if (li < 128u) {
    workgroupBarrier(); // other half never arrives
  }
}
```

### Legal (mask inactive threads; all still hit barrier)

```wgsl
@compute @workgroup_size(16, 16, 1)
fn ok_edge(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_index) li: u32,
) {
  let inBounds = gid.x < params.width && gid.y < params.height;
  if (inBounds) {
    tile[li] = rgba[gid.y * params.width + gid.x].r;
  } else {
    tile[li] = 0.0;
  }
  workgroupBarrier(); // all 256 threads reach here
  // reduce / read tile only if inBounds on store path
}
```

### Legal (uniform predicate)

```wgsl
// params.enableReduce is identical for every thread in the dispatch
if (params.enableReduce != 0u) {
  workgroupBarrier();
  // shared reduce
  workgroupBarrier();
}
```

---

## Texture barriers

`textureBarrier()` synchronizes **texture** memory accesses among threads in the **same workgroup** when a compute shader both writes and reads a texture (or needs write→read ordering before sampling).

| Case | Need `textureBarrier()`? | Example |
|---|---|---|
| Compute only **stores** to texture; no read in same pass | No | `textureStore(outTex, coord, color);` |
| Same workgroup **store then load** same texel/region | **Yes** | See below |
| Render pass writes texture; later compute reads | No barrier in shader — use **pass / pipeline** barriers via encoder | Separate passes |
| Different workgroups | Shader barrier **insufficient** — split passes or use storage buffers | — |

### Store → load in one compute pass

```wgsl
@group(0) @binding(0) var outTex: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var inTex: texture_2d<f32>; // or same resource if allowed by format/usage

@compute @workgroup_size(8, 8, 1)
fn blur_pass(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_index) li: u32,
) {
  let p = vec2<i32>(i32(gid.x), i32(gid.y));
  // Phase A: write intermediate
  textureStore(outTex, p, vec4<f32>(1.0, 0.0, 0.0, 1.0));
  textureBarrier(); // workgroup-visible texture writes complete
  // Phase B: read neighbors (only valid if binding supports read + same workgroup coverage)
  // Prefer storage buffers for multi-workgroup reductions.
}
```

**WebGPU host side:** texture usage must include `STORAGE_BINDING` (and format must be storage-compatible). Cross-workgroup or cross-pass ordering is expressed with **command encoder** pass boundaries, not only WGSL barriers.

| Host construct | Role |
|---|---|
| Separate `beginComputePass` calls | Implicit ordering between passes on same encoder |
| `textureBarrier()` in WGSL | Intra-workgroup only |
| Pipeline / resource transitions | Driver validates usage flags |

TurboVec does **not** bind textures today (storage buffers only) → no `textureBarrier()`.

---

## Shared-memory recipe (reference)

```wgsl
var<workgroup> tile: array<f32, 256>;

@compute @workgroup_size(16, 16, 1)
fn main(
  @builtin(local_invocation_index) li: u32,
  @builtin(global_invocation_id) gid: vec3<u32>,
) {
  // A — load (uniform reach of barrier)
  tile[li] = /* storage load or 0 */;
  workgroupBarrier();

  // B — local combine
  let v = tile[li] + tile[(li + 1u) & 255u];
  workgroupBarrier();

  // C — store
}
```

---

## TurboVec decision matrix

| Concern | Choice | Code / note |
|---|---|---|
| Shared memory | None | No `var<workgroup>` |
| `workgroupBarrier` | None | Avoids divergence + stall cost |
| `textureBarrier` | None | Buffer path only |
| Coalescing | AoS `vec4` | `idx = gid.y * width + gid.x` |
| Edge pixels | Mask stores, no early barrier return | N/A without barriers |

Add barriers only when profiling shows bandwidth still bound **and** a workgroup-local stencil/reduce cuts global traffic enough to pay synchronization.

---

## Related

- `docs/ptdt-v33/WGSL_COALESCED_ACCESS.md`
- `docs/ptdt-v33/WEBGPU_COMPUTE_LIMITS.md`
- `docs/ptdt-v33/WEBGPU_OCCUPANCY_AND_BINDGROUPS.md`
- `frontend/src/shaders/turbovecCompute.wgsl`
