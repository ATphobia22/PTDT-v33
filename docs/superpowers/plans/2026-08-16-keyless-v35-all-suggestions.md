# Keyless v35 PTDT Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert PTDT-v33 into a keyless-by-default, provider-neutral engineering runtime while hardening the v35 evidence/spatial core and keeping Unity, Unreal, WebGPU, OpenUSD, and provenance contracts on one canonical authority boundary.

**Architecture:** The authoritative core remains Python and immutable: evidence is RFC 8785 canonicalized and SHA-256 content addressed; spatial state carries explicit CRS/datum metadata; SceneState is a derived transport contract. Provider-specific maps, AI, storage, and realtime implementations sit behind capability interfaces and cannot mutate authority state. Engine adapters consume only validated SceneState frames.

**Tech Stack:** Python 3.11+, FastAPI, Pydantic, rfc8785, pyproj, protobuf/gRPC, MapLibre GL JS, WebGPU/WGSL, OpenUSD, Unity C#, Unreal C++, GitHub Actions, Trivy/OSV-Scanner/Syft where supported.

## Global Constraints

- NAVD88 is the authoritative vertical datum.
- EPSG:2966 is the authoritative horizontal CRS.
- Rendering, VFX, AI, Unity, Unreal, and cinematic layers are read-only consumers of sealed authority payloads.
- Runtime-critical capabilities must not require commercial API keys or hosted SaaS accounts.
- Optional commercial adapters must fail closed to local/OSS implementations when credentials are absent.
- Production dependency posture is MIT / Apache-2.0 / BSD unless an explicit documented exception already exists.
- No secrets may be committed or logged.
- Engine-native builds are verified on compatible runners; Linux CI validates deterministic adapter fixtures when native SDKs are unavailable.

---

### Task 1: Establish a credential-free provider capability registry

**Files:**
- Create: `core/providers.py`
- Create: `tests/core/test_providers.py`
- Modify: `backend/main.py` only if an existing provider health endpoint needs wiring.
- Modify: `README.md` to document provider-neutral defaults.

**Interfaces:**
- `ProviderMode = Literal["local", "optional"]`
- `ProviderCapability(name: str, implementation: str, requires_credentials: bool, enabled: bool)`
- `ProviderRegistry.from_environment()` returns deterministic capabilities for maps, raster, object storage, realtime, inference, and telemetry.
- `ProviderRegistry.require_available(name)` raises a typed configuration error instead of attempting a credentialed provider.

- [ ] **Step 1: Write failing tests** for absent credentials selecting local providers and for credentialed optional providers remaining disabled unless explicitly enabled.
- [ ] **Step 2: Run `pytest tests/core/test_providers.py -v` and confirm the new tests fail for the missing registry implementation.**
- [ ] **Step 3: Implement the minimal registry and typed configuration error.**
- [ ] **Step 4: Re-run the focused tests and confirm PASS.**
- [ ] **Step 5: Update README provider defaults and commit the task.**

### Task 2: Harden v35 evidence and spatial invariants

**Files:**
- Modify: `ptdt_v35_core/evidence.py`
- Modify: `ptdt_v35_core/spatial.py`
- Modify: `tests/ptdt_v35_core/test_core.py`
- Modify: `tests/test_v35_core.py`

**Interfaces:**
- Evidence nodes reject non-finite numeric payload values recursively.
- Evidence canonicalization remains RFC 8785 deterministic.
- `EvidenceLedger` exposes immutable snapshot verification without exposing mutable internal state.
- Spatial transforms reject non-finite coordinates and explicitly identify source/target CRS and vertical datum for authoritative records.

- [ ] **Step 1: Add failing tests for non-finite evidence values, mutable-ledger leakage, invalid coordinates, and missing authoritative datum metadata.**
- [ ] **Step 2: Run the focused v35 tests and confirm the new assertions fail.**
- [ ] **Step 3: Implement recursive finite-value validation, immutable snapshots, and explicit spatial authority metadata.**
- [ ] **Step 4: Run all v35 tests and confirm PASS.**
- [ ] **Step 5: Commit the hardened v35 core.**

### Task 3: Make SceneState the canonical engine-neutral transport contract

**Files:**
- Inspect/modify: `protobuf/` existing SceneState schema files.
- Modify: `adapters/engine/core/` existing contract implementation.
- Create/modify: `tests/engine/` contract fixtures as required by the existing repository layout.

**Interfaces:**
- SceneState carries frame ID, authority snapshot ID, UTC timestamp, CRS/datum IDs, render origin, terrain references, hydraulic references, evidence references, entities, validation status, and content hashes.
- Deserialization validates version, units, CRS, datum, finite coordinates, and authority snapshot identity before exposing the frame.
- Engine adapters cannot receive a frame that fails authority validation.

- [ ] **Step 1: Add failing protobuf/contract tests for missing authority metadata and schema-version incompatibility.**
- [ ] **Step 2: Run the contract tests and confirm failure.**
- [ ] **Step 3: Implement the validation boundary without changing existing wire-compatible fields unnecessarily.**
- [ ] **Step 4: Run protobuf generation/compatibility tests and confirm PASS.**
- [ ] **Step 5: Commit the canonical SceneState validation layer.**

### Task 4: Complete credential-free Unity and Unreal adapter boundaries

**Files:**
- Modify: `adapters/engine/unity/`
- Modify: `adapters/engine/unreal/`
- Modify: `adapters/engine/core/`
- Add deterministic fixtures under the existing adapter test layout.

**Interfaces:**
- Unity adapter consumes validated SceneState and never requires Unity Gaming Services credentials.
- Unreal adapter is native-runtime oriented; Python/JS helpers remain optional tooling.
- MagicOnion/gRPC transport is optional behind the transport interface; local fixture transport is always available for CI.
- Cesium remains an optional visualization adapter and is never a core dependency.

- [ ] **Step 1: Add failing adapter tests proving a local SceneState fixture can initialize with zero provider credentials.**
- [ ] **Step 2: Run the adapter fixture suite and confirm failure before implementation.**
- [ ] **Step 3: Implement the credential-free initialization and transport selection.**
- [ ] **Step 4: Run deterministic adapter fixtures and compile checks available in CI.**
- [ ] **Step 5: Commit adapter boundary changes.**

### Task 5: Enforce WebGPU/OpenUSD/security verification in CI

**Files:**
- Modify: `.github/workflows/sovereign-ci.yml`
- Modify: `.github/workflows/engine-webgpu-verification.yml`
- Create: `.github/workflows/security-supply-chain.yml`
- Add or modify: CI scripts already used by the repository for WGSL, OpenUSD, schema, and dependency verification.

**Interfaces:**
- CI runs Python tests, schema checks, WebGPU/WGSL validation, OpenUSD round-trip fixtures, secret scanning, dependency vulnerability scanning, license checks, and SBOM generation.
- CI permissions are least-privilege.
- Failures in optional engine-native toolchains are reported distinctly from authoritative-core failures.

- [ ] **Step 1: Add CI assertions/scripts first and validate YAML/schema syntax.**
- [ ] **Step 2: Run the repository's available CI validation locally where possible; otherwise push and use GitHub Actions as the verification environment.**
- [ ] **Step 3: Add security and SBOM jobs with pinned action versions.**
- [ ] **Step 4: Trigger the complete workflow suite and inspect failed job logs.**
- [ ] **Step 5: Fix failures, re-run, and commit only a green configuration.**

### Task 6: Reconcile branches and publish verified main

**Files:**
- No source changes expected unless verification discovers a concrete defect.
- Create a machine-readable integration report under `docs/integration/`.

**Interfaces:**
- Every current branch is compared against `main` and classified as represented, stale, unique, or conflicting.
- Existing stale branches are not force-overwritten or deleted without explicit authorization.
- Only verified commits are merged/published.

- [ ] **Step 1: Re-run branch comparisons after implementation.**
- [ ] **Step 2: Verify that the already-consolidated feature histories remain represented in `main`.**
- [ ] **Step 3: Record the final CI/security/engine verification matrix.**
- [ ] **Step 4: Merge the implementation branch to `main` only after all required checks pass.**
- [ ] **Step 5: Re-read the final `main` commit and confirm the canonical contracts and provider registry are present.**

## Verification Matrix

| Area | Required evidence |
|---|---|
| v35 evidence | deterministic RFC 8785 + SHA-256 + DAG/immutability tests |
| v35 spatial | finite-value, CRS, datum, transform tests |
| SceneState | protobuf compatibility + serialization round-trip |
| Unity | credential-free fixture + native compile when runner supports it |
| Unreal | credential-free fixture + native compile when runner supports it |
| WebGPU | WGSL reflection/validation + shader fixtures |
| OpenUSD | round-trip fixture |
| Security | secret scan + dependency vulnerability scan + SBOM |
| Licenses | production dependency allowlist/audit |
| Runtime | Docker build + smoke test |
| Branches | all intended changes represented in `main` |
