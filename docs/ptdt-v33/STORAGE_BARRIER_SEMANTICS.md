# storageBarrier semantics (WGSL)

## Definition

`storageBarrier()` is a **control barrier** with **acquire/release** memory ordering that:

1. Forces **all invocations in the same workgroup** to arrive before any continues.
2. Makes prior **storage** address-space writes by those invocations visible to later storage reads by those same invocations.

It does **not**:

- Synchronize **different workgroups**
- Flush workgroup (`var<workgroup>`) memory (use `workgroupBarrier()`)
- Provide device- or queue-wide ordering (use separate compute passes)

---

## Comparison table

| Builtin | Address space | Cross-workgroup? | Minimal example |
|---|---|---|---|
| `workgroupBarrier()` | `workgroup` | No | `tile[li]=v; workgroupBarrier();` |
| `storageBarrier()` | `storage` | No | `buf[i]=v; storageBarrier(); let x=buf[j];` |
| `textureBarrier()` | storage texture | No | `textureStore(...); textureBarrier();` |
| GLSL `memoryBarrier()` | generic | N/A | **Not in WGSL** |

```wgsl
@group(0) @binding(0) var<storage, read_write> buf: array<f32>;

@compute @workgroup_size(256)
fn reduce_local(@builtin(local_invocation_index) li: u32) {
  // Phase A — each thread writes its slot
  buf[li] = buf[li] * 0.5;
  storageBarrier(); // this WG only: writes visible before Phase B
  // Phase B — read neighbor in same WG
  let neighbor = buf[(li + 1u) % 256u];
  buf[li] = buf[li] + neighbor;
}
```

---

## When storageBarrier is insufficient

| Scenario | Correct approach |
|---|---|
| Workgroup 0 writes; workgroup 1 must read | **Second dispatch** (or second `beginComputePass`) |
| Shared tile only | `workgroupBarrier()` only |
| Need both tile + buffer | Call **both** barriers |

```ts
// Host: cross-WG ordering via pass boundary
encoder.beginComputePass(). /* dispatch A */ .end();
encoder.beginComputePass(). /* dispatch B reads A's storage */ .end();
```

---

## TurboVec

No `storageBarrier` — one thread per pixel, no cross-thread storage dependency within a dispatch.

---

## Related

- `docs/ptdt-v33/WGSL_WORKGROUP_BARRIERS.md`
- `docs/ptdt-v33/WEBGPU_BIND_GROUPS.md`
