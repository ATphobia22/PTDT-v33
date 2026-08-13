# WGSL workgroup barriers vs memory barriers

## Scope

TurboVec has **no** barriers (embarrassingly parallel). This note distinguishes WGSL’s address-space barriers from GLSL-style generic `memoryBarrier()`, and records divergence + texture rules.

**Fact:** WGSL does **not** define a function named `memoryBarrier()`. Use the address-space-specific builtins below.

---

## Barrier inventory (WGSL)

| Builtin | Address space ordered | Execution scope | Memory scope | Minimal example |
|---|---|---|---|---|
| `workgroupBarrier()` | `workgroup` | Workgroup | Workgroup | `tile[li]=v; workgroupBarrier(); let x=tile[j];` |
| `storageBarrier()` | `storage` | Workgroup | Workgroup | `buf[i]=v; storageBarrier(); let x=buf[j];` |
| `textureBarrier()` | Texture (storage tex) | Workgroup | Workgroup | `textureStore(t,p,c); textureBarrier();` |

All three are **control barriers** with **acquire/release** ordering. All require **uniform control flow** within the workgroup. **None** synchronize different workgroups.

---

## `workgroupBarrier` vs GLSL `memoryBarrier`

| Concept | GLSL / older APIs | WGSL |
|---|---|---|
| Generic “flush memory” | `memoryBarrier()` | **Not present** |
| Shared / tile memory | `barrier()` + shared | `workgroupBarrier()` |
| SSBO / UAV-style | `memoryBarrierBuffer()` etc. | `storageBarrier()` |
| Cross-workgroup device scope | Possible in some native APIs | **Not available** in WGSL |

CUDA analogy: `__syncthreads()` ≈ `workgroupBarrier()` **and** `storageBarrier()` combined for groupshared + visible global within the block. WGSL splits them so backends (esp. Metal) can implement precisely.

| Need | Call |
|---|---|
| Sync `var<workgroup>` tile only | `workgroupBarrier()` |
| Sync read_write storage buffer within WG | `storageBarrier()` |
| Both | Call **both** (order either way; may fuse in SPIR-V) |

```wgsl
// Tile + partial storage write visible to this workgroup only
tile[li] = buf[idx];
workgroupBarrier();
buf[idx] = tile[li] + tile[(li + 1u) & 255u];
storageBarrier();
```

Cross-workgroup storage visibility requires **separate dispatches / compute passes**, not barriers.

---

## Divergence (uniform control flow)

| Pattern | Legal? | Code example |
|---|---|---|
| Barrier on common path | Yes | `load(); workgroupBarrier(); use();` |
| Uniform `if` (same for all threads) | Yes | `if (params.flag != 0u) { workgroupBarrier(); }` |
| Divergent half-workgroup | **No** | `if (li < 128u) { workgroupBarrier(); }` |
| Non-uniform loop trips | **No** | `for (var k=0u; k<li; k++) { workgroupBarrier(); }` |
| Early return then barrier | **No** | `if (gid.x >= w) { return; } workgroupBarrier();` |

```wgsl
// ILLEGAL
if (li < 128u) { workgroupBarrier(); }

// LEGAL — all threads reach barrier
let inBounds = gid.x < w && gid.y < h;
tile[li] = select(0.0, load(gid), inBounds);
workgroupBarrier();
```

---

## Texture barriers

Requires language feature `readonly_and_readwrite_storage_textures` for read-write storage textures; `textureBarrier()` orders texture accesses **inside one workgroup**.

| Case | Need `textureBarrier()`? | Example |
|---|---|---|
| Write-only stores | No | `textureStore(outTex, p, c);` |
| Same WG store → load | **Yes** | `textureStore(...); textureBarrier(); textureLoad(...);` |
| Cross-pass | Encoder pass split | Two `beginComputePass` |
| Cross-workgroup | Not solvable by shader barrier | Storage buffer + multi-pass |

TurboVec: storage buffers only → no texture barriers.

---

## TurboVec decision

| Concern | Choice | Note |
|---|---|---|
| Shared memory | None | No `var<workgroup>` |
| Barriers | None | No divergence / stall cost |
| Coalescing | AoS `vec4` | `idx = gid.y * width + gid.x` |

---

## Related

- `docs/ptdt-v33/WEBGPU_COMPUTE_LIMITS.md`
- `docs/ptdt-v33/WGSL_COALESCED_ACCESS.md`
- W3C WGSL § synchronization: https://www.w3.org/TR/WGSL/#sync-builtin-functions
