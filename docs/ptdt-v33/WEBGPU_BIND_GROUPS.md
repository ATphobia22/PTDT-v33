# WebGPU bind groups (TurboVec + PTDT)

## Model

| Object | Role |
|---|---|
| `GPUBindGroupLayout` | Schema: binding index → type (uniform/storage/texture) + visibility |
| `GPUPipelineLayout` | Ordered list of bind group layouts used by a pipeline |
| `GPUBindGroup` | Concrete resources (buffers/views) matching a layout |

Shader declares `@group(N) @binding(M)`. Host must match N/M exactly.

---

## TurboVec group 0

| Binding | WGSL | Buffer usage | `minBindingSize` |
|---|---|---|---|
| 0 | `var<uniform> params` | `UNIFORM \| COPY_DST` | **16** |
| 1 | `var<storage, read> rgba` | `STORAGE \| COPY_DST` | `width*height*16` |
| 2 | `var<storage, read_write> out_f16` | `STORAGE \| COPY_SRC` | `width*height*4` |

```ts
const bindGroupLayout = device.createBindGroupLayout({
  entries: [
    { binding: 0, visibility: GPUShaderStage.COMPUTE,
      buffer: { type: 'uniform', minBindingSize: 16 } },
    { binding: 1, visibility: GPUShaderStage.COMPUTE,
      buffer: { type: 'read-only-storage' } },
    { binding: 2, visibility: GPUShaderStage.COMPUTE,
      buffer: { type: 'storage' } },
  ],
});

const pipelineLayout = device.createPipelineLayout({
  bindGroupLayouts: [bindGroupLayout],
});

const bindGroup = device.createBindGroup({
  layout: bindGroupLayout,
  entries: [
    { binding: 0, resource: { buffer: paramBuf } },
    { binding: 1, resource: { buffer: rgbaBuf } },
    { binding: 2, resource: { buffer: outBuf } },
  ],
});
```

**Cache** layout + pipeline on the device; rebuild bind groups per plate (buffer sizes change).

---

## Alignment

| Resource | Offset alignment (typical base) | Size note |
|---|---|---|
| Uniform binding offset | `minUniformBufferOffsetAlignment` (often 256) | Struct size 16 OK |
| Storage binding offset | `minStorageBufferOffsetAlignment` (often 256) | Full buffer from 0 |
| Mapped range | 4 / 8 depending on type | `mapAsync` rules |

```ts
assertBufferOffsetAlign(offset, device.limits.minUniformBufferOffsetAlignment, 'uniform');
```

---

## Validation pitfalls

| Mistake | Symptom |
|---|---|
| Wrong binding type (`storage` vs `read-only-storage`) | Pipeline / bind group create fails |
| Buffer usage missing `STORAGE` | Runtime validation error |
| `minBindingSize` larger than buffer | Create bind group fails |
| Using `layout: 'auto'` then mixing pipelines | Harder to reuse layouts |

---

## Related

- `frontend/src/viz/turbovecGpu.ts`
- `docs/ptdt-v33/WEBGPU_COMPUTE_LIMITS.md`
- `docs/ptdt-v33/WGSL_COALESCED_ACCESS.md`
