# WebGPU compute — physics diff / plate ops (TurboVec)

## Role

WebGPU does **not** own authoritative physics. It may:

1. Rasterize / hillshade DEM plates (TurboVec)
2. Apply **derived** particle / debris visual updates from sealed envelopes
3. Optionally parallel-filter body deltas for GPU culling

## Workgroup sizing

| Kernel | `@workgroup_size` | Notes |
|---|---|---|
| 2D plate (TurboVec) | `(16, 16, 1)` | 256 inv/WG — fills wavefront on most GPUs |
| 1D body scan | `(256, 1, 1)` | one body per invocation |
| Reduce (seal prehash) | `(256, 1, 1)` | CPU seal remains authoritative |

```wgsl
// body_delta_filter.wgsl — derived visual only
struct Body {
  entity_hash: u32,
  flags: u32,
  pos: vec3<f32>,
  _pad: f32,
};

@group(0) @binding(0) var<storage, read> bodies: array<Body>;
@group(0) @binding(1) var<storage, read_write> visible: array<u32>;
@group(0) @binding(2) var<uniform> params: vec4<u32>;

@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= params.x) { return; }
  visible[i] = bodies[i].flags;
}
```

## Dispatch

```ts
const count = bodies.length;
const wg = 256;
pass.dispatchWorkgroups(Math.ceil(count / wg));
```

## Memory coalescing

- Store SoA for large N when scanning
- AoS `Body` fine for N < ~10k
- Diff path: only upload `updated`/`added` slices each frame

## Barriers

| Barrier | Use |
|---|---|
| `workgroupBarrier()` | Shared-memory tile reductions inside WG |
| `storageBarrier()` | Ordered storage writes before next WG phase |
| Texture barrier | Implicit on render pass boundaries in WebGPU |

Do **not** barrier across divergent early-outs that skip the barrier on some lanes.

## Seal remains on CPU

SHA-256 of canonical JSON stays in Python/Unity (`verify_state_seal`). GPU never forges forensic seals.
