# WebGPU storage texture formats (PTDT)

## Core read_write formats

| Format | PTDT use |
|---|---|
| **`r32uint`** | Cell index bake / exact IDs |
| **`r32sint`** | Signed ids |
| **`r32float`** | Scalar fields |

## Sampled vs storage

| Usage | Access |
|---|---|
| `TEXTURE_BINDING` + `texture_2d<u32>` | `textureLoad` (fragment) |
| `STORAGE_BINDING` + `texture_storage_2d<r32uint, write>` | `textureStore` (compute bake) |

Runtime fragment uses sampled integer load. Optional GPU bake uses storage write (`cell_index_bake.wgsl`).
