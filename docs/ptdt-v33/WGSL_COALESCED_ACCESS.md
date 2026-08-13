# WGSL TurboVec — coalesced memory access

## Layout

```
rgba: array<vec4<f32>>   // AoS: pixel i → bytes [i*16 .. i*16+16)
out_f16: array<u32>      // pixel i → 4 bytes
idx = gid.y * width + gid.x
```

## Why it coalesces

| Thread (local x) | Global idx (same row) | rgba address |
|------------------|------------------------|--------------|
| 0 | base+0 | base+0 |
| 1 | base+1 | base+16 |
| 2 | base+2 | base+32 |
| … | … | +16 B each |

Within a workgroup row, consecutive threads issue consecutive 16-byte loads.
GPU memory controllers merge these into wide transactions (typically 32–128 B).

## Anti-patterns avoided

- **SoA split buffers** (separate r[], n[], g[], b[]): four sparse streams → 4× transactions.
- **Column-major index** `gid.x * height + gid.y`: vertical stride breaks row coalescing.
- **Unaligned struct** without pad: uniform binding must stay 16 B multiple.

## Workgroup 16×16

- 256 threads; row of 16 covers 16×16 = 256 B of rgba per subgroup row segment.
- Bandwidth-bound kernel (no `var<workgroup>` shared memory) → occupancy > shared-memory tricks.
- Dispatch: `ceil(width/16) × ceil(height/16)`.

## Host alignment

- Uniform buffer size 16; offset alignment prefer `device.limits.minUniformBufferOffsetAlignment` (often 256).
- Storage offset alignment often 256 for sub-allocation.
- Per-pass buffers destroyed after readback; pipeline + bind group layout cached on device.
