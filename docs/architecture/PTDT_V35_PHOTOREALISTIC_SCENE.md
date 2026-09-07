# PTDT v35 Photorealistic Spatial Scene Architecture

PTDT separates engineering truth from visual/simulation representations.

## Authority boundary

**Authoritative:** PostGIS/evidence ledger, validated telemetry, surveyed geometry, canonical SceneState, model outputs that pass their explicit validation contracts.

**Derived:** MVT, I3S/SLPK, OpenUSD, meshes, point-cloud reconstructions, 3D Gaussian Splatting, 4D Gaussian Splatting, procedural assets, WebGPU render buffers, Unity/Unreal scene assets, cinematic renders.

Every derived product must carry source identifiers, transformation metadata, CRS, vertical datum, epoch, confidence, and a deterministic content hash.

## Multi-representation flow

```text
Evidence/PostGIS -> SceneState -> SpatialTile
                                  |
             +--------------------+-------------------+
             |                    |                   |
            MVT                  I3S                 OpenUSD
             |                    |                   |
         MapLibre              3D GIS          Houdini/Unity/Unreal
                                  |
                                WebGPU

Reality capture: Photo-SLAM -> observations -> 3DGS/4DGS -> derived scene layers.
Point clouds: LiDAR/photogrammetry -> validation -> Open3D-derived products.
Procedural completion: Infinigen-like generators may fill missing/low-confidence visual regions only and must be labeled procedural.
```

## Routing safety

OSRM remains a path solver. Safety weighting comes from a dynamic hazard model using road elevation, water-surface elevation, inundation depth, velocity, closure state, road class, and uncertainty. BFE is an engineering attribute, not a universal road-closure threshold.

## Vertical reference

SceneState currently requires EPSG:2966 horizontally and NAVD88 vertically. Transformations that require a geoid model must record that model and transformation provenance rather than silently converting datums.

## Open-source dependency policy

External renderers, game engines, and procedural tools are optional adapters. The core spatial/evidence path does not require hosted accounts or paid API keys.
