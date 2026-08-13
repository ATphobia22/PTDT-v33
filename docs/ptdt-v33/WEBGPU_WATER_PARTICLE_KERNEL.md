# WebGPU water particle compute kernel

**Authority:** derived VFX only. Rigid bodies are an **immutable** snapshot from a seal-verified envelope.

## Files

| Path | Role |
|---|---|
| `engine/cinematic_runtime/shaders/water_particle_compute.wgsl` | Compute kernel |
| `web/shaders/water_particle_compute.wgsl` | Browser copy |
| `web/shaders/water_particle_dispatch.ts` | Dispatch + pack helpers |

## Bind group

| Binding | Type | Access |
|---|---|---|
| 0 | `array<Particle>` | read_write |
| 1 | `array<RigidBody>` | read (immutable this dispatch) |
| 2 | `SimParams` uniform | read |

## Workgroup

`@workgroup_size(256, 1, 1)` · `dispatchWorkgroups(ceil(particleCount / 256))`

## Hard rules

1. Never write particle positions into `Box3DPhysicsState`
2. Never use GPU output as LOMA / HEC-RAS evidence
3. Re-pack `RigidBody` buffer only from seal-verified JSON
