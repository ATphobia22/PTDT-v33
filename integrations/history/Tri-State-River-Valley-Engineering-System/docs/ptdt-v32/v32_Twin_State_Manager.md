# PTDT v32 Twin State Manager Implementation

## 1. Concept of Operations
The Twin State Manager (TSM) replaces legacy static file-based persistence with a temporal-aware datastore. It is responsible for tracking the exact digital state of the PTDT system across time ($t_0 \dots t_n$), enabling rollbacks, parallel scenario testing, and EnKF covariance tracking.

## 2. Architecture
*   **Time-Series Metadata**: TimescaleDB (PostgreSQL) is used to index all simulation states, capturing valid time (when the physical event occurs) and transaction time (when it was computed).
*   **Heavy Artifact Storage**: Massive grids (HDF5, NetCDF, GeoTIFF) are stored in an S3-compatible object store (e.g., MinIO). TimescaleDB stores URIs pointing to these immutable artifacts.

## 3. Core Capabilities

### 3.1 Snapshots & Checkpoints
At the end of every DAG execution cycle, the TSM creates a cryptographic snapshot of the global state $\mathbf{x}_t^a$. This serves as the initial condition ($\mathbf{x}_0$) for the next forecast cycle.

### 3.2 Branching (Scenario Analysis)
Users can "branch" the digital twin from any historical checkpoint to test scenarios without affecting the operational real-time model.
*   *Example*: Branching from the current state to test "What if Gate A fails to open?" by artificially altering the SWMM boundary conditions on the branch.

### 3.3 EnKF Matrix Persistence
The TSM tracks the massive Ensemble covariance matrices. Instead of storing full $N \times n$ grids for every timestep, it stores the mean state $\bar{\mathbf{x}}$ and the sparse perturbation matrices, allowing rapid reconstruction of uncertainty bounds ($\sigma$) in the UI.

## 4. API Specification
The TSM exposes a gRPC/REST API for the front-end dashboard:
*   `GET /api/v1/state/timeseries?metric=wse&lat=x&lon=y`
*   `POST /api/v1/scenario/branch`
*   `GET /api/v1/state/uncertainty_bounds`
