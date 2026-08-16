# PTDT v32 DAG Execution Graph Specification

## 1. Overview
The Tri-State Digital Engineering System (PTDT) v32 employs a Directed Acyclic Graph (DAG) for orchestration. Prefect (and/or Temporal) serves as the orchestrator to ensure reliable execution, state checkpointing, retries, and data lineage across the physical solver pipeline.

## 2. Execution Topology
The execution flow is structured into five core stages, enforcing strict dependency management while maximizing parallel execution of independent solvers.

### Stage 1: Hydrologic Forcing (SWMM)
*   **Node**: `run_swmm_simulation`
*   **Description**: Computes urban catchment runoff and pipe routing.
*   **Dependencies**: None (Entry point triggered by temporal schedule or event).
*   **Outputs**: Runoff hydrographs, outfall discharges.

### Stage 2: Parallel Surface & Subsurface Flow
*   **Node**: `run_hec_ras_simulation`
    *   **Description**: HEC-RAS 2D overland flow and riverine routing.
    *   **Dependencies**: `run_swmm_simulation` (uses SWMM outfalls as boundary conditions).
    *   **Outputs**: 2D WSE grids, velocity fields, bed shear stress ($\tau_{bed}$).
*   **Node**: `run_modflow_simulation`
    *   **Description**: MODFLOW 6 groundwater flow.
    *   **Dependencies**: `run_swmm_simulation` (infiltration/recharge boundary).
    *   **Outputs**: Groundwater head distribution, pore water pressure.

### Stage 3: Geotechnical & Sediment Analysis
*   **Node**: `run_sediment_scour`
    *   **Description**: Calculates local and contraction scour at critical infrastructure points.
    *   **Dependencies**: `run_hec_ras_simulation` (requires $\tau_{bed}$ and velocity).
    *   **Outputs**: Scour depth grids ($\Delta z_{scour}$).
*   **Node**: `run_bishop_stability`
    *   **Description**: Evaluates levee/slope Factor of Safety (FoS) using Bishop's method.
    *   **Dependencies**: `run_modflow_simulation` (pore pressure) AND `run_sediment_scour` (scoured geometry).
    *   **Outputs**: FoS grids, critical failure surfaces.

### Stage 4: Data Assimilation
*   **Node**: `data_assimilation_enkf`
    *   **Description**: Merges physical solver states with real-time telemetry (gauges, radar) using the Ensemble Kalman Filter.
    *   **Dependencies**: `run_hec_ras_simulation`, `run_modflow_simulation`, `run_bishop_stability`.
    *   **Outputs**: Analyzed (assimilated) state vectors, uncertainty bounds.

### Stage 5: Governance and Provenance
*   **Node**: `generate_evidence_manifest`
    *   **Description**: Compiles convergence metrics, SBOM references, and generates a cryptographically signed evidence manifest.
    *   **Dependencies**: `data_assimilation_enkf`.
    *   **Outputs**: Canonical Signed Evidence Manifest (JSON), RFC 3161 Timestamp.

## 3. Resilience and Retry Policies
*   **Transient Failures**: Nodes handling external I/O or stochastic instability (e.g., SWMM, HEC-RAS) are configured with retries (e.g., `retries=3`) and exponential backoff (`retry_delay_seconds=10, 20, 40`).
*   **Checkpointing**: Intermediate states (e.g., HDF5 grids, NetCDF files) are persisted to the `ptdt-solver-pvc` persistent volume. If the DAG fails at Stage 3, it can resume using the cached, immutable results from Stages 1 and 2.
*   **Backpressure & Concurrency Limits**: The orchestrator limits concurrent execution of heavy physics nodes based on Kubernetes resource availability (e.g., throttling HEC-RAS workers to a maximum of 3 concurrent runs to prevent OOM kills).

## 4. Twin State Management
Each task output is tracked in TimescaleDB with a unique temporal index. To ensure orchestrator performance, the DAG context passes lightweight references (URIs, S3 paths, or PVC paths) to the artifacts, rather than passing massive multiterabyte grid datasets directly through the orchestrator's state backend.
