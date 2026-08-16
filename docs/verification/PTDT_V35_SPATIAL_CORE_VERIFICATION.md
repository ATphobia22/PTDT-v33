# PTDT v35 Spatial Core Verification Record

The approved v35 photorealistic spatial-scene architecture is implemented on `main`.

## Corrections driven by CI

- Added missing deck.gl 9.3.7 dependencies and WebGPU declarations.
- Corrected MapLibre/deck.gl typing and removed unsupported render parameters.
- Corrected WebGPU typed-array uploads for current `@webgpu/types` by using ArrayBuffer-backed copies.
- Restored the missing Vite `index.html` entry and a typed PTDT application shell so production bundling has a real entrypoint.
- Corrected Ruff import/typing/exception findings in the v35 spatial core.

## Passing verification already observed

- v35 Python spatial suite: PASS (`14 passed` in repository CI).
- JSON schema validation: PASS.
- Keyless policy: PASS.
- Engine/WebGPU integration: PASS in the latest completed run.
- WGSL validation: PASS.
- Engine contracts: PASS.
- Cinematic runtime: PASS.
- Security/supply-chain: PASS in the latest completed run.

The remaining verification run is intentionally rerunning the full frontend build and complete CI after restoring the Vite entrypoint.

## Architecture implemented

- deterministic provenance/source/transform records;
- PTDT SpatialTile with CRS, vertical datum, epoch, confidence, layers, and content hash;
- dynamic road-hazard route-cost semantics rather than universal BFE closure;
- reality-capture, point-cloud, static Gaussian, and temporal Gaussian descriptors;
- preservation/classification of legitimate below-BFE observations;
- MVT, I3S, OpenUSD, WebGPU, Unity, and Unreal adapter boundaries;
- SceneState-to-SpatialTile facade and adapter manifests;
- JSON Schema and dedicated CI verification;
- photorealistic spatial architecture and open-source integration documentation.
