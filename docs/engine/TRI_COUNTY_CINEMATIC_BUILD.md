# Tri-County Cinematic Experience

This branch packages the first unified cinematic stack for the Tri-State River Valley Engineering System.

## Components

- `src/shaders/triCountyPhotoreal.wgsl` — WebGPU terrain/water photoreal fragment pipeline.
- `src/cinematic/TriCountyCinematicScene.ts` — Three.js scene, lighting, post-processing, and waypoint director.
- `public/map/tri-county-style.json` — MapLibre GL style with terrain, imagery, water, flood scenarios, roads, assets, telemetry, and labels.
- `scripts/build-tri-county.mjs` — unified application build/staging script.
- `docs/engine/unreal-cesium-5.4-tri-county.scenegraph.json` — Unreal 5.4 + Cesium declarative valley scene graph.

## Integration

The existing application already exposes a cinematic flyover modal and Digital Twin modal from `Dashboard.tsx`; this stack is intended to become the rendering backend for those controls.

The WebGPU shader deliberately accepts terrain scale, wetness, flood stage, and water level as uniforms so the visual state can be driven by the existing telemetry/flood pipeline rather than hard-coded animation.

The Cesium scene graph uses environment variables for private/tenant-specific 3D Tiles endpoints. No credentials or tokens are committed.

## Build

`node scripts/build-tri-county.mjs`
