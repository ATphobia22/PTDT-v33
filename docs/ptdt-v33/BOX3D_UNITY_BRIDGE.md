# Box3D Unity Bridge (derived physics/VFX)

**Authority:** derived only. Does not overwrite hydraulic, elevation, regulatory, or provenance state.

Pinned dependency: `ATphobia22/box3d-unity@9501a404d93c79bc6369d84c9b17e28aee780a37` (Box3D 0.8.1, Unity 6000.0+).

## Layout

```
integrations/box3d-unity/
  package.json
  Runtime/
    PTDTBox3D.Runtime.asmdef
    PTDTBox3DWorld.cs
    PTDTBox3DStateSynchronizer.cs
engine/cinematic_runtime/
  box3d_contract.py
```

## Data path (corrected — not zero-copy)

```
Redis Stream → PTDT SceneState → WebSocket → Unity/WebGPU
  → typed native representation → Box3D / GPU
```

Consume `BodyMoveEvent` spans immediately; valid only until next `World.Step` or mutation.

## CRS / precision

```
EPSG:2966 project coords → PTDT render origin → Box3D local (B3Pos)
```

Never pass large absolute projected coordinates into single-precision physics.

## Seal

Python `compute_state_seal` / `verify_state_seal` (SHA-256 of canonical JSON excluding seal field) aligns with Unity `stateCryptographicSeal`.
