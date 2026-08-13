# WebGPU compute shader limits

Runtime values come from `GPUAdapter.limits` / `GPUDevice.limits`. Numbers below are **typical** minimums from the WebGPU base capability set; always query the device.

---

## Core compute limits

| Limit | Base minimum (spec) | TurboVec use |
|---|---|---|
| `maxComputeWorkgroupSizeX` | 256 | WG X = **16** |
| `maxComputeWorkgroupSizeY` | 256 | WG Y = **16** |
| `maxComputeWorkgroupSizeZ` | 64 | Z = **1** |
| `maxComputeInvocationsPerWorkgroup` | 256 | 16×16×1 = **256** (at minimum ceiling) |
| `maxComputeWorkgroupsPerDimension` | 65535 | Dispatch `ceil(W/16)`, `ceil(H/16)` |
| `maxComputeWorkgroupStorageSize` | 16384 bytes | TurboVec uses **0** |
| `maxBindingArrayLength` / bind groups | device-dependent | One bind group, 3 buffers |

If an adapter only guarantees 256 invocations per workgroup, **16×16 is the maximum square** that is always valid. Larger groups require feature/`requestDevice` with raised limits where available.

---

## Buffer and binding limits

| Limit | Typical base | PTDT practice |
|---|---|---|
| `minUniformBufferOffsetAlignment` | 256 | Sub-allocate uniforms on 256 B |
| `minStorageBufferOffsetAlignment` | 256 | Same for storage slices |
| `maxUniformBufferBindingSize` | 65536 | Params struct = **16 B** |
| `maxStorageBufferBindingSize` | 128 MiB | Full-plate RGBA may be large; chunk if needed |
| `maxBindGroups` | 4 | TurboVec uses **1** |
| `maxBindingsPerBindGroup` | 1000 | Uses **3** |

Host helpers: `UNIFORM_OFFSET_ALIGNMENT_DEFAULT = 256`, `assertBufferOffsetAlign(...)`.

---

## Timestamp queries

| Item | Value |
|---|---|
| Feature name | `timestamp-query` |
| Request | `adapter.features.has('timestamp-query')` → `requiredFeatures` |
| Resolution | Implementation-defined; deltas in **ns** as `BigUint64` |
| Overhead | ~0.5–3 ms wall when enabled for profiling only |

---

## Validation checklist (CI / boot)

| Check | Action on failure |
|---|---|---|
| `navigator.gpu` missing | CPU fallback |
| `requestAdapter()` null | CPU fallback |
| Workgroup 16×16 vs `maxComputeInvocationsPerWorkgroup` | Cap WG or fail closed |
| `minUniformBufferOffsetAlignment` | Use device limit, not hard-coded 256 alone |
| Storage buffer byteLength | Split plate if over `maxStorageBufferBindingSize` |

```ts
const maxInv = device.limits.maxComputeInvocationsPerWorkgroup;
if (WORKGROUP * WORKGROUP > maxInv) {
  throw new Error(`TurboVec WG ${WORKGROUP}² exceeds maxComputeInvocationsPerWorkgroup=${maxInv}`);
}
```

---

## Barrier-related limits (reminder)

| Item | Constraint | Example |
|---|---|---|
| Barrier scope | Workgroup only | No device-wide `memoryBarrier` in WGSL |
| Shared memory size | `maxComputeWorkgroupStorageSize` (≥16 KiB base) | `var<workgroup> tile: array<f32, 256>` ≈ 1 KiB |
| Invocations at barrier | Uniform CF; ≤ max invocations | 16×16 = 256 |

See `WGSL_WORKGROUP_BARRIERS.md` for divergence rules.

## Related

- `frontend/src/viz/turbovecGpu.ts`
- `frontend/src/shaders/turbovecCompute.wgsl`
- `docs/ptdt-v33/WGSL_WORKGROUP_BARRIERS.md`
- `docs/ptdt-v33/WEBGPU_TIMESTAMPS_ALIGNMENT_BENCHMARKS.md`

---

## Texture + storage interaction (limits angle)

| Item | Typical constraint | Example check |
|---|---|---|
| Storage texture formats | Subset of formats (e.g. `rgba8unorm`, `r32float`) | `texture_storage_2d<rgba8unorm, write>` |
| `maxStorageTexturesPerShaderStage` | Device limit (often ≥ 4) | Count `@binding` storage textures |
| `textureBarrier()` vs limits | No extra limit; still intra-workgroup only | See `WGSL_WORKGROUP_BARRIERS.md` |
| Max texture 2D size | `maxTextureDimension2D` (often 8192) | `width/height ≤ limit` before dispatch |

```ts
const maxDim = device.limits.maxTextureDimension2D;
if (width > maxDim || height > maxDim) {
  throw new Error(`Texture ${width}x${height} exceeds maxTextureDimension2D=${maxDim}`);
}
```
