# WGSL workgroup memory barriers

## Scope

TurboVec (`turbovecCompute.wgsl`) is **embarrassingly parallel**: one thread per pixel, no cross-thread data. It does **not** use `var<workgroup>` or barriers today. This note defines when barriers are required if shared memory is added later (e.g. tile reductions, local filters).

---

## Barrier primitives (WGSL)

| Statement | Effect | Typical use |
|---|---|---|
| `workgroupBarrier()` | All threads in the workgroup reach the barrier; **workgroup** storage visibility ordered | Shared-memory tile algorithms |
| `storageBarrier()` | Orders **storage** buffer accesses within the workgroup | Rare; prefer workgroup memory |
| `textureBarrier()` | Orders texture accesses (when applicable) | Compute writing textures |

Semantics (WebGPU / WGSL): after `workgroupBarrier()`, writes to `var<workgroup>` by any thread in the group are visible to all threads in the group for subsequent reads.

---

## Correct pattern (shared tile)

```wgsl
var<workgroup> tile : array<f32, 256>;

@compute @workgroup_size(16, 16, 1)
fn main(
  @builtin(local_invocation_index) li : u32,
  @builtin(global_invocation_id) gid : vec3<u32>,
) {
  // Phase A — load
  tile[li] = /* load from storage */;
  workgroupBarrier(); // all loads complete before reduce

  // Phase B — reduce / filter using tile[]
  let v = tile[li] + tile[(li + 1u) & 255u];
  workgroupBarrier(); // if writing tile again before reuse

  // Phase C — write storage
}
```

---

## Incorrect patterns

| Anti-pattern | Failure mode |
|---|---|
| Read `tile[j]` written by another thread **without** barrier | Race; undefined values |
| Barrier inside divergent `if` (not uniform control flow) | Deadlock / validation error on some backends |
| Expecting barrier across **different** workgroups | Impossible; only intra-workgroup |
| Using barrier for global storage alone without need | Extra latency; prefer algorithm redesign |

Control flow to the barrier must be **uniform** across the workgroup (all threads take the same path).

---

## TurboVec decision

| Concern | TurboVec choice |
|---|---|
| Shared memory | **None** — pure global load → ALU → store |
| Barriers | **None** |
| Occupancy | Maximize; no barrier stalls |
| Coalescing | AoS `vec4` + row-major index |

Add `var<workgroup>` + `workgroupBarrier()` only if profiling shows L2/bandwidth still bound **and** a local stencil/reduce reduces global traffic enough to pay barrier cost.

---

## Related

- `docs/ptdt-v33/WGSL_COALESCED_ACCESS.md`
- `docs/ptdt-v33/WEBGPU_COMPUTE_LIMITS.md`
- `docs/ptdt-v33/WEBGPU_OCCUPANCY_AND_BINDGROUPS.md`
