# Pipeline cache UUID validation & Vulkan descriptor set layouts

Cross-checked against PTDT TurboVec host (`turbovecGpu.ts`) and authority rules from
`PTDT-TriState-Unified-v33` (`CANONICAL_AUTHORITY_MATRIX.md`). Presentation-only path.

---

## 1. Pipeline cache UUID validation

### 1.1 What is validated

When a driver loads a serialized `VkPipelineCache` blob, it compares header fields to the **live** physical device:

| Header field | Live source | On mismatch |
|--------------|-------------|-------------|
| `pipelineCacheUUID` (16 bytes) | `VkPhysicalDeviceProperties::pipelineCacheUUID` | Blob discarded / treated empty |
| `vendorID` | `VkPhysicalDeviceProperties::vendorID` | Discard |
| `deviceID` | `VkPhysicalDeviceProperties::deviceID` | Discard |
| Driver version / implementation | ICD-specific | Discard |

Validation is **driver-internal**. Applications do not call a separate "validate UUID" API; they pass `pInitialData` and the ICD either accepts or ignores the blob.

### 1.2 Application checklist (native Vulkan)

1. After `vkEnumeratePhysicalDevices`, read `pipelineCacheUUID`.
2. Optionally store UUID next to the blob file for a **pre-check** before create (avoids feeding a known-stale blob).
3. Always tolerate empty cache after driver update.
4. Never share blobs across machines or GPU models.

### 1.3 Pre-check pattern (native)

```c
// Pseudocode — not WebGPU
uint8_t file_uuid[VK_UUID_SIZE];
uint8_t live_uuid[VK_UUID_SIZE];
memcpy(live_uuid, props.pipelineCacheUUID, VK_UUID_SIZE);
if (memcmp(file_uuid, live_uuid, VK_UUID_SIZE) != 0) {
  // skip pInitialData — cold compile
}
```

### 1.4 WebGPU / PTDT

| Concern | Behavior |
|---------|----------|
| App-visible UUID | **None** |
| Blob load/save | Browser / Dawn / wgpu only |
| PTDT equivalent of "UUID miss" | `device.lost` or new adapter → `resetTurboVecDeviceCache()` |
| Compile identity | Stable WGSL string + explicit `GPUBindGroupLayout` |

There is nothing for TurboVec JS to validate against `pipelineCacheUUID`. Process-local `DeviceCache` is the only controllable cache.

---

## 2. Vulkan descriptor set layouts

### 2.1 Object roles

| Vulkan | WebGPU | Lifetime in TurboVec |
|--------|--------|----------------------|
| `VkDescriptorSetLayout` | `GPUBindGroupLayout` | Once per device |
| `VkDescriptorSet` | `GPUBindGroup` | Per plate (buffer sizes change) |
| `VkPipelineLayout` | `GPUPipelineLayout` | Once per device |
| Descriptor pool | Implementation-managed | Hidden |

### 2.2 TurboVec set 0 (canonical)

| Binding | Vulkan type | WebGPU `buffer.type` | Access | Size / stride |
|---------|-------------|----------------------|--------|---------------|
| 0 | `UNIFORM_BUFFER` | `uniform` | COMPUTE | ≥ 16 bytes (`TurboVecParams`) |
| 1 | `STORAGE_BUFFER` | `read-only-storage` | COMPUTE | `n × 16` (`vec4<f32>`) |
| 2 | `STORAGE_BUFFER` | `storage` | COMPUTE | `n × 4` (`u32`) |

WGSL:

```wgsl
@group(0) @binding(0) var<uniform> params : TurboVecParams;
@group(0) @binding(1) var<storage, read>  rgba   : array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> out_f16 : array<u32>;
```

### 2.3 Layout rules that fail validation

| Mistake | Result |
|---------|--------|
| Shader `@group(1)` with only group 0 in pipeline layout | Pipeline create fails |
| Bind storage buffer to uniform binding | Bind group create fails |
| Uniform size < `minBindingSize` (16) | Bind group create fails |
| Dynamic offset not multiple of 256 (typical) | Encode-time `OperationError` |
| Write to `read-only-storage` in shader | Shader/pipeline validation fails |

### 2.4 Authority boundary

Descriptor layouts and GPU compute for TurboVec are **visualization only**. Per canonical matrix:

| Domain | Authority |
|--------|-----------|
| Hydraulics | HEC-RAS |
| Groundwater | MODFLOW6 |
| Engineering calc | Archimedes |
| Visualization | PTDT (derived projection only) |

NDVI / packed f16 plates must never be promoted as hydraulic or regulatory evidence.

---

## 3. Cross-repo doc map (connector search results)

| Repo | Vulkan/WebGPU pipeline UUID docs | Action |
|------|----------------------------------|--------|
| `PTDT-v33` | Local + this file | Canonical for GPU path |
| `PTDT-TriState-Unified-v33` | None (authority/HEC-RAS/PostGIS) | Import authority matrix only |
| `Tri-State-River-Valley-Engineering-System` | None | No GPU cache docs |
| `Tri-County-River-Valley-Digital-Twin` | None in tree root | No UUID docs |
| `Point-Township-Digital-Twin` | Architecture/GIS (V23) | No Vulkan UUID docs |

**Conclusion:** UUID validation and descriptor-layout engineering docs did not exist upstream; this file is the authoritative creation for the family of repos.
