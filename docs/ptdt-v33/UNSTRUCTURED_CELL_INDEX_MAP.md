# Unstructured HEC-RAS → Cell Index Map → WebGPU

## Pipeline

```text
Geometry HDF Cells Center Coordinate
  → rasterize_nearest_cell_index (uint32 HxW)
  → cell_index_map texture (texture_2d<u32>)
Live plan HDF Water Surface[t, :]
  → seal (exclude seal field) → Redis
  → wse storage buffer (array<f32>)
Fragment: textureLoad(map) → wse_array[cell_id] vs DEM
```

## WGSL rule

**Do not** `textureSample` integer index maps. Use **`textureLoad`** + bounds check. Nodata = `0xFFFFFFFF`.

## OpenMI note

OpenMI 2.0 = pull-based linkable components exchanging value sets in memory at timesteps — **not** OS `mmap` files. Flux gate is PTDT engineering fail-closed.

## Modules

| Path | Role |
|---|---|
| `backend/services/hecras_cell_index_rasterizer.py` | Bake map |
| `backend/services/hecras_unstructured_coupler.py` | 1D stream |
| `engine/cinematic_runtime/shaders/turbovec_unstructured_plate.wgsl` | Shader |
| `frontend/src/viz/turboVecUnstructured.ts` | Host upload |
| `backend/services/openmi_forensic_gate.py` | Flux lock |
