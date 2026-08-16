# PTDT v35+ Photorealistic Spatial Scene Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a provenance-aware multi-representation spatial scene/tile core to PTDT-v33, correct the identified v35 routing/point-cloud/UI defects, and integrate open-source-ready adapters for MVT/I3S/OpenUSD/WebGPU/Unity/Unreal without making derived visualization authoritative.

**Architecture:** PostGIS/evidence remains authoritative. A canonical SceneState and PTDT Spatial Tile contract describe CRS, vertical datum, epoch, provenance, confidence, terrain, vector, point-cloud, mesh, Gaussian, simulation, and evidence layers. Derived products feed OpenUSD, I3S/MVT, WebGPU, Unity, Unreal, and offline rendering through isolated adapters.

**Tech Stack:** Python 3.12+, Pydantic, psycopg2/PostGIS, requests/httpx, NumPy/Open3D optional, TypeScript, React, MapLibre GL, WebGPU validation, OpenUSD adapter contracts, I3S/SLPK metadata, GitHub Actions.

## Global Constraints

- PostGIS/evidence remains authoritative.
- OpenUSD is an interchange/render/simulation representation, not the source of truth.
- I3S/SLPK and MVT are delivery representations derived from authoritative state.
- Gaussian splats, meshes, procedural assets, and cinematic media are derived products with provenance.
- Observed, derived, simulated, and procedurally generated geometry are explicitly distinguished.
- No fabricated operational metrics are allowed in UI or APIs.
- Flood routing uses dynamic hazard fields rather than a universal elevation cutoff.
- Vertical reference frames/datum and epochs are explicit in spatial payloads.
- External API keys/accounts are not required for the core system.
- Licensed/proprietary tools may remain optional adapters but cannot be mandatory core dependencies.

## File Map

- Create: `ptdt_v35_core/spatial_tile.py` — canonical spatial tile contract and validation.
- Create: `ptdt_v35_core/provenance.py` — deterministic evidence/source/transform manifest helpers.
- Create: `ptdt_v35_core/hazard.py` — dynamic road-hazard model and route-cost calculation.
- Create: `ptdt_v35_core/reality_capture.py` — typed contracts for observations, poses, point clouds, and Gaussian derivatives.
- Create: `ptdt_v35_core/scene_adapters.py` — adapter interfaces for MVT/I3S/USD/WebGPU/Unity/Unreal.
- Create: `tests/test_spatial_tile.py` — tile/schema/provenance tests.
- Create: `tests/test_hazard.py` — routing safety tests.
- Create: `tests/test_reality_capture.py` — observation/reality-capture contract tests.
- Create: `tests/test_scene_adapters.py` — adapter contract tests.
- Create: `engine/v35_spatial_core.py` — service facade integrating the new contracts with existing engine code.
- Modify: `engine/...` routing implementation identified by repository search — replace invalid timing, validate OSRM responses, and use dynamic hazard inputs.
- Modify: `frontend/...` existing PTDT v35 map/HUD implementation — remove hard-coded operational metrics and make route results backend-driven.
- Create: `schemas/ptdt_spatial_tile.schema.json` — machine-readable interchange schema.
- Create: `schemas/scene_state.schema.json` if absent — canonical scene-state subset used by tile generation.
- Create: `adapters/mvt/README.md`, `adapters/i3s/README.md`, `adapters/usd/README.md`, `adapters/webgpu/README.md`, `adapters/unity/README.md`, `adapters/unreal/README.md` — adapter contracts and dependency policy.
- Create: `.github/workflows/ptdt-v35-spatial-verification.yml` — deterministic schema/lint/test and adapter contract verification.
- Modify: `README.md` — document the new spatial scene architecture and dependency policy.

---

### Task 1: Establish canonical provenance and spatial tile contracts

**Files:**
- Create: `ptdt_v35_core/provenance.py`
- Create: `ptdt_v35_core/spatial_tile.py`
- Create: `schemas/ptdt_spatial_tile.schema.json`
- Create: `tests/test_spatial_tile.py`

**Interfaces:**
- `SourceRecord(source_id: str, kind: str, uri: str | None, sha256: str | None, observed_at: str | None)`
- `TransformRecord(transform_id: str, operation: str, input_hashes: tuple[str, ...], output_hash: str, parameters: dict[str, object])`
- `ProvenanceManifest(sources: tuple[SourceRecord, ...], transforms: tuple[TransformRecord, ...], content_sha256: str)`
- `SpatialTile(tile_id: str, version: int, crs: str, vertical_datum: str, epoch: str | None, bounds: tuple[float, float, float, float], provenance: ProvenanceManifest, confidence: float, layers: dict[str, object])`
- `canonical_sha256(value: object) -> str`
- `SpatialTile.canonical_bytes() -> bytes`

- [ ] Step 1: Write failing tests for deterministic hashes, confidence bounds, CRS/datum requirements, and stable canonical serialization.
- [ ] Step 2: Run `pytest tests/test_spatial_tile.py -v` and verify the new tests fail.
- [ ] Step 3: Implement typed immutable models and deterministic canonical serialization.
- [ ] Step 4: Generate the JSON Schema from the same contract or maintain an equivalent checked-in schema with a schema-contract test.
- [ ] Step 5: Run the focused tests and verify PASS.
- [ ] Step 6: Commit as `feat: add canonical PTDT spatial tile and provenance contracts`.

### Task 2: Add dynamic hazard semantics

**Files:**
- Create: `ptdt_v35_core/hazard.py`
- Create: `tests/test_hazard.py`
- Modify: identified OSRM routing module under `engine/`

**Interfaces:**
- `RoadHazard(elevation_m: float, water_surface_m: float | None, depth_m: float | None, velocity_mps: float | None, closed: bool, uncertainty_m: float)`
- `RouteCostInput(travel_time_s: float, hazard: RoadHazard, road_class_weight: float)`
- `route_cost(input: RouteCostInput) -> float`
- `validate_hazard(hazard: RoadHazard) -> None`

- [ ] Step 1: Add tests proving BFE alone does not close a road and explicit closure/depth/velocity/uncertainty increase route cost.
- [ ] Step 2: Run focused hazard tests and confirm failure.
- [ ] Step 3: Implement deterministic hazard validation and cost calculation.
- [ ] Step 4: Replace the hard-coded BFE route assumption in the existing routing service with hazard inputs while preserving OSRM as the path solver.
- [ ] Step 5: Replace `time.perf_context()` with `time.perf_counter()` and validate HTTP status/JSON/route presence.
- [ ] Step 6: Run focused routing tests and commit `fix: make evacuation routing hazard-aware`.

### Task 3: Reality-capture contracts

**Files:**
- Create: `ptdt_v35_core/reality_capture.py`
- Create: `tests/test_reality_capture.py`

**Interfaces:**
- `CameraObservation(observation_id: str, timestamp: str, sensor: str, pose: tuple[float, ...], source_hash: str, confidence: float)`
- `PointCloudDescriptor(point_count: int, coordinate_crs: str, vertical_datum: str, source_hash: str)`
- `GaussianSceneDescriptor(kind: str, epoch_start: str, epoch_end: str | None, source_hash: str, confidence: float)`
- `validate_observation(observation) -> None`
- `derive_evidence_hash(source_hashes: tuple[str, ...]) -> str`

- [ ] Step 1: Write tests for timestamps, pose cardinality, confidence bounds, CRS/datum, and static vs temporal Gaussian descriptors.
- [ ] Step 2: Run focused tests and verify failure.
- [ ] Step 3: Implement contracts and deterministic evidence hashing.
- [ ] Step 4: Run tests and commit `feat: add reality capture provenance contracts`.

### Task 4: Replace simplistic point-cloud BFE filtering

**Files:**
- Modify: existing Open3D point-cloud module found by repository search.
- Create/modify: `tests/test_reality_capture.py`

**Interfaces:**
- `PointObservation(x: float, y: float, z: float, class_code: int | None, water_surface_m: float | None, valid: bool)`
- `classify_point(point: PointObservation) -> str`
- `filter_invalid_points(points: Iterable[PointObservation]) -> list[PointObservation]`

- [ ] Step 1: Add tests proving legitimate below-BFE channel/ground/water points are retained while invalid records are rejected by explicit validity rules.
- [ ] Step 2: Run focused tests and verify failure.
- [ ] Step 3: Replace generic `z >= BFE` rejection with classification/validity semantics; retain BFE as an analytical attribute.
- [ ] Step 4: Run tests and commit `fix: preserve valid floodplain and channel observations`.

### Task 5: Scene adapter interfaces

**Files:**
- Create: `ptdt_v35_core/scene_adapters.py`
- Create: `tests/test_scene_adapters.py`
- Create: `adapters/mvt/README.md`
- Create: `adapters/i3s/README.md`
- Create: `adapters/usd/README.md`
- Create: `adapters/webgpu/README.md`
- Create: `adapters/unity/README.md`
- Create: `adapters/unreal/README.md`

**Interfaces:**
- `SceneAdapter.name: str`
- `SceneAdapter.validate(tile: SpatialTile) -> list[str]`
- `SceneAdapter.manifest(tile: SpatialTile) -> dict[str, object]`
- `MVTAdapter`, `I3SAdapter`, `USDAdapter`, `WebGPUAdapter`, `UnityAdapter`, `UnrealAdapter`

- [ ] Step 1: Write contract tests requiring all adapters to reject missing provenance/datum metadata and accept a valid tile.
- [ ] Step 2: Run tests and verify failure.
- [ ] Step 3: Implement adapters as validation/manifest boundaries; do not make heavy external runtimes mandatory.
- [ ] Step 4: Add explicit I3S/MVT/USD/WebGPU/engine integration requirements to adapter docs.
- [ ] Step 5: Run tests and commit `feat: add PTDT multi-representation scene adapters`.

### Task 6: Spatial core facade

**Files:**
- Create: `engine/v35_spatial_core.py`
- Modify: existing SceneState/evidence integration module discovered during implementation.
- Create: integration tests under `tests/`

**Interfaces:**
- `build_spatial_tile(scene_state: object, sources: tuple[SourceRecord, ...], transforms: tuple[TransformRecord, ...]) -> SpatialTile`
- `validate_spatial_tile(tile: SpatialTile) -> tuple[str, ...]`
- `export_manifests(tile: SpatialTile) -> dict[str, dict[str, object]]`

- [ ] Step 1: Write an integration test converting a canonical SceneState fixture into a SpatialTile and six adapter manifests.
- [ ] Step 2: Run the integration test and verify failure.
- [ ] Step 3: Implement the facade using existing SceneState canonicalization rather than creating a second source of truth.
- [ ] Step 4: Run the integration test and commit `feat: wire v35 spatial scene facade`.

### Task 7: Correct the frontend operational truth model

**Files:**
- Modify: existing v35 React/MapLibre frontend source identified by search.
- Create/modify: frontend tests as supported by existing project tooling.

- [ ] Step 1: Add tests or static assertions for absence of fabricated route distance/latency/freeboard values.
- [ ] Step 2: Run the frontend test/lint command and verify failure where appropriate.
- [ ] Step 3: Replace simulated route button behavior with a typed backend request and explicit loading/error/empty states.
- [ ] Step 4: Replace hard-coded spatial-query latency and compliance text with backend-provided status fields.
- [ ] Step 5: Move map style configuration behind a local/self-hosted environment setting with an offline-safe default.
- [ ] Step 6: Run frontend lint/build/tests and commit `fix: make PTDT frontend metrics backend-derived`.

### Task 8: CI verification and dependency policy

**Files:**
- Create: `.github/workflows/ptdt-v35-spatial-verification.yml`
- Modify: existing CI workflows only where necessary to reuse canonical commands.

- [ ] Step 1: Add CI checks for Python lint/type/test, JSON Schema validation, TypeScript lint/build/test, and adapter contract tests.
- [ ] Step 2: Add a dependency policy check that fails if mandatory runtime configuration requires secret/API-key placeholders.
- [ ] Step 3: Add deterministic hash/schema regression tests.
- [ ] Step 4: Add WebGPU shader/build validation using the repository's existing toolchain; do not introduce a paid service.
- [ ] Step 5: Add Unity/Unreal adapter contract validation without requiring engine installation on the base CI runner.
- [ ] Step 6: Run the workflow locally where possible and commit `ci: verify v35 spatial scene contracts`.

### Task 9: Documentation and integration inventory

**Files:**
- Modify: `README.md`
- Create: `docs/architecture/PTDT_V35_PHOTOREALISTIC_SCENE.md`
- Create: `docs/integration/OPEN_SOURCE_3D_STACK.md`

- [ ] Step 1: Document authoritative-vs-derived data boundaries.
- [ ] Step 2: Document Photo-SLAM/3DGS/4DGS/Open3D/Infinigen/OpenUSD/I3S/MVT/WebGPU/Unity/Unreal roles.
- [ ] Step 3: Document optional Houdini/ProRender integrations and dependency/licensing boundaries.
- [ ] Step 4: Document routing safety semantics and vertical datum requirements.
- [ ] Step 5: Run documentation link/schema checks and commit `docs: document photorealistic spatial architecture`.

### Task 10: Full verification and branch integration review

**Files:**
- No new source files unless verification exposes a defect.

- [ ] Step 1: Compare all active feature branches against `main` and identify unique changes that are still relevant to this architecture.
- [ ] Step 2: Run repository-wide Python/TypeScript tests and lint.
- [ ] Step 3: Run WebGPU validation and adapter contract checks.
- [ ] Step 4: Run dependency/security checks already configured by the repository.
- [ ] Step 5: Verify the new spatial scene contracts against existing SceneState tests and evidence canonicalization.
- [ ] Step 6: Resolve only conflicts that preserve the canonical architecture; do not merge obsolete duplicate implementations.
- [ ] Step 7: Commit final verification fixes and update the verification report.

## Final acceptance criteria

- Canonical SceneState remains the sole authoritative scene-state model.
- Every derived spatial tile has CRS, vertical datum, provenance, confidence, and deterministic hash metadata.
- Routing does not use BFE as a universal closure rule.
- Point clouds are not discarded solely because Z is below BFE.
- Frontend operational metrics are backend-derived.
- MVT/I3S/USD/WebGPU/Unity/Unreal adapters are isolated and keyless by default.
- CI verifies schemas, deterministic hashes, Python/TypeScript tests, adapter contracts, and available graphics/engine contracts.
- Existing passing functionality is preserved.
