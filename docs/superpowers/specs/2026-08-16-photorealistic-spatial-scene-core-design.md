# PTDT v35+ Photorealistic Spatial Scene Core Design

## Goal

Integrate the approved open-source 3D/geospatial capabilities into PTDT-v33 without making visual tooling authoritative. Preserve a deterministic, provenance-aware engineering data plane while adding multi-representation scene generation and delivery for mapping, simulation, WebGPU, Unity, Unreal, and offline rendering.

## Architecture

```text
Authoritative Evidence / PostGIS
            |
         SceneState
            |
   Spatial Fusion + Provenance
            |
   +--------+---------+----------------+
   |        |         |                |
   GIS    Reality   Engineering      Simulation
   |      Capture      Geometry          |
 MVT/I3S  Photo-SLAM  CAD/OCCT       HEC-RAS/MODFLOW/EnKF/Bishop
   |       3DGS/4DGS       |              |
   +----------+-----------+--------------+
              |
           OpenUSD
              |
   +----------+-----------+
   |          |           |
 WebGPU     Unity       Unreal
   |                      |
 MapLibre              Runtime/Cinematic
              |
        Offline validation/rendering
```

## Core rules

1. PostGIS/evidence remains authoritative.
2. OpenUSD is an interchange/render/simulation representation, not the source of truth.
3. I3S/SLPK and MVT are delivery representations derived from authoritative state.
4. Gaussian splats, meshes, procedural assets, and cinematic media are derived products with provenance.
5. Observed, derived, simulated, and procedurally generated geometry are explicitly distinguished.
6. No fabricated operational metrics are allowed in UI or APIs.
7. Flood routing uses dynamic hazard fields rather than a universal elevation cutoff.
8. Vertical reference frames/datum and epochs are explicit in spatial payloads.
9. External API keys/accounts are not required for the core system.
10. Licensed/proprietary tools may remain optional adapters but cannot be mandatory core dependencies.

## PTDT Spatial Tile contract

Each tile carries:

- tile identifier and version
- CRS and vertical datum
- spatial bounds and epoch
- provenance and evidence hashes
- confidence/uncertainty metadata
- terrain DEM/DSM/mesh
- vector MVT layers
- point-cloud representation
- integrated mesh representation
- Gaussian/temporal Gaussian representation when available
- simulation layers
- source/transform manifests

## Reality capture

Photo-SLAM and photogrammetry establish camera poses and observations. 3DGS/4DGS provides photorealistic static/temporal derived scene representations. Open3D handles point-cloud validation, denoising, normals, and reconstruction. These products retain source timestamps, pose, confidence, and evidence hashes.

## Procedural generation

Infinigen and similar procedural tools fill missing/low-confidence visual regions only. Generated assets are marked `procedural` and cannot silently replace observed engineering geometry.

## Engineering geometry

CAD/OCCT-derived infrastructure assets are semantic engineering objects and may include bridges, culverts, levees, retaining structures, pump stations, and buildings. Their geometric provenance remains linked to source GIS/evidence records.

## Rendering/delivery

MapLibre/WebGPU serves operational interactive views. I3S/SLPK serves scalable heterogeneous 3D geospatial streaming. OpenUSD feeds Unity, Unreal, Houdini/Solaris, and offline rendering. Radeon ProRender is an optional offline/cinematic validation path.

## Routing safety correction

OSRM integration must consume dynamic hazard data: road elevation, water-surface elevation, depth, velocity, closure state, road class, and uncertainty. The router must not assume BFE is a universal road-closure threshold.

## v35 code corrections

- replace invalid `time.perf_context()` with `time.perf_counter()`;
- remove unused LAG retrieval or define its explicit engineering meaning;
- validate coordinates, response schemas, HTTP status, and OSRM route status;
- use pooled-connection context management and transaction hygiene;
- eliminate hard-coded latency/distance/compliance claims from the UI;
- remove remote map-style dependencies from the core deployment path;
- replace simplistic BFE-based point-cloud rejection with explicit elevation/land-cover/water/validity semantics;
- add deterministic hashing and provenance manifests to generated tiles and derived scene assets.

## Verification gates

The implementation must add or update tests for:

- SceneState schema/canonicalization
- spatial tile schema and provenance
- vertical datum metadata
- MVT/I3S/USD round-trip contracts where tooling is available
- point-cloud validation
- routing hazard semantics
- WebGPU shader/build validation
- Unity/Unreal adapter contracts
- security/dependency scanning
- deterministic build/test behavior

## Non-goals

- wholesale copying of external repositories into PTDT
- replacing authoritative engineering data with AI-generated geometry
- making Houdini, Unity, Unreal, or proprietary renderers mandatory
- asserting scientific/regulatory compliance from visualization alone
