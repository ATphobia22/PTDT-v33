# WebGPU compute shader dispatch (TurboVec)

## API

```ts
pass.setPipeline(pipeline);
pass.setBindGroup(0, bindGroup);
pass.dispatchWorkgroups(dispatchX, dispatchY, dispatchZ?);
```

| Parameter | TurboVec | Formula |
|---|---|---|
| Workgroup size | 16 × 16 × 1 | `@workgroup_size(16, 16, 1)` |
| `dispatchX` | `ceil(width / 16)` | covers full image width |
| `dispatchY` | `ceil(height / 16)` | covers full image height |
| `dispatchZ` | 1 (default) | 2D plates only |

```ts
const WG = 16;
const dispatchX = Math.ceil(width / WG);
const dispatchY = Math.ceil(height / WG);
pass.dispatchWorkgroups(dispatchX, dispatchY);
```

---

## Limits

| Limit | Typical base | Check |
|---|---|---|
| `maxComputeWorkgroupsPerDimension` | 65535 | `dispatchX/Y ≤ limit` |
| `maxComputeInvocationsPerWorkgroup` | 256 | 16×16 = 256 |
| Total threads | `dispatchX * dispatchY * 256` | edge WGs partially idle |

Edge pixels: threads with `gid.x >= width || gid.y >= height` must **no-op** (no early barrier).

---

## Indirect dispatch (optional)

`dispatchWorkgroupsIndirect(buffer, offset)` — 12-byte `GPUBuffer` of three `u32` counts. Use when plate size is GPU-resident; TurboVec uses direct dispatch (CPU knows W/H).

---

## Related

- `frontend/src/viz/turbovecGpu.ts`
- `docs/ptdt-v33/WEBGPU_COMPUTE_LIMITS.md`
- `docs/ptdt-v33/WGSL_COALESCED_ACCESS.md`
