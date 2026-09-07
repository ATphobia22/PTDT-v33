# PTDT v35 Spatial Scene, Evidence, and Photorealistic Rendering Design

**Date:** 2026-08-16  
**Target:** `ATphobia22/PTDT-v33`  
**Status:** Design approved by user; written-spec review required before implementation.

## 1. Objective

Extend the existing PTDT v35 architecture into a scientifically authoritative, provider-neutral spatial scene system capable of producing high-fidelity 3D terrain, infrastructure, hydrology, simulation, and cinematic representations of the Tri-State River Valley.

The system must preserve a strict separation between authoritative engineering state and derived visual representations. Photorealism improves visualization and simulation context; it does not become an evidence authority.

## 2. Design Principles

1. One authoritative spatial state; many derived representations.
2. Every spatial artifact declares CRS, vertical datum, epoch, units, provenance, and validation state.
3. BFE and regulatory surfaces are analytical layers, never destructive filters for terrain/LiDAR.
4. Cryptographic hashes establish integrity, not scientific truth.
5. Derived assets retain lineage back to source observations and transformations.
6. Render-origin-relative coordinates are used for large-world WebGPU/Unity/Unreal rendering.
7. Optional commercial services cannot prevent the sovereign core from starting or validating.
8. Unity and Unreal consume the same canonical SceneState contract.

## 3. Canonical Spatial Contracts

### SpatialReferenceContract

Fields:

- horizontal CRS identifier and authority
- vertical datum identifier
- geoid model where applicable
- coordinate epoch / realization
- horizontal and vertical units
- axis order
- transformation pipeline identifier
- source and target CRS for derived transforms

Validation rejects missing authority metadata, invalid transformations, and non-finite coordinates/elevations.

### TemporalStateContract

Fields:

- simulation time
- observation/acquisition time
- forecast horizon
- timestep
- interpolation method
- temporal source identifier
- timezone/UTC normalization

### EvidenceArtifact

Fields:

- artifact ID
- source ID
- acquisition timestamp
- transformation chain
- canonical serialization version
- content hash
- optional signature
- validation results
- uncertainty metadata
- authority classification

The canonical hash excludes the mutable hash field itself.

### SceneRepresentation

Explicitly distinguishes:

- authoritative source representation
- engineering/simulation derivative
- visualization derivative
- cinematic derivative

No representation may silently replace the authoritative source.

## 4. SceneTileManifest

Each spatial tile becomes a versioned manifest containing:

- tile identity and spatial bounds
- SpatialReferenceContract
- TemporalStateContract
- terrain/DEM references
- hydrography references
- buildings/infrastructure references
- simulation-state references
- mesh references
- 3DGS/4DGS references where available
- OpenUSD/I3S/SLPK references
- WebGPU delivery metadata
- provenance graph references
- artifact hashes
- confidence/uncertainty metadata
- validation status

The manifest is deterministic and content-addressable.

## 5. Data Pipeline

```text
Authoritative observations
        |
        v
Ingest + provenance + QA/QC
        |
        v
CRS/datum normalization
        |
        v
PostGIS / COG / PMTiles / object storage
        |
        +-------------------------------+
        |                               |
        v                               v
Engineering derivatives          Visual derivatives
DEM / hydro / structures         meshes / textures / 3DGS / 4DGS
        |                               |
        +---------------+---------------+
                        v
                 SceneTileManifest
                        |
              +---------+---------+
              |         |         |
           WebGPU    OpenUSD   I3S/SLPK
              |         |         |
           MapLibre   Hydra    engine import
              |         |         |
              +---- Unity/Unreal ----+
```

## 6. Terrain and Point-Cloud Processing

Point-cloud processing must not remove points merely because they are below BFE. Instead:

- preserve all source observations within quality bounds;
- classify terrain, buildings, vegetation, water, and artifacts;
- retain BFE as a separate analytical surface;
- derive inundation masks through comparison with WSE/BFE and hydraulic results;
- preserve raw and filtered artifact hashes;
- record every filter and reconstruction parameter.

Surface reconstruction is a derived product and must retain source lineage.

## 7. Photorealistic Representation Pipeline

The visual pipeline may use owned/open technologies for:

- photogrammetry and camera reconstruction;
- Photo-SLAM-style localization/reconstruction;
- 3D Gaussian Splatting for static photorealistic capture;
- 4D Gaussian Splatting for time-varying scenes where validated temporal observations exist;
- synthetic scene generation for gaps, testing, and visualization;
- CAD/engineering geometry for authoritative structures;
- OpenUSD as the interchange and composition layer;
- Hydra/compatible renderers for cinematic output.

Synthetic or generative geometry must be marked as generated/derived and must never be represented as surveyed fact.

## 8. WebGPU Contract

OpenMI exchange data will use an explicit binary contract:

- little-endian float32/float16/int formats as declared by schema;
- byte length and stride;
- row/column-major convention;
- alignment requirements;
- nodata representation;
- min/max/scale/offset;
- grid dimensions;
- CRS/datum IDs;
- timestep;
- content hash.

WebGPU upload code must use explicit `ArrayBuffer`/typed-array handling and obey buffer alignment and usage constraints.

## 9. Engine Adapter Contract

The common engine frame carries:

- frame ID
- authority snapshot ID
- SceneTileManifest ID
- timestamp
- spatial reference
- render origin
- terrain/mesh handles
- hydraulic state references
- evidence references
- scene entities
- visual derivatives
- validation status
- content hashes

### Unity

Use PTDT SceneState as the authoritative contract. Integrate MagicOnion/realtime networking only behind the transport abstraction. Unity MCP and editor tooling remain development tools. Rendering and VFX remain derived consumers.

### Unreal

Provide a native C++ runtime adapter around the same SceneState contract. Python/JS/UnrealCV tooling remains optional development/test tooling.

## 10. Rendering and Level of Detail

Tiles use hierarchical LOD and content-addressed assets.

- WebGPU: stream only visible tile representations.
- MapLibre: MVT/terrain/vector presentation layers.
- OpenUSD: composed engineering/cinematic scene graph.
- Unity/Unreal: engine-native streamed assets generated from the same manifest.
- 3DGS/4DGS: visibility- and quality-aware streaming with explicit capture provenance.

Large-world coordinates use local render origins while preserving authoritative geographic coordinates in metadata.

## 11. Error Handling

Fail closed for:

- missing CRS/datum on authoritative records;
- invalid coordinate ranges;
- NaN/Inf values;
- incompatible SceneState schema versions;
- evidence hash mismatch;
- unverified authoritative substitutions;
- unsupported unit conversions;
- malformed WebGPU buffer contracts.

Fail soft for optional visual providers by falling back to validated OSS/self-hosted representations.

## 12. Verification

Add deterministic tests for:

1. SpatialReferenceContract validation.
2. TemporalStateContract validation.
3. canonical evidence hashing.
4. provenance-chain integrity.
5. SceneTileManifest serialization round trips.
6. OpenMI payload layout and endian/stride rules.
7. WebGPU buffer alignment and upload contracts.
8. point-cloud filtering/reconstruction lineage.
9. MVT/COG/PMTiles metadata compatibility.
10. OpenUSD round trips.
11. SceneState Unity/Unreal contract compatibility.
12. 3DGS/4DGS artifact provenance.
13. large-world render-origin transforms.
14. security/license/dependency scans.
15. full CI integration.

## 13. Repository Integration Policy

Candidate owned repositories are capability sources, not automatic merge targets. Each candidate must pass relevance, license, dependency, security, architecture, and compatibility checks before code is incorporated.

Prefer adapters and thin integration boundaries over copying entire upstream repositories into PTDT.

## 14. Implementation Sequence

1. Add canonical spatial/temporal/evidence contracts.
2. Correct SceneTileManifest and provenance hashing.
3. Implement OpenMI/WebGPU binary contract.
4. Correct point-cloud processing and BFE analytical separation.
5. Add photogrammetry/3DGS/4DGS asset metadata and adapters.
6. Add OpenUSD/I3S/SLPK scene export contracts.
7. Integrate MapLibre/WebGPU streaming.
8. Integrate Unity/Unreal adapters.
9. Add end-to-end deterministic fixtures and CI.
10. Reconcile remaining branches and publish only verified results to `main`.

## 15. Success Criteria

The implementation is successful when the PTDT core can construct a deterministic, provenance-preserving SceneTileManifest from authoritative inputs; produce multiple visual representations without mutating authority state; stream appropriate representations to WebGPU/MapLibre; export OpenUSD/I3S-compatible scenes; and deliver the same validated SceneState contract to Unity and Unreal without commercial credentials.

The final system must distinguish clearly between measured/authoritative, simulated/derived, and generated/visual content.
