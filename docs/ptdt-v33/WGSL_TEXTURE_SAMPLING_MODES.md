# WGSL texture sampling modes (PTDT)

## Modes

| Mode | API | Filter | Use |
|---|---|---|---|
| **Filtered sample** | `textureSample(tex, sampler, uv)` | Yes | DEM, imagery |
| **Explicit LOD** | `textureSampleLevel(..., lod)` | Yes fixed LOD | Vertex DEM elev |
| **Texel fetch** | `textureLoad(tex, coords, level)` | **None** | `r32uint` cell index |
| **Storage load/store** | `textureLoad` / `textureStore` | None | Compute index bake |

## Address modes (filtered)

`clamp-to-edge` (DEM default) · `repeat` · `mirror-repeat`

## Filter modes

`nearest` · `linear` (mag/min)

## PTDT rules

```text
DEM elevation (vertex)  → textureSampleLevel + linear
Cell Index Map r32uint  → textureLoad only (no sampler)
WSE                     → storage buffer index
```

## Invalid

- `textureSample` on `texture_2d<u32>`
- OOB `textureLoad` without clamp
- Storage texture + sampler
