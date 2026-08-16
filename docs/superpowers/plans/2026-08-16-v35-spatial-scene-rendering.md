# PTDT v35 Spatial Scene, Evidence & Photorealistic Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved PTDT v35 spatial authority, provenance, WebGPU, photorealistic asset, scene interchange, engine adapter, and deterministic verification architecture without allowing derived visualization to replace authoritative engineering state.

**Architecture:** Add provider-neutral canonical contracts under `ptdt_v35_core`, then make WebGPU, MVT/I3S/USD, point-cloud, and engine adapters consume those contracts. Preserve authoritative observations and analytical BFE/WSE layers, while making meshes, 3DGS/4DGS, textures, and cinematic assets explicitly derived and provenance-linked. Use one versioned SceneState/SceneTileManifest contract for Unity and Unreal, with local render origins for large-world precision.

**Tech Stack:** Python 3.11+ typed core; TypeScript/WebGPU frontend; PostgreSQL/PostGIS; COG/PMTiles/MVT; OpenUSD; I3S/SLPK; Open3D; 3DGS/4DGS adapters; Unity C#; Unreal C++; pytest; TypeScript typecheck/build; GitHub Actions; dependency/license/security scanners.

## Global Constraints

- Authoritative spatial records must carry horizontal CRS authority, vertical datum, epoch/realization, units, axis order, and transformation metadata.
- BFE/regulatory surfaces are analytical layers and must never be used as destructive LiDAR/terrain rejection filters.
- Cryptographic hashes prove artifact integrity only; they do not prove scientific truth.
- Derived artifacts must retain source IDs, transformation parameters, and validation lineage.
- Unity and Unreal consume the same canonical SceneState contract.
- Optional commercial providers must never be required to initialize, validate, or render the sovereign core.
- WebGPU payloads use explicit little-endian binary layout, dimensions, stride, alignment, nodata, scale/offset, CRS/datum, timestep, and content hash metadata.
- Synthetic/generated content must be marked generated/derived and must not be represented as surveyed fact.
- Fail closed on invalid authority metadata, coordinates, schema versions, evidence hashes, units, or malformed GPU contracts; fail soft only for optional visual providers.
- Do not copy whole upstream repositories into PTDT when a thin adapter or isolated capability boundary is sufficient.

---

## Repository Map

The current `main` branch already contains dedicated `core`, `ptdt_v35_core`, `adapters/engine`, `adapters/unity`, `adapters/unreal`, `adapters/webgpu`, `adapters/usd`, `adapters/i3s`, and `adapters/mvt` boundaries. The implementation should extend those boundaries instead of introducing a parallel architecture.

Planned canonical files:

- Create: `ptdt_v35_core/contracts/spatial_reference.py` — SpatialReferenceContract and validation.
- Create: `ptdt_v35_core/contracts/temporal_state.py` — TemporalStateContract and validation.
- Create: `ptdt_v35_core/contracts/evidence.py` — EvidenceArtifact, canonical serialization, hashing, and provenance links.
- Create: `ptdt_v35_core/contracts/scene.py` — SceneRepresentation, SceneTileManifest, and canonical SceneState.
- Create: `ptdt_v35_core/contracts/webgpu.py` — binary exchange schema and alignment rules.
- Create: `ptdt_v35_core/contracts/__init__.py` — public contract exports.
- Create: `ptdt_v35_core/processing/point_cloud.py` — non-destructive classification/filtering and derived reconstruction metadata.
- Create: `ptdt_v35_core/processing/__init__.py` — processing exports.
- Create: `ptdt_v35_core/assets/visual.py` — photogrammetry/3DGS/4DGS asset metadata and lineage.
- Create: `ptdt_v35_core/assets/__init__.py` — asset exports.
- Create: `ptdt_v35_core/transforms/render_origin.py` — deterministic geographic-to-local render-origin transforms.
- Create: `ptdt_v35_core/transforms/__init__.py` — transform exports.
- Modify: `adapters/webgpu/*` — consume the canonical WebGPU contract rather than ad-hoc float packing.
- Modify: `adapters/usd/*` — export canonical SceneTileManifest/SceneState metadata into OpenUSD composition metadata.
- Modify: `adapters/i3s/*` — map manifest assets to I3S/SLPK-compatible layer metadata.
- Modify: `adapters/mvt/*` — attach tile identity, CRS, epoch, provenance, and content-address metadata.
- Modify: `adapters/engine/*` — expose one engine-neutral SceneState frame contract.
- Modify: `adapters/unity/*` — deserialize and validate SceneState; keep transport behind an abstraction.
- Modify: `adapters/unreal/*` — add native C++ SceneState bridge; Python/JS tooling remains optional.
- Create: `tests/contracts/test_spatial_reference.py`.
- Create: `tests/contracts/test_temporal_state.py`.
- Create: `tests/contracts/test_evidence.py`.
- Create: `tests/contracts/test_scene.py`.
- Create: `tests/contracts/test_webgpu.py`.
- Create: `tests/processing/test_point_cloud.py`.
- Create: `tests/assets/test_visual.py`.
- Create: `tests/transforms/test_render_origin.py`.
- Create: `tests/integration/test_scene_state_compatibility.py`.
- Create: `tests/integration/test_openusd_roundtrip.py`.
- Create: `tests/integration/test_tile_formats.py`.
- Modify/create: `.github/workflows/*` for deterministic contract, adapter, security, license, and integration gates.

---

### Task 1: Canonical Spatial, Temporal, and Evidence Contracts

**Files:**
- Create: `ptdt_v35_core/contracts/spatial_reference.py`
- Create: `ptdt_v35_core/contracts/temporal_state.py`
- Create: `ptdt_v35_core/contracts/evidence.py`
- Create: `ptdt_v35_core/contracts/__init__.py`
- Test: `tests/contracts/test_spatial_reference.py`
- Test: `tests/contracts/test_temporal_state.py`
- Test: `tests/contracts/test_evidence.py`

**Interfaces:**
- Produces `SpatialReferenceContract.validate()`, `TemporalStateContract.validate()`, `EvidenceArtifact.canonical_bytes()`, `EvidenceArtifact.content_hash()`, and `EvidenceArtifact.validate_chain()`.
- Later tasks consume these contracts without redefining CRS, time, or provenance fields.

- [ ] **Step 1: Write failing validation tests** for missing CRS authority, missing vertical datum, non-finite coordinates, unsupported units, invalid temporal intervals, and malformed provenance chains.
- [ ] **Step 2: Run `pytest tests/contracts/test_spatial_reference.py tests/contracts/test_temporal_state.py tests/contracts/test_evidence.py -v` and confirm the new contract symbols fail before implementation.
- [ ] **Step 3: Implement frozen, explicitly typed dataclasses/enums with deterministic validation and no implicit unit conversion.
- [ ] **Step 4: Implement evidence canonicalization that excludes the mutable hash field and hashes UTF-8 canonical JSON with sorted keys and deterministic separators.
- [ ] **Step 5: Add tests proving equivalent canonical objects produce identical hashes while changed source/transformation data changes the hash.
- [ ] **Step 6: Run the focused tests and commit `feat: add v35 spatial temporal evidence contracts`.

---

### Task 2: SceneTileManifest and Canonical SceneState

**Files:**
- Create: `ptdt_v35_core/contracts/scene.py`
- Test: `tests/contracts/test_scene.py`
- Test: `tests/integration/test_scene_state_compatibility.py`

**Interfaces:**
- Produces `SceneRepresentation`, `SceneTileManifest`, and `SceneState` with deterministic serialization.
- `SceneState` must contain frame ID, authority snapshot ID, manifest ID, timestamp, spatial reference, render origin, asset handles, hydraulic-state references, evidence references, validation status, and content hashes.

- [ ] **Step 1: Write tests for deterministic manifest serialization, representation authority classification, schema-version rejection, and SceneState round trips.
- [ ] **Step 2: Run the focused tests and confirm failure.
- [ ] **Step 3: Implement versioned contracts with explicit authoritative/engineering/visual/cinematic representation classes.
- [ ] **Step 4: Implement content-addressed manifest hashing from immutable canonical fields and ensure mutable validation timestamps are excluded from identity.
- [ ] **Step 5: Test that an authoritative artifact cannot be silently replaced by a derived artifact with the same logical asset role.
- [ ] **Step 6: Run tests and commit `feat: add canonical scene tile and scene state contracts`.

---

### Task 3: Correct OpenMI/WebGPU Binary Contract

**Files:**
- Create: `ptdt_v35_core/contracts/webgpu.py`
- Modify: `adapters/webgpu/*`
- Test: `tests/contracts/test_webgpu.py`

**Interfaces:**
- Produces `WebGPUBufferContract` and deterministic `pack_exchange_item()` / `unpack_exchange_item()` operations.
- Consumes `OpenMIGridExchangeItem`-style data but replaces implicit native-endian `struct.pack` behavior with declared little-endian layout, stride, alignment, nodata, scale/offset, dimensions, CRS, datum, timestep, and content hash.

- [ ] **Step 1: Write tests for little-endian float32 layout, exact byte lengths, row-major indexing, 256-byte WebGPU uniform/storage alignment where required, nodata handling, and hash stability.
- [ ] **Step 2: Run the focused tests and confirm failure.
- [ ] **Step 3: Implement explicit `array('f')`/typed-array-compatible packing with `struct` format prefixes and schema-declared alignment rather than relying on host architecture.
- [ ] **Step 4: Validate finite numeric values and reject dimensions/stride combinations whose declared byte length is inconsistent.
- [ ] **Step 5: Update the adapter to return metadata plus binary payload without embedding opaque Python-specific assumptions in the contract.
- [ ] **Step 6: Run tests and commit `feat: formalize openmi webgpu binary contract`.

---

### Task 4: Non-Destructive Point-Cloud and Terrain Processing

**Files:**
- Create: `ptdt_v35_core/processing/point_cloud.py`
- Test: `tests/processing/test_point_cloud.py`

**Interfaces:**
- Produces source-preserving point-cloud classifications and `DerivedSurfaceArtifact` metadata.
- BFE is an analytical comparison surface; no source point is deleted solely because its Z value is below BFE.

- [ ] **Step 1: Write tests demonstrating that points below BFE remain in the preserved source set and are classified independently.
- [ ] **Step 2: Run the focused tests and confirm failure.
- [ ] **Step 3: Implement classification/filter configuration that separates quality rejection from hydrologic analysis.
- [ ] **Step 4: Record reconstruction algorithm, parameters, source hash, output hash, and uncertainty metadata for derived meshes.
- [ ] **Step 5: Add deterministic tests for repeated processing and lineage integrity.
- [ ] **Step 6: Run tests and commit `fix: preserve point cloud authority below bfe`.

---

### Task 5: Photorealistic Asset and Provenance Layer

**Files:**
- Create: `ptdt_v35_core/assets/visual.py`
- Test: `tests/assets/test_visual.py`
- Modify: `adapters/usd/*`

**Interfaces:**
- Produces `VisualAssetMetadata` for photogrammetry, Photo-SLAM-derived reconstruction, 3DGS, 4DGS, CAD-derived geometry, generated content, and cinematic outputs.
- Every generated/derived asset records source artifacts, capture/acquisition context, algorithm, parameters, and authority class.

- [ ] **Step 1: Write tests for measured vs simulated vs generated classification and provenance completeness.
- [ ] **Step 2: Run focused tests and confirm failure.
- [ ] **Step 3: Implement metadata schema and adapter hooks without importing whole upstream visual-generation repositories.
- [ ] **Step 4: Add OpenUSD metadata mapping for asset authority and provenance IDs.
- [ ] **Step 5: Test that generated assets cannot satisfy an authoritative-input requirement.
- [ ] **Step 6: Run tests and commit `feat: add photorealistic asset provenance metadata`.

---

### Task 6: Render-Origin and Large-World Precision

**Files:**
- Create: `ptdt_v35_core/transforms/render_origin.py`
- Test: `tests/transforms/test_render_origin.py`

**Interfaces:**
- Produces deterministic local render coordinates while preserving authoritative geographic coordinates.
- `to_render_coordinates(world_coordinate, render_origin)` and inverse conversion must be explicitly typed and numerically bounded.

- [ ] **Step 1: Write tests for round-trip geographic/local transformations, origin shifts, and large-coordinate precision bounds.
- [ ] **Step 2: Run focused tests and confirm failure.
- [ ] **Step 3: Implement origin-relative transforms using declared CRS units and explicit floating-point precision policy.
- [ ] **Step 4: Reject incompatible CRS/unit inputs rather than guessing.
- [ ] **Step 5: Run tests and commit `feat: add deterministic large-world render origins`.

---

### Task 7: MVT/I3S/SLPK/OpenUSD Tile Delivery

**Files:**
- Modify: `adapters/mvt/*`
- Modify: `adapters/i3s/*`
- Modify: `adapters/usd/*`
- Test: `tests/integration/test_tile_formats.py`
- Test: `tests/integration/test_openusd_roundtrip.py`

**Interfaces:**
- All format adapters consume the same `SceneTileManifest` and return validated derived representations.
- Tile metadata must preserve tile identity, bounds, CRS/datum, epoch, source hashes, representation class, and content-address identifiers.

- [ ] **Step 1: Write fixture tests covering MVT metadata, I3S/SLPK layer mapping, and OpenUSD manifest round-trip identity.
- [ ] **Step 2: Run focused tests and confirm failures for missing metadata/round-trip behavior.
- [ ] **Step 3: Implement thin format adapters that do not duplicate authority contracts.
- [ ] **Step 4: Add deterministic OpenUSD composition metadata for SceneTileManifest and EvidenceArtifact IDs.
- [ ] **Step 5: Verify MVT/COG/PMTiles references can be represented without losing CRS/epoch/provenance information.
- [ ] **Step 6: Run tests and commit `feat: integrate spatial tile representation adapters`.

---

### Task 8: Unified Unity and Unreal SceneState Adapters

**Files:**
- Modify: `adapters/engine/*`
- Modify: `adapters/unity/*`
- Modify: `adapters/unreal/*`
- Test: `tests/integration/test_scene_state_compatibility.py`

**Interfaces:**
- Produces one engine-neutral SceneState serialization consumed by both adapters.
- Unity transport remains behind an abstraction; MagicOnion/realtime networking is optional.
- Unreal uses native C++ runtime adaptation; Python/JS/UnrealCV tooling remains optional development/test functionality.

- [ ] **Step 1: Add compatibility fixtures with one canonical SceneState payload and expected Unity/Unreal field mappings.
- [ ] **Step 2: Run compatibility tests and confirm missing adapter mappings fail.
- [ ] **Step 3: Implement Unity deserialization/validation without making transport or rendering libraries authoritative.
- [ ] **Step 4: Implement Unreal C++ SceneState bridge with schema-version and evidence validation before scene mutation.
- [ ] **Step 5: Test identical authority snapshot, manifest ID, timestamps, render origin, and evidence hashes across both adapters.
- [ ] **Step 6: Run tests and commit `feat: unify unity unreal scenestate adapters`.

---

### Task 9: WebGPU/MapLibre Streaming and LOD Policy

**Files:**
- Modify: `adapters/webgpu/*`
- Modify: `adapters/mvt/*`
- Test: `tests/integration/test_tile_formats.py`
- Create/modify: frontend WebGPU streaming integration identified by the existing `adapters/webgpu` and frontend package structure.

**Interfaces:**
- Visible-tile streaming chooses the lowest-cost validated representation satisfying requested quality/LOD.
- Streaming never substitutes generated visual content for an authoritative engineering layer.

- [ ] **Step 1: Write tests for deterministic LOD selection from camera visibility, requested quality, representation availability, and validation status.
- [ ] **Step 2: Run tests and confirm failure.
- [ ] **Step 3: Implement manifest-driven tile selection and WebGPU upload using the Task 3 binary contract.
- [ ] **Step 4: Add cancellation/backpressure so rapid camera movement cannot enqueue unbounded stale uploads.
- [ ] **Step 5: Verify MapLibre remains a presentation consumer and does not own authoritative state.
- [ ] **Step 6: Run tests and commit `feat: add manifest driven webgpu tile streaming`.

---

### Task 10: End-to-End Verification, Security, Licensing, and Branch Reconciliation

**Files:**
- Modify/create: `.github/workflows/*`
- Test: all contract/processing/integration suites
- Review: all remaining branches listed by GitHub before reconciliation

**Interfaces:**
- CI must validate Python, TypeScript, WebGPU contract fixtures, OpenUSD round trips, Unity/Unreal compatibility fixtures, dependency/security scans, and license policy.
- Branch reconciliation must preserve verified work and resolve conflicts semantically, never by blindly preferring one branch.

- [ ] **Step 1: Add CI jobs for Python lint/typecheck/tests, frontend typecheck/build/tests, contract fixtures, and integration tests.
- [ ] **Step 2: Add dependency vulnerability and license-policy scans; fail on known critical vulnerabilities or disallowed licenses according to repository policy.
- [ ] **Step 3: Add deterministic artifact/provenance checks so generated assets without authority labels fail CI.
- [ ] **Step 4: Execute the full test suite and inspect every failing job/log before changing code.
- [ ] **Step 5: Compare each remaining feature branch against `main`; classify unique changes as keep/merge/reject and identify conflicts in canonical contracts first.
- [ ] **Step 6: Reconcile branches through reviewed commits/PRs, retaining the canonical v35 contracts as the conflict-resolution authority.
- [ ] **Step 7: Re-run the complete CI suite after reconciliation and verify the final `main` commit has passing required checks.
- [ ] **Step 8: Publish only verified changes to `main`; document rejected/duplicate branches and reasons rather than silently deleting functionality.
- [ ] **Step 9: Commit `ci: enforce v35 spatial scene integration gates` and record the final verification matrix.

---

## Verification Matrix

| Area | Required proof |
|---|---|
| Spatial authority | CRS/datum/epoch/unit validation tests pass |
| Temporal authority | UTC/time-step/forecast validation tests pass |
| Evidence | Canonical hash and lineage tests pass |
| Scene manifest | Deterministic serialization/hash round trip passes |
| WebGPU | Endian/stride/alignment/byte-length fixtures pass |
| Point cloud | Below-BFE observations preserved; BFE remains analytical |
| Photorealism | 3DGS/4DGS/generated assets carry provenance and authority class |
| Tile formats | MVT/I3S/SLPK/OpenUSD metadata round trips pass |
| Large world | Render-origin round-trip precision tests pass |
| Unity | SceneState compatibility fixture passes |
| Unreal | SceneState compatibility fixture passes |
| Security | Dependency/vulnerability scan passes configured policy |
| Licensing | Imported capability licenses pass repository policy |
| CI | Required workflows green on final `main` |
| Branches | Every remaining branch classified and reconciled or explicitly rejected |

## Completion Gate

Implementation is complete only after the full verification matrix passes on the final `main` commit. A green unit-test subset is not sufficient to claim completion; the final report must distinguish passed, skipped, blocked, and environment-dependent checks.
