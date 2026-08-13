# WebGPU textureLoad precision (Cell Index Map)

## Rules

| Rule | Detail |
|---|---|
| Integer textures | `r32uint` / `texture_2d<u32>` — **not** filterable |
| Access | **`textureLoad(tex, coords, level)` only** — no sampler |
| Coords | 0-based texel `vec2<i32>` or `vec2<u32>` |
| Level | Mip index; use `0` for full resolution |
| OOB | Invalid address → implementation-defined; **always clamp in shader** |
| Return | `vec4<u32>`; single-channel uses `.r` |
| Precision | `r32uint` stores **exact** cell IDs (no float rounding) |

## UV → texel (correct)

```wgsl
let x = min(i32(floor(u * f32(width))), i32(width) - 1);
let y = min(i32(floor(v * f32(height))), i32(height) - 1);
let cell_id = textureLoad(cell_index_map, vec2(x, y), 0).r;
```

## Host format

```ts
device.createTexture({ format: "r32uint", usage: TEXTURE_BINDING | COPY_DST, ... })
// bytesPerRow: pad to 256-byte multiple when required
```
