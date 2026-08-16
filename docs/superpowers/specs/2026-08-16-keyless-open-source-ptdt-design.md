# PTDT Keyless Open-Source Architecture Design

**Date:** 2026-08-16  
**Target:** `main` of `ATphobia22/PTDT-v33`  
**Status:** Approved design; implementation follows after written-spec review.

## 1. Objective

Convert PTDT into a provider-neutral, keyless-by-default engineering platform. Runtime-critical capabilities must not require commercial API keys, hosted SaaS accounts, or proprietary cloud control planes. Authoritative scientific/regulatory sources remain explicit provenance inputs rather than being replaced merely because they are external.

The core authority boundary is preserved: presentation, rendering, AI, VFX, and engine adapters may consume authoritative state but must not mutate hydrographic, geodetic, regulatory, or evidence state.

Current PTDT already declares NAVD88 and EPSG:2966 as the authoritative vertical/horizontal contract and explicitly excludes Cesium Ion and Google Photorealistic keys from production paths. The migration generalizes that posture across the entire stack.

## 2. Scope

### In scope

- PTDT-v33 plus the previously identified Tri-State/Tri-County repositories.
- v35 evidence/spatial core correction and normalization.
- Credential/account dependency census.
- Owned-repository OSS capability discovery and selective integration.
- Provider-neutral interfaces for AI, maps/tiles, object storage, realtime transport, telemetry, and inference.
- MapLibre/WebGPU spatial visualization.
- PostGIS/PROJ/GDAL/OGC-compatible spatial processing where appropriate.
- PMTiles/COG/OGC data delivery patterns.
- MinIO-compatible object storage abstraction for self-hosted deployments.
- gRPC/MagicOnion-compatible realtime transport with PTDT SceneState contracts.
- Unity and Unreal adapter layers.
- OpenUSD/Hydra interchange and round-trip validation.
- CI, security, dependency, schema, WebGPU, and engine integration verification.
- Branch reconciliation and eventual consolidation on `main`.

### Out of scope as core dependencies

- Commercial hosted map basemaps requiring tokens.
- Cesium Ion as a required service.
- Google Photorealistic 3D Tiles as a required service.
- Hosted AI APIs as a required inference path.
- Hosted realtime/database services as a required runtime path.
- Any provider whose failure prevents the sovereign core from starting or validating.

Optional adapters may remain, but they must be isolated behind interfaces and disabled without credentials.

## 3. Repository capability inventory

Initial owned-repository searches identified directly relevant assets including:

### PTDT and engineering

- `PTDT-v33`
- `PTDT-TriState-Unified-v33`
- `Tri-County-River-Valley-Digital-Twin`
- Additional Tri-State engineering repositories identified in prior work.

### Spatial / mapping

- `maplibre-gl-js`
- `maplibre-three-plugin`
- `maplibre-cog-protocol`
- `maplibre-gl-usgs-lidar`
- `maplibre-compose`
- `maplibre-storymap`
- `maplibre-geoman`
- `react-map-components-maplibre`
- `react-three-map`
- `tileserver-gl`
- `StreetMap`

### Scene / cinematic / USD

- `OpenUSD`
- `UniversalSceneDescription`
- `openusd-mcp`
- `usd-optimize`
- `hydra-viewport-toolbox`
- `OpenDCC`
- `ComfyUI-OpenUSD`
- `blender-mcp`

### Unity

- `unity`
- `unity-mcp`
- `unity-realtime-networking-client`
- `unity-gaming-services-cli`
- `box3d-unity`
- `cesium-unity`
- `react-unity-webgl`
- `MagicOnion`

### Unreal

- `UnrealEnginePython`
- `unrealcv`
- `Unreal.js`
- `cityengine_for_unreal`
- `StreetMap`

### Local AI / inference / research

- `llama.cpp`
- `web-llm`
- `LiteRT-LM`
- `SwiftLM`
- `ipex-llm`
- `llm-interface`
- `llm-foundry`
- `llm-compressor`
- `nexa-sdk`
- `local-deep-research`
- `DeepTutor`
- `hermes-agent`
- `onyx`
- `godfirst-llm-ml-protocol`
- `ai-hub-models`
- `Edge-AI-Model-Zoo`

These repositories are candidate capability sources, not blanket merge targets. Code is incorporated only after license, dependency, security, architecture, and relevance checks.

## 4. Architecture

```text
                         PTDT Sovereign Core
                                  |
          +-----------------------+-----------------------+
          |                       |                       |
      Evidence DAG          Spatial Core              AI Core
      RFC 8785              PROJ/PostGIS              Local models
      SHA-256               GDAL/OGC                   RAG/eval
      provenance            PMTiles/COG                inference
          |                       |                       |
          +-----------------------+-----------------------+
                                  |
                              SceneState
                                  |
             +--------------------+--------------------+
             |                    |                    |
          MapLibre             WebGPU              OpenUSD
             |                    |                    |
             +--------------------+--------------------+
                                  |
                        Engine Adapter Contract
                           /                  \
                       Unity                 Unreal
                           \                  /
                            gRPC / mTLS
                                  |
                    +-------------+-------------+
                    |             |             |
                  Redis        PostGIS        MinIO

        Optional provider adapters live outside the authority core.
```

## 5. Authority and provenance rules

1. `SceneState` is derived from authoritative state; it is never itself the source of truth.
2. Rendering, VFX, AI inference, Unity, Unreal, and cinematic systems are read-only consumers of sealed authority payloads unless a formally governed command API is used.
3. Every externally sourced datum receives provenance metadata sufficient to identify source, acquisition time, transformation chain, CRS/datum, and content hash.
4. Spatial transformations must declare source and target CRS and preserve vertical-datum semantics.
5. Cryptographic sealing uses deterministic canonical serialization before hashing/signing.
6. Regulatory/engineering constants remain explicit and testable rather than inferred from visual layers.

## 6. Key/account replacement policy

| Capability | Core implementation | Commercial provider posture |
|---|---|---|
| Web map | MapLibre GL JS | Optional adapter only |
| Vector tiles | PMTiles / self-hosted tile server | Optional hosted provider |
| Raster | COG / GDAL / OGC services | Optional provider |
| Spatial DB | PostGIS | Optional hosted DB |
| Object storage | MinIO/S3-compatible abstraction | Optional cloud storage |
| Realtime | gRPC + WebSocket/Redis; MagicOnion where useful | Optional hosted realtime |
| AI inference | llama.cpp / local runtimes / WebLLM | Optional hosted model APIs |
| LLM abstraction | PTDT provider-neutral interface | Provider-specific adapters |
| Scene interchange | OpenUSD | Proprietary DCC adapters optional |
| Unity transport | PTDT SceneState + gRPC/MagicOnion adapter | Unity Gaming Services not required |
| Unreal transport | PTDT SceneState + gRPC adapter | Hosted backend not required |
| Telemetry | local/self-hosted streams and exporters | Optional cloud sinks |

## 7. v35 evidence/spatial core

The corrected core will establish:

- Explicit CRS and vertical datum tokens.
- Deterministic coordinate normalization.
- Render-origin-relative coordinates for large-world rendering.
- Bounds validation and finite-value checks.
- Deterministic canonical evidence serialization.
- Content-addressed evidence objects.
- Provenance graph links.
- Immutable authority snapshots.
- Schema/version compatibility checks.
- Separation between authoritative evidence and presentation derivatives.
- Transport contracts that cannot silently change units, CRS, datum, or authority state.

## 8. Engine adapter layer

### Common contract

The engine-neutral contract will carry:

- frame ID
- authority snapshot ID
- timestamp
- CRS/datum identifiers
- render origin
- terrain/mesh references
- hydraulic state references
- evidence references
- scene entities
- material/visual derivatives
- validation status
- content hashes

### Unity

Use the existing PTDT Unity frame contract as the baseline and selectively integrate:

- `unity-mcp` for controlled editor automation where useful.
- `unity-realtime-networking-client` for transport patterns.
- `MagicOnion` for strongly typed realtime RPC/streaming.
- `box3d-unity` only as a derived rendering/physics layer.
- `cesium-unity` only as an optional visualization adapter; no Ion dependency.

### Unreal

Provide a native C++ adapter first. Python/JS tooling is optional tooling rather than a runtime dependency. Candidate repositories include `unrealcv`, `UnrealEnginePython`, `Unreal.js`, and `cityengine_for_unreal`, subject to compatibility and license review.

## 9. AI architecture

The AI subsystem uses a provider-neutral interface with explicit model metadata and deterministic evaluation hooks.

Preferred local execution candidates include llama.cpp, LiteRT-LM, SwiftLM, WebLLM, and other owned repositories after compatibility testing. Models are treated as replaceable inference implementations, never evidence authorities.

AI output must be marked as:

- generated
- derived
- advisory
- unverified

AI cannot mutate sealed evidence without a governed human/solver-controlled workflow.

## 10. Error handling and security

- Fail closed on authority-contract violations.
- Reject non-finite coordinates/elevations.
- Reject missing CRS/datum metadata for authoritative spatial records.
- Refuse credential-required providers when no credentials exist and automatically fall back to OSS implementations.
- Never log secrets.
- Add secret scanning and dependency vulnerability checks to CI.
- Pin or constrain production dependencies and produce an auditable SBOM.
- Apply least-privilege CI permissions.
- Use mTLS or equivalent authenticated transport for trusted node communication.

## 11. Verification strategy

CI must validate, at minimum:

1. Python syntax/type/contract tests.
2. v35 evidence and spatial invariants.
3. RFC 8785 canonicalization and hash determinism.
4. FastAPI endpoint contracts.
5. gRPC protobuf compilation and compatibility.
6. WebGPU/WGSL validation and shader tests.
7. MapLibre integration tests.
8. OpenUSD round-trip tests.
9. Unity adapter compile/contract tests.
10. Unreal adapter compile/contract tests where the runner supports the toolchain; otherwise deterministic contract fixtures run in Linux CI and native builds run in engine-specific runners.
11. Dependency and license audit.
12. Secret/credential scan.
13. Docker build and runtime smoke test.
14. Full SceneState serialization/deserialization round trip.
15. Provenance and authority immutability tests.

## 12. Branch integration policy

The repository currently has `main`, an integration branch, and multiple feature/fix/dependabot branches. Integration will proceed in dependency order:

1. Preserve `main` as the protected target.
2. Compare every candidate branch against `main`.
3. Classify unique commits by subsystem.
4. Resolve conflicts semantically, not by blindly favoring one side.
5. Deduplicate equivalent implementations.
6. Run targeted tests after each subsystem merge.
7. Run full CI after the integrated tree is stable.
8. Merge/publish only verified results.
9. Do not delete source branches until their contents are demonstrably represented in `main` and branch deletion is explicitly authorized.

## 13. Success criteria

The migration is complete only when:

- PTDT core starts and validates without commercial credentials.
- OSS/self-hosted implementations cover all core capabilities requiring prior keys/accounts.
- Optional commercial adapters fail gracefully when credentials are absent.
- Authority/evidence invariants remain intact.
- Unity and Unreal consume the same canonical SceneState contract.
- WebGPU, OpenUSD, transport, and engine verification pass at the supported runner levels.
- Security, license, and dependency scans pass or have explicit documented exceptions.
- All intended branch changes are represented in `main`.
- The final `main` commit is verified by the complete CI suite.

## 14. Non-goals

This design does not claim that every public data source can be replaced by an offline copy. Authoritative government/scientific sources remain legitimate external inputs. The objective is to eliminate *platform/account lock-in*, not to fabricate or duplicate authoritative source data.
