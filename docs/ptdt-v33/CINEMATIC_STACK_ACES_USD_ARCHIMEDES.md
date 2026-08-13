# Cinematic stack: ACEScg · Hydra · USD · Archimedes→WebGPU

## Authority

| Layer | Role |
|---|---|
| Material Truth / HEC-RAS / Archimedes analytical | **Engineering** |
| ACEScg Hydra Viewport | **Presentation** color |
| WebGPU Frame Emitter | **Presentation** sealed frames |
| USD SceneState | **Presentation** scene graph |
| Archimedes→WebGPU Coupler | **Derived** shading uniforms only |

## Modules

| Component | Path |
|---|---|
| ACEScg Hydra Viewport | `engine/cinematic_runtime/acescg_hydra_viewport.py` |
| WebGPU Frame Emitter | `engine/cinematic_runtime/webgpu_cinematic_frame_emitter.py` |
| USD SceneState Generator | `engine/cinematic_runtime/usd_scene_state_generator.py` |
| Archimedes ≥ WebGPU | `engine/cinematic_runtime/archimedes_webgpu_coupler.py` |

## Locked labels

BFE **375.0** · LAG **377.2** · FFE **382.5** ft NAVD88 · n **0.045** · slope **0.00015** · storage **1.20×**
