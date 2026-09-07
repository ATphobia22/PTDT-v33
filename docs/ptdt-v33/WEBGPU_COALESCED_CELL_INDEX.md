# WebGPU coalesced access & GPU cell-index acceleration

**Authority:** HEC-RAS WSE remains absolute truth. GPU depth is **presentation only**.

## Preferred path (production)

1. **CPU-seal** `cell_index_map` once via `HecRasPipeline.generate_cell_index_map` (rasterio, EPSG:2966, nodata `0xFFFFFFFF`).
2. Stream **WSE mm** (int32) from sealed HDF coupler.
3. Dispatch **`cell_index_compute.wgsl`** workgroup `(16, 16, 1)`:
   - `textureLoad(dem_tex)` + `textureLoad(cell_index_map)` — coalesced
   - `wse_mm[cell_id]` — sparse buffer read
   - `textureStore(depth_out)` — r32float presentation depth

### Why 16×16 coalesces

- Threads in a wavefront/warp map to consecutive texels in X (then Y).
- `textureLoad` on the same mip hits texture cache lines together.
- Avoids divergent branching across dry vs wet cells when possible (still safe with early nodata checks).

## Optional GPU nearest-cell bake (`cell_index_bake.wgsl`)

**Use only if mesh sizes force it** (e.g. cannot offline-rasterize, or interactive mesh edit).

- Complexity: **O(width × height × cell_count)** — expensive for large 2D areas.
- Writes `r32uint` cell ids; still must be **sealed offline** before regulatory evidence packages.
- Do **not** use GPU-baked maps as LOMA/affidavit inputs without CPU re-seal + SHA-256.

### Gate (pseudocode)

```text
if cell_count * map_pixels > GPU_BUDGET:
    require CPU rasterize (fail-closed soft-fail if missing)
else:
    optional: dispatch cell_index_bake for interactive preview only
```

## Host upload requirements

- `bytesPerRow` multiple of **256** for texture uploads.
- DEM / cell_index dimensions must match exactly.
- `wse_mm.length >= max(cell_id) + 1` or host clamps/soft-fails.
- Shader module: call `getCompilationInfo()`; surface Naga errors; never dispatch on fail.

## Related files

| File | Role |
|------|------|
| `shaders/cell_index_compute.wgsl` | Coalesced depth bake |
| `shaders/cell_index_bake.wgsl` | Optional O(N) nearest id bake |
| `shaders/preprocess_dem_wse.wgsl` | Grid-aligned DEM−WSE depth (no cell map) |
| `hecras_pipeline.py` | HDF WSE + CPU cell_index_map |
| `cell_index_map.py` | Fail-closed uint32 helper |

## Invariants

- No fabricated HEC-RAS WSE
- No Archimedes overwrite of hydraulic state
- No raw large-world coords in Float32 WebGPU buffers (render-origin only)
- Vertical = NAVD88; horizontal engineering = EPSG:2966
