# HEC-RAS → WebGPU Integration (PTDT-v33)

## Authority

```
HEC-RAS HDF (.p##.hdf)
  → ValidatedHydraulicState (CRS EPSG:2966, NAVD88, SHA-256)
  → Redis / WebSocket
  → WebGPU: cell_index_map (static) + wse_mm (per timestep)
  → compute depth_out = max(wse - dem, 0)
```

Archimedes / Box3D are **secondary** (VFX/collision only). Never overwrite WSE.

## HDF path

`/Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/{area}/Water Surface`

## Soft-fail

If `rascmd` or HDF missing: emit empty WSE + `SOFT_FAIL_*` status. **No fabricated results.**

## Texture sampling rules

| Format | Bind sampleType | WGSL access |
|--------|-----------------|-------------|
| r32float DEM/depth | unfilterable-float | textureLoad |
| r32uint cell_index | uint | textureLoad |
| rgba8unorm basemap | float | textureSample |

## Upload

- `bytesPerRow` multiple of 256
- See `web/src/gpu/textureUpload.ts`

## MapLibre

Presentation only: fill-extrusion buildings, OpenFreeMap/PMTiles, raster-dem viz. Regulatory Z = sealed NAVD88 DEM only.
